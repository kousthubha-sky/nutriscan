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
    productImage: {
        type: String,  // URL or path to the stored image
        required: true
    },
    barcodeImage: {
        type: String,  // URL or path to the stored image
        required: true
    },
    additionalInfo: {
        type: String,
        trim: true
    },
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