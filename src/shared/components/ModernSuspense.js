import React, { Suspense } from 'react';
import Icon from './Icon';

// Modern loading skeleton component
const ModernLoadingSkeleton = ({ type = 'card' }) => {
  if (type === 'match-card') {
    return (
      <div className="card-modern animate-fade-in-up">
        <div className="skeleton-modern h-6 w-20 mb-4"></div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="skeleton-modern w-10 h-10 rounded-full"></div>
            <div className="skeleton-modern h-4 w-24"></div>
          </div>
          <div className="skeleton-modern h-8 w-16"></div>
          <div className="flex items-center gap-3">
            <div className="skeleton-modern h-4 w-24"></div>
            <div className="skeleton-modern w-10 h-10 rounded-full"></div>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="skeleton-modern h-3 w-16"></div>
          <div className="skeleton-modern h-3 w-20"></div>
        </div>
      </div>
    );
  }

  if (type === 'league-section') {
    return (
      <div className="space-y-4 animate-fade-in-up">
        <div className="league-header">
          <div className="skeleton-modern h-6 w-32 bg-white/20"></div>
        </div>
        <div className="grid-modern">
          {Array.from({ length: 3 }, (_, i) => (
            <ModernLoadingSkeleton key={i} type="match-card" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="card-modern animate-fade-in-up">
      <div className="skeleton-modern h-6 w-3/4 mb-4"></div>
      <div className="skeleton-modern h-4 w-1/2 mb-2"></div>
      <div className="skeleton-modern h-4 w-2/3"></div>
    </div>
  );
};

// Modern error boundary for React 18
class ModernErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Error boundary caught an error
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="card-modern text-center py-12">
          <div className="mb-4"><Icon name="alert-triangle" size={48} className="text-yellow-400" /></div>
          <h2 className="text-xl font-semibold text-gradient mb-2">
            Something went wrong
          </h2>
          <p className="text-gray-400 mb-6">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="btn-modern"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Modern Suspense wrapper with enhanced loading states
const ModernSuspense = ({ 
  children, 
  fallback, 
  type = 'card',
  errorFallback,
  onError 
}) => {
  const defaultFallback = fallback || <ModernLoadingSkeleton type={type} />;

  return (
    <ModernErrorBoundary onError={onError} fallback={errorFallback}>
      <Suspense fallback={defaultFallback}>
        {children}
      </Suspense>
    </ModernErrorBoundary>
  );
};

export default ModernSuspense;
export { ModernLoadingSkeleton, ModernErrorBoundary };