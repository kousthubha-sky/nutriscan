const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: async function (req, file, cb) {
        const uploadDir = path.join(__dirname, '..', 'uploads', 'products');
        try {
            await fs.access(uploadDir);
        } catch {
            await fs.mkdir(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Create unique filename with timestamp and original extension
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter to only allow image files
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG and GIF images are allowed.'), false);
    }
};

// Configure multer with our options
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB file size limit
    }
});

// Export middleware for different upload scenarios
module.exports = {
    // For single file uploads
    uploadProductImage: upload.single('productImage'),
    uploadBarcodeImage: upload.single('barcodeImage'),
    
    // For multiple files (both product and barcode images)
    uploadProductImages: upload.fields([
        { name: 'productImage', maxCount: 1 },
        { name: 'barcodeImage', maxCount: 1 }
    ]),
    
    // Error handling middleware
    handleUploadError: (err, req, res, next) => {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({
                    success: false,
                    message: 'File is too large. Maximum size is 5MB.'
                });
            }
            return res.status(400).json({
                success: false,
                message: err.message
            });
        }
        if (err) {
            return res.status(400).json({
                success: false,
                message: err.message
            });
        }
        next();
    }
};