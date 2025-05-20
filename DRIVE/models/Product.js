const mongoose = require('mongoose');

const HealthHistorySchema = new mongoose.Schema({
  score: {
    type: Number,
    required: [true, 'Health score is required'],
    min: [0, 'Health score cannot be negative'],
    max: [5, 'Health score cannot exceed 5'],
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: [true, 'Timestamp is required'],
    validate: {
      validator: function (value) {
        return value <= Date.now();
      },
      message: 'Health history timestamp cannot be in the future',
    },
  },
  reason: {
    type: String,
    required: [true, 'Reason for health score change is required'],
    trim: true,
    maxlength: [500, 'Reason cannot exceed 500 characters'],
  },
});

const productSchema = new mongoose.Schema({
  barcode: {
    type: String,
    required: [true, 'Barcode is required'],
    unique: true,
    index: true,
    validate: {
      validator: function (v) {
        return /^[0-9]{8,14}$/.test(v);
      },
      message: props => `${props.value} is not a valid barcode number. Must be 8-14 digits.`,
    },
  },
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    index: true,
    minlength: [2, 'Product name must be at least 2 characters long'],
    maxlength: [100, 'Product name cannot exceed 100 characters'],
  },
  brand: {
    type: String,
    trim: true,
    index: true,
    maxlength: [50, 'Brand name cannot exceed 50 characters'],
  },
  productImage: {
    type: String,
    validate: {
      validator: function (v) {
        return !v || /\.(jpg|jpeg|png)$/i.test(v);
      },
      message: 'Product image must be a valid image file (JPG, JPEG, or PNG)',
    },
  },
  barcodeImage: {
    type: String,
    validate: {
      validator: function (v) {
        return !v || /\.(jpg|jpeg|png)$/i.test(v);
      },
      message: 'Barcode image must be a valid image file (JPG, JPEG, or PNG)',
    },
  },
  category: {
    type: String,
    trim: true,
    index: true,
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
    default: 'Uncategorized',
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters'],
  },
  ingredients: [{
    type: String,
    trim: true,
    maxlength: [100, 'Individual ingredient name cannot exceed 100 characters'],
  }],
  labels: {
    type: String,
    trim: true,
    maxlength: [200, 'Labels cannot exceed 200 characters'],
  },
  allergens: [{
    type: String,
    trim: true,
    maxlength: [50, 'Allergen name cannot exceed 50 characters'],
  }],
  nutriments: {
    energy_kcal_100g: {
      type: Number,
      min: [0, 'Energy value cannot be negative'],
      max: [1000, 'Energy value seems too high'],
    },
    carbohydrates_100g: {
      type: Number,
      min: [0, 'Carbohydrates value cannot be negative'],
      max: [100, 'Carbohydrates value cannot exceed 100g per 100g'],
    },
    sugars_100g: {
      type: Number,
      min: [0, 'Sugars value cannot be negative'],
      max: [100, 'Sugars value cannot exceed 100g per 100g'],
    },
    fat_100g: {
      type: Number,
      min: [0, 'Fat value cannot be negative'],
      max: [100, 'Fat value cannot exceed 100g per 100g'],
    },
    saturated_fat_100g: {
      type: Number,
      min: [0, 'Saturated fat value cannot be negative'],
      max: [100, 'Saturated fat value cannot exceed 100g per 100g'],
    },
    proteins_100g: {
      type: Number,
      min: [0, 'Proteins value cannot be negative'],
      max: [100, 'Proteins value cannot exceed 100g per 100g'],
    },
    fiber_100g: {
      type: Number,
      min: [0, 'Fiber value cannot be negative'],
      max: [100, 'Fiber value cannot exceed 100g per 100g'],
    },
    salt_100g: {
      type: Number,
      min: [0, 'Salt value cannot be negative'],
      max: [100, 'Salt value cannot exceed 100g per 100g'],
    },
  },
  nutriscore_grade: {
    type: String,
    enum: {
      values: ['a', 'b', 'c', 'd', 'e'],
      message: '{VALUE} is not a valid Nutri-Score grade',
    },
  },  healthRating: {
    type: Number,
    default: 3.0,
    required: [true, 'Health rating is required'],
    validate: {
      validator: function (v) {
        return v >= 1 && v <= 5;
      },
      message: 'Health rating must be between 1 and 5',
    },
  },
  healthAnalysis: [{
    type: String,
    trim: true,
    maxlength: [500, 'Health analysis item cannot exceed 500 characters'],
  }],
  healthRatingLabel: {
    type: String,
    trim: true,
    maxlength: [50, 'Health rating label cannot exceed 50 characters'],
    enum: {
      values: ['Excellent Choice', 'Healthy Choice', 'Good Choice', 'Fair Choice', 'Poor Choice'],
      message: '{VALUE} is not a valid health rating label',
    },
  },
  healthRatingColor: {
    type: String,
    trim: true,
    validate: {
      validator: function (v) {
        return /^#[0-9A-Fa-f]{6}$/.test(v);
      },
      message: 'Health rating color must be a valid hex color code',
    },
  },
  confidence: {
    type: Number,
    required: [true, 'Confidence score is required'],
    min: [0, 'Confidence score cannot be negative'],
    max: [1, 'Confidence score cannot exceed 1'],
    default: 0.5,
  },
  dataCompleteness: {
    type: Number,
    required: [true, 'Data completeness score is required'],
    min: [0, 'Data completeness cannot be negative'],
    max: [100, 'Data completeness cannot exceed 100%'],
    default: 0,
  },
  lastSignificantUpdate: {
    type: Date,
    validate: {
      validator: function (value) {
        return !value || value <= Date.now();
      },
      message: 'Last significant update date cannot be in the future',
    },
  },
  ratingChanged: {
    type: Boolean,
    default: false,
  },
  cacheHit: {
    type: Boolean,
    default: false,
  },
  healthHistory: [HealthHistorySchema],
  healthTrends: {
    avgScore30Days: {
      type: Number,
      min: [1, 'Average score cannot be less than 1'],
      max: [5, 'Average score cannot exceed 5'],
    },
    avgScore90Days: {
      type: Number,
      min: [1, 'Average score cannot be less than 1'],
      max: [5, 'Average score cannot exceed 5'],
    },
    improvement30Days: {
      type: Number,
      min: [-5, 'Improvement cannot be less than -5'],
      max: [5, 'Improvement cannot exceed 5'],
    },
    improvement90Days: {
      type: Number,
      min: [-5, 'Improvement cannot be less than -5'],
      max: [5, 'Improvement cannot exceed 5'],
    },
    lastAnalyzed: {
      type: Date,
      validate: {
        validator: function (value) {
          return !value || value <= Date.now();
        },
        message: 'Last analyzed date cannot be in the future',
      },
    },
  },  searchCount: {
    type: Number,
    default: 0,
    min: [0, 'Search count cannot be negative'],
    index: true,
  },
  lastFetched: {
    type: Date,
    default: Date.now,
    index: true,
    validate: {
      validator: function (value) {
        return !value || value <= Date.now();
      },
      message: 'Last fetched date cannot be in the future',
    },
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: [true, 'Added by user reference is required'],
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
  isVerified: {
    type: Boolean,
    default: false,
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    validate: {
      validator: async function (value) {
        if (!value) return true; // Optional field
        try {
          const User = mongoose.model('user');
          const user = await User.findById(value);
          return user !== null && user.role === 'admin';
        } catch (err) {
          return false;
        }
      },
      message: 'Product can only be verified by an admin user',
    },
  },
  verifiedAt: {
    type: Date,
    validate: {
      validator: function (value) {
        return !value || value <= Date.now();
      },
      message: 'Verification date cannot be in the future',
    },
  },
}, {
  timestamps: true,
});

