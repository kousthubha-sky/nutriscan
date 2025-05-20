const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const RefreshToken = require('../models/refresh-token.model');
const { generateTokens } = require('../utils/token-service');

// Store for revoked tokens
const TOKEN_BLACKLIST = new Set();

module.exports = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        message: 'No auth token found',
        code: 'TOKEN_MISSING',
      });
    }

    // Check token blacklist
    if (TOKEN_BLACKLIST.has(token)) {
      return res.status(401).json({
        message: 'Token has been revoked',
        code: 'TOKEN_REVOKED',
      });
    }    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET, {
        algorithms: ['HS256'], // Explicitly specify allowed algorithms
      });
      
      // Check if token is about to expire
      const expiresIn = decoded.exp * 1000 - Date.now();
      const refreshThreshold = 5 * 60 * 1000; // 5 minutes
      
      // If token is about to expire and refresh token is present, generate new tokens
      if (expiresIn < refreshThreshold && req.header('X-Refresh-Token')) {
        const refreshToken = req.header('X-Refresh-Token');
        const validRefreshToken = await RefreshToken.findOne({
          token: refreshToken,
          isRevoked: false,
          expiresAt: { $gt: new Date() },
        });

        if (validRefreshToken) {
          const user = await User.findById(decoded.uid);
          if (user) {
            const tokens = await generateTokens(
              user,
              req.ip,
              req.headers['user-agent'],
            );

            // Set new tokens in response headers
            res.set({
              'X-Access-Token': tokens.accessToken,
              'X-Refresh-Token': tokens.refreshToken,
              'X-Token-Expiry': Date.now() + (tokens.expiresIn * 1000),
            });
          }
        }
      }

      // Additional security checks
      if (!decoded.uid || !decoded.role) {
        return res.status(401).json({
          message: 'Invalid token format',
          code: 'TOKEN_INVALID_FORMAT',
        });
      }
      
      if (expiresIn < 0) {
        return res.status(401).json({ 
          message: 'Token has expired',
          code: 'TOKEN_EXPIRED',
        });
      }

      const user = await User.findById(decoded.userId);
      if (!user) {
        return res.status(401).json({ 
          message: 'User not found',
          code: 'USER_NOT_FOUND',
        });
      }

      // Add token expiry info to response headers
      res.set({
        'X-Token-Expiry': decoded.exp * 1000,
        'X-Token-Refresh-Required': expiresIn < refreshThreshold ? 'true' : 'false',
      });

      req.user = user;
      req.token = token;
      next();
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          message: 'Token has expired',
          code: 'TOKEN_EXPIRED',
        });
      }
      
      return res.status(401).json({ 
        message: 'Invalid token',
        code: 'TOKEN_INVALID',
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ 
      message: 'Authentication failed',
      code: 'AUTH_ERROR',
    });
  }
};
