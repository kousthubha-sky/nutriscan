class AppError extends Error {
  constructor(message, statusCode = 500, errorCode = 'INTERNAL_SERVER_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    Error.captureStackTrace(this, this.constructor);
  }
}

// Predefined error codes for consistency
const ErrorCodes = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  NOT_FOUND: 'NOT_FOUND',
  FORBIDDEN: 'FORBIDDEN',
  CONFLICT: 'CONFLICT',
  RATE_LIMIT: 'RATE_LIMIT',
  INTERNAL_ERROR: 'INTERNAL_SERVER_ERROR',
  BAD_REQUEST: 'BAD_REQUEST',
  INVALID_TOKEN: 'INVALID_TOKEN',
};

const formatValidationErrors = (errors) => {
  return Object.values(errors).map(err => ({
    field: err.path,
    message: err.message,
    value: err.value,
  }));
};

const errorResponse = (err, includeStack = false) => {
  const response = {
    status: err.status || 'error',
    errorCode: err.errorCode || ErrorCodes.INTERNAL_ERROR,
    message: err.message || 'An unexpected error occurred',
    timestamp: new Date().toISOString(),
  };

  if (err.details) {
    response.details = err.details;
  }

  if (err.errors && Object.keys(err.errors).length > 0) {
    response.validationErrors = formatValidationErrors(err.errors);
  }

  if (includeStack && process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  return response;
};

module.exports = {
  AppError,
  ErrorCodes,
  errorResponse,
  formatValidationErrors,
};
