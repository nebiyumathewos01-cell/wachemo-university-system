const User = require('../models/User');
const Student = require('../models/Student');
const Application = require('../models/Application');
const Payment = require('../models/Payment');
const AuditLog = require('../models/AuditLog');
const { createNotification } = require('../services/notificationService');

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
// @access  Private (admin)
const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalStudents,
      pending,
      underReview,
      approved,
      rejected,
      totalPayments,
      paidPayments,
      pendingPayments,
    ] = await Promise.all([
      Student.countDocuments(),
      Application.countDocuments({ status: 'pending' }),
      Application.countDocuments({ status: 'under_review' }),
      Application.countDocuments({ status: 'approved' }),
      Application.countDocuments({ status: 'rejected' }),
      Payment.countDocuments(),
      Payment.countDocuments({ status: 'paid' }),
      Payment.countDocuments({ status: 'pending' }),
    ]);

    // Monthly payment totals for the current year
    const currentYear = new Date().getFullYear();
    const monthlyStats = await Payment.aggregate([
      { $match: { year: currentYear, status: 'paid' } },
      { $group: { _id: '$month', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    // Recent applications
    const recentApplications = await Application.find()
      .populate({ path: 'studentId', populate: { path: 'userId', select: 'fullName' } })
      .sort({ submittedAt: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        students: { total: totalStudents },
        applications: { pending, underReview, approved, rejected, total: pending + underReview + approved + rejected },
        payments: { total: totalPayments, paid: paidPayments, pending: pendingPayments },
        monthlyStats,
        recentApplications,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users (admin)
// @route   GET /api/admin/users
// @access  Private (admin)
const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, role } = req.query;
    const query = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { fullName: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await User.countDocuments(query);
    const users = await User.find(query).skip(skip).limit(parseInt(limit)).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: users,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle user active status (admin)
// @route   PUT /api/admin/users/:id/toggle
// @access  Private (admin)
const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot deactivate your own account' });
    }

    user.isActive = !user.isActive;
    await user.save({ validateBeforeSave: false });

    res.json({ success: true, message: `User ${user.isActive ? 'activated' : 'deactivated'}`, data: { isActive: user.isActive } });
  } catch (error) {
    next(error);
  }
};

// @desc    Get audit logs (admin)
// @route   GET /api/admin/audit-logs
// @access  Private (admin)
const getAuditLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, action, entity } = req.query;
    const query = {};
    if (action) query.action = new RegExp(action, 'i');
    if (entity) query.entity = new RegExp(entity, 'i');

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await AuditLog.countDocuments(query);
    const logs = await AuditLog.find(query)
      .populate('userId', 'fullName email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({ success: true, data: logs, pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) } });
  } catch (error) {
    next(error);
  }
};

// @desc    Send broadcast notification (admin)
// @route   POST /api/admin/notify
// @access  Private (admin)
const sendBroadcastNotification = async (req, res, next) => {
  try {
    const { title, message, type = 'system', targetRole = 'student' } = req.body;

    const users = await User.find({ role: targetRole, isActive: true }).select('_id');
    await Promise.all(users.map((u) => createNotification({ userId: u._id, title, message, type })));

    res.json({ success: true, message: `Notification sent to ${users.length} users` });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboardStats, getAllUsers, toggleUserStatus, getAuditLogs, sendBroadcastNotification };
