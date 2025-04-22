const mongoose = require('mongoose');

const productSubmissionSchema = new mongoose.Schema({
    productName: {
        type: String,
        required: true,
        trim: true
    },
    barcodeNumber: {
        type: String,
        required: true,
        unique: true,
        sparse: true
    },
    brand: {
        type: String,
        default: 'Not specified'
    },
    category: {
        type: String,
        default: 'Uncategorized'
    },
    ingredients: [{
        type: String
    }],
    nutritionalInfo: {
        servingSize: String,
        calories: Number,
        protein: Number,
        carbohydrates: Number,
        fat: Number,
        fiber: Number,
        sugar: Number,
        sodium: Number
    },
    allergens: [{
        type: String
    }],
    dietaryInfo: [{
        type: String
    }],
    productImage: {
        type: String,  // URL or path to the stored image
        required: true
    },
    barcodeImage: {
        type: String,  // URL or path to the stored image
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'in_review', 'approved', 'rejected'],
        default: 'pending'
    },
    adminNotes: {
        type: String
    },
    reviewHistory: [{
        status: String,
        notes: String,
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        },
        updatedAt: {
            type: Date,
            default: Date.now
        }
    }],
    submittedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    submittedAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

productSubmissionSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

const ProductSubmission = mongoose.model('ProductSubmission', productSubmissionSchema);
module.exports = ProductSubmission;