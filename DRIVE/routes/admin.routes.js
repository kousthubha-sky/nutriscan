const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { isAdmin } = require('../controllers/adminController');
const adminController = require('../controllers/adminController');

// All admin routes should be protected by both auth and isAdmin middleware
router.use(auth);
router.use(isAdmin);

// Stats and overview
router.get('/stats', adminController.getStats);
router.get('/submissions/stats', adminController.getSubmissionStats);

// Submissions management
router.get('/submissions', adminController.getSubmissions);
router.get('/submissions/pending', adminController.getPendingSubmissions);
router.get('/submissions/:id', adminController.getSubmissionById);
router.patch('/submissions/:id/status', adminController.updateSubmissionStatus);
router.post('/submissions/:id/review', adminController.reviewSubmission);

// Products management
router.get('/products', adminController.getProducts);
router.patch('/products/:id/status', adminController.updateProductStatus);

// Users management
router.get('/users', adminController.getUsers);
router.patch('/users/:id/status', adminController.updateUserStatus);

module.exports = router;
