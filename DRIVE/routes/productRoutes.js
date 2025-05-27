const express = require('express');
const fs = require('fs').promises;
const { searchProducts, getFeaturedProducts, getHealthierAlternatives, getIndianProducts } = require('../controllers/productController');
const { uploadProductImages, handleUploadError } = require('../middleware/upload');
const auth = require('../middleware/auth');
const ProductSubmission = require('../models/ProductSubmission');
const { catchAsync } = require('../middleware/errorMiddleware');
const { AppError, ErrorCodes } = require('../utils/errorHandler');
const router = express.Router();

// Public routes
router.get('/search', searchProducts);
router.get('/featured', getFeaturedProducts);
router.get('/indian', getIndianProducts);
router.post('/alternatives', getHealthierAlternatives); // Fixed route path to avoid double products prefix

// Protected routes
router.post('/submit', 
  auth, 
  uploadProductImages,
  handleUploadError,
  catchAsync(async (req, res) => {
    if (!req.files?.productImage?.[0] || !req.files?.barcodeImage?.[0]) {
      // Clean up any uploaded files before throwing error
      if (req.files) {
        await Promise.all(
          Object.values(req.files)
            .flat()
            .map(file => fs.unlink(file.path).catch(console.error)),
        );
      }
      throw new AppError('Both product and barcode images are required', 400, ErrorCodes.VALIDATION_ERROR);
    }

    const productImage = req.files.productImage[0].path;
    const barcodeImage = req.files.barcodeImage[0].path;
        
    // Validate required fields
    if (!req.body.productName || !req.body.barcodeNumber) {
      // Clean up uploaded files before throwing error
      await Promise.all([
        fs.unlink(productImage).catch(console.error),
        fs.unlink(barcodeImage).catch(console.error),
      ]);
      throw new AppError('Product name and barcode number are required', 400, ErrorCodes.VALIDATION_ERROR);
    }

    // Create submission record
    const submission = await ProductSubmission.create({
      productName: req.body.productName,
      barcodeNumber: req.body.barcodeNumber,
      productImage: productImage,
      barcodeImage: barcodeImage,
      additionalInfo: req.body.additionalInfo,
      submittedBy: req.user._id,
      status: 'pending',
    });

    res.status(201).json({
      success: true,
      message: 'Product submitted successfully',
      data: {
        submission,
      },
    });
  }));

module.exports = router;
