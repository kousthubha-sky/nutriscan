import { toast } from 'react-toastify';

class AuthService {
  constructor() {
    this.token = localStorage.getItem('authToken');
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
    try {
      const response = await fetch('http://localhost:3000/user/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      this.token = data.token;
      this.user = data.user;

      localStorage.setItem('authToken', this.token);
      localStorage.setItem('user', JSON.stringify(this.user));

      this.setupTokenRefresh();
      window.dispatchEvent(new Event('auth:login'));

      return this.user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  logout() {
    this.clearAuth();
    window.dispatchEvent(new Event('auth:logout'));
  }

  clearAuth() {
    this.token = null;
    this.user = null;
    localStorage.removeItem('authToken');
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
      const response = await fetch('http://localhost:3000/user/refresh-token', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Token refresh failed');
      }

      this.token = data.token;
      this.user = data.user;

      localStorage.setItem('authToken', this.token);
      localStorage.setItem('user', JSON.stringify(this.user));

      this.setupTokenRefresh();
    } catch (error) {
      console.error('Token refresh error:', error);
      if (error.message.includes('Token has expired')) {
        this.clearAuth();
        toast.error('Session expired. Please log in again.');
        window.dispatchEvent(new Event('auth:logout'));
      }
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