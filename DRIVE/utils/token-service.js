const jwt = require('jsonwebtoken');
const RefreshToken = require('../models/refresh-token.model');
const crypto = require('crypto');

const generateTokens = async (user, ipAddress, userAgent) => {
    // Generate access token with shorter expiry
    const accessToken = jwt.sign(
        { 
            uid: user._id,
            role: user.role 
        },
        process.env.JWT_SECRET,
        { 
            expiresIn: '15m',  // Shorter expiry for access tokens
            algorithm: 'HS256'
        }
    );

    // Generate refresh token
    const refreshToken = crypto.randomBytes(40).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    // Save refresh token to database
    await RefreshToken.create({
        userId: user._id,
        token: refreshToken,
        expiresAt,
        userAgent,
        ipAddress
    });

    return {
        accessToken,
        refreshToken,
        expiresIn: 900 // 15 minutes in seconds
    };
};

const verifyRefreshToken = async (token) => {
    const refreshToken = await RefreshToken.findOne({
        token,
        isRevoked: false,
        expiresAt: { $gt: new Date() }
    }).populate('userId');

    if (!refreshToken) {
        throw new Error('Invalid refresh token');
    }

    return refreshToken;
};

const revokeRefreshToken = async (token) => {
    await RefreshToken.updateOne(
        { token },
        { isRevoked: true }
    );
};

module.exports = {
    generateTokens,
    verifyRefreshToken,
    revokeRefreshToken
};
