// ===============================================
// PERFORMANCE OPTIMIZATION UTILITIES
// Advanced performance monitoring and optimization tools
// ===============================================

// Performance monitoring
export class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.observers = new Map();
    this.isEnabled = process.env.NODE_ENV === 'production';
  }

  // Measure component render time
  measureRender(componentName, renderFn) {
    if (!this.isEnabled) return renderFn();
    
    const startTime = performance.now();
    const result = renderFn();
    const endTime = performance.now();
    
    this.recordMetric(`render_${componentName}`, endTime - startTime);
    return result;
  }

  // Measure API call performance
  async measureApiCall(endpoint, apiCall) {
    const startTime = performance.now();
    try {
      const result = await apiCall();
      const endTime = performance.now();
      
      this.recordMetric(`api_${endpoint}`, endTime - startTime);
      this.recordMetric(`api_${endpoint}_success`, 1);
      
      return result;
    } catch (error) {
      const endTime = performance.now();
      this.recordMetric(`api_${endpoint}`, endTime - startTime);
      this.recordMetric(`api_${endpoint}_error`, 1);
      throw error;
    }
  }

  recordMetric(name, value) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name).push({
      value,
      timestamp: Date.now()
    });

    // Keep only last 100 measurements
    const measurements = this.metrics.get(name);
    if (measurements.length > 100) {
      measurements.shift();
    }
  }

  getMetrics() {
    const summary = {};
    
    this.metrics.forEach((measurements, name) => {
      const values = measurements.map(m => m.value);
      summary[name] = {
        count: values.length,
        average: values.reduce((a, b) => a + b, 0) / values.length,
        min: Math.min(...values),
        max: Math.max(...values),
        latest: values[values.length - 1]
      };
    });

    return summary;
  }

  // Setup performance observers
  setupObservers() {
    if (typeof window === 'undefined') return;

    // Largest Contentful Paint
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordMetric('lcp', entry.startTime);
        }
      });
      
      try {
        observer.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.set('lcp', observer);
      } catch (e) {
        console.warn('LCP observer not supported');
      }
    }

    // First Input Delay
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordMetric('fid', entry.processingStart - entry.startTime);
        }
      });
      
      try {
        observer.observe({ entryTypes: ['first-input'] });
        this.observers.set('fid', observer);
      } catch (e) {
        console.warn('FID observer not supported');
      }
    }
  }

  cleanup() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
  }
}

// Image lazy loading with intersection observer
export class LazyImageLoader {
  constructor() {
    this.observer = null;
    this.setupIntersectionObserver();
  }

  setupIntersectionObserver() {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return;

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          this.loadImage(img);
          this.observer.unobserve(img);
        }
      });
    }, {
      rootMargin: '50px 0px',
      threshold: 0.01
    });
  }

  observe(imageElement) {
    if (this.observer && imageElement) {
      this.observer.observe(imageElement);
    }
  }

  loadImage(img) {
    const src = img.dataset.src;
    if (src) {
      img.src = src;
      img.classList.remove('lazy');
      img.classList.add('loaded');
      
      // Add load event for fade-in animation
      img.onload = () => {
        img.style.opacity = '1';
      };
    }
  }

  cleanup() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

// Bundle splitting utility
export const loadChunk = async (chunkName) => {
  try {
    const module = await import(
      /* webpackChunkName: "[request]" */
      `../components/${chunkName}`
    );
    return module.default || module;
  } catch (error) {
    console.error(`Failed to load chunk ${chunkName}:`, error);
    throw error;
  }
};

// Preload critical resources
export const preloadCriticalResources = () => {
  if (typeof window === 'undefined') return;

  const criticalResources = [
    '/api/fixtures/live',
    '/api/leagues',
    '/manifest.json'
  ];

  criticalResources.forEach(resource => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = resource;
    document.head.appendChild(link);
  });
};

// Memory cleanup utility
export const cleanupMemory = () => {
  // Clear expired cache entries
  if (typeof window !== 'undefined' && window.caches) {
    window.caches.keys().then(names => {
      names.forEach(name => {
        if (name.includes('old') || name.includes('temp')) {
          window.caches.delete(name);
        }
      });
    });
  }

  // Force garbage collection in development
  if (process.env.NODE_ENV === 'development' && window.gc) {
    window.gc();
  }
};

// Performance-optimized debounce
export const debounce = (func, wait, immediate = false) => {
  let timeout;
  let args;
  let context;
  let timestamp;
  let result;

  const later = function() {
    const last = Date.now() - timestamp;

    if (last < wait && last >= 0) {
      timeout = setTimeout(later, wait - last);
    } else {
      timeout = null;
      if (!immediate) {
        result = func.apply(context, args);
        context = args = null;
      }
    }
  };

  const debounced = function() {
    context = this;
    args = arguments;
    timestamp = Date.now();
    
    const callNow = immediate && !timeout;
    
    if (!timeout) timeout = setTimeout(later, wait);
    
    if (callNow) {
      result = func.apply(context, args);
      context = args = null;
    }

    return result;
  };

  debounced.clear = function() {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  };

  debounced.flush = function() {
    if (timeout) {
      result = func.apply(context, args);
      debounced.clear();
    }
    return result;
  };

  return debounced;
};

// Throttle function for scroll events
export const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Virtual scrolling helper for large lists
export class VirtualScrolling {
  constructor(containerHeight, itemHeight, buffer = 5) {
    this.containerHeight = containerHeight;
    this.itemHeight = itemHeight;
    this.buffer = buffer;
  }

  getVisibleRange(scrollTop, totalItems) {
    const startIndex = Math.max(0, Math.floor(scrollTop / this.itemHeight) - this.buffer);
    const endIndex = Math.min(
      totalItems - 1,
      startIndex + Math.ceil(this.containerHeight / this.itemHeight) + this.buffer * 2
    );

    return { startIndex, endIndex };
  }

  getItemStyle(index) {
    return {
      position: 'absolute',
      top: index * this.itemHeight,
      height: this.itemHeight,
      width: '100%'
    };
  }

  getContainerStyle(totalItems) {
    return {
      height: totalItems * this.itemHeight,
      position: 'relative'
    };
  }
}

// Web Workers utility for heavy computations
export const createWorker = (workerFunction) => {
  const blob = new Blob([`(${workerFunction.toString()})()`], { type: 'application/javascript' });
  return new Worker(URL.createObjectURL(blob));
};

// Singleton instances
export const performanceMonitor = new PerformanceMonitor();
export const lazyImageLoader = new LazyImageLoader();

// Auto-setup performance monitoring
if (typeof window !== 'undefined') {
  performanceMonitor.setupObservers();
  
  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    performanceMonitor.cleanup();
    lazyImageLoader.cleanup();
  });
}

export default {
  performanceMonitor,
  lazyImageLoader,
  loadChunk,
  preloadCriticalResources,
  cleanupMemory,
  debounce,
  throttle,
  VirtualScrolling,
  createWorker
};