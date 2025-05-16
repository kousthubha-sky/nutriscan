const express = require('express')
const app = express()
const router = express.Router()
const userModel = require('../models/user.model')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {body, validationResult} = require('express-validator');
const auth = require('../middleware/auth');
const { sendEmail } = require('../config/email');
const rateLimit = require('express-rate-limit');
const sanitizer = require('express-sanitizer');

// Enhanced password hashing configuration
const PEPPER = process.env.PASSWORD_PEPPER || 'your-secure-pepper-key'; // Move to env in production
const SALT_ROUNDS = 12;

const hashPassword = async (password) => {
  try {
    // Add pepper to password before hashing
    const pepperedPassword = password + PEPPER;
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    return await bcrypt.hash(pepperedPassword, salt);
  } catch (error) {
    throw new Error('Password hashing failed');
  }
};

const verifyPassword = async (password, hash) => {
  try {
    const pepperedPassword = password + PEPPER;
    return await bcrypt.compare(pepperedPassword, hash);
  } catch (error) {
    throw new Error('Password verification failed');
  }
};

// Rate limiters
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window per IP
  message: 'Too many login attempts, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      message: 'Too many login attempts, please try again after 15 minutes',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
    });
  },
  skipSuccessfulRequests: true // Don't count successful logins
});

const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 accounts per hour per IP
  message: 'Too many accounts created, please try again after an hour'
});

const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 password reset attempts per hour
  message: 'Too many password reset attempts, please try again after an hour'
});

// Middleware
router.use(sanitizer());

// Helper function to validate password strength
const validatePasswordStrength = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasNonAlphas = /\W/.test(password);

  if (password.length < minLength) return 'Password must be at least 8 characters long';
  if (!hasUpperCase) return 'Password must contain at least one uppercase letter';
  if (!hasLowerCase) return 'Password must contain at least one lowercase letter';
  if (!hasNumbers) return 'Password must contain at least one number';
  if (!hasNonAlphas) return 'Password must contain at least one special character';
  
  return null;
};

router.get('/signup', (req, res) => {
  res.render('register')
})
// Signup route with enhanced security
router.post('/signup',
  signupLimiter,
  body('username')
    .trim()
    .isLength({min: 3})
    .withMessage('Username must be at least 3 characters long')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Username can only contain letters, numbers, underscores and dashes')
    .escape(),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Invalid email address')
    .normalizeEmail(),
  body('password')
    .trim()
    .custom((value) => {
      const validationError = validatePasswordStrength(value);
      if (validationError) throw new Error(validationError);
      return true;
    }),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errors: errors.array(),
          message: 'User registration failed',
        });
      }

      const { email, username, password, role } = req.body;

      // Sanitize inputs
      const sanitizedUsername = req.sanitize(username.toLowerCase());
      const sanitizedEmail = req.sanitize(email.toLowerCase());

      // Check existing user
      const existingUser = await userModel.findOne({
        $or: [
          { username: sanitizedUsername },
          { email: sanitizedEmail }
        ]
      });

      if (existingUser) {
        return res.status(400).json({
          message: existingUser.username === sanitizedUsername ? 
            'Username already exists' : 'Email already registered'
        });
      }      // Hash password with pepper
      const hashedPassword = await hashPassword(password);

      const newUser = await userModel.create({
        username: sanitizedUsername,
        email: sanitizedEmail,
        password: hashedPassword,
        role: role === 'admin' ? 'admin' : 'user'
      });

      // Generate JWT token with reduced payload
      const token = jwt.sign(
        { 
          uid: newUser._id,
          role: newUser.role 
        },
        process.env.JWT_SECRET,
        { 
          expiresIn: '1h',
          algorithm: 'HS256'
        }
      );

      // Remove sensitive data from response
      const userResponse = {
        _id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role
      };
      
      res.status(201).json({
        message: 'Registration successful',
        user: userResponse,
        token: token
      });

    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({
        message: 'Registration failed',
        error: error.message
      });
    }
  }
)

router.get('/login', (req, res) => {
  res.render('login')
})
// Login route with enhanced security
router.post('/login',
  loginLimiter,
  body('username')
    .trim()
    .isLength({min: 3})
    .escape(),
  body('password')
    .trim()
    .isLength({min: 8}),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: 'Invalid credentials'
        });
      }      const { username, password } = req.body;
      const sanitizedUsername = req.sanitize(username.toLowerCase());

      const user = await userModel.findOne({ 
        username: sanitizedUsername
      });

      // Check for account lockout
      if (user && user.accountLocked && user.lockUntil > Date.now()) {
        const waitMinutes = Math.ceil((user.lockUntil - Date.now()) / (60 * 1000));
        return res.status(423).json({
          message: `Account is temporarily locked. Please try again in ${waitMinutes} minutes`
        });
      }

      if (!user) {
        // Use consistent timing to prevent username enumeration
        await bcrypt.compare(password, '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LcdYste0X/S.PXY1G');
        return res.status(401).json({
          message: 'Invalid credentials'
        });
      }      const isMatch = await verifyPassword(password, user.password);
      if (!isMatch) {
        await user.handleFailedLogin();
        return res.status(401).json({ 
          message: user.accountLocked ? 
            'Account has been locked due to too many failed attempts' : 
            'Invalid credentials'
        });
      }

      // Reset failed login attempts and update last login timestamp
      await user.resetFailedLoginAttempts();
      user.lastLogin = new Date();
      await user.save();

      // Generate new JWT token
      const token = jwt.sign(
        { 
          uid: user._id,
          role: user.role 
        },
        process.env.JWT_SECRET,
        { 
          expiresIn: '1h',
          algorithm: 'HS256'
        }
      );

      const userResponse = {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      };

      res.status(200).json({
        message: 'Login successful',
        user: userResponse,
        token: token
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        message: 'Login failed',
        error: 'An unexpected error occurred'
      });
    }
  }
);

