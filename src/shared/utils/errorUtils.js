// ===============================================
// STANDARDIZED ERROR HANDLING UTILITIES
// Centralized error handling, logging, and user messaging
// ===============================================

import { createNotification } from '../components/NotificationSystem';

// Error types for better categorization
export const ERROR_TYPES = {
  NETWORK: 'NETWORK_ERROR',
  API: 'API_ERROR',
  VALIDATION: 'VALIDATION_ERROR',
  AUTHENTICATION: 'AUTH_ERROR',
  PERMISSION: 'PERMISSION_ERROR',
  NOT_FOUND: 'NOT_FOUND_ERROR',
  RATE_LIMIT: 'RATE_LIMIT_ERROR',
  SERVER: 'SERVER_ERROR',
  CLIENT: 'CLIENT_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR'
};

// Error severity levels
export const ERROR_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

// Enhanced error class with additional context
export class AppError extends Error {
  constructor(message, type = ERROR_TYPES.UNKNOWN, options = {}) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.code = options.code;
    this.severity = options.severity || ERROR_SEVERITY.MEDIUM;
    this.context = options.context || {};
    this.userMessage = options.userMessage || message;
    this.timestamp = new Date().toISOString();
    this.stack = Error.captureStackTrace ? Error.captureStackTrace(this, AppError) : (new Error()).stack;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      type: this.type,
      code: this.code,
      severity: this.severity,
      context: this.context,
      userMessage: this.userMessage,
      timestamp: this.timestamp,
      stack: this.stack
    };
  }
}

// Error message mapping for user-friendly messages
const ERROR_MESSAGES = {
  [ERROR_TYPES.NETWORK]: 'Connection problem. Please check your internet connection and try again.',
  [ERROR_TYPES.API]: 'Service temporarily unavailable. Please try again later.',
  [ERROR_TYPES.VALIDATION]: 'Please check your input and try again.',
  [ERROR_TYPES.AUTHENTICATION]: 'Please sign in to continue.',
  [ERROR_TYPES.PERMISSION]: 'You don\'t have permission to perform this action.',
  [ERROR_TYPES.NOT_FOUND]: 'The requested resource was not found.',
  [ERROR_TYPES.RATE_LIMIT]: 'Too many requests. Please wait a moment before trying again.',
  [ERROR_TYPES.SERVER]: 'Server error. Please try again later.',
  [ERROR_TYPES.CLIENT]: 'Something went wrong. Please refresh the page and try again.',
  [ERROR_TYPES.UNKNOWN]: 'An unexpected error occurred. Please try again.'
};

// Parse HTTP errors and convert to AppError
export const parseHttpError = (error, response = null) => {
  let errorType = ERROR_TYPES.UNKNOWN;
  let userMessage = '';
  let severity = ERROR_SEVERITY.MEDIUM;

  if (!error) {
    return new AppError('Unknown error occurred', ERROR_TYPES.UNKNOWN);
  }

  // Network errors (no response)
  if (!response && (error.code === 'NETWORK_ERROR' || error.message?.includes('fetch'))) {
    errorType = ERROR_TYPES.NETWORK;
    severity = ERROR_SEVERITY.HIGH;
  }
  // HTTP status code errors
  else if (response?.status) {
    const status = response.status;
    
    if (status >= 400 && status < 500) {
      switch (status) {
        case 401:
          errorType = ERROR_TYPES.AUTHENTICATION;
          severity = ERROR_SEVERITY.MEDIUM;
          break;
        case 403:
          errorType = ERROR_TYPES.PERMISSION;
          severity = ERROR_SEVERITY.MEDIUM;
          break;
        case 404:
          errorType = ERROR_TYPES.NOT_FOUND;
          severity = ERROR_SEVERITY.LOW;
          break;
        case 422:
          errorType = ERROR_TYPES.VALIDATION;
          severity = ERROR_SEVERITY.LOW;
          break;
        case 429:
          errorType = ERROR_TYPES.RATE_LIMIT;
          severity = ERROR_SEVERITY.MEDIUM;
          break;
        default:
          errorType = ERROR_TYPES.CLIENT;
      }
    } else if (status >= 500) {
      errorType = ERROR_TYPES.SERVER;
      severity = ERROR_SEVERITY.HIGH;
    }
  }
  // API-specific errors
  else if (error.message?.includes('API') || error.code?.startsWith('API')) {
    errorType = ERROR_TYPES.API;
    severity = ERROR_SEVERITY.HIGH;
  }

  userMessage = ERROR_MESSAGES[errorType] || error.message;

  return new AppError(
    error.message || 'Unknown error',
    errorType,
    {
      code: error.code || response?.status,
      severity,
      userMessage,
      context: {
        originalError: error.message,
        status: response?.status,
        url: response?.url
      }
    }
  );
};

