module.exports = {
  env: 'production',
  port: process.env.PORT || 3000,
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  corsOrigin: process.env.FRONTEND_URL,
  uploadLimits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 3,
  },
  logLevel: 'error',
};
