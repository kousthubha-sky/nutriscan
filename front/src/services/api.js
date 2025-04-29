const API_BASE = 'http://localhost:3000';

const api = {
  async searchProducts(query, page = 1, filters = {}, sortBy = 'relevance') {
    console.log('Searching with query:', query, 'page:', page, 'filters:', filters, 'sortBy:', sortBy);
    
    try {
      const params = new URLSearchParams({
        q: query,
        page,
        sortBy,
        filters: JSON.stringify(filters)
      });
      
      const url = `${API_BASE}/products/search?${params.toString()}`;
      console.log('Request URL:', url);
      
      const response = await fetch(url);
      const data = await response.json();
      
      console.log('API Response:', data);
      
      if (!response.ok) {
        throw new Error(data.message || 'Search failed');
      }
      
      return {
        products: data.products || [],
        currentPage: Number(data.currentPage) || page,
        totalPages: Number(data.totalPages) || 1,
        query,
        sources: data.sources
      };
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  async getFeaturedProducts() {
    try {
      const response = await fetch(`${API_BASE}/products/featured`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch featured products');
      }
      
      return data.products || [];
    } catch (error) {
      console.error('Failed to fetch featured products:', error);
      throw error;
    }
  },

  async getHealthierAlternatives(category, minHealthRating = 3.0, productData = null) {
    try {
      if (!productData) {
        throw new Error('Product data is required');
      }

      const params = new URLSearchParams({
        category: category || 'All Categories',
        healthRating: minHealthRating.toString()
      });
      
      console.log('Fetching alternatives:', {
        url: `${API_BASE}/products/alternatives?${params}`,
        productData
      });
      
      const response = await fetch(`${API_BASE}/products/alternatives?${params}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          _id: productData?._id,
          category: productData?.category,
          nutriments: productData?.nutriments || {},
          healthRating: productData?.healthRating || 3.0,
          ingredients: productData?.ingredients || [],
          name: productData?.name
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to fetch alternatives');
      }
      
      return data.alternatives || [];
    } catch (error) {
      console.error('Failed to fetch healthier alternatives:', error);
      throw error;
    }
  },

  async getIndianProducts(page = 1, limit = 12) {
    try {
      const params = new URLSearchParams({ page, limit });
      const response = await fetch(`${API_BASE}/products/indian?${params}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch Indian products');
      }
      
      return data.products || [];
    } catch (error) {
      console.error('Failed to fetch Indian products:', error);
      throw error;
    }
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
      const response = await fetch(`${API_BASE}/admin/submissions/${submissionId}/review`, {
        method: 'POST',
        headers: {
          ...this.getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status, adminNotes, ...productData })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit review');
      }
      
      return data;
    } catch (error) {
      console.error('API Error:', error);
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
    // Log the error for debugging
    console.error('API Error:', error);

    // If it's a network error
    if (!error.response && !error.status) {
      return new Error('Network error. Please check your connection.');
    }

    // If it's a 401 Unauthorized error
    if (error.status === 401) {
      // Clear invalid auth token
      localStorage.removeItem('authToken');
      return new Error('Please log in to continue.');
    }

    // If it's a 413 Payload Too Large error
    if (error.status === 413) {
      return new Error('File size too large. Maximum size is 5MB.');
    }

    // If it's an API error with a message
    if (error.data && (error.data.message || error.data.error)) {
      return new Error(error.data.message || error.data.error);
    }

    // Default error message
    return new Error('An unexpected error occurred. Please try again.');
  }
};

export default api;