const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  barcode: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  brand: String,
  imageUrl: String,
  category: String,
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
  lastFetched: {
    type: Date,
    default: Date.now
  },
  searchCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for text search
ProductSchema.index({ 
  name: 'text', 
  brand: 'text',
  category: 'text',
  ingredients: 'text' 
});

// Index for barcode lookups
ProductSchema.index({ barcode: 1 });

// Index for frequently accessed products
ProductSchema.index({ searchCount: -1 });

module.exports = mongoose.model('Product', ProductSchema);