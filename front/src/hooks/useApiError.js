import { useState, useCallback, useRef } from 'react';
import { toast } from 'react-toastify';
import { APIError } from '../services/api';

export const useApiError = (options = {}) => {
  const {
    maxRetries = 2,
    retryDelay = 1000,
    showToast = true,
  } = options;

  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const retryCount = useRef(0);
  const abortController = useRef(null);

  const reset = useCallback(() => {
    setError(null);
    setIsLoading(false);
    retryCount.current = 0;
    if (abortController.current) {
      abortController.current.abort();
    }
  }, []);

  const handleApiCall = useCallback(async (apiFunction, {
    onSuccess,
    onError,
    shouldRetry = true
  } = {}) => {
    if (isLoading) {
      console.warn('API call attempted while another call is in progress');
      return;
    }

    setIsLoading(true);
    setError(null);

    // Create new AbortController for this request
    abortController.current = new AbortController();

    const executeCall = async (attempt = 0) => {
      try {
        const result = await apiFunction(abortController.current.signal);
        
        setIsLoading(false);
        retryCount.current = 0;
        
        if (onSuccess) {
          onSuccess(result);
        }
        
        return result;
      } catch (err) {
        let apiError = err;
        
        // Handle aborted requests
        if (err.name === 'AbortError') {
          setIsLoading(false);
          return;
        }

        // Convert regular errors to APIError
        if (!(err instanceof APIError)) {
          apiError = new APIError(
            err.message || 'An unexpected error occurred',
            err.status || 500,
            'UNKNOWN_ERROR'
          );
        }

        // Retry logic for certain error types
        if (shouldRetry && 
            attempt < maxRetries && 
            [500, 502, 503, 504].includes(apiError.status)) {
          retryCount.current = attempt + 1;
          const delay = retryDelay * Math.pow(2, attempt); // Exponential backoff
          
          await new Promise(resolve => setTimeout(resolve, delay));
          return executeCall(attempt + 1);
        }

        setError(apiError);
        setIsLoading(false);

        // Call custom error handler if provided
        if (onError) {
          onError(apiError);
        }

        // Show toast notification if enabled
        if (showToast) {
          toast.error(apiError.message);
        }

        throw apiError;
      }
    };

    return executeCall();
  }, [isLoading, maxRetries, retryDelay, showToast]);

  const cancelRequest = useCallback(() => {
    if (abortController.current) {
      abortController.current.abort();
    }
  }, []);

  return {
    error,
    isLoading,
    handleApiCall,
    reset,
    cancelRequest,
    retryCount: retryCount.current
  };
};
