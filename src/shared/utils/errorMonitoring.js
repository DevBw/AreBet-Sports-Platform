// ===============================================
// ERROR MONITORING AND LOGGING SYSTEM
// Comprehensive error tracking and user experience monitoring
// ===============================================

import React from 'react';

// Error severity levels
export const ERROR_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium', 
  HIGH: 'high',
  CRITICAL: 'critical'
};

// Error categories
export const ERROR_CATEGORIES = {
  NETWORK: 'network',
  DATABASE: 'database', 
  API: 'api',
  UI: 'ui',
  AUTH: 'auth',
  SUBSCRIPTION: 'subscription',
  PERFORMANCE: 'performance',
  SECURITY: 'security'
};

export class ErrorMonitor {
  constructor() {
    this.errorQueue = [];
    this.maxQueueSize = 100;
    this.isEnabled = true;
    this.sessionId = this.generateSessionId();
    this.userId = null;
    this.setupGlobalErrorHandlers();
    this.startPeriodicFlush();
  }

  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  setUserId(userId) {
    this.userId = userId;
  }

  // Setup global error handlers
  setupGlobalErrorHandlers() {
    if (typeof window === 'undefined') return;

    // Global JavaScript errors
    window.addEventListener('error', (event) => {
      this.captureError({
        type: 'javascript_error',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
        level: ERROR_LEVELS.HIGH,
        category: ERROR_CATEGORIES.UI
      });
    });

    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.captureError({
        type: 'unhandled_promise_rejection',
        message: event.reason?.message || 'Unhandled promise rejection',
        stack: event.reason?.stack,
        level: ERROR_LEVELS.HIGH,
        category: ERROR_CATEGORIES.API
      });
    });

    // Resource loading errors
    window.addEventListener('error', (event) => {
      if (event.target !== window) {
        this.captureError({
          type: 'resource_error',
          message: `Failed to load resource: ${event.target.src || event.target.href}`,
          resource: event.target.tagName,
          level: ERROR_LEVELS.MEDIUM,
          category: ERROR_CATEGORIES.NETWORK
        });
      }
    }, true);
  }

  // Capture and log errors
  captureError(errorData) {
    if (!this.isEnabled) return;

    const enrichedError = {
      ...errorData,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      userId: this.userId,
      url: window?.location?.href,
      userAgent: navigator?.userAgent,
      viewport: {
        width: window?.innerWidth,
        height: window?.innerHeight
      },
      id: this.generateErrorId()
    };

    // Add to queue
    this.errorQueue.push(enrichedError);
    
    // Maintain queue size
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue.shift();
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group(`🚨 Error Captured [${errorData.level}]`);
      console.error('Message:', errorData.message);
      console.error('Category:', errorData.category);
      console.error('Full Error:', enrichedError);
      console.groupEnd();
    }

    // Send critical errors immediately
    if (errorData.level === ERROR_LEVELS.CRITICAL) {
      this.flushErrors([enrichedError]);
    }

    return enrichedError.id;
  }

  generateErrorId() {
    return `error_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  // API specific error handler
  captureAPIError(endpoint, error, requestData = null) {
    return this.captureError({
      type: 'api_error',
      message: `API Error: ${endpoint}`,
      endpoint,
      status: error.status,
      statusText: error.statusText,
      requestData,
      responseData: error.data,
      level: this.getAPIErrorLevel(error.status),
      category: ERROR_CATEGORIES.API
    });
  }

  getAPIErrorLevel(status) {
    if (status >= 500) return ERROR_LEVELS.CRITICAL;
    if (status >= 400) return ERROR_LEVELS.HIGH;
    return ERROR_LEVELS.MEDIUM;
  }

  // Database error handler
  captureDatabaseError(operation, error, query = null) {
    return this.captureError({
      type: 'database_error',
      message: `Database Error: ${operation}`,
      operation,
      query,
      dbError: error.message,
      level: ERROR_LEVELS.HIGH,
      category: ERROR_CATEGORIES.DATABASE
    });
  }

  // Authentication error handler
  captureAuthError(action, error) {
    return this.captureError({
      type: 'auth_error',
      message: `Authentication Error: ${action}`,
      action,
      authError: error.message,
      level: ERROR_LEVELS.HIGH,
      category: ERROR_CATEGORIES.AUTH
    });
  }

  // Performance issue tracker
  capturePerformanceIssue(metric, value, threshold) {
    return this.captureError({
      type: 'performance_issue',
      message: `Performance Issue: ${metric} (${value}ms) exceeded threshold (${threshold}ms)`,
      metric,
      value,
      threshold,
      level: value > threshold * 2 ? ERROR_LEVELS.HIGH : ERROR_LEVELS.MEDIUM,
      category: ERROR_CATEGORIES.PERFORMANCE
    });
  }

  // User feedback integration
  captureUserFeedback(feedback, errorId = null) {
    const userFeedback = {
      type: 'user_feedback',
      message: 'User reported issue',
      feedback: feedback.message,
      userEmail: feedback.email,
      category: feedback.category || ERROR_CATEGORIES.UI,
      errorId,
      level: ERROR_LEVELS.MEDIUM,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      userId: this.userId,
      url: window?.location?.href
    };

    this.errorQueue.push(userFeedback);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('📝 User Feedback:', userFeedback);
    }
  }

  // Flush errors to backend/logging service
  async flushErrors(errors = null) {
    const errorsToSend = errors || this.errorQueue.splice(0);
    
    if (errorsToSend.length === 0) return;

    try {
      // In production, you would send to your logging service
      // For now, we'll store in localStorage for debugging
      if (typeof window !== 'undefined') {
        const existingLogs = JSON.parse(localStorage.getItem('arebet_error_logs') || '[]');
        const updatedLogs = [...existingLogs, ...errorsToSend].slice(-200); // Keep last 200 errors
        localStorage.setItem('arebet_error_logs', JSON.stringify(updatedLogs));
      }

      // In development, log the batch
      if (process.env.NODE_ENV === 'development') {
        console.log(`📤 Flushed ${errorsToSend.length} errors to storage`);
      }

      return true;
    } catch (error) {
      console.error('Failed to flush errors:', error);
      return false;
    }
  }

  // Start periodic error flushing
  startPeriodicFlush() {
    setInterval(() => {
      if (this.errorQueue.length > 0) {
        this.flushErrors();
      }
    }, 30000); // Flush every 30 seconds
  }

  // Get error summary for dashboard
  getErrorSummary(timeframe = 'day') {
    try {
      const logs = JSON.parse(localStorage.getItem('arebet_error_logs') || '[]');
      const now = Date.now();
      const cutoff = {
        hour: now - (60 * 60 * 1000),
        day: now - (24 * 60 * 60 * 1000),
        week: now - (7 * 24 * 60 * 60 * 1000)
      }[timeframe] || now - (24 * 60 * 60 * 1000);

      const recentErrors = logs.filter(error => 
        new Date(error.timestamp).getTime() > cutoff
      );

      const summary = {
        total: recentErrors.length,
        byLevel: {},
        byCategory: {},
        byType: {},
        recentErrors: recentErrors.slice(-10)
      };

      recentErrors.forEach(error => {
        summary.byLevel[error.level] = (summary.byLevel[error.level] || 0) + 1;
        summary.byCategory[error.category] = (summary.byCategory[error.category] || 0) + 1;
        summary.byType[error.type] = (summary.byType[error.type] || 0) + 1;
      });

      return summary;
    } catch (error) {
      console.error('Failed to generate error summary:', error);
      return { total: 0, byLevel: {}, byCategory: {}, byType: {}, recentErrors: [] };
    }
  }

  // Enable/disable monitoring
  setEnabled(enabled) {
    this.isEnabled = enabled;
  }

  // Clear error logs
  clearLogs() {
    this.errorQueue = [];
    if (typeof window !== 'undefined') {
      localStorage.removeItem('arebet_error_logs');
    }
  }

  // Export logs for analysis
  exportLogs() {
    const logs = JSON.parse(localStorage.getItem('arebet_error_logs') || '[]');
    const dataStr = JSON.stringify(logs, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `arebet_error_logs_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

// React hook for error monitoring
export const useErrorHandler = () => {
  const handleError = React.useCallback((error, errorInfo = {}) => {
    errorMonitor.captureError({
      type: 'react_error',
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      level: ERROR_LEVELS.HIGH,
      category: ERROR_CATEGORIES.UI,
      ...errorInfo
    });
  }, []);

  const handleAPIError = React.useCallback((endpoint, error, requestData) => {
    return errorMonitor.captureAPIError(endpoint, error, requestData);
  }, []);

  const handlePerformanceIssue = React.useCallback((metric, value, threshold) => {
    return errorMonitor.capturePerformanceIssue(metric, value, threshold);
  }, []);

  return {
    handleError,
    handleAPIError,
    handlePerformanceIssue,
    captureUserFeedback: errorMonitor.captureUserFeedback.bind(errorMonitor)
  };
};

// Error Boundary component
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorId: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    const errorId = errorMonitor.captureError({
      type: 'react_boundary_error',
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      level: ERROR_LEVELS.CRITICAL,
      category: ERROR_CATEGORIES.UI
    });

    this.setState({ errorId });
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="error-boundary p-6 bg-red-50 border border-red-200 rounded-lg">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Something went wrong</h2>
          <p className="text-red-600 mb-4">
            We've encountered an unexpected error. Our team has been notified.
          </p>
          {this.state.errorId && (
            <p className="text-sm text-red-500">
              Error ID: {this.state.errorId}
            </p>
          )}
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Singleton instance
export const errorMonitor = new ErrorMonitor();

// Initialize error monitoring
if (typeof window !== 'undefined') {
  window.errorMonitor = errorMonitor;
}

export default {
  ErrorMonitor,
  errorMonitor,
  useErrorHandler,
  ErrorBoundary,
  ERROR_LEVELS,
  ERROR_CATEGORIES
};