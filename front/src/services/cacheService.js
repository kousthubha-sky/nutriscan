// Cache configuration
export const CACHE_CONFIG = {
  searchProducts: 300000, // 5 minutes
  getFeaturedProducts: 900000, // 15 minutes
  getHealthierAlternatives: 600000, // 10 minutes
  getIndianProducts: 900000, // 15 minutes
  healthRating: 86400000, // 24 hours
};

class CacheService {
  constructor() {
    this.cache = new Map();
    this.timeouts = new Map();
    this.maxSize = 1000; // Maximum number of cached items
  }

  // Generate cache key
  generateKey(method, params = {}) {
    try {
      // Sanitize and validate input
      const sanitizedMethod = String(method).replace(/[^a-zA-Z0-9_]/g, '');
      const sanitizedParams = this._sanitizeParams(params);
      return `${sanitizedMethod}:${JSON.stringify(sanitizedParams)}`;
    } catch (error) {
      console.error('Error generating cache key:', error);
      return null;
    }
  }

  // Get cached data
  get(key) {
    if (!key) return null;
    
    const item = this.cache.get(key);
    if (!item) return null;

    const now = Date.now();
    if (now > item.expiry) {
      this.delete(key);
      return null;
    }

    // Update access timestamp for LRU implementation
    item.lastAccessed = now;
    return item.data;
  }

  // Set cache with expiry
  set(key, data, ttl = 300000) { // Default TTL: 5 minutes
    if (!key) return;

    // Enforce cache size limit
    if (this.cache.size >= this.maxSize) {
      this._evictLRU();
    }

    const expiry = Date.now() + ttl;
    this.cache.set(key, {
      data,
      expiry,
      lastAccessed: Date.now()
    });

    // Clear any existing timeout
    if (this.timeouts.has(key)) {
      clearTimeout(this.timeouts.get(key));
    }

    // Set new timeout
    const timeout = setTimeout(() => this.delete(key), ttl);
    this.timeouts.set(key, timeout);
  }

  // Delete cached data
  delete(key) {
    if (!key) return;
    this.cache.delete(key);
    if (this.timeouts.has(key)) {
      clearTimeout(this.timeouts.get(key));
      this.timeouts.delete(key);
    }
  }

  // Clear all cache
  clear() {
    this.cache.clear();
    this.timeouts.forEach(timeout => clearTimeout(timeout));
    this.timeouts.clear();
  }

  // Get cache statistics
  getStats() {
    const now = Date.now();
    const stats = {
      totalEntries: this.cache.size,
      activeEntries: 0,
      expiredEntries: 0,
      averageAge: 0
    };

    let totalAge = 0;
    this.cache.forEach((value, key) => {
      const age = now - value.lastAccessed;
      if (now <= value.expiry) {
        stats.activeEntries++;
        totalAge += age;
      } else {
        stats.expiredEntries++;
        this.delete(key); // Clean up expired entries
      }
    });

    if (stats.activeEntries > 0) {
      stats.averageAge = totalAge / stats.activeEntries;
    }

    return stats;
  }

  // Private helper methods
  _sanitizeParams(params) {
    if (typeof params !== 'object' || params === null) {
      return {};
    }

    const sanitized = {};
    for (const [key, value] of Object.entries(params)) {
      // Sanitize keys
      const sanitizedKey = String(key).replace(/[^a-zA-Z0-9_]/g, '');
      
      // Sanitize values based on type
      if (typeof value === 'object' && value !== null) {
        sanitized[sanitizedKey] = this._sanitizeParams(value);
      } else if (typeof value === 'string') {
        sanitized[sanitizedKey] = value.replace(/[^\w\s-]/g, '');
      } else if (typeof value === 'number' || typeof value === 'boolean') {
        sanitized[sanitizedKey] = value;
      }
    }
    return sanitized;
  }

  _evictLRU() {
    // Find least recently used entries
    const entries = [...this.cache.entries()]
      .sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);
    
    // Remove 20% of oldest entries
    const toRemove = Math.max(1, Math.floor(this.maxSize * 0.2));
    entries.slice(0, toRemove).forEach(([key]) => this.delete(key));
  }
}

// Create singleton instance
export const cacheService = new CacheService();

// Export a health rating specific wrapper
export class HealthRatingCache {
  constructor() {
    this._cache = cacheService;
  }

  getKey(product) {
    if (!product || !product._id) return null;
    
    return this._cache.generateKey('healthRating', {
      id: product._id,
      name: product.name,
      category: product.category,
      nutriments: product.nutriments,
      ingredients: product.ingredients,
      nutriscore_grade: product.nutriscore_grade
    });
  }

  get(product) {
    const key = this.getKey(product);
    return this._cache.get(key);
  }

  set(product, result) {
    const key = this.getKey(product);
    this._cache.set(key, result, CACHE_CONFIG.healthRating);
  }

  invalidate(product) {
    const key = this.getKey(product);
    this._cache.delete(key);
  }

  clear() {
    // Only clear health rating related entries
    const healthRatingKeys = [...this._cache.cache.keys()]
      .filter(key => key.startsWith('healthRating:'));
    
    healthRatingKeys.forEach(key => this._cache.delete(key));
  }

  getStats() {
    return this._cache.getStats();
  }
}