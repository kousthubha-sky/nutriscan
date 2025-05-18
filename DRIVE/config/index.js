require('dotenv').config({
  path: `.env.${process.env.NODE_ENV || 'development'}`
});

module.exports = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3000,
  mongodb: {
    uri: process.env.MONGODB_URI
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessTokenExpiry: '15m',
    refreshTokenExpiry: '7d'
  },
  cors: {
    origin: process.env.CORS_ORIGIN
  },
  email: {
    service: process.env.EMAIL_SERVICE,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  },
  redis: {
    url: process.env.REDIS_URL
  },
  upload: {
    limits: {
      fileSize: 5 * 1024 * 1024 // 5MB
    },
    directory: './uploads'
  }
};