// Create text indexes for better search performance
productSchema.index({ 
  name: 'text',
  brand: 'text',
  category: 'text',
  description: 'text',
}, {
  weights: {
    name: 10,
    brand: 5,
    category: 3,
    description: 1,
  },
});

// Add method to update health history
productSchema.methods.updateHealthHistory = function (newScore, reason) {
  if (!reason) {
    throw new Error('A reason is required when updating health history');
  }

  if (newScore < 1 || newScore > 5) {
    throw new Error('Health score must be between 1 and 5');
  }

  this.healthHistory.push({
    score: newScore,
    reason: reason,
    timestamp: new Date(),
  });
  // Keep only last 365 days of history
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  this.healthHistory = this.healthHistory.filter(h => h.timestamp >= oneYearAgo);
  
  // Calculate and update trends
  this.calculateHealthTrends();
  this.ratingChanged = true;
  
  return this.save();
};

// Calculate health trends
productSchema.methods.calculateHealthTrends = function () {
  const now = new Date();
  const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
  const ninetyDaysAgo = new Date(now - 90 * 24 * 60 * 60 * 1000);

  // Calculate averages
  const last30Days = this.healthHistory.filter(h => h.timestamp >= thirtyDaysAgo);
  const last90Days = this.healthHistory.filter(h => h.timestamp >= ninetyDaysAgo);

  this.healthTrends = {
    avgScore30Days: last30Days.length > 0 
      ? parseFloat((last30Days.reduce((sum, h) => sum + h.score, 0) / last30Days.length).toFixed(2))
      : null,
    avgScore90Days: last90Days.length > 0
      ? parseFloat((last90Days.reduce((sum, h) => sum + h.score, 0) / last90Days.length).toFixed(2))
      : null,
    improvement30Days: last30Days.length >= 2
      ? parseFloat((last30Days[last30Days.length - 1].score - last30Days[0].score).toFixed(2))
      : null,
    improvement90Days: last90Days.length >= 2
      ? parseFloat((last90Days[last90Days.length - 1].score - last90Days[0].score).toFixed(2))
      : null,
    lastAnalyzed: now,
  };
};

