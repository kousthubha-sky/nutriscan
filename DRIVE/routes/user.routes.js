const express = require('express')
const app = express()
const router = express.Router()
const userModel = require('../models/user.model')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {body, validationResult} = require('express-validator');
const auth = require('../middleware/auth');

router.get('/signup', (req, res) => {
  res.render('register')
})
router.post('/signup',
  body('username').trim().isLength({min: 3}).withMessage('Username must be at least 3 characters long'),
  body('email').trim().isEmail().withMessage('Invalid email address'),
  body('password').trim().isLength({min: 5}).withMessage('Password must be at least 8 characters long'),

  async (req, res) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
        message: 'User registration failed',
      })
    }
    const { email, username, password, role } = req.body

    // Check if the username already exists
    const existingUser = await userModel.findOne({ username: username.toLowerCase() })
    
    if (existingUser) {
      return res.status(400).json({
        message: 'Username already exists'
      })
    }
    
    const hashedPassword = await bcrypt.hash(password, 10)
    //whenever a new user is created it will be saved in the database in this const variable
    const newUser = await userModel.create({
      username,
      email,
      password: hashedPassword,
      role: role === 'admin' ? 'admin' : 'user'  // Only set admin if explicitly specified
    })

    // Remove password from response
    const userResponse = {
      _id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role
    }
    
    res.json(userResponse)
  }
)

router.get('/login', (req, res) => {
  res.render('login')
})
router.post('/login',
  body('username').trim().isLength({min: 3}),
  body('password').trim().isLength({min: 5}),
  async (req, res) => {
    const errors = validationResult(req)

    if(!errors.isEmpty()){
      return res.status(400).json({
        errors: errors.array(),
        message: 'User login failed'
      })
    }
    
    const { username, password } = req.body
    
    const user = await userModel.findOne({ 
      username: username.toLowerCase()
    })
    
    if(!user){
      return res.status(400).json({
        message: 'Username or password incorrect'
      })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if(!isMatch) {
      return res.status(400).json({ message: 'Password incorrect' });
    }

    // Generate JWT token with role included
    const token = jwt.sign(
      { 
        userId: user._id,
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Return user data and token
    const userData = {
      username: user.username,
      email: user.email,
      _id: user._id,
      role: user.role
    };

    return res.status(200).json({
      message: 'Login successful',
      user: userData,
      token: token
    });
  }
);

// Forgot Password - Request Reset
router.post('/forgot-password',
  body('email').isEmail().normalizeEmail(),
  async (req, res) => {
    try {
      const { email } = req.body;
      const user = await userModel.findOne({ email });
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Generate reset token
      const resetToken = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      // Save reset token and expiry to user
      user.resetToken = resetToken;
      user.resetTokenExpiry = Date.now() + 3600000; // 1 hour
      await user.save();

      // In a real application, send email with reset link
      // For demo, just return the token
      res.json({ 
        message: 'Password reset email sent',
        resetToken // In production, this would be sent via email
      });
    } catch (error) {
      res.status(500).json({ message: 'Error initiating password reset', error: error.message });
    }
  }
);

// Reset Password with Token
router.post('/reset-password',
  body('password').isLength({ min: 5 }),
  body('token').notEmpty(),
  async (req, res) => {
    try {
      const { token, password } = req.body;
      
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await userModel.findOne({
        _id: decoded.userId,
        resetToken: token,
        resetTokenExpiry: { $gt: Date.now() }
      });

      if (!user) {
        return res.status(400).json({ message: 'Invalid or expired reset token' });
      }

      // Update password
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
      user.resetToken = undefined;
      user.resetTokenExpiry = undefined;
      await user.save();

      res.json({ message: 'Password reset successful' });
    } catch (error) {
      res.status(500).json({ message: 'Error resetting password', error: error.message });
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