/**
 * Seed script — creates default admin account
 * Run: node scripts/seedAdmin.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const existing = await User.findOne({ email: process.env.ADMIN_EMAIL });
    if (existing) {
      console.log('Admin already exists:', existing.email);
      process.exit(0);
    }

    const admin = await User.create({
      fullName: 'System Administrator',
      email: process.env.ADMIN_EMAIL || 'admin@wachemo.edu.et',
      password: process.env.ADMIN_PASSWORD || 'Admin@123456',
      role: 'admin',
    });

    console.log('✅ Admin created successfully:');
    console.log('   Email:', admin.email);
    console.log('   Password:', process.env.ADMIN_PASSWORD || 'Admin@123456');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error.message);
    process.exit(1);
  }
};

seed();
