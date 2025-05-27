import { cacheService, CACHE_CONFIG } from './cacheService';

class ApiService {
  constructor(baseUrl = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
  }

  async fetchWithAuth(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      'X-Refresh-Token': localStorage.getItem('refreshToken'),
      'X-Requested-With': 'XMLHttpRequest'
    };

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          ...headers,
          ...options.headers
        },
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        const error = new Error(data.message || response.statusText);
        error.status = response.status;
        error.data = data;
        throw error;
      }

      // Handle token refresh if needed
      const tokenRefreshRequired = response.headers.get('X-Token-Refresh-Required');
      if (tokenRefreshRequired === 'true') {
        await this.refreshToken();
      }

      return data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  handleError(error) {
    console.error('API Error:', error);

    if (error.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      cacheService.clear();
      window.location.href = '/login';
      throw new Error('Session expired. Please log in again.');
    }

    if (error.status === 403) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
      throw new Error('Access denied. Please log in again.');
    }

    if (error.status === 429) {
      throw new Error('Too many requests. Please try again later.');
    }

    if (error.status === 423) {
      throw new Error('Account is temporarily locked. Please try again later.');
    }

    if (error.status === 413) {
      throw new Error('File size too large. Maximum size is 5MB.');
    }

    throw error;
  }

  async refreshToken() {
    try {
      const response = await fetch(`${this.baseUrl}/user/refresh-token`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'X-Refresh-Token': localStorage.getItem('refreshToken')
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }

      const data = await response.json();
      localStorage.setItem('authToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
    } catch (error) {
      console.error('Token refresh failed:', error);
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
    }
  }
}

export const apiService = new ApiService();
