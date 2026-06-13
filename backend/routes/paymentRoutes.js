const express = require('express');
const router = express.Router();
const {
  generateMonthlyPayments,
  getAllPayments,
  markAsPaid,
  getMyPayments,
  exportToExcel,
  exportToPDF,
  getPaymentStats,
} = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');

// Student routes
router.get('/my', protect, authorize('student'), getMyPayments);

// Admin routes
router.post('/generate', protect, authorize('admin'), generateMonthlyPayments);
router.get('/stats', protect, authorize('admin'), getPaymentStats);
router.get('/export/excel', protect, authorize('admin'), exportToExcel);
router.get('/export/pdf', protect, authorize('admin'), exportToPDF);
router.get('/', protect, authorize('admin'), getAllPayments);
router.put('/:id/pay', protect, authorize('admin'), markAsPaid);

module.exports = router;
