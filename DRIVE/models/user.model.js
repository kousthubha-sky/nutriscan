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
    },    password: {
        type: String,
        required: true,
        validate: {
            validator: function(value) {
                // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
                return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\W]{8,}$/.test(value);
            },
            message: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number'
        }
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
    },
    failedLoginAttempts: {
        type: Number,
        default: 0
    },
    accountLocked: {
        type: Boolean,
        default: false
    },
    lockUntil: {
        type: Date
    },
    lastFailedLogin: {
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

// Add method to handle failed login attempts
userSchema.methods.handleFailedLogin = async function() {
    this.failedLoginAttempts += 1;
    this.lastFailedLogin = new Date();
    
    // Lock account after 5 failed attempts
    if (this.failedLoginAttempts >= 5) {
        this.accountLocked = true;
        this.lockUntil = new Date(Date.now() + 30 * 60 * 1000); // Lock for 30 minutes
    }
    
    await this.save();
};

// Add method to reset failed login attempts
userSchema.methods.resetFailedLoginAttempts = async function() {
    this.failedLoginAttempts = 0;
    this.accountLocked = false;
    this.lockUntil = null;
    await this.save();
};

const user = mongoose.model('user', userSchema)
module.exports = user;