// Generate OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Forgot Password - Request OTP
router.post('/forgot-password',
  body('email').isEmail().normalizeEmail(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: 'Invalid email format'
        });
      }

      const { email } = req.body;
      const user = await userModel.findOne({ email: email.toLowerCase() });
      
      if (!user) {
        return res.status(404).json({ message: 'No account found with this email address' });
      }

      if (!user.canRequestOTP()) {
        return res.status(429).json({ 
          message: 'Please wait 1 minute before requesting another OTP'
        });
      }

      // Generate and save OTP
      const otp = generateOTP();
      user.resetOTP = otp;
      user.otpExpiry = Date.now() + 600000; // 10 minutes
      user.lastOTPAttempt = Date.now();
      user.otpAttempts += 1;
      await user.save();

      // Send OTP via email
      const emailSent = await sendEmail(
        email,
        'Password Reset OTP',
        `
        <h2>Password Reset Request</h2>
        <p>Your OTP for password reset is: <strong>${otp}</strong></p>
        <p>This OTP will expire in 10 minutes.</p>
        <p>If you didn't request this password reset, please ignore this email.</p>
        `
      );

      if (!emailSent) {
        throw new Error('Failed to send OTP email');
      }

      res.json({
        message: 'OTP sent successfully to your email'
      });
    } catch (error) {
      console.error('Password reset error:', error);
      res.status(500).json({ message: error.message || 'Error sending OTP' });
    }
  }
);

// Verify OTP
router.post('/verify-otp',
  body('email').isEmail().normalizeEmail(),
  body('otp').isLength({ min: 6, max: 6 }),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: 'Invalid input'
        });
      }

      const { email, otp } = req.body;
      const user = await userModel.findOne({ 
        email: email.toLowerCase(),
        resetOTP: otp,
        otpExpiry: { $gt: Date.now() }
      });

      if (!user) {
        return res.status(400).json({ message: 'Invalid or expired OTP' });
      }

      res.json({ message: 'OTP verified successfully' });
    } catch (error) {
      console.error('OTP verification error:', error);
      res.status(500).json({ message: 'Error verifying OTP' });
    }
  }
);

// Reset Password with OTP
router.post('/reset-password',
  body('email').isEmail().normalizeEmail(),
  body('otp').isLength({ min: 6, max: 6 }),
  body('password').isLength({ min: 5 }).trim(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: 'Invalid input'
        });
      }

      const { email, otp, password } = req.body;
      const user = await userModel.findOne({ 
        email: email.toLowerCase(),
        resetOTP: otp,
        otpExpiry: { $gt: Date.now() }
      });

      if (!user) {
        return res.status(400).json({ message: 'Invalid or expired OTP' });
      }

      // Update password
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
      user.resetOTP = undefined;
      user.otpExpiry = undefined;
      user.otpAttempts = 0;
      await user.save();

      res.json({ message: 'Password reset successful' });
    } catch (error) {
      console.error('Password reset error:', error);
      res.status(500).json({ message: 'Error resetting password' });
    }
  }
);

// Change Password (requires authentication)
router.post('/change-password',
  auth,
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 5 }),
  async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      
      // Check current password
      const isMatch = await bcrypt.compare(currentPassword, req.user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }

      // Update password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      req.user.password = hashedPassword;
      await req.user.save();

      res.json({ message: 'Password changed successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error changing password', error: error.message });
    }
  }
);

// Update user preferences
router.patch('/preferences',
  auth,
  async (req, res) => {
    try {
      const { dietaryPreferences, allergies, location } = req.body;
      
      const user = await userModel.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (dietaryPreferences !== undefined) {
        user.dietaryPreferences = dietaryPreferences;
      }
      if (allergies !== undefined) {
        user.allergies = allergies;
      }
      if (location !== undefined) {
        user.location = location;
      }

      await user.save();

      // Return updated user without password
      const userResponse = {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        dietaryPreferences: user.dietaryPreferences,
        allergies: user.allergies,
        location: user.location
      };

      res.json({ message: 'Preferences updated successfully', user: userResponse });
    } catch (error) {
      res.status(500).json({ message: 'Error updating preferences', error: error.message });
    }
  }
);

module.exports = router