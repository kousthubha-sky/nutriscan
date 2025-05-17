const { AppError, ErrorCodes, errorResponse } = require('../utils/errorHandler');

// For handling async errors without try-catch blocks
const catchAsync = fn => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Convert Mongoose validation errors to AppError format
const handleMongooseValidationError = (err) => {
  const validationErrors = Object.values(err.errors).map(error => ({
    field: error.path,
    message: error.message,
    value: error.value
  }));
  
  return new AppError('Validation failed', 400, ErrorCodes.VALIDATION_ERROR, validationErrors);
};

// Handle cast errors (e.g., invalid MongoDB ObjectId)
const handleCastError = (err) => {
  return new AppError(`Invalid ${err.path}: ${err.value}`, 400, ErrorCodes.VALIDATION_ERROR);
};

// Handle duplicate key errors
const handleDuplicateKeyError = (err) => {
  const field = Object.keys(err.keyPattern)[0];
  return new AppError(
    `Duplicate value for field: ${field}. This ${field} already exists.`,
    400,
    ErrorCodes.CONFLICT
  );
};

// Handle JWT errors
const handleJWTError = () => {
  return new AppError('Invalid token. Please log in again.', 401, ErrorCodes.INVALID_TOKEN);
};

const handleJWTExpiredError = () => {
  return new AppError('Your token has expired. Please log in again.', 401, ErrorCodes.INVALID_TOKEN);
};

// Global error handling middleware
const globalErrorHandler = (err, req, res, next) => {
  console.error('Error:', {
    name: err.name,
    message: err.message,
    stack: err.stack,
    errorCode: err.errorCode
  });

  // Default values
  let error = {...err};
  error.message = err.message;
  error.errorCode = err.errorCode;

  // Handle specific error types
  if (err.name === 'ValidationError') {
    error = handleMongooseValidationError(err);
  } else if (err.name === 'CastError') {
    error = handleCastError(err);
  } else if (err.code === 11000) {
    error = handleDuplicateKeyError(err);
  } else if (err.name === 'JsonWebTokenError') {
    error = handleJWTError();
  } else if (err.name === 'TokenExpiredError') {
    error = handleJWTExpiredError();
  }

  // Create response based on the environment
  const response = errorResponse(error, process.env.NODE_ENV === 'development');

  // Set status code
  const statusCode = error.statusCode || 500;

  // Log error details in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Full error details:', {
      error,
      originalError: err,
      stack: err.stack
    });
  }

  // Send error response
  res.status(statusCode).json(response);
};

// Handle uncaught exceptions and unhandled rejections
const setupErrorHandlers = (app) => {
  process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    console.error(err.name, err.message, err.stack);
    process.exit(1);
  });

  process.on('unhandledRejection', (err) => {
    console.error('UNHANDLED REJECTION! 💥 Shutting down...');
    console.error(err.name, err.message, err.stack);
    process.exit(1);
  });

  // Handle SIGTERM
  process.on('SIGTERM', () => {
    console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
    process.exit(1);
  });
};

module.exports = {
  catchAsync,
  globalErrorHandler,
  setupErrorHandlers
};
