module.exports = {
  env: 'development',
  port: process.env.PORT || 3000,
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/drive_dev',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-key',
  corsOrigin: 'http://localhost:5173', // Vite's default dev server port
  uploadLimits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 5,
  },
  logLevel: 'debug',
};
