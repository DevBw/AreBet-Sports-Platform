// ===============================================
// PERFORMANCE OPTIMIZATION UTILITIES
// Tools for monitoring and optimizing React performance
// ===============================================

import React, { lazy, Suspense } from 'react';

// Lazy loading with fallbacks
export const createLazyComponent = (importFn, fallback = null) => {
  const LazyComponent = lazy(importFn);
  
  return (props) => (
    <Suspense fallback={fallback || <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>}>
      <LazyComponent {...props} />
    </Suspense>
  );
};

// Image lazy loading with intersection observer
export const LazyImage = ({ src, alt, className, placeholder, ...props }) => {
  const [loaded, setLoaded] = React.useState(false);
  const [inView, setInView] = React.useState(false);
  const imgRef = React.useRef();

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={imgRef} className={className}>
      {inView ? (
        <img
          src={src}
          alt={alt}
          onLoad={() => setLoaded(true)}
          style={{ 
            opacity: loaded ? 1 : 0,
            transition: 'opacity 0.3s ease'
          }}
          {...props}
        />
      ) : (
        <div 
          className={`bg-gray-200 animate-pulse ${placeholder || ''}`}
          style={{ width: '100%', height: '100%' }}
        />
      )}
    </div>
  );
};

// Debounce hook for search and other rapid updates
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = React.useState(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Virtual scrolling for large lists
export const useVirtualScroll = (items, itemHeight, containerHeight) => {
  const [scrollTop, setScrollTop] = React.useState(0);
  
  const visibleStart = Math.floor(scrollTop / itemHeight);
  const visibleEnd = Math.min(
    visibleStart + Math.ceil(containerHeight / itemHeight) + 1,
    items.length
  );
  
  const visibleItems = items.slice(visibleStart, visibleEnd);
  const offsetY = visibleStart * itemHeight;
  const totalHeight = items.length * itemHeight;

  return {
    visibleItems,
    offsetY,
    totalHeight,
    setScrollTop
  };
};

// Performance monitoring
export const performanceMonitor = {
  // Mark performance points
  mark: (name) => {
    if (typeof performance !== 'undefined' && performance.mark) {
      performance.mark(name);
    }
  },

  // Measure between marks
  measure: (name, startMark, endMark) => {
    if (typeof performance !== 'undefined' && performance.measure) {
      try {
        performance.measure(name, startMark, endMark);
        const measure = performance.getEntriesByName(name)[0];
        return measure.duration;
      } catch (error) {
        console.warn('Performance measure failed:', error);
        return 0;
      }
    }
    return 0;
  },

  // Time a function execution
  time: async (name, fn) => {
    const startTime = performance.now();
    const result = await fn();
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`);
    return { result, duration };
  }
};

// Memory usage monitoring
export const memoryMonitor = {
  // Get current memory usage (Chrome only)
  getUsage: () => {
    if (typeof performance !== 'undefined' && performance.memory) {
      return {
        used: Math.round(performance.memory.usedJSHeapSize / 1048576), // MB
        total: Math.round(performance.memory.totalJSHeapSize / 1048576), // MB
        limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576) // MB
      };
    }
    return null;
  },

  // Log memory usage
  log: (label = '') => {
    const usage = memoryMonitor.getUsage();
    if (usage) {
      console.log(`[Memory${label ? ' ' + label : ''}] Used: ${usage.used}MB / Total: ${usage.total}MB`);
    }
  }
};

// React performance utilities
export const withPerformanceTracking = (Component, name) => {
  return React.memo((props) => {
    React.useEffect(() => {
      performanceMonitor.mark(`${name}-render-start`);
      
      return () => {
        performanceMonitor.mark(`${name}-render-end`);
        performanceMonitor.measure(
          `${name}-render-time`,
          `${name}-render-start`,
          `${name}-render-end`
        );
      };
    });

    return <Component {...props} />;
  });
};

// Bundle size analyzer (development only)
export const bundleAnalyzer = {
  // Analyze component bundle impact
  analyzeComponent: (ComponentName) => {
    if (process.env.NODE_ENV === 'development') {
      import(/* webpackChunkName: "bundle-analyzer" */ 'webpack-bundle-analyzer')
        .then(({ BundleAnalyzerPlugin }) => {
          console.log(`Analyzing bundle impact of ${ComponentName}`);
        })
        .catch(() => {
          console.log('Bundle analyzer not available');
        });
    }
  }
};

// API response caching
export const createCache = (maxSize = 100, ttl = 300000) => { // 5 minutes default TTL
  const cache = new Map();
  
  return {
    get: (key) => {
      const item = cache.get(key);
      if (!item) return null;
      
      if (Date.now() > item.expiry) {
        cache.delete(key);
        return null;
      }
      
      return item.value;
    },
    
    set: (key, value) => {
      // Remove oldest entries if at capacity
      if (cache.size >= maxSize) {
        const firstKey = cache.keys().next().value;
        cache.delete(firstKey);
      }
      
      cache.set(key, {
        value,
        expiry: Date.now() + ttl
      });
    },
    
    clear: () => cache.clear(),
    size: () => cache.size
  };
};

// Prefetch resources
export const prefetchResource = (url, type = 'fetch') => {
  if (typeof window === 'undefined') return;
  
  const link = document.createElement('link');
  link.rel = type === 'image' ? 'prefetch' : 'dns-prefetch';
  link.href = url;
  
  if (type === 'image') {
    link.as = 'image';
  }
  
  document.head.appendChild(link);
};

// Service Worker registration for caching
export const registerServiceWorker = () => {
  if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    });
  }
};

const PerformanceUtils = {
  createLazyComponent,
  LazyImage,
  useDebounce,
  useVirtualScroll,
  performanceMonitor,
  memoryMonitor,
  withPerformanceTracking,
  bundleAnalyzer,
  createCache,
  prefetchResource,
  registerServiceWorker
};

export default PerformanceUtils;