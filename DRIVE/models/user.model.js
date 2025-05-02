const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true,
        minlength: [3, "user must be 3 letters"]
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address']
    },
    password: {
        type: String,
        required: true,
        minlength: [5, "password must be 5 letters"]
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    dietaryPreferences: {
        type: [String],
        default: []
    },
    allergies: {
        type: [String],
        default: []
    },
    resetOTP: {
        type: String
    },
    otpExpiry: {
        type: Date
    },
    lastOTPAttempt: {
        type: Date
    },
    otpAttempts: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastLogin: {
        type: Date
    }
})

// Add method to check if user can request new OTP
userSchema.methods.canRequestOTP = function() {
    if (!this.lastOTPAttempt) return true;
    
    // Allow new OTP request after 1 minute
    const timeSinceLastAttempt = Date.now() - this.lastOTPAttempt;
    return timeSinceLastAttempt >= 60000; // 1 minute in milliseconds
};

const user = mongoose.model('user', userSchema)
module.exports = user;

