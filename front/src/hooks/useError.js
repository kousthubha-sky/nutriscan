import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';

const errorMessages = {
  VALIDATION_ERROR: 'Please check your input and try again.',
  AUTH_ERROR: 'Please log in again to continue.',
  ACCESS_DENIED: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  RATE_LIMIT: 'Too many requests. Please try again later.',
  SERVER_ERROR: 'An unexpected error occurred. Please try again.',
  NETWORK_ERROR: 'Unable to connect to the server. Please check your connection.',
  FILE_ERROR: 'There was a problem with the file upload.',
  DUPLICATE_ERROR: 'This item already exists.',
};

export const useError = () => {
  const [error, setError] = useState(null);

  const handleError = useCallback((error) => {
    console.error('Error occurred:', error);

    // Clear any previous errors
    setError(null);

    // Network or connection errors
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      const networkError = {
        code: 'NETWORK_ERROR',
        message: errorMessages.NETWORK_ERROR
      };
      setError(networkError);
      toast.error(networkError.message);
      return;
    }

    // API errors with status codes
    if (error.status) {
      let errorMessage = error.message;

      // Use predefined messages for known error codes
      if (error.code && errorMessages[error.code]) {
        errorMessage = errorMessages[error.code];
      }
      // Fall back to HTTP status code based messages
      else if (error.status === 400) errorMessage = errorMessages.VALIDATION_ERROR;
      else if (error.status === 401) errorMessage = errorMessages.AUTH_ERROR;
      else if (error.status === 403) errorMessage = errorMessages.ACCESS_DENIED;
      else if (error.status === 404) errorMessage = errorMessages.NOT_FOUND;
      else if (error.status === 429) errorMessage = errorMessages.RATE_LIMIT;
      else if (error.status >= 500) errorMessage = errorMessages.SERVER_ERROR;

      const apiError = {
        code: error.code || 'API_ERROR',
        status: error.status,
        message: errorMessage
      };
      setError(apiError);
      toast.error(errorMessage);
      return;
    }

    // Generic errors
    const genericError = {
      code: 'UNKNOWN_ERROR',
      message: error.message || errorMessages.SERVER_ERROR
    };
    setError(genericError);
    toast.error(genericError.message);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    handleError,
    clearError
  };
};
