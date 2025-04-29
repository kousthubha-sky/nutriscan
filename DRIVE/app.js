const express = require('express')
const cors = require("cors");
const path = require('path');
const env = require('dotenv');
const cookieParser = require('cookie-parser');
const { body, validationResult } = require('express-validator');
const fs = require('fs').promises;

const app = express();
env.config();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads', 'products');
(async () => {
  try {
    await fs.access(uploadsDir);
  } catch {
    await fs.mkdir(uploadsDir, { recursive: true });
    console.log('Created uploads directory');
  }
})().catch(err => {
  console.error('Failed to create uploads directory:', err);
  process.exit(1);
});

// Configure CORS to allow all origins
app.use(cors({
  origin: true, // Allow all origins
  credentials: true
}));

// Database connection
const connecToDB = require('./config/db');
connecToDB();

// Middleware
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Error handling middleware for file uploads
app.use((err, req, res, next) => {
  if (err.name === 'MulterError') {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  if (err) {
    return res.status(500).json({
      success: false,
      message: 'Something went wrong with file upload'
    });
  }
  next();
});

// Routes
const indexRouter = require('./routes/index.routes');
const userRouter = require('./routes/user.routes');
const adminRoutes = require('./routes/admin.routes');
const productRouter = require('./routes/productRoutes');

app.use('/', indexRouter);
app.use('/user', userRouter);
app.use('/admin', adminRoutes);
app.use('/products', productRouter);

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0'; // Listen on all network interfaces

app.listen(PORT, HOST, () => {
    console.log(`Server is running on http://${HOST}:${PORT}`);
});