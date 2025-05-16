import { cacheService } from './cacheService';

class ApiService {
  constructor(baseUrl = 'http://localhost:3000') {
    // Validate and normalize base URL
    try {
      const url = new URL(baseUrl);
      // Remove trailing slash if present
      this.baseUrl = url.href.replace(/\/$/, '');
    } catch (error) {
      console.error('Invalid base URL:', error);
      throw new Error('Invalid API base URL provided');
    }
  }

  async fetchWithAuth(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      'X-Refresh-Token': localStorage.getItem('refreshToken'),
      'X-Requested-With': 'XMLHttpRequest'
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          ...headers,
          ...options.headers
        },
        credentials: 'include',
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // Parse JSON response, return empty object if parsing fails
      const data = await response.json().catch(() => ({}));

      // Handle token refresh
      if (response.status === 401 && response.headers.get('X-Token-Refresh-Required') === 'true') {
        try {
          const refreshed = await this.refreshToken();
          if (refreshed && !options._isRetry) {
            // Retry the request with new token
            return this.fetchWithAuth(endpoint, {
              ...options,
              _isRetry: true
            });
          }
        } catch (error) {
          console.error('Token refresh failed:', error);
          this.handleAuthError();
          throw new Error('Authentication failed after token refresh attempt');
        }
      }

      if (!response.ok) {
        const error = new Error(data.message || response.statusText);
        error.status = response.status;
        error.data = data;
        this.handleError(error);
        throw error;
      }

      return data;
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timed out. Please try again.');
      }
      if (!error.status && !error.message.includes('Authentication failed')) {
        error.message = 'Network error. Please check your connection.';
      }
      throw error;
    }
  }

  handleError(error) {
    if (error.status === 401) {
      this.handleAuthError();
      throw new Error('Session expired. Please log in again.');
    }

    if (error.status === 403) {
      this.handleAuthError();
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

  handleAuthError() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    cacheService.clear();
    // Dispatch auth:logout event instead of directly manipulating location
    window.dispatchEvent(new Event('auth:logout'));
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

      const data = await response.json();

      if (!response.ok) {
        this.handleAuthError();
        return false;
      }

      localStorage.setItem('authToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.handleAuthError();
      return false;
    }
  }
}

const apiService = new ApiService();
export { apiService };
