const ProductSubmission = require('../models/ProductSubmission');
const Product = require('../models/Product');
const calculateHealthRating = require('../utils/healthRating');
const User = require('../models/user.model');
const fs = require('fs').promises;

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
      total,
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
    const { id } = req.params;
    const { 
      status, 
      adminNotes,
      productName,
      brand,
      category,
      ingredients,
      nutritionalInfo,
      allergens,
      dietaryInfo,
    } = req.body;

    // Validate required fields
    if (!status) {
      return res.status(400).json({ 
        success: false,
        message: 'Status is required for review submission', 
      });
    }

    const submission = await ProductSubmission.findById(id);
    if (!submission) {
      return res.status(404).json({ 
        success: false,
        message: 'Submission not found', 
      });
    }

    // Validate submission status
    if (!['pending', 'in_review', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid status value', 
      });
    }

    // Update submission fields if provided
    if (productName) submission.productName = productName;
    if (brand) submission.brand = brand;
    if (category) submission.category = category;
    if (ingredients) submission.ingredients = ingredients;
    if (nutritionalInfo) submission.nutritionalInfo = nutritionalInfo;
    if (allergens) submission.allergens = allergens;
    if (dietaryInfo) submission.dietaryInfo = dietaryInfo;

    // Update status and add to review history
    submission.status = status;
    submission.adminNotes = adminNotes;
    submission.reviewHistory.push({
      status,
      notes: adminNotes,
      updatedBy: req.user._id,
    });

    // If approved, create a new product in the main products collection
    if (status === 'approved') {
      try {
        // Map nutritional info to product schema format
        const nutriments = {
          energy_kcal_100g: nutritionalInfo?.calories || 0,
          carbohydrates_100g: nutritionalInfo?.carbohydrates || 0,
          sugars_100g: nutritionalInfo?.sugar || 0,
          fat_100g: nutritionalInfo?.fat || 0,
          proteins_100g: nutritionalInfo?.protein || 0,
          fiber_100g: nutritionalInfo?.fiber || 0,
        };

        // Calculate health rating based on nutritional info
        const healthAnalysis = calculateHealthRating({
          ingredients: Array.isArray(ingredients) ? ingredients.join(', ') : '',
          nutriments,
          nutriscore_grade: 'unknown',
        });

        const newProduct = new Product({
          name: submission.productName,
          barcode: submission.barcodeNumber,
          brand: submission.brand,
          category: submission.category,
          ingredients: Array.isArray(submission.ingredients) ? submission.ingredients : [submission.ingredients].filter(Boolean),
          nutriments,
          allergens: Array.isArray(submission.allergens) ? submission.allergens : [submission.allergens].filter(Boolean),
          labels: submission.dietaryInfo ? submission.dietaryInfo.join(', ') : '',
          productImage: submission.productImage,
          barcodeImage: submission.barcodeImage,
          addedBy: submission.submittedBy,
          lastFetched: new Date(),
          healthRating: healthAnalysis.score,
          healthAnalysis: healthAnalysis.analysis,
          healthRatingLabel: healthAnalysis.rating,
          healthRatingColor: healthAnalysis.color,
        });

        await newProduct.save();
      } catch (productError) {
        console.error('Error creating product:', productError);
        return res.status(500).json({ 
          success: false,
          message: 'Failed to create product from submission',
          error: productError.message,
        });
      }
    }

    await submission.save();
    res.json({ 
      success: true,
      message: 'Submission reviewed successfully',
      submission,
    });
  } catch (error) {
    console.error('Review submission error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error processing review submission',
      error: error.message,
    });
  }
};

// Get submission statistics
exports.getSubmissionStats = async (req, res) => {
  try {
    const stats = await ProductSubmission.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const formattedStats = stats.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {
      pending: 0,
      approved: 0,
      rejected: 0,
    });

    res.json({
      success: true,
      stats: formattedStats,
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
      pendingSubmissions,
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
      .populate('submittedBy', 'username email')
      .sort({ submittedAt: -1 });
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get submission by ID
exports.getSubmissionById = async (req, res) => {
  try {
    const submission = await ProductSubmission.findById(req.params.id)
      .populate('submittedBy', 'username email')
      .populate('reviewHistory.updatedBy', 'username');
        
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }
        
    res.json(submission);
  } catch (error) {
    res.status(500).json({ message: error.message });
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

    submission.status = status;
    await submission.save();

    res.json({ message: 'Status updated successfully', submission });
  } catch (error) {
    res.status(500).json({ message: error.message });
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
      { new: true },
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
      { new: true },
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error updating user', error: error.message });
  }
};
