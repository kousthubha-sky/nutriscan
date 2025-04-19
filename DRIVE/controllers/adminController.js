const ProductSubmission = require('../models/ProductSubmission');
const Product = require('../models/Product');
const calculateHealthRating = require('../utils/healthRating');
const User = require('../models/user.model');
const fs = require('fs').promises;
const path = require('path');

// Helper function to delete uploaded files
async function cleanupFiles(submission) {
    try {
        if (submission.productImage) {
            await fs.unlink(submission.productImage);
        }
        if (submission.barcodeImage) {
            await fs.unlink(submission.barcodeImage);
        }
    } catch (error) {
        console.error('Error cleaning up files:', error);
    }
}

// Middleware to check if user is admin
exports.isAdmin = async (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    
    if (req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Access denied. Admin only.' });
    }
    
    next();
};

// Get all pending submissions
exports.getPendingSubmissions = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const submissions = await ProductSubmission
            .find({ status: 'pending' })
            .populate('submittedBy', 'username email')
            .sort({ submittedAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const total = await ProductSubmission.countDocuments({ status: 'pending' });

        res.json({
            success: true,
            submissions,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            total
        });
    } catch (error) {
        console.error('Error fetching submissions:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch submissions' });
    }
};

// Get submission details
exports.getSubmissionDetails = async (req, res) => {
    try {
        const submission = await ProductSubmission
            .findById(req.params.id)
            .populate('submittedBy', 'username email')
            .populate('reviewedBy', 'username')
            .lean();

        if (!submission) {
            return res.status(404).json({ success: false, message: 'Submission not found' });
        }

        res.json({ success: true, submission });
    } catch (error) {
        console.error('Error fetching submission:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch submission details' });
    }
};

// Review submission (approve/reject)
exports.reviewSubmission = async (req, res) => {
    try {
        const { status, feedback } = req.body;
        const submissionId = req.params.id;

        const submission = await ProductSubmission.findById(submissionId);
        if (!submission) {
            return res.status(404).json({ success: false, message: 'Submission not found' });
        }

        submission.status = status;
        submission.adminFeedback = feedback;
        submission.reviewedBy = req.user._id;
        submission.reviewedAt = new Date();

        if (status === 'approved') {
            // Create or update product in main database
            await Product.findOneAndUpdate(
                { barcodeNumber: submission.barcodeNumber },
                {
                    name: submission.productName,
                    barcodeNumber: submission.barcodeNumber,
                    image: submission.productImage,
                    barcodeImage: submission.barcodeImage,
                    additionalInfo: submission.additionalInfo,
                    lastUpdated: new Date(),
                    addedBy: submission.submittedBy,
                    status: 'active',
                    source: 'user_submission'
                },
                { upsert: true, new: true }
            );
        } else if (status === 'rejected') {
            // Clean up files for rejected submissions
            await cleanupFiles(submission);
        }

        await submission.save();

        res.json({
            success: true,
            message: `Submission ${status}`,
            submission
        });
    } catch (error) {
        console.error('Error reviewing submission:', error);
        res.status(500).json({ success: false, message: 'Failed to review submission' });
    }
};

// Get submission statistics
exports.getSubmissionStats = async (req, res) => {
    try {
        const stats = await ProductSubmission.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        const formattedStats = stats.reduce((acc, stat) => {
            acc[stat._id] = stat.count;
            return acc;
        }, {
            pending: 0,
            approved: 0,
            rejected: 0
        });

        res.json({
            success: true,
            stats: formattedStats
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch statistics' });
    }
};

// Get admin dashboard statistics
exports.getStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const activeUsers = await User.countDocuments({ status: 'active' });
        const totalProducts = await Product.countDocuments();
        const pendingSubmissions = await ProductSubmission.countDocuments({ status: 'pending' });

        res.json({
            totalUsers,
            activeUsers,
            totalProducts,
            pendingSubmissions
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching stats', error: error.message });
    }
};

// Get all products
exports.getProducts = async (req, res) => {
    try {
        const products = await Product.find()
            .sort({ createdAt: -1 })
            .populate('addedBy', 'username');
        
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching products', error: error.message });
    }
};

// Get all product submissions
exports.getSubmissions = async (req, res) => {
    try {
        const submissions = await ProductSubmission.find()
            .sort({ createdAt: -1 })
            .populate('submittedBy', 'username');
        
        res.json(submissions);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching submissions', error: error.message });
    }
};

// Get all users
exports.getUsers = async (req, res) => {
    try {
        const users = await User.find()
            .sort({ createdAt: -1 })
            .select('-password');
        
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users', error: error.message });
    }
};

// Update submission status
exports.updateSubmissionStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const submission = await ProductSubmission.findById(id);
        if (!submission) {
            return res.status(404).json({ message: 'Submission not found' });
        }

        const previousStatus = submission.status;
        submission.status = status;
        await submission.save();

        // If status changed to approved, create a new product
        if (status === 'approved') {
            const newProduct = new Product({
                name: submission.productName,
                barcode: submission.barcodeNumber,
                productImage: submission.productImage,  // Using consistent field name
                barcodeImage: submission.barcodeImage,
                description: submission.additionalInfo,
                addedBy: submission.submittedBy,
                status: 'active'
            });
            await newProduct.save();
        }

        // If rejected, clean up files
        if (status === 'rejected' && previousStatus !== 'rejected') {
            await cleanupFiles(submission);
        }

        res.json(submission);
    } catch (error) {
        res.status(500).json({ 
            message: 'Error updating submission', 
            error: error.message,
            details: error.errors // Include validation errors if any
        });
    }
};

// Update product status
exports.updateProductStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const product = await Product.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json(product);
    } catch (error) {
        res.status(500).json({ message: 'Error updating product', error: error.message });
    }
};

// Update user status
exports.updateUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const user = await User.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error updating user', error: error.message });
    }
};