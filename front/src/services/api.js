import { cacheService, CACHE_CONFIG } from './cacheService';
import { apiService } from './apiService';

// Custom API error class for better error handling
class APIError extends Error {
  constructor(message, status, code = 'UNKNOWN_ERROR', details = null) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.code = code;
    this.details = details;
    this.timestamp = new Date().toISOString();
    this.retryable = [500, 502, 503, 504].includes(status);
  }

  static fromResponse(response, data) {
    return new APIError(
      data?.message || response.statusText,
      response.status,
      data?.code || 'API_ERROR',
      data?.details
    );
  }
}

// Error handler helper function
const handleApiError = (error, context, signal) => {
  console.error(`${context}:`, error);

  // Handle request cancellation
  if (signal?.aborted) {
    throw new APIError('Request was cancelled', 499, 'REQUEST_CANCELLED');
  }

  if (!navigator.onLine) {
    throw new APIError(
      'No internet connection. Please check your network and try again.',
      0, 
      'NETWORK_ERROR'
    );
  }

  // If it's already our custom error, just throw it
  if (error instanceof APIError) {
    throw error;
  }

  // Handle specific HTTP status codes with more detailed messages
  switch (error.status) {
    case 400:
      throw new APIError(
        error.data?.message || 'The request was invalid. Please check your input and try again.',
        400,
        'BAD_REQUEST',
        error.data?.details
      );
    case 401:
      throw new APIError(
        'Your session has expired. Please login again to continue.',
        401,
        'UNAUTHORIZED'
      );
    case 403:
      throw new APIError(
        'You do not have permission to perform this action. Please contact support if you believe this is an error.',
        403,
        'FORBIDDEN'
      );
    case 404:
      throw new APIError(
        'The requested resource could not be found. It may have been deleted or moved.',
        404,
        'NOT_FOUND'
      );
    case 429:
      throw new APIError(
        'Too many requests. Please wait a moment and try again.',
        429,
        'RATE_LIMIT'
      );
    case 413:
      throw new APIError(
        'The uploaded file is too large. Maximum size is 5MB.',
        413,
        'PAYLOAD_TOO_LARGE'
      );
    case 415:
      throw new APIError(
        'The uploaded file type is not supported. Please use JPG, PNG, or WEBP format.',
        415,
        'UNSUPPORTED_MEDIA_TYPE'
      );
    case 500:
    case 502:
    case 503:
    case 504:
      throw new APIError(
        'A server error occurred. We have been notified and are working on a fix.',
        error.status,
        'SERVER_ERROR'
      );
    default:
      throw new APIError(
        error.message || 'An unexpected error occurred. Please try again.',
        error.status || 500,
        'UNKNOWN_ERROR',
        error.data?.details
      );
  }
};

