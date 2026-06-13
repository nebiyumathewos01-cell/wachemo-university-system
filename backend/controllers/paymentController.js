const Payment = require('../models/Payment');
const Application = require('../models/Application');
const Student = require('../models/Student');
const User = require('../models/User');
const { createNotification } = require('../services/notificationService');
const { sendPaymentEmail } = require('../services/emailService');
const { createAuditLog } = require('../middleware/auditLogger');
const XLSX = require('xlsx');
const PDFDocument = require('pdfkit');

// @desc    Generate monthly payment list (admin)
// @route   POST /api/payments/generate
// @access  Private (admin)
const generateMonthlyPayments = async (req, res, next) => {
  try {
    const { month, year } = req.body;

    if (!month || !year) {
      return res.status(400).json({ success: false, message: 'Month and year are required' });
    }

    // Get all approved applications
    const approvedApps = await Application.find({ status: 'approved' });

    let created = 0;
    let skipped = 0;

    for (const app of approvedApps) {
      const exists = await Payment.findOne({ studentId: app.studentId, month: parseInt(month), year: parseInt(year) });
      if (exists) { skipped++; continue; }

      await Payment.create({
        studentId: app.studentId,
        userId: app.userId,
        applicationId: app._id,
        amount: parseInt(process.env.MONTHLY_COMPENSATION) || 3000,
        month: parseInt(month),
        year: parseInt(year),
      });
      created++;
    }

    await createAuditLog({ userId: req.user._id, action: 'GENERATE_PAYMENTS', entity: 'Payment', details: { month, year, created, skipped }, req });

    res.json({ success: true, message: `Generated ${created} payments, skipped ${skipped} duplicates` });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all payments (admin)
// @route   GET /api/payments
// @access  Private (admin)
const getAllPayments = async (req, res, next) => {
  try {
    const { month, year, status, page = 1, limit = 10, search } = req.query;
    const query = {};

    if (month) query.month = parseInt(month);
    if (year) query.year = parseInt(year);
    if (status && status !== 'all') query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    let pipeline = [
      { $match: query },
      { $lookup: { from: 'students', localField: 'studentId', foreignField: '_id', as: 'student' } },
      { $unwind: '$student' },
      { $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
    ];

    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { 'user.fullName': new RegExp(search, 'i') },
            { 'student.studentId': new RegExp(search, 'i') },
          ],
        },
      });
    }

    const countPipeline = [...pipeline, { $count: 'total' }];
    const countResult = await Payment.aggregate(countPipeline);
    const total = countResult[0]?.total || 0;

    pipeline.push(
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: parseInt(limit) },
      { $project: { 'user.password': 0 } }
    );

    const payments = await Payment.aggregate(pipeline);

    res.json({
      success: true,
      data: payments,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark payment as paid (admin)
// @route   PUT /api/payments/:id/pay
// @access  Private (admin)
const markAsPaid = async (req, res, next) => {
  try {
    const { transactionRef, note } = req.body;

    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    if (payment.status === 'paid') {
      return res.status(400).json({ success: false, message: 'Payment already marked as paid' });
    }

    payment.status = 'paid';
    payment.paidDate = new Date();
    payment.paidBy = req.user._id;
    payment.transactionRef = transactionRef || null;
    payment.note = note || null;
    await payment.save();

    // Notify student
    const user = await User.findById(payment.userId);
    const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    await createNotification({
      userId: payment.userId,
      title: 'Payment Processed',
      message: `Your ${months[payment.month - 1]} ${payment.year} compensation of ${payment.amount} ETB has been processed.`,
      type: 'payment',
      link: '/dashboard/payments',
    });
    if (user) sendPaymentEmail(user, payment);

    await createAuditLog({ userId: req.user._id, action: 'MARK_PAYMENT_PAID', entity: 'Payment', entityId: payment._id, req });

    res.json({ success: true, message: 'Payment marked as paid', data: payment });
  } catch (error) {
    next(error);
  }
};

// @desc    Get student's own payments
// @route   GET /api/payments/my
// @access  Private (student)
const getMyPayments = async (req, res, next) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    const payments = await Payment.find({ studentId: student._id }).sort({ year: -1, month: -1 });

    res.json({ success: true, data: payments });
  } catch (error) {
    next(error);
  }
};

