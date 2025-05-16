import { cacheService, CACHE_CONFIG } from './cacheService';
import { apiService } from './apiService';


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
      
      const data = await apiService.fetchWithAuth(`/products/search?${params.toString()}`);
      
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
      console.error('Product search failed:', error);
      if (error.status === 400) {
        throw new Error('Invalid search parameters. Please check your input.');
      } else if (error.status === 429) {
        throw new Error('Too many search requests. Please try again later.');
      }
      throw new Error('Failed to search products. Please try again.');
    }
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
      console.error('Failed to fetch featured products:', error);
      if (error.status === 404) {
        throw new Error('No featured products found.');
      } else if (error.status === 429) {
        throw new Error('Too many requests. Please try again later.');
      }
      throw new Error('Failed to load featured products. Please try again.');
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
      if (error.status === 400) {
        throw new Error(error.data?.message || 'Invalid product data. Please check input parameters.');
      } else if (error.status === 404) {
        throw new Error('No healthier alternatives found for this product.');
      } else if (error.status === 429) {
        throw new Error('Too many requests. Please try again later.');
      }
      throw new Error('Failed to find healthier alternatives. Please try again.');
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
      const data = await apiService.fetchWithAuth(`/admin/submissions/pending?${params}`);
      return {
        submissions: data.submissions || [],
        totalPages: data.totalPages || 1,
        currentPage: data.currentPage || page
      };
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
      const data = await apiService.fetchWithAuth('/admin/submissions/stats');
      return {
        total: data.total || 0,
        pending: data.pending || 0,
        approved: data.approved || 0,
        rejected: data.rejected || 0
      };
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
      const data = await apiService.fetchWithAuth(`/admin/submissions/${submissionId}/review`, {
        method: 'POST',
        body: JSON.stringify({ 
          status, 
          adminNotes,
          ...productData
        })
      });
      return data;
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

  async submitProduct(formData) {
    try {
      // For FormData, we need to handle Content-Type differently
      const response = await fetch(`${apiService.baseUrl}/products/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'X-Refresh-Token': localStorage.getItem('refreshToken')
        },
        body: formData,
        credentials: 'include'
      });

      const data = await response.json();
      
      if (!response.ok) {
        if (response.status === 413) {
          throw new Error('Image file size too large. Maximum size is 5MB.');
        } else if (response.status === 415) {
          throw new Error('Invalid file format. Please upload JPG, PNG, or WEBP images.');
        } else if (response.status === 400) {
          throw new Error(data.message || 'Invalid product data. Please check all fields.');
        } else if (response.status === 429) {
          throw new Error('Too many submissions. Please try again later.');
        } else if (response.status === 409) {
          throw new Error('This product has already been submitted. Please check existing products.');
        }
        throw new Error(data.message || data.error || 'Failed to submit product');
      }
      return data;
    } catch (error) {
      console.error('Product submission error:', error);
      if (error instanceof TypeError) {
        throw new Error('Network error. Please check your connection and try again.');
      }
      throw error;
    }
  },

  async getSubmissionDetails(submissionId) {
    try {
      const data = await apiService.fetchWithAuth(`/admin/submissions/${submissionId}`);
      if (!data) {
        throw new Error('Submission not found.');
      }
      return data;
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
      const data = await apiService.fetchWithAuth(`/admin/submissions/${submissionId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
      return data;
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

export default api;
