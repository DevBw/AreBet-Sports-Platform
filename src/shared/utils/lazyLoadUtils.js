// ===============================================
// LAZY LOADING UTILITIES
// Enhanced lazy loading with retry, error boundaries, and preloading
// ===============================================

import React, { lazy, Suspense } from 'react';
import { LoadingSpinner, ErrorBoundary } from '../components';

// Enhanced lazy loading with retry mechanism
export const lazyWithRetry = (importFn, fallbackComponent = null, maxRetries = 3) => {
  return lazy(() => {
    return new Promise((resolve, reject) => {
      let retries = 0;
      
      const attemptImport = () => {
        importFn()
          .then(resolve)
          .catch((error) => {
            retries += 1;
            console.warn(`Failed to load component (attempt ${retries}/${maxRetries}):`, error);
            
            if (retries >= maxRetries) {
              // If we have a fallback component, use it
              if (fallbackComponent) {
                resolve({ default: fallbackComponent });
              } else {
                reject(error);
              }
            } else {
              // Retry with exponential backoff
              const delay = Math.pow(2, retries) * 1000;
              setTimeout(attemptImport, delay);
            }
          });
      };
      
      attemptImport();
    });
  });
};

// Preload components for better UX
export const preloadComponent = (importFn) => {
  return importFn().catch(error => {
    console.warn('Failed to preload component:', error);
  });
};

// Create a wrapped lazy component with consistent loading and error handling
export const createLazyComponent = (importFn, options = {}) => {
  const {
    fallback = <LoadingSpinner size="lg" />,
    errorFallback = null,
    displayName = 'LazyComponent',
    preload = false
  } = options;

  const LazyComponent = lazyWithRetry(importFn, errorFallback);
  LazyComponent.displayName = displayName;

  // Preload if requested
  if (preload) {
    preloadComponent(importFn);
  }

  // Return wrapped component with suspense and error boundary
  const WrappedComponent = (props) => (
    <ErrorBoundary fallback={errorFallback}>
      <Suspense fallback={fallback}>
        <LazyComponent {...props} />
      </Suspense>
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `Lazy(${displayName})`;
  WrappedComponent.preload = () => preloadComponent(importFn);

  return WrappedComponent;
};

// Route-based code splitting helper
export const createLazyRoute = (importFn, routeName) => {
  return createLazyComponent(importFn, {
    displayName: `${routeName}Page`,
    fallback: (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <LoadingSpinner size="xl" />
          <p className="text-gray-400">Loading {routeName}...</p>
        </div>
      </div>
    ),
    errorFallback: () => (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-semibold text-red-400">Failed to load {routeName}</h2>
          <p className="text-gray-400">Please refresh the page to try again</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400"
          >
            Reload Page
          </button>
        </div>
      </div>
    )
  });
};

// Component-based code splitting for heavy components
export const createLazyModal = (importFn, modalName) => {
  return createLazyComponent(importFn, {
    displayName: `${modalName}Modal`,
    fallback: (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-gray-900 p-8 rounded-xl">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-center text-gray-400">Loading {modalName}...</p>
        </div>
      </div>
    )
  });
};

// Chart/visualization lazy loading
export const createLazyChart = (importFn, chartName) => {
  return createLazyComponent(importFn, {
    displayName: `${chartName}Chart`,
    fallback: (
      <div className="w-full h-64 bg-gray-800 rounded-lg flex items-center justify-center">
        <div className="text-center space-y-2">
          <LoadingSpinner size="lg" />
          <p className="text-sm text-gray-400">Loading {chartName}...</p>
        </div>
      </div>
    ),
    errorFallback: () => (
      <div className="w-full h-64 bg-gray-800 rounded-lg flex items-center justify-center">
        <p className="text-gray-400">Unable to load {chartName}</p>
      </div>
    )
  });
};

// Intersection observer based lazy loading for components
export const useLazyVisible = (ref, options = {}) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const [hasBeenVisible, setHasBeenVisible] = React.useState(false);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasBeenVisible) {
          setIsVisible(true);
          setHasBeenVisible(true);
        }
      },
      {
        threshold: 0.1,
        ...options
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [ref, hasBeenVisible, options]);

  return isVisible || hasBeenVisible;
};

// Progressive loading utility
export const useProgressiveLoading = (stages = []) => {
  const [currentStage, setCurrentStage] = React.useState(0);
  const [loadedStages, setLoadedStages] = React.useState(new Set());

  const loadNextStage = React.useCallback(() => {
    if (currentStage < stages.length - 1) {
      setCurrentStage(prev => prev + 1);
      setLoadedStages(prev => new Set([...prev, currentStage]));
    }
  }, [currentStage, stages.length]);

  const loadStage = React.useCallback((index) => {
    if (index < stages.length) {
      setCurrentStage(index);
      setLoadedStages(prev => new Set([...prev, index]));
    }
  }, [stages.length]);

  return {
    currentStage,
    loadedStages,
    loadNextStage,
    loadStage,
    isStageLoaded: (index) => loadedStages.has(index),
    currentStageData: stages[currentStage]
  };
};

const LazyLoadUtils = {
  lazyWithRetry,
  preloadComponent,
  createLazyComponent,
  createLazyRoute,
  createLazyModal,
  createLazyChart,
  useLazyVisible,
  useProgressiveLoading
};

export default LazyLoadUtils;