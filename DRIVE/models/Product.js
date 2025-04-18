const mongoose = require('mongoose');

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
  imageUrl: String,
  category: {
    type: String,
    index: true
  },
  description: String,
  ingredients: String,
  labels: String,
  allergens: String,
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
  healthRating: Number,
  healthAnalysis: [String],
  healthRatingLabel: String,
  healthRatingColor: String,
  searchCount: {
    type: Number,
    default: 0,
    index: true
  },
  lastFetched: {
    type: Date,
    default: Date.now,
    index: true
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

module.exports = mongoose.model('Product', productSchema);