// @desc    Export payments to Excel (admin)
// @route   GET /api/payments/export/excel
// @access  Private (admin)
const exportToExcel = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const query = {};
    if (month) query.month = parseInt(month);
    if (year) query.year = parseInt(year);

    const payments = await Payment.find(query)
      .populate({ path: 'studentId', populate: { path: 'userId', select: 'fullName email' } })
      .sort({ year: -1, month: -1 });

    const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];

    const data = payments.map((p) => ({
      'Full Name': p.studentId?.userId?.fullName || '',
      'Student ID': p.studentId?.studentId || '',
      'Department': p.studentId?.department || '',
      'Bank Name': p.studentId?.bankName || '',
      'Account Number': p.studentId?.accountNumber || '',
      'Account Holder': p.studentId?.accountHolderName || '',
      'Month': months[(p.month || 1) - 1],
      'Year': p.year,
      'Amount (ETB)': p.amount,
      'Status': p.status,
      'Paid Date': p.paidDate ? new Date(p.paidDate).toLocaleDateString() : '',
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, 'Payments');
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=payments_${month || 'all'}_${year || 'all'}.xlsx`);
    res.send(buffer);
  } catch (error) {
    next(error);
  }
};

// @desc    Export payments to PDF (admin)
// @route   GET /api/payments/export/pdf
// @access  Private (admin)
const exportToPDF = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const query = {};
    if (month) query.month = parseInt(month);
    if (year) query.year = parseInt(year);

    const payments = await Payment.find(query)
      .populate({ path: 'studentId', populate: { path: 'userId', select: 'fullName email' } })
      .sort({ year: -1, month: -1 });

    const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];

    const doc = new PDFDocument({ margin: 40, size: 'A4', layout: 'landscape' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=payments_${month || 'all'}_${year || 'all'}.pdf`);
    doc.pipe(res);

    // Header
    doc.fontSize(16).font('Helvetica-Bold').text('WACHEMO UNIVERSITY', { align: 'center' });
    doc.fontSize(12).font('Helvetica').text('Non-Cafeteria Payment Report', { align: 'center' });
    if (month && year) {
      doc.text(`Period: ${months[parseInt(month) - 1]} ${year}`, { align: 'center' });
    }
    doc.moveDown();

    const totalAmount = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const paidCount = payments.filter((p) => p.status === 'paid').length;
    doc.fontSize(10).text(`Total Records: ${payments.length}  |  Paid: ${paidCount}  |  Pending: ${payments.length - paidCount}  |  Total Amount: ${totalAmount.toLocaleString()} ETB`);
    doc.moveDown();

    // Table header
    const cols = [100, 80, 100, 100, 100, 60, 50, 70];
    const headers = ['Full Name', 'Student ID', 'Department', 'Bank', 'Account No.', 'Amount', 'Status', 'Paid Date'];
    let x = 40;
    doc.fontSize(9).font('Helvetica-Bold');
    headers.forEach((h, i) => {
      doc.text(h, x, doc.y, { width: cols[i], lineBreak: false });
      x += cols[i];
    });
    doc.moveDown(0.5);
    doc.moveTo(40, doc.y).lineTo(800, doc.y).stroke();
    doc.moveDown(0.3);

    // Table rows
    doc.font('Helvetica').fontSize(8);
    payments.forEach((p) => {
      x = 40;
      const rowY = doc.y;
      const row = [
        p.studentId?.userId?.fullName || '',
        p.studentId?.studentId || '',
        p.studentId?.department || '',
        p.studentId?.bankName || '',
        p.studentId?.accountNumber || '',
        `${p.amount} ETB`,
        p.status,
        p.paidDate ? new Date(p.paidDate).toLocaleDateString() : '-',
      ];
      row.forEach((cell, i) => {
        doc.text(String(cell), x, rowY, { width: cols[i], lineBreak: false });
        x += cols[i];
      });
      doc.moveDown(0.6);
    });

    doc.end();
  } catch (error) {
    next(error);
  }
};

// @desc    Get payment stats (admin)
// @route   GET /api/payments/stats
// @access  Private (admin)
const getPaymentStats = async (req, res, next) => {
  try {
    const { year } = req.query;
    const matchYear = year ? { year: parseInt(year) } : {};

    const stats = await Payment.aggregate([
      { $match: matchYear },
      {
        $group: {
          _id: { month: '$month', year: '$year' },
          total: { $sum: 1 },
          paid: { $sum: { $cond: [{ $eq: ['$status', 'paid'] }, 1, 0] } },
          totalAmount: { $sum: '$amount' },
          paidAmount: { $sum: { $cond: [{ $eq: ['$status', 'paid'] }, '$amount', 0] } },
        },
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
    ]);

    res.json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};

module.exports = { generateMonthlyPayments, getAllPayments, markAsPaid, getMyPayments, exportToExcel, exportToPDF, getPaymentStats };
