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
      const params = new URLSearchParams({
        category: category || 'All Categories',
        healthRating: minHealthRating.toString()
      });
      
      const response = await fetch(`${API_BASE}/products/alternatives?${params}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(productData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch alternatives');
      }
      
      return data.alternatives || [];
    } catch (error) {
      console.error('Failed to fetch healthier alternatives:', error);
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

  async reviewSubmission(submissionId, { status, feedback }) {
    try {
      const response = await fetch(`${API_BASE}/admin/submissions/${submissionId}/review`, {
        method: 'POST',
        headers: {
          ...this.getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status, feedback })
      });
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error);
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
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error);
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
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    return response.json();
  },

  handleError(error) {
    console.error('API Error:', error);
    throw error;
  }
};

export default api;