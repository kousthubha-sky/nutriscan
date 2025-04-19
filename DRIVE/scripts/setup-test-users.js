const mongoose = require('mongoose');
const User = require('../models/user.model');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function setupTestUsers() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to database');

        // Create test user if doesn't exist
        const testUser = await User.findOne({ username: 'testuser' });
        if (!testUser) {
            const hashedPassword = await bcrypt.hash('testpass123', 10);
            await User.create({
                username: 'testuser',
                email: 'testuser@example.com',
                password: hashedPassword,
                role: 'user'
            });
            console.log('Test user created');
        } else {
            console.log('Test user already exists');
        }

        // Create admin user if doesn't exist
        const adminUser = await User.findOne({ username: 'admin' });
        if (!adminUser) {
            const hashedPassword = await bcrypt.hash('adminpass123', 10);
            await User.create({
                username: 'admin',
                email: 'admin@example.com',
                password: hashedPassword,
                role: 'admin'
            });
            console.log('Admin user created');
        } else {
            console.log('Admin user already exists');
        }

        console.log('Test users setup complete');
    } catch (error) {
        console.error('Error setting up test users:', error);
    } finally {
        await mongoose.disconnect();
    }
}

setupTestUsers();