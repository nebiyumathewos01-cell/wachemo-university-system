const Notification = require('../models/Notification');

/**
 * Create a notification for a user
 */
const createNotification = async ({ userId, title, message, type = 'system', link = null }) => {
  try {
    const notification = await Notification.create({ userId, title, message, type, link });
    return notification;
  } catch (error) {
    console.error('Notification creation error:', error.message);
  }
};

/**
 * Mark notification(s) as read
 */
const markAsRead = async (notificationId, userId) => {
  return await Notification.findOneAndUpdate(
    { _id: notificationId, userId },
    { read: true },
    { new: true }
  );
};

/**
 * Mark all notifications as read for a user
 */
const markAllAsRead = async (userId) => {
  return await Notification.updateMany({ userId, read: false }, { read: true });
};

/**
 * Get unread count for a user
 */
const getUnreadCount = async (userId) => {
  return await Notification.countDocuments({ userId, read: false });
};

module.exports = { createNotification, markAsRead, markAllAsRead, getUnreadCount };
