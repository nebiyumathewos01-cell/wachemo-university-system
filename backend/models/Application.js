const mongoose = require('mongoose');

const verificationChecklistSchema = new mongoose.Schema(
  {
    studentIdVerified: { type: Boolean, default: false },
    nationalIdVerified: { type: Boolean, default: false },
    bankAccountVerified: { type: Boolean, default: false },
    paymentReceiptVerified: { type: Boolean, default: false },
    cafeteriaCardSurrendered: { type: Boolean, default: false },
    studentInfoVerified: { type: Boolean, default: false },
  },
  { _id: false }
);

const applicationSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Reason
    reason: {
      type: String,
      required: [true, 'Reason for choosing non-cafeteria service is required'],
      minlength: [50, 'Reason must be at least 50 characters'],
    },
    // Document uploads
    studentIdDocument: { type: String, default: null },
    nationalIdDocument: { type: String, default: null },
    bankProof: { type: String, default: null },
    paymentReceipt: { type: String, default: null },
    declarationForm: { type: String, default: null },
    photo: { type: String, default: null },

    // Application status
    status: {
      type: String,
      enum: ['pending', 'under_review', 'approved', 'rejected'],
      default: 'pending',
    },
    rejectionReason: {
      type: String,
      default: null,
    },
    additionalDocumentRequest: {
      type: String,
      default: null,
    },

    // Admin verification checklist
    verificationChecklist: {
      type: verificationChecklistSchema,
      default: () => ({}),
    },

    // Declaration checkbox
    declarationAccepted: {
      type: Boolean,
      required: [true, 'Declaration must be accepted'],
    },

    // Admin who processed the application
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    processedAt: {
      type: Date,
      default: null,
    },

    // Approval letter path
    approvalLetterPath: {
      type: String,
      default: null,
    },

    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Index for fast queries
applicationSchema.index({ status: 1 });
applicationSchema.index({ studentId: 1 });
applicationSchema.index({ submittedAt: -1 });

module.exports = mongoose.model('Application', applicationSchema);
