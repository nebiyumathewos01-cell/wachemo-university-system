const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Generate approval letter PDF for a student application
 */
const generateApprovalLetter = async (application, student, user) => {
  return new Promise((resolve, reject) => {
    try {
      const outputDir = path.join(__dirname, '../uploads/letters');
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      const fileName = `approval_${student.studentId}_${Date.now()}.pdf`;
      const filePath = path.join(outputDir, fileName);
      const doc = new PDFDocument({ margin: 60 });
      const stream = fs.createWriteStream(filePath);

      doc.pipe(stream);

      // Header
      doc.fontSize(18).font('Helvetica-Bold').text('WACHEMO UNIVERSITY', { align: 'center' });
      doc.fontSize(12).font('Helvetica').text('Non-Cafeteria Registration System', { align: 'center' });
      doc.moveDown(0.5);
      doc.moveTo(60, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown();

      // Title
      doc.fontSize(16).font('Helvetica-Bold').text('APPROVAL LETTER', { align: 'center' });
      doc.moveDown();

      // Reference number and date
      const refNo = `WU/NC/${student.studentId}/${new Date().getFullYear()}`;
      doc.fontSize(10).font('Helvetica')
        .text(`Reference No: ${refNo}`, { align: 'right' })
        .text(`Date: ${new Date().toLocaleDateString('en-GB')}`, { align: 'right' });
      doc.moveDown();

      // Body
      doc.fontSize(12).font('Helvetica').text(`Dear ${user.fullName},`, { continued: false });
      doc.moveDown(0.5);
      doc.text(
        `This letter is to confirm that your application for the Non-Cafeteria Service at Wachemo University has been APPROVED. ` +
        `You are entitled to receive a monthly compensation of ETB 3,000 (Three Thousand Ethiopian Birr) in lieu of cafeteria services.`,
        { align: 'justify' }
      );
      doc.moveDown();

      // Student details
      doc.fontSize(12).font('Helvetica-Bold').text('Student Details:');
      doc.moveDown(0.3);
      doc.fontSize(11).font('Helvetica');
      const details = [
        ['Full Name', user.fullName],
        ['Student ID', student.studentId],
        ['Department', student.department],
        ['Year of Study', `Year ${student.year}`],
        ['Email', user.email],
        ['Phone', student.phone],
        ['Bank Name', student.bankName || 'N/A'],
        ['Account Number', student.accountNumber || 'N/A'],
        ['Account Holder', student.accountHolderName || 'N/A'],
      ];

      details.forEach(([label, value]) => {
        doc.text(`${label}: `, { continued: true }).font('Helvetica-Bold').text(value).font('Helvetica');
      });

      doc.moveDown();
      doc.fontSize(12).font('Helvetica').text(
        `Effective from ${new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}, ` +
        `payments will be made directly to your registered bank account on a monthly basis.`,
        { align: 'justify' }
      );

      doc.moveDown();
      doc.text(
        'Please ensure that your cafeteria meal card has been surrendered to the Student Affairs Office as per university policy.',
        { align: 'justify' }
      );

      doc.moveDown(2);
      doc.text('___________________________');
      doc.text('Authorized Signature');
      doc.text('Wachemo University');
      doc.text('Student Affairs Office');

      // Footer
      doc.moveDown(2);
      doc.moveTo(60, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(0.3);
      doc.fontSize(9).fillColor('gray').text(
        'Wachemo University | Non-Cafeteria Registration System | confidential',
        { align: 'center' }
      );

      doc.end();

      stream.on('finish', () => resolve({ filePath, fileName }));
      stream.on('error', reject);
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = { generateApprovalLetter };