const api = {
  // Helper function to handle cache and API calls
  async withCache(cacheKey, apiCall, config = {}) {
    const cachedData = cacheService.get(cacheKey);
    if (cachedData && !config.bypass) return cachedData;

    try {
      const data = await apiCall();
      if (config.cache !== false) {
        cacheService.set(cacheKey, data, config.cacheConfig);
      }
      return data;
    } catch (error) {
      handleApiError(error, config.context, config.signal);
    }
  },

  async searchProducts(query, page = 1, filters = {}, sortBy = 'relevance', signal) {
    const cacheKey = cacheService.generateKey('searchProducts', { query, page, filters, sortBy });
    
    return this.withCache(cacheKey, async () => {
      const params = new URLSearchParams({
        q: query,
        page,
        sortBy,
        filters: JSON.stringify(filters)
      });
      
      const data = await apiService.fetchWithAuth(`/products/search?${params.toString()}`, { signal });
      
      return {
        products: data.products || [],
        currentPage: Number(data.currentPage) || page,
        totalPages: Number(data.totalPages) || 1,
        query,
        sources: data.sources
      };
    }, {
      cacheConfig: CACHE_CONFIG.searchProducts,
      context: 'Product search failed',
      signal
    });
  },

  async getFeaturedProducts() {
    const cacheKey = cacheService.generateKey('getFeaturedProducts');
    const cachedData = cacheService.get(cacheKey);
    if (cachedData) return cachedData;

    try {
      const data = await apiService.fetchWithAuth('/products/featured');
      const products = data.products || [];
      cacheService.set(cacheKey, products, CACHE_CONFIG.getFeaturedProducts);
      return products;
    } catch (error) {
      handleApiError(error, 'Failed to fetch featured products');
    }
  },

  async getHealthierAlternatives(category, minHealthRating = 3.0, productData = null) {
    if (!productData) {
      throw new Error('Product data is required');
    }

    const cacheKey = cacheService.generateKey('getHealthierAlternatives', { 
      category, 
      minHealthRating, 
      productId: productData._id 
    });
    const cachedData = cacheService.get(cacheKey);
    if (cachedData) return cachedData;

    try {
      const params = new URLSearchParams({
        category: category || 'All Categories',
        healthRating: minHealthRating.toString()
      });
      
      const data = await apiService.fetchWithAuth(`/products/alternatives?${params}`, {
        method: 'POST',
        body: JSON.stringify({
          _id: productData._id,
          category: productData.category,
          nutriments: productData.nutriments || {},
          healthRating: productData.healthRating || 3.0,
          ingredients: productData.ingredients || [],
          name: productData.name
        })
      });
      
      const alternatives = data.alternatives || [];
      cacheService.set(cacheKey, alternatives, CACHE_CONFIG.getHealthierAlternatives);
      return alternatives;
    } catch (error) {
      console.error('Failed to fetch healthier alternatives:', error);
      throw error;
    }
  },

  async getIndianProducts(page = 1, limit = 12) {
    const cacheKey = cacheService.generateKey('getIndianProducts', { page, limit });
    const cachedData = cacheService.get(cacheKey);
    if (cachedData) return cachedData;

    try {
      const params = new URLSearchParams({ page, limit });
      const data = await apiService.fetchWithAuth(`/products/indian?${params}`);
      const products = data.products || [];
      cacheService.set(cacheKey, products, CACHE_CONFIG.getIndianProducts);
      return products;
    } catch (error) {
      console.error('Failed to fetch Indian products:', error);
      if (error.status === 404) {
        throw new Error('No Indian products found.');
      } else if (error.status === 400) {
        throw new Error('Invalid page or limit parameters.');
      } else if (error.status === 429) {
        throw new Error('Too many requests. Please try again later.');
      }
      throw new Error('Failed to load Indian products. Please try again.');
    }
  },

  clearCache() {
    cacheService.clear();
  },

  // Admin API methods
  async getPendingSubmissions(page = 1, limit = 10) {
    try {
      const params = new URLSearchParams({ page, limit });
      return await apiService.fetchWithAuth(`/admin/submissions/pending?${params}`);
    } catch (error) {
      console.error('Failed to fetch pending submissions:', error);
      if (error.status === 403) {
        throw new Error('You do not have permission to access admin features.');
      } else if (error.status === 429) {
        throw new Error('Too many requests. Please try again later.');
      }
      throw new Error('Failed to load pending submissions. Please try again.');
    }
  },

  async getSubmissionStats() {
    try {
      return await apiService.fetchWithAuth('/admin/submissions/stats');
    } catch (error) {
      console.error('Failed to fetch submission stats:', error);
      if (error.status === 403) {
        throw new Error('You do not have permission to access admin features.');
      }
      throw new Error('Failed to load submission statistics. Please try again.');
    }
  },

  async reviewSubmission(submissionId, { status, adminNotes, ...productData }) {
    try {
      return await apiService.fetchWithAuth(`/admin/submissions/${submissionId}/review`, {
        method: 'POST',
        body: JSON.stringify({ 
          status, 
          adminNotes,
          ...productData
        })
      });
    } catch (error) {
      console.error('Review submission error:', error);
      if (error.status === 403) {
        throw new Error('You do not have permission to review submissions.');
      } else if (error.status === 404) {
        throw new Error('Submission not found.');
      } else if (error.status === 400) {
        throw new Error(error.data?.message || 'Invalid review data. Please check your input.');
      }
      throw new Error('Failed to review submission. Please try again.');
    }
  },

  async submitProduct(formData, signal) {
    try {
      const response = await fetch(`${apiService.baseUrl}/products/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'X-Refresh-Token': localStorage.getItem('refreshToken')
        },
        body: formData,
        credentials: 'include',
        signal
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw APIError.fromResponse(response, data);
      }
      return data;
    } catch (error) {
      handleApiError(error, 'Product submission error', signal);
    }
  },
  async getSubmissionDetails(submissionId) {
    try {
      return await apiService.fetchWithAuth(`/admin/submissions/${submissionId}`);
    } catch (error) {
      console.error('Failed to fetch submission details:', error);
      if (error.status === 403) {
        throw new Error('You do not have permission to view submission details.');
      } else if (error.status === 404) {
        throw new Error('Submission not found.');
      }
      throw new Error('Failed to load submission details. Please try again.');
    }
  },

  async updateSubmissionStatus(submissionId, status) {
    try {
      return await apiService.fetchWithAuth(`/admin/submissions/${submissionId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
    } catch (error) {
      console.error('Failed to update submission status:', error);
      if (error.status === 403) {
        throw new Error('You do not have permission to update submission status.');
      } else if (error.status === 404) {
        throw new Error('Submission not found.');
      } else if (error.status === 400) {
        throw new Error('Invalid status value.');
      }
      throw new Error('Failed to update submission status. Please try again.');
    }
  }
};

export { APIError };
export default api;