// Log errors with different levels
export const logError = (error, context = {}) => {
  const errorData = {
    timestamp: new Date().toISOString(),
    error: error instanceof AppError ? error.toJSON() : {
      message: error.message,
      stack: error.stack,
      name: error.name
    },
    context,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
    url: typeof window !== 'undefined' ? window.location.href : 'unknown'
  };

  // Console logging based on severity
  if (error instanceof AppError) {
    switch (error.severity) {
      case ERROR_SEVERITY.CRITICAL:
        console.error('🚨 CRITICAL ERROR:', errorData);
        break;
      case ERROR_SEVERITY.HIGH:
        console.error('❌ HIGH PRIORITY ERROR:', errorData);
        break;
      case ERROR_SEVERITY.MEDIUM:
        console.warn('⚠️  MEDIUM PRIORITY ERROR:', errorData);
        break;
      case ERROR_SEVERITY.LOW:
        console.info('ℹ️  LOW PRIORITY ERROR:', errorData);
        break;
      default:
        console.error('❓ UNKNOWN SEVERITY ERROR:', errorData);
    }
  } else {
    console.error('💥 UNHANDLED ERROR:', errorData);
  }

  // In production, you would send this to your error tracking service
  // Example: Sentry, LogRocket, Bugsnag, etc.
  if (process.env.NODE_ENV === 'production') {
    // sendToErrorTrackingService(errorData);
  }

  return errorData;
};

// Show user-friendly error notifications
export const showErrorNotification = (error, options = {}) => {
  const appError = error instanceof AppError 
    ? error 
    : parseHttpError(error);

  const notificationOptions = {
    type: 'error',
    duration: appError.severity === ERROR_SEVERITY.CRITICAL ? 0 : 5000, // Critical errors don't auto-dismiss
    ...options
  };

  logError(appError, options.context);

  if (typeof createNotification === 'function') {
    createNotification({
      title: 'Error',
      message: appError.userMessage,
      ...notificationOptions
    });
  }

  return appError;
};

// Retry mechanism for failed operations
export const withRetry = async (operation, options = {}) => {
  const {
    maxRetries = 3,
    delay = 1000,
    backoff = 1.5,
    retryCondition = (error) => {
      // Retry on network errors or 5xx server errors
      return error instanceof AppError && 
        (error.type === ERROR_TYPES.NETWORK || error.type === ERROR_TYPES.SERVER);
    }
  } = options;

  let lastError;

  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      const result = await operation();
      return result;
    } catch (error) {
      lastError = error instanceof AppError ? error : parseHttpError(error);
      
      // Don't retry if we've exceeded max attempts or retry condition fails
      if (attempt > maxRetries || !retryCondition(lastError)) {
        throw lastError;
      }

      // Wait before retrying with exponential backoff
      const waitTime = delay * Math.pow(backoff, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  throw lastError;
};

// Async error boundary helper
export const handleAsyncError = (asyncFunction) => {
  return async (...args) => {
    try {
      return await asyncFunction(...args);
    } catch (error) {
      const appError = showErrorNotification(error);
      throw appError;
    }
  };
};

// Form validation error helper
export const createValidationError = (field, message) => {
  return new AppError(
    `Validation failed for ${field}`,
    ERROR_TYPES.VALIDATION,
    {
      severity: ERROR_SEVERITY.LOW,
      userMessage: message,
      context: { field }
    }
  );
};

// API call wrapper with standardized error handling
export const apiCall = async (fetchFunction, options = {}) => {
  try {
    const result = await withRetry(fetchFunction, options.retry);
    return result;
  } catch (error) {
    if (options.showNotification !== false) {
      return showErrorNotification(error, {
        context: options.context
      });
    }
    throw error instanceof AppError ? error : parseHttpError(error);
  }
};

const ErrorUtils = {
  ERROR_TYPES,
  ERROR_SEVERITY,
  AppError,
  parseHttpError,
  logError,
  showErrorNotification,
  withRetry,
  handleAsyncError,
  createValidationError,
  apiCall
};

export default ErrorUtils;