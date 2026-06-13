const User = require('../models/User');
const Student = require('../models/Student');
const path = require('path');
const fs = require('fs');

// @desc    Get student profile
// @route   GET /api/students/profile
// @access  Private (student)
const getProfile = async (req, res, next) => {
  try {
    const student = await Student.findOne({ userId: req.user._id }).populate('userId', 'fullName email createdAt lastLogin');

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    res.json({ success: true, data: student });
  } catch (error) {
    next(error);
  }
};

// @desc    Update student profile
// @route   PUT /api/students/profile
// @access  Private (student)
const updateProfile = async (req, res, next) => {
  try {
    const { fullName, phone, bankName, accountNumber, accountHolderName } = req.body;

    // Update user fullName
    if (fullName) {
      await User.findByIdAndUpdate(req.user._id, { fullName });
    }

    // Update student info
    const student = await Student.findOneAndUpdate(
      { userId: req.user._id },
      { phone, bankName, accountNumber, accountHolderName },
      { new: true, runValidators: true }
    );

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    res.json({ success: true, message: 'Profile updated successfully', data: student });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload profile photo
// @route   PUT /api/students/profile/photo
// @access  Private (student)
const uploadProfilePhoto = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const student = await Student.findOne({ userId: req.user._id });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    // Delete old photo if exists
    if (student.profilePhoto) {
      const oldPath = path.join(__dirname, '../uploads/photos', path.basename(student.profilePhoto));
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    student.profilePhoto = `/uploads/photos/${req.file.filename}`;
    await student.save();

    res.json({ success: true, message: 'Profile photo updated', data: { profilePhoto: student.profilePhoto } });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all students (admin)
// @route   GET /api/students
// @access  Private (admin)
const getAllStudents = async (req, res, next) => {
  try {
    const { search, department, year, page = 1, limit = 10 } = req.query;

    const query = {};
    if (department) query.department = new RegExp(department, 'i');
    if (year) query.year = parseInt(year);
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [{ studentId: searchRegex }, { department: searchRegex }];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Student.countDocuments(query);
    const students = await Student.find(query)
      .populate('userId', 'fullName email createdAt')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: students,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)), limit: parseInt(limit) },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single student by ID (admin)
// @route   GET /api/students/:id
// @access  Private (admin)
const getStudentById = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id).populate('userId', 'fullName email createdAt lastLogin isActive');

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    res.json({ success: true, data: student });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProfile, updateProfile, uploadProfilePhoto, getAllStudents, getStudentById };
