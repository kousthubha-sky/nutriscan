const mongoose = require('mongoose');

const refreshTokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  token: {
    type: String,
    required: true,
    unique: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 30 * 24 * 60 * 60, // Auto-delete after 30 days
  },
  isRevoked: {
    type: Boolean,
    default: false,
  },
  userAgent: String,
  ipAddress: String,
});

// Index for faster lookups and automatic expiration
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
refreshTokenSchema.index({ userId: 1, isRevoked: 1 });

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);
