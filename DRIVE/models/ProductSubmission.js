const mongoose = require('mongoose');

const productSubmissionSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    minlength: [2, 'Product name must be at least 2 characters long'],
    maxlength: [100, 'Product name cannot exceed 100 characters'],
  },
  barcodeNumber: {
    type: String,
    required: [true, 'Barcode number is required'],
    unique: true,
    sparse: true,
    validate: {
      validator: function (v) {
        // Basic validation for common barcode formats (EAN-13, UPC-A, EAN-8)
        return /^[0-9]{8,14}$/.test(v);
      },
      message: props => `${props.value} is not a valid barcode number. Must be 8-14 digits.`,
    },
  },
  brand: {
    type: String,
    trim: true,
    default: 'Not specified',
    maxlength: [50, 'Brand name cannot exceed 50 characters'],
  },
  category: {
    type: String,
    trim: true,
    default: 'Uncategorized',
    enum: {
      values: [
        'Uncategorized',
        'dairy',
        'snacks',
        'beverages',
        'grains',
        'fruits',
        'meat',
        'seafood',
        'bakery',
        'condiments',
        'frozen',
        'organic',
      ],
      message: '{VALUE} is not a valid category',
    },
  },
  ingredients: [{
    type: String,
    trim: true,
    maxlength: [100, 'Individual ingredient name cannot exceed 100 characters'],
  }],
  nutritionalInfo: {
    servingSize: {
      type: String,
      trim: true,
      maxlength: [50, 'Serving size description cannot exceed 50 characters'],
    },
    calories: {
      type: Number,
      min: [0, 'Calories cannot be negative'],
      max: [10000, 'Calories value seems too high'],
    },
    protein: {
      type: Number,
      min: [0, 'Protein content cannot be negative'],
      max: [1000, 'Protein value seems too high'],
    },
    carbohydrates: {
      type: Number,
      min: [0, 'Carbohydrate content cannot be negative'],
      max: [1000, 'Carbohydrate value seems too high'],
    },
    fat: {
      type: Number,
      min: [0, 'Fat content cannot be negative'],
      max: [1000, 'Fat value seems too high'],
    },
    fiber: {
      type: Number,
      min: [0, 'Fiber content cannot be negative'],
      max: [100, 'Fiber value seems too high'],
    },
    sugar: {
      type: Number,
      min: [0, 'Sugar content cannot be negative'],
      max: [100, 'Sugar value seems too high'],
    },
    sodium: {
      type: Number,
      min: [0, 'Sodium content cannot be negative'],
      max: [10000, 'Sodium value seems too high'],
    },
  },
  allergens: [{
    type: String,
    trim: true,
    maxlength: [50, 'Allergen name cannot exceed 50 characters'],
  }],
  dietaryInfo: [{
    type: String,
    trim: true,
    enum: {
      values: [
        'Vegan',
        'Vegetarian',
        'Gluten-Free',
        'Lactose-Free',
        'Organic',
        'Kosher',
        'Halal',
        'Low-Carb',
        'Sugar-Free',
        'Keto-Friendly',
      ],
      message: '{VALUE} is not a recognized dietary category',
    },
  }],
  productImage: {
    type: String,
    required: [true, 'Product image is required'],
    validate: {
      validator: function (v) {
        return /\.(jpg|jpeg|png)$/i.test(v);
      },
      message: 'Product image must be a valid image file (JPG, JPEG, or PNG)',
    },
  },
  barcodeImage: {
    type: String,
    required: [true, 'Barcode image is required'],
    validate: {
      validator: function (v) {
        return /\.(jpg|jpeg|png)$/i.test(v);
      },
      message: 'Barcode image must be a valid image file (JPG, JPEG, or PNG)',
    },
  },    status: {
    type: String,
    enum: {
      values: ['pending', 'in_review', 'approved', 'rejected'],
      message: '{VALUE} is not a valid submission status',
    },
    default: 'pending',
    required: [true, 'Submission status is required'],
  },
  adminNotes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Admin notes cannot exceed 1000 characters'],
  },    reviewHistory: [{
    status: {
      type: String,
      enum: {
        values: ['pending', 'in_review', 'approved', 'rejected'],
        message: '{VALUE} is not a valid review status',
      },
      required: [true, 'Review status is required'],
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Review notes cannot exceed 1000 characters'],
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: [true, 'Reviewer information is required'],
    },
    updatedAt: {
      type: Date,
      default: Date.now,
      required: [true, 'Review timestamp is required'],
    },
  }],
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: [true, 'Submitter information is required'],
    validate: {
      validator: async function (value) {
        try {
          const User = mongoose.model('user');
          const user = await User.findById(value);
          return user !== null;
        } catch (err) {
          return false;
        }
      },
      message: 'The specified user does not exist',
    },
  },
  submittedAt: {
    type: Date,
    default: Date.now,
    required: [true, 'Submission timestamp is required'],
    validate: {
      validator: function (value) {
        return value <= Date.now();
      },
      message: 'Submission date cannot be in the future',
    },
  },
  updatedAt: {
    type: Date,
    default: Date.now,
    required: [true, 'Last update timestamp is required'],
  },
});

productSubmissionSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

const ProductSubmission = mongoose.model('ProductSubmission', productSubmissionSchema);
module.exports = ProductSubmission;
