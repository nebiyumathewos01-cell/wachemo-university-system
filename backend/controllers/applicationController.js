const Application = require('../models/Application');
const Student = require('../models/Student');
const User = require('../models/User');
const { createNotification } = require('../services/notificationService');
const { sendApplicationStatusEmail } = require('../services/emailService');
const { generateApprovalLetter } = require('../services/pdfService');
const { createAuditLog } = require('../middleware/auditLogger');
const path = require('path');
const fs = require('fs');

// @desc    Submit a new application
// @route   POST /api/applications
// @access  Private (student)
const submitApplication = async (req, res, next) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    // Check for existing active application
    const existing = await Application.findOne({
      studentId: student._id,
      status: { $in: ['pending', 'under_review', 'approved'] },
    });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `You already have an active application with status: ${existing.status}`,
      });
    }

    const { reason, declarationAccepted, bankName, accountNumber, accountHolderName } = req.body;

    if (!declarationAccepted || declarationAccepted === 'false') {
      return res.status(400).json({ success: false, message: 'You must accept the declaration to submit' });
    }

    // Update bank info on student profile if provided
    if (bankName) {
      await Student.findByIdAndUpdate(student._id, { bankName, accountNumber, accountHolderName });
    }

    // Build document paths from uploaded files
    const docs = {};
    const requiredDocs = ['studentIdDocument', 'nationalIdDocument', 'bankProof', 'paymentReceipt', 'declarationForm', 'photo'];

    for (const field of requiredDocs) {
      if (req.files && req.files[field]) {
        const file = req.files[field][0];
        docs[field] = `/uploads/${file.fieldname === 'photo' ? 'photos' : 'documents'}/${file.filename}`;
      } else {
        return res.status(400).json({ success: false, message: `${field} document is required` });
      }
    }

    const application = await Application.create({
      studentId: student._id,
      userId: req.user._id,
      reason,
      declarationAccepted: true,
      ...docs,
    });

    // Notify student
    await createNotification({
      userId: req.user._id,
      title: 'Application Submitted',
      message: 'Your non-cafeteria application has been submitted successfully and is pending review.',
      type: 'application',
      link: '/dashboard/application',
    });

    await createAuditLog({ userId: req.user._id, action: 'SUBMIT_APPLICATION', entity: 'Application', entityId: application._id, req });

    res.status(201).json({ success: true, message: 'Application submitted successfully', data: application });
  } catch (error) {
    next(error);
  }
};

// @desc    Get student's own application
// @route   GET /api/applications/my
// @access  Private (student)
const getMyApplication = async (req, res, next) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    const application = await Application.findOne({ studentId: student._id })
      .sort({ createdAt: -1 })
      .populate('processedBy', 'fullName');

    if (!application) {
      return res.status(404).json({ success: false, message: 'No application found' });
    }

    res.json({ success: true, data: application });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all applications (admin)
// @route   GET /api/applications
// @access  Private (admin)
const getAllApplications = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;
    const query = {};

    if (status && status !== 'all') query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    let pipeline = [
      { $match: query },
      {
        $lookup: {
          from: 'students',
          localField: 'studentId',
          foreignField: '_id',
          as: 'student',
        },
      },
      { $unwind: '$student' },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
    ];

    // Apply search filter
    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { 'user.fullName': new RegExp(search, 'i') },
            { 'student.studentId': new RegExp(search, 'i') },
            { 'student.department': new RegExp(search, 'i') },
          ],
        },
      });
    }

    const countPipeline = [...pipeline, { $count: 'total' }];
    const countResult = await Application.aggregate(countPipeline);
    const total = countResult[0]?.total || 0;

    pipeline.push(
      { $sort: { submittedAt: -1 } },
      { $skip: skip },
      { $limit: parseInt(limit) },
      {
        $project: {
          'user.password': 0,
        },
      }
    );

    const applications = await Application.aggregate(pipeline);

    res.json({
      success: true,
      data: applications,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)), limit: parseInt(limit) },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single application (admin)
// @route   GET /api/applications/:id
// @access  Private (admin)
const getApplicationById = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate({ path: 'studentId', populate: { path: 'userId', select: 'fullName email' } })
      .populate('userId', 'fullName email')
      .populate('processedBy', 'fullName');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    res.json({ success: true, data: application });
  } catch (error) {
    next(error);
  }
};

// @desc    Update application status (admin)
// @route   PUT /api/applications/:id/status
// @access  Private (admin)
const updateApplicationStatus = async (req, res, next) => {
  try {
    const { status, rejectionReason, additionalDocumentRequest } = req.body;
    const validStatuses = ['under_review', 'approved', 'rejected'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    application.status = status;
    application.processedBy = req.user._id;
    application.processedAt = new Date();

    if (status === 'rejected' && rejectionReason) {
      application.rejectionReason = rejectionReason;
    }
    if (additionalDocumentRequest) {
      application.additionalDocumentRequest = additionalDocumentRequest;
    }

    // Generate approval letter if approved
    if (status === 'approved') {
      const student = await Student.findById(application.studentId);
      const user = await User.findById(application.userId);
      try {
        const { fileName } = await generateApprovalLetter(application, student, user);
        application.approvalLetterPath = `/uploads/letters/${fileName}`;
      } catch (pdfErr) {
        console.error('PDF generation error:', pdfErr.message);
      }
    }

    await application.save();

    // Notify student
    const user = await User.findById(application.userId);
    const notifMessages = {
      under_review: { title: 'Application Under Review', message: 'Your application is now being reviewed by the admin team.', type: 'application' },
      approved: { title: 'Application Approved! 🎉', message: 'Congratulations! Your non-cafeteria application has been approved. You will receive 3,000 ETB monthly.', type: 'approval' },
      rejected: { title: 'Application Not Approved', message: `Your application was rejected. ${rejectionReason ? 'Reason: ' + rejectionReason : ''}`, type: 'rejection' },
    };

    await createNotification({ userId: application.userId, ...notifMessages[status], link: '/dashboard/application' });
    sendApplicationStatusEmail(user, application, status, rejectionReason);

    await createAuditLog({ userId: req.user._id, action: `APPLICATION_${status.toUpperCase()}`, entity: 'Application', entityId: application._id, details: { status, rejectionReason }, req });

    res.json({ success: true, message: `Application ${status} successfully`, data: application });
  } catch (error) {
    next(error);
  }
};

// @desc    Update verification checklist (admin)
// @route   PUT /api/applications/:id/checklist
// @access  Private (admin)
const updateChecklist = async (req, res, next) => {
  try {
    const { verificationChecklist } = req.body;

    const application = await Application.findByIdAndUpdate(
      req.params.id,
      { verificationChecklist },
      { new: true, runValidators: true }
    );

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    res.json({ success: true, data: application });
  } catch (error) {
    next(error);
  }
};

// @desc    Download approval letter
// @route   GET /api/applications/:id/letter
// @access  Private
const downloadApprovalLetter = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    // Students can only download their own letter
    if (req.user.role === 'student' && application.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (!application.approvalLetterPath) {
      return res.status(404).json({ success: false, message: 'Approval letter not generated yet' });
    }

    const filePath = path.join(__dirname, '..', application.approvalLetterPath);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'Approval letter file not found' });
    }

    res.download(filePath);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitApplication,
  getMyApplication,
  getAllApplications,
  getApplicationById,
  updateApplicationStatus,
  updateChecklist,
  downloadApprovalLetter,
};
