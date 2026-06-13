const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, uploadProfilePhoto, getAllStudents, getStudentById } = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/auth');
const { handleUploadProfilePhoto } = require('../middleware/upload');

// Student routes
router.get('/profile', protect, authorize('student'), getProfile);
router.put('/profile', protect, authorize('student'), updateProfile);
router.put('/profile/photo', protect, authorize('student'), handleUploadProfilePhoto, uploadProfilePhoto);

// Admin routes
router.get('/', protect, authorize('admin'), getAllStudents);
router.get('/:id', protect, authorize('admin'), getStudentById);

module.exports = router;
