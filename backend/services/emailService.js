const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send a generic email
 */
const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const info = await transporter.sendMail({
      from: `"Wachemo University" <${process.env.EMAIL_FROM}>`,
      to,
      subject,
      html,
      text,
    });
    console.log(`📧 Email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('Email send error:', error.message);
    // Don't throw — email failure shouldn't break the flow
  }
};

/**
 * Welcome email after registration
 */
const sendWelcomeEmail = async (user) => {
  await sendEmail({
    to: user.email,
    subject: 'Welcome to Wachemo University Non-Cafeteria System',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1e40af; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Wachemo University</h1>
          <p style="color: #93c5fd; margin: 5px 0;">Non-Cafeteria Registration System</p>
        </div>
        <div style="padding: 30px; background: #f8fafc;">
          <h2>Welcome, ${user.fullName}!</h2>
          <p>Your account has been successfully created.</p>
          <p>You can now log in and apply for the Non-Cafeteria program to receive your monthly 3,000 ETB compensation.</p>
          <a href="${process.env.FRONTEND_URL}/login" 
             style="display: inline-block; background: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 16px;">
            Login to Your Account
          </a>
        </div>
        <div style="padding: 16px; text-align: center; color: #6b7280; font-size: 12px;">
          <p>© ${new Date().getFullYear()} Wachemo University. All rights reserved.</p>
        </div>
      </div>
    `,
  });
};

/**
 * Application status update email
 */
const sendApplicationStatusEmail = async (user, application, status, reason = '') => {
  const statusMessages = {
    under_review: {
      subject: 'Your Application is Under Review',
      color: '#f59e0b',
      heading: 'Application Under Review',
      body: 'Your non-cafeteria application is currently being reviewed by our team. We will notify you once a decision is made.',
    },
    approved: {
      subject: 'Congratulations! Your Application is Approved',
      color: '#10b981',
      heading: 'Application Approved! 🎉',
      body: 'Your non-cafeteria application has been approved. You will receive 3,000 ETB monthly compensation starting from next month.',
    },
    rejected: {
      subject: 'Your Application Has Been Rejected',
      color: '#ef4444',
      heading: 'Application Not Approved',
      body: `We regret to inform you that your application has been rejected. ${reason ? `<br/><strong>Reason:</strong> ${reason}` : ''}`,
    },
  };

  const info = statusMessages[status];
  if (!info) return;

  await sendEmail({
    to: user.email,
    subject: info.subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1e40af; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Wachemo University</h1>
        </div>
        <div style="padding: 30px; background: #f8fafc;">
          <h2 style="color: ${info.color};">${info.heading}</h2>
          <p>Dear ${user.fullName},</p>
          <p>${info.body}</p>
          <a href="${process.env.FRONTEND_URL}/dashboard" 
             style="display: inline-block; background: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 16px;">
            View Dashboard
          </a>
        </div>
        <div style="padding: 16px; text-align: center; color: #6b7280; font-size: 12px;">
          <p>© ${new Date().getFullYear()} Wachemo University. All rights reserved.</p>
        </div>
      </div>
    `,
  });
};

/**
 * Password reset email
 */
const sendPasswordResetEmail = async (user, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
  await sendEmail({
    to: user.email,
    subject: 'Password Reset Request',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1e40af; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Wachemo University</h1>
        </div>
        <div style="padding: 30px; background: #f8fafc;">
          <h2>Password Reset</h2>
          <p>Dear ${user.fullName},</p>
          <p>You requested a password reset. Click the button below to reset your password. This link expires in 1 hour.</p>
          <a href="${resetUrl}" 
             style="display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 16px;">
            Reset Password
          </a>
          <p style="margin-top: 16px; color: #6b7280; font-size: 12px;">If you didn't request this, please ignore this email.</p>
        </div>
      </div>
    `,
  });
};

/**
 * Payment notification email
 */
const sendPaymentEmail = async (user, payment) => {
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  await sendEmail({
    to: user.email,
    subject: `Payment of ${payment.amount} ETB Processed`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1e40af; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Wachemo University</h1>
        </div>
        <div style="padding: 30px; background: #f8fafc;">
          <h2 style="color: #10b981;">Payment Processed ✅</h2>
          <p>Dear ${user.fullName},</p>
          <p>Your monthly non-cafeteria compensation has been processed.</p>
          <table style="width:100%; border-collapse: collapse; margin-top: 16px;">
            <tr><td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>Amount</strong></td><td style="padding: 8px; border: 1px solid #e5e7eb;">${payment.amount} ETB</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>Month</strong></td><td style="padding: 8px; border: 1px solid #e5e7eb;">${months[payment.month - 1]} ${payment.year}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>Date</strong></td><td style="padding: 8px; border: 1px solid #e5e7eb;">${new Date(payment.paidDate).toLocaleDateString()}</td></tr>
          </table>
        </div>
      </div>
    `,
  });
};

module.exports = { sendEmail, sendWelcomeEmail, sendApplicationStatusEmail, sendPasswordResetEmail, sendPaymentEmail };
