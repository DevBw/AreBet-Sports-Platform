import { supabase } from './supabase';

/**
 * Base service class with common functionality
 * Reduces duplication across domain-specific services
 */
export class BaseService {
  constructor() {
    this.client = supabase;
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  // Cache management
  getCacheKey(table, params = {}) {
    return `${table}_${JSON.stringify(params)}`;
  }

  getFromCache(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  setCache(key, data) {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  clearCache(pattern = null) {
    if (!pattern) {
      this.cache.clear();
      return;
    }
    
    this.cache.forEach((value, key) => {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    });
  }

  // Error handling
  async handleError(operation, error) {
    console.error(`${operation} error:`, error);
    throw new Error(`Failed to ${operation}: ${error.message}`);
  }

  // Common query methods
  async executeQuery(queryBuilder, cacheKey = null) {
    if (cacheKey) {
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;
    }

    const { data, error } = await queryBuilder;
    
    if (error) throw error;

    if (cacheKey) {
      this.setCache(cacheKey, data);
    }

    return data;
  }
}