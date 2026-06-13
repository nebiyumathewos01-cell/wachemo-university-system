const express = require('express');
const router = express.Router();
const {
  submitApplication,
  getMyApplication,
  getAllApplications,
  getApplicationById,
  updateApplicationStatus,
  updateChecklist,
  downloadApprovalLetter,
} = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/auth');
const { handleUploadApplicationDocs } = require('../middleware/upload');

// Student routes
router.post('/', protect, authorize('student'), handleUploadApplicationDocs, submitApplication);
router.get('/my', protect, authorize('student'), getMyApplication);
router.get('/:id/letter', protect, downloadApprovalLetter);

// Admin routes
router.get('/', protect, authorize('admin'), getAllApplications);
router.get('/:id', protect, authorize('admin'), getApplicationById);
router.put('/:id/status', protect, authorize('admin'), updateApplicationStatus);
router.put('/:id/checklist', protect, authorize('admin'), updateChecklist);

module.exports = router;
