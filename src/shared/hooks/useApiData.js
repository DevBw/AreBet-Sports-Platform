import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook for API data fetching with loading, error handling, and caching
 * @param {Function} fetchFunction - Function that returns a Promise for data fetching
 * @param {Array} dependencies - Dependencies that trigger refetch
 * @param {Object} options - Configuration options
 * @returns {Object} Data, loading state, error, and refetch function
 */
const useApiData = (fetchFunction, dependencies = [], options = {}) => {
  const {
    initialData = null,
    enabled = true,
    onSuccess = null,
    onError = null,
    retryAttempts = 3,
    retryDelay = 1000,
    cacheKey = null,
    cacheTime = 5 * 60 * 1000 // 5 minutes
  } = options;

  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);
  
  const retryCountRef = useRef(0);
  const abortControllerRef = useRef(null);

  // Simple in-memory cache
  const getCachedData = useCallback(() => {
    if (!cacheKey) return null;
    
    const cached = localStorage.getItem(`api_cache_${cacheKey}`);
    if (!cached) return null;
    
    try {
      const { data: cachedData, timestamp } = JSON.parse(cached);
      const isExpired = Date.now() - timestamp > cacheTime;
      
      if (isExpired) {
        localStorage.removeItem(`api_cache_${cacheKey}`);
        return null;
      }
      
      return cachedData;
    } catch {
      localStorage.removeItem(`api_cache_${cacheKey}`);
      return null;
    }
  }, [cacheKey, cacheTime]);

  const setCachedData = useCallback((newData) => {
    if (!cacheKey) return;
    
    try {
      const cacheEntry = {
        data: newData,
        timestamp: Date.now()
      };
      localStorage.setItem(`api_cache_${cacheKey}`, JSON.stringify(cacheEntry));
    } catch (error) {
      console.warn('Failed to cache data:', error);
    }
  }, [cacheKey]);

  const fetchData = useCallback(async (isRetry = false) => {
    if (!enabled) return;

    // Check cache first
    const cachedData = getCachedData();
    if (cachedData && !isRetry) {
      setData(cachedData);
      setLastFetch(new Date());
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    
    try {
      setLoading(true);
      setError(null);

      const result = await fetchFunction(abortControllerRef.current.signal);
      
      setData(result);
      setLastFetch(new Date());
      retryCountRef.current = 0;
      
      // Cache successful result
      setCachedData(result);
      
      if (onSuccess) {
        onSuccess(result);
      }
    } catch (err) {
      // Don't set error if request was aborted
      if (err.name === 'AbortError') return;
      
      // Retry logic
      if (retryCountRef.current < retryAttempts) {
        retryCountRef.current += 1;
        
        setTimeout(() => {
          fetchData(true);
        }, retryDelay * retryCountRef.current);
        
        return;
      }
      
      setError(err);
      
      if (onError) {
        onError(err);
      }
    } finally {
      setLoading(false);
    }
  }, [
    enabled,
    fetchFunction,
    getCachedData,
    setCachedData,
    onSuccess,
    onError,
    retryAttempts,
    retryDelay
  ]);

  // Effect to fetch data when dependencies change
  useEffect(() => {
    fetchData();
    
    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchData, ...dependencies]);

  // Manual refetch function
  const refetch = useCallback(() => {
    retryCountRef.current = 0;
    return fetchData(true);
  }, [fetchData]);

  // Reset function
  const reset = useCallback(() => {
    setData(initialData);
    setError(null);
    setLoading(false);
    retryCountRef.current = 0;
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, [initialData]);

  return {
    data,
    loading,
    error,
    lastFetch,
    refetch,
    reset,
    isStale: cacheKey && lastFetch && (Date.now() - lastFetch.getTime() > cacheTime),
    retryCount: retryCountRef.current
  };
};

export default useApiData;