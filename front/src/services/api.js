import { cacheService, CACHE_CONFIG } from './cacheService';

const API_BASE = 'http://localhost:3000';

const api = {
  async searchProducts(query, page = 1, filters = {}, sortBy = 'relevance') {
    const cacheKey = cacheService.generateKey('searchProducts', { query, page, filters, sortBy });
    const cachedData = cacheService.get(cacheKey);
    if (cachedData) return cachedData;

    try {
      const params = new URLSearchParams({
        q: query,
        page,
        sortBy,
        filters: JSON.stringify(filters)
      });
      
      const url = `${API_BASE}/products/search?${params.toString()}`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Search failed');
      }
      
      const result = {
        products: data.products || [],
        currentPage: Number(data.currentPage) || page,
        totalPages: Number(data.totalPages) || 1,
        query,
        sources: data.sources
      };

      cacheService.set(cacheKey, result, CACHE_CONFIG.searchProducts);
      return result;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  async getFeaturedProducts() {
    const cacheKey = cacheService.generateKey('getFeaturedProducts');
    const cachedData = cacheService.get(cacheKey);
    if (cachedData) return cachedData;

    try {
      const response = await fetch(`${API_BASE}/products/featured`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch featured products');
      }
      
      const products = data.products || [];
      cacheService.set(cacheKey, products, CACHE_CONFIG.getFeaturedProducts);
      return products;
    } catch (error) {
      console.error('Failed to fetch featured products:', error);
      throw error;
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
      
      const response = await fetch(`${API_BASE}/products/alternatives?${params}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          _id: productData._id,
          category: productData.category,
          nutriments: productData.nutriments || {},
          healthRating: productData.healthRating || 3.0,
          ingredients: productData.ingredients || [],
          name: productData.name
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to fetch alternatives');
      }
      
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
      const response = await fetch(`${API_BASE}/products/indian?${params}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch Indian products');
      }
      
      const products = data.products || [];
      cacheService.set(cacheKey, products, CACHE_CONFIG.getIndianProducts);
      return products;
    } catch (error) {
      console.error('Failed to fetch Indian products:', error);
      throw error;
    }
  },

  // Clear cache when user logs out
  clearCache() {
    cacheService.clear();
  },

  // Admin API methods
  async getPendingSubmissions(page = 1, limit = 10) {
    try {
      const params = new URLSearchParams({ page, limit });
      const response = await fetch(`${API_BASE}/admin/submissions/pending?${params}`, {
        headers: this.getAuthHeaders()
      });
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error);
    }
  },

  async getSubmissionStats() {
    try {
      const response = await fetch(`${API_BASE}/admin/submissions/stats`, {
        headers: this.getAuthHeaders()
      });
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error);
    }
  },

  async reviewSubmission(submissionId, { status, adminNotes, ...productData }) {
    try {
      console.log('Submitting review:', { submissionId, status, adminNotes, ...productData });
      
      const response = await fetch(`${API_BASE}/admin/submissions/${submissionId}/review`, {
        method: 'POST',
        headers: {
          ...this.getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          status, 
          adminNotes,
          ...productData
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to submit review');
      }
      
      return data;
    } catch (error) {
      console.error('Review submission error:', error);
      throw error;
    }
  },

  async submitProduct(formData) {
    try {
      const response = await fetch(`${API_BASE}/products/submit`, {
        method: 'POST',
        headers: {
          ...this.getAuthHeaders(),
          // Don't set Content-Type here as it's handled by FormData
        },
        body: formData
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to submit product');
      }
      
      return data;
    } catch (error) {
      console.error('Product submission error:', error);
      throw error;
    }
  },

  async getSubmissionDetails(submissionId) {
    try {
      const response = await fetch(`${API_BASE}/admin/submissions/${submissionId}`, {
        headers: this.getAuthHeaders()
      });
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error);
    }
  },

  async updateSubmissionStatus(submissionId, status) {
    try {
      const response = await fetch(`${API_BASE}/admin/submissions/${submissionId}/status`, {
        method: 'PATCH',
        headers: {
          ...this.getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error);
    }
  },

  getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return {
      'Authorization': `Bearer ${token}`
    };
  },

  handleResponse(response) {
    return response.json().then(data => {
      if (!response.ok) {
        const error = new Error(data.message || data.error || response.statusText);
        error.status = response.status;
        error.data = data;
        throw error;
      }
      return data;
    });
  },

  handleError(error) {
    console.error('API Error:', error);

    if (!error.response && !error.status) {
      return new Error('Network error. Please check your connection.');
    }

    if (error.status === 401) {
      // Clear invalid auth token and cache
      localStorage.removeItem('authToken');
      cacheService.clear();
      return new Error('Please log in to continue.');
    }

    if (error.status === 413) {
      return new Error('File size too large. Maximum size is 5MB.');
    }

    if (error.data && (error.data.message || error.data.error)) {
      return new Error(error.data.message || error.data.error);
    }

    return new Error('An unexpected error occurred. Please try again.');
  }
};

export default api;