import React from 'react';
import PropTypes from 'prop-types';
import Icon from './Icon';
import Button from './Button';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to an error reporting service
    this.setState({
      error,
      errorInfo
    });

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // Send to error reporting service in production
    if (process.env.NODE_ENV === 'production' && this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom error UI
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleRetry);
      }

      // Default error UI
      return (
        <div className="min-h-64 flex items-center justify-center p-6">
          <div className="text-center max-w-md">
            <div className="mb-4">
              <Icon name="alert-triangle" size={48} className="text-red-400 mx-auto" />
            </div>
            
            <h2 className="text-xl font-semibold text-primary mb-2">
              {this.props.title || 'Something went wrong'}
            </h2>
            
            <p className="text-secondary mb-6">
              {this.props.message || 'We encountered an unexpected error. Please try again.'}
            </p>

            <div className="flex gap-3 justify-center">
              <Button onClick={this.handleRetry} variant="primary" icon="refresh">
                Try Again
              </Button>
              
              {this.props.onReset && (
                <Button onClick={this.props.onReset} variant="secondary">
                  Reset
                </Button>
              )}
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-secondary hover:text-primary">
                  Error Details (Development)
                </summary>
                <div className="mt-2 p-3 bg-red-900 bg-opacity-20 rounded text-xs font-mono text-red-300 overflow-auto max-h-40">
                  <div className="mb-2 font-bold">Error:</div>
                  <div className="mb-2">{this.state.error.toString()}</div>
                  <div className="mb-2 font-bold">Stack Trace:</div>
                  <div className="whitespace-pre-wrap">{this.state.errorInfo.componentStack}</div>
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  fallback: PropTypes.func,
  title: PropTypes.string,
  message: PropTypes.string,
  onError: PropTypes.func,
  onReset: PropTypes.func
};

// HOC for easy wrapping
export const withErrorBoundary = (Component, errorBoundaryProps = {}) => {
  const WrappedComponent = (props) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};

export default ErrorBoundary;