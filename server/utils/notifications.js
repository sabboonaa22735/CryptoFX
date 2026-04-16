const Notification = require('../models/Notification');
const AdminNotification = require('../models/AdminNotification');

const createNotification = async (userId, title, message, type = 'system', data = {}) => {
  try {
    const notification = await Notification.create({
      user: userId,
      title,
      message,
      type,
      data
    });
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};

const createBulkNotifications = async (notifications) => {
  try {
    const created = await Notification.insertMany(notifications);
    return created;
  } catch (error) {
    console.error('Error creating bulk notifications:', error);
    return [];
  }
};

const createAdminNotification = async (title, message, type = 'system', data = {}, relatedId = null) => {
  try {
    const notification = await AdminNotification.create({
      title,
      message,
      type,
      data,
      relatedId
    });
    return notification;
  } catch (error) {
    console.error('Error creating admin notification:', error);
    return null;
  }
};

const emitAdminNotification = (io, notification) => {
  if (io) {
    io.to('admin').emit('admin-notification', notification);
  }
};

module.exports = { createNotification, createBulkNotifications, createAdminNotification, emitAdminNotification };