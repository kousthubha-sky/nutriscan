const mongoose = require('mongoose');

const HealthHistorySchema = new mongoose.Schema({
  score: Number,
  timestamp: { type: Date, default: Date.now },
  reason: String
});

const productSchema = new mongoose.Schema({
  barcode: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    index: true
  },
  brand: {
    type: String,
    index: true
  },
  productImage: String,
  barcodeImage: String,
  category: {
    type: String,
    index: true
  },
  description: String,
  ingredients: [{
    type: String
  }],
  labels: String,
  allergens: [{
    type: String
  }],
  nutriments: {
    energy_kcal_100g: Number,
    carbohydrates_100g: Number,
    sugars_100g: Number,
    fat_100g: Number,
    saturated_fat_100g: Number,
    proteins_100g: Number,
    fiber_100g: Number,
    salt_100g: Number
  },
  nutriscore_grade: String,
  healthRating: {
    type: Number,
    default: 3.0,
    validate: {
      validator: function(v) {
        return v >= 1 && v <= 5;
      },
      message: 'Health rating must be between 1 and 5'
    }
  },
  healthAnalysis: [String],
  healthRatingLabel: String,
  healthRatingColor: String,
  confidence: {
    type: Number,
    min: 0,
    max: 1
  },
  dataCompleteness: {
    type: Number,
    min: 0,
    max: 100
  },
  lastSignificantUpdate: Date,
  ratingChanged: Boolean,
  cacheHit: Boolean,
  healthHistory: [HealthHistorySchema],
  healthTrends: {
    avgScore30Days: Number,
    avgScore90Days: Number,
    improvement30Days: Number,
    improvement90Days: Number,
    lastAnalyzed: Date
  },
  searchCount: {
    type: Number,
    default: 0,
    index: true
  },
  lastFetched: {
    type: Date,
    default: Date.now,
    index: true
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  }
}, {
  timestamps: true
});

// Create text indexes for better search performance
productSchema.index({ 
  name: 'text',
  brand: 'text',
  category: 'text',
  description: 'text'
});

// Add method to update health history
productSchema.methods.updateHealthHistory = function(newScore, reason) {
  this.healthHistory.push({
    score: newScore,
    reason: reason
  });

  // Keep only last 365 days of history
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  this.healthHistory = this.healthHistory.filter(h => h.timestamp >= oneYearAgo);

  // Update trends
  this.updateHealthTrends();
};

// Add method to calculate health trends
productSchema.methods.updateHealthTrends = function() {
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
productSchema.statics.getTrendingProducts = async function(options = {}) {
  const {
    limit = 10,
    minImprovement = 5,
    period = 30
  } = options;

  const query = {
    [`healthTrends.improvement${period}Days`]: { $gte: minImprovement },
    [`healthTrends.avgScore${period}Days`]: { $exists: true }
  };

  return this.find(query)
    .sort({ [`healthTrends.improvement${period}Days`]: -1 })
    .limit(limit);
};

module.exports = mongoose.model('Product', productSchema);