const mongoose = require('mongoose');

const productSubmissionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    brand: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        required: true
    },
    barcode: {
        type: String,
        unique: true,
        sparse: true
    },
    ingredients: {
        type: String,
        required: true
    },
    nutriments: {
        proteins_100g: Number,
        carbohydrates_100g: Number,
        fat_100g: Number,
        fiber_100g: Number,
        sugars_100g: Number,
        salt_100g: Number
    },
    imageUrl: String,
    submittedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    adminFeedback: String,
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    reviewedAt: Date,
    submittedAt: {
        type: Date,
        default: Date.now
    }
});

const ProductSubmission = mongoose.model('ProductSubmission', productSubmissionSchema);
module.exports = ProductSubmission;