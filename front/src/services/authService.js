import { toast } from 'react-toastify';

class AuthService {
  constructor() {
    this.token = localStorage.getItem('authToken');
    this.refreshToken = localStorage.getItem('refreshToken');
    this.user = JSON.parse(localStorage.getItem('user'));
    this.refreshTimeout = null;
  }

  init() {
    if (this.token) {
      this.setupTokenRefresh();
    }
  }

  getUser() {
    return this.user;
  }

  getToken() {
    return this.token;
  }

  async login(username, password) {
    try {      const response = await fetch('/api/user/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password }),
        credentials: 'include' // For secure http-only cookies
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 423) {
          throw new Error('Account is temporarily locked. Please try again later.');
        }
        throw new Error(data.message || 'Login failed');
      }

      this.token = data.accessToken;
      this.refreshToken = data.refreshToken;
      this.user = data.user;

      localStorage.setItem('authToken', this.token);
      localStorage.setItem('refreshToken', this.refreshToken);
      localStorage.setItem('user', JSON.stringify(this.user));

      this.setupTokenRefresh();
      window.dispatchEvent(new Event('auth:login'));

      return this.user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async logout() {
    try {
      await fetch('/api/user/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'X-Refresh-Token': this.refreshToken
        },
        credentials: 'include'
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearAuth();
      window.dispatchEvent(new Event('auth:logout'));
    }
  }

  clearAuth() {
    this.token = null;
    this.refreshToken = null;
    this.user = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout);
      this.refreshTimeout = null;
    }
  }

  isAuthenticated() {
    return !!this.token && this.checkTokenExpiry();
  }

  checkTokenExpiry() {
    if (!this.token) return false;

    try {
      const payload = JSON.parse(atob(this.token.split('.')[1]));
      const expiresIn = payload.exp * 1000 - Date.now();
      
      if (expiresIn <= 0) {
        this.clearAuth();
        return false;
      }

      // If token is about to expire in the next hour, try to refresh it
      if (expiresIn < 60 * 60 * 1000) {
        this.refreshToken();
      }

      return true;
    } catch (error) {
      console.error('Token validation error:', error);
      this.clearAuth();
      return false;
    }
  }

  async refreshToken() {
    if (!this.token) return;

    try {
      const response = await fetch('/api/user/refresh-token', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'X-Refresh-Token': localStorage.getItem('refreshToken')
        },
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          this.clearAuth();
          throw new Error('Session expired. Please log in again.');
        }
        throw new Error(data.message || 'Token refresh failed');
      }

      this.token = data.accessToken;
      this.refreshToken = data.refreshToken;
      this.user = data.user;

      localStorage.setItem('authToken', this.token);
      localStorage.setItem('refreshToken', this.refreshToken);
      localStorage.setItem('user', JSON.stringify(this.user));

      this.setupTokenRefresh();
    } catch (error) {
      console.error('Token refresh error:', error);
      if (error.message.includes('Session expired')) {
        toast.error(error.message);
        window.dispatchEvent(new Event('auth:logout'));
      }
      throw error;
    }
  }

  setupTokenRefresh() {
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout);
    }

    try {
      const payload = JSON.parse(atob(this.token.split('.')[1]));
      const expiresIn = payload.exp * 1000 - Date.now();
      
      // Schedule refresh 5 minutes before expiration
      const refreshDelay = Math.max(0, expiresIn - (5 * 60 * 1000));
      
      this.refreshTimeout = setTimeout(() => {
        this.refreshToken();
      }, refreshDelay);
    } catch (error) {
      console.error('Error setting up token refresh:', error);
      this.clearAuth();
    }
  }
}

export const authService = new AuthService();