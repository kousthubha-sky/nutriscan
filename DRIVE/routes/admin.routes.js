const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');

// Protected admin routes
router.use(auth, adminController.isAdmin);

// Dashboard stats
router.get('/stats', adminController.getStats);

// Products management
router.get('/products', adminController.getProducts);
router.patch('/products/:id/status', adminController.updateProductStatus);

// Submissions management
router.get('/submissions', adminController.getSubmissions);
router.get('/submissions/stats', adminController.getSubmissionStats);
router.get('/submissions/pending', adminController.getPendingSubmissions);
router.get('/submissions/:id', adminController.getSubmissionDetails);
router.patch('/submissions/:id/status', adminController.updateSubmissionStatus);
router.post('/submissions/:id/review', adminController.reviewSubmission);

// User management
router.get('/users', adminController.getUsers);
router.patch('/users/:id/status', adminController.updateUserStatus);

module.exports = router;