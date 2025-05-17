import { useState, useCallback } from 'react';

export const useError = () => {
  const [error, setError] = useState(null);

  const handleError = useCallback((error) => {
    const errorMessage = error?.response?.data?.message || error?.message || 'An unexpected error occurred';
    const errorCode = error?.response?.data?.errorCode || 'UNKNOWN_ERROR';
    const validationErrors = error?.response?.data?.validationErrors || [];

    setError({
      message: errorMessage,
      code: errorCode,
      validationErrors,
      timestamp: new Date().toISOString()
    });
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    handleError,
    clearError,
    hasError: !!error
  };
};

export default useError;