// Calculate data completeness score
productSchema.methods.calculateDataCompleteness = function () {
  const requiredFields = ['name', 'brand', 'category', 'ingredients', 'nutriments'];
  const optionalFields = ['description', 'allergens', 'labels', 'nutriscore_grade'];
  const nutrimentFields = ['energy_kcal_100g', 'carbohydrates_100g', 'proteins_100g', 'fat_100g'];

  let score = 0;
  let totalFields = requiredFields.length + optionalFields.length + nutrimentFields.length;

  // Check required fields
  requiredFields.forEach(field => {
    if (this[field] && 
      (Array.isArray(this[field]) ? this[field].length > 0 : true)) {
      score += 2; // Weight required fields more heavily
    }
  });

  // Check optional fields
  optionalFields.forEach(field => {
    if (this[field] && 
      (Array.isArray(this[field]) ? this[field].length > 0 : true)) {
      score += 1;
    }
  });

  // Check nutriment fields
  nutrimentFields.forEach(field => {
    if (this.nutriments && this.nutriments[field] !== undefined) {
      score += 1;
    }
  });

  // Calculate percentage and update
  this.dataCompleteness = parseFloat(((score / (totalFields + requiredFields.length)) * 100).toFixed(2));
  return this.save();
};

// Pre-save middleware to update timestamps and completeness
productSchema.pre('save', function (next) {
  if (this.isModified()) {
    this.lastSignificantUpdate = new Date();
    this.calculateDataCompleteness();
  }
  next();
});

// Add method to calculate health trends
productSchema.methods.updateHealthTrends = function () {
  const now = new Date();
  const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
  const ninetyDaysAgo = new Date(now - 90 * 24 * 60 * 60 * 1000);

  // Calculate averages
  const history30Days = this.healthHistory.filter(h => h.timestamp >= thirtyDaysAgo);
  const history90Days = this.healthHistory.filter(h => h.timestamp >= ninetyDaysAgo);

  if (history30Days.length > 0) {
    this.healthTrends.avgScore30Days = 
      history30Days.reduce((sum, h) => sum + h.score, 0) / history30Days.length;
    
    // Calculate improvement (compare to oldest score in period)
    const oldestScore30 = history30Days[0].score;
    this.healthTrends.improvement30Days = 
      ((this.healthRating - oldestScore30) / oldestScore30) * 100;
  }

  if (history90Days.length > 0) {
    this.healthTrends.avgScore90Days = 
      history90Days.reduce((sum, h) => sum + h.score, 0) / history90Days.length;
    
    const oldestScore90 = history90Days[0].score;
    this.healthTrends.improvement90Days = 
      ((this.healthRating - oldestScore90) / oldestScore90) * 100;
  }

  this.healthTrends.lastAnalyzed = now;
};

// Add static method to get trending products
productSchema.statics.getTrendingProducts = async function (options = {}) {
  const {
    limit = 10,
    minImprovement = 5,
    period = 30,
  } = options;

  const query = {
    [`healthTrends.improvement${period}Days`]: { $gte: minImprovement },
    [`healthTrends.avgScore${period}Days`]: { $exists: true },
  };

  return this.find(query)
    .sort({ [`healthTrends.improvement${period}Days`]: -1 })
    .limit(limit);
};

module.exports = mongoose.model('Product', productSchema);
