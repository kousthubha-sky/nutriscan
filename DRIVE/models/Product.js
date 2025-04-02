const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  brand: { 
    type: String, 
    default: 'Unknown Brand' 
  },
  barcode: { 
    type: String, 
    unique: true,
    sparse: true 
  },
  ingredients: { 
    type: String,
    default: 'No ingredients information available'
  },
  imageUrl: { 
    type: String,
    default: 'https://placehold.co/60x60'
  },
  source: {
    type: String,
    enum: ['database', 'openfoodfacts'],
    default: 'database'
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

module.exports = mongoose.model('Product', productSchema);