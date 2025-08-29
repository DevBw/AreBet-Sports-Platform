import { useState, useCallback } from 'react';

/**
 * Custom hook for centralized error handling
 * Provides consistent error handling across components
 */
export const useErrorHandler = () => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Handles async operations with consistent error handling
   * @param {Function} asyncFn - Async function to execute
   * @param {Object} options - Configuration options
   * @returns {Promise} Result of the async operation
   */
  const handleAsync = useCallback(async (asyncFn, options = {}) => {
    const { 
      loadingMessage = 'Loading...', 
      successMessage = null,
      onSuccess = null,
      onError = null
    } = options;

    try {
      setIsLoading(true);
      setError(null);
      
      const result = await asyncFn();
      
      if (successMessage) {
        console.info(successMessage, result);
      }
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      return result;
    } catch (err) {
      const errorMessage = `${err.message || 'An unexpected error occurred'}`;
      setError(errorMessage);
      
      console.error('Error in async operation:', err);
      
      if (onError) {
        onError(err);
      }
      
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Clears the current error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Sets a custom error message
   * @param {string|Error} errorMessage - Error message or Error object
   */
  const setCustomError = useCallback((errorMessage) => {
    const message = errorMessage instanceof Error ? errorMessage.message : errorMessage;
    setError(message);
  }, []);

  /**
   * Wraps multiple async operations with error handling
   * @param {Array} asyncFunctions - Array of async functions
   * @param {Object} options - Configuration options
   * @returns {Promise<Array>} Array of results
   */
  const handleMultipleAsync = useCallback(async (asyncFunctions, options = {}) => {
    const { 
      stopOnFirstError = false,
      loadingMessage = 'Loading multiple operations...'
    } = options;

    try {
      setIsLoading(true);
      setError(null);

      let results;
      if (stopOnFirstError) {
        // Execute sequentially and stop on first error
        results = [];
        for (const fn of asyncFunctions) {
          const result = await fn();
          results.push(result);
        }
      } else {
        // Execute in parallel, collect all results/errors
        results = await Promise.allSettled(asyncFunctions.map(fn => fn()));
      }

      return results;
    } catch (err) {
      const errorMessage = `Multiple operations failed: ${err.message}`;
      setError(errorMessage);
      console.error('Error in multiple async operations:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    error,
    isLoading,
    handleAsync,
    clearError,
    setCustomError,
    handleMultipleAsync
  };
};

export default useErrorHandler;