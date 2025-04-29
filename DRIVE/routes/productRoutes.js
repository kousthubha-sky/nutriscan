const express = require('express');
const fs = require('fs').promises;
const { searchProducts, getFeaturedProducts, getHealthierAlternatives, getIndianProducts } = require('../controllers/productController');
const { uploadProductImages, handleUploadError } = require('../middleware/upload');
const auth = require('../middleware/auth');
const ProductSubmission = require('../models/ProductSubmission');
const router = express.Router();

// Public routes
router.get('/search', searchProducts);
router.get('/featured', getFeaturedProducts);
router.get('/indian', getIndianProducts);
router.post('/alternatives', getHealthierAlternatives); // Ensure this route is properly configured

// Protected routes
router.post('/submit', 
    auth, 
    uploadProductImages,
    handleUploadError,
    async (req, res) => {
        try {
            // Files are available as req.files.productImage[0] and req.files.barcodeImage[0]
            const productImage = req.files.productImage[0].path;
            const barcodeImage = req.files.barcodeImage[0].path;
            
            // Create submission record
            const submission = await ProductSubmission.create({
                productName: req.body.productName,
                barcodeNumber: req.body.barcodeNumber,
                productImage: productImage,
                barcodeImage: barcodeImage,
                additionalInfo: req.body.additionalInfo,
                submittedBy: req.user._id,
                status: 'pending'
            });

            res.status(201).json({
                success: true,
                message: 'Product submitted successfully',
                submission
            });
        } catch (error) {
            // If there's an error, clean up any uploaded files
            if (req.files) {
                Object.values(req.files).forEach(fileArray => {
                    fileArray.forEach(file => {
                        fs.unlink(file.path).catch(console.error);
                    });
                });
            }
            
            res.status(500).json({
                success: false,
                message: 'Failed to submit product',
                error: error.message
            });
        }
    }
);

module.exports = router;