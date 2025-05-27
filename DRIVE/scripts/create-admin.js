const mongoose = require('mongoose');
const User = require('../models/user.model');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function createAdminUser(username, email, password) {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to database');

        // Check if user already exists
        const existingUser = await User.findOne({ 
            $or: [{ username }, { email }]
        });
        
        if (existingUser) {
            if (existingUser.username === username) {
                throw new Error('Username already exists');
            } else {
                throw new Error('Email already registered');
            }
        }

        // Create new admin user
        const hashedPassword = await bcrypt.hash(password, 10);
        const adminUser = await User.create({
            username,
            email,
            password: hashedPassword,
            role: 'admin'
        });

        console.log('Admin user created successfully:', {
            username: adminUser.username,
            email: adminUser.email,
            role: adminUser.role
        });

    } catch (error) {
        console.error('Error creating admin user:', error.message);
    } finally {
        await mongoose.disconnect();
    }
}

// Get command line arguments
const args = process.argv.slice(2);
if (args.length !== 3) {
    console.log('Usage: node create-admin.js <username> <email> <password>');
    process.exit(1);
}

const [username, email, password] = args;

// Validate password strength
if (password.length < 8) {
    console.error('Password must be at least 8 characters long');
    process.exit(1);
}

// Create the admin user
createAdminUser(username, email, password);
