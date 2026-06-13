const AuditLog = require('../models/AuditLog');

/**
 * Creates an audit log entry
 */
const createAuditLog = async ({ userId, action, entity, entityId, details, req }) => {
  try {
    await AuditLog.create({
      userId: userId || null,
      action,
      entity,
      entityId: entityId || null,
      details: details || null,
      ipAddress: req ? (req.ip || req.connection?.remoteAddress) : null,
      userAgent: req ? req.get('User-Agent') : null,
    });
  } catch (err) {
    // Non-blocking — log but don't crash
    console.error('Audit log error:', err.message);
  }
};

module.exports = { createAuditLog };
