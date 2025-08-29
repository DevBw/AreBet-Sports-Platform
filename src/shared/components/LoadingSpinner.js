import React from 'react';
import PropTypes from 'prop-types';

const LoadingSpinner = ({ 
  size = 'default', 
  className = '',
  text = 'Loading...' 
}) => {
  const sizes = {
    sm: 'w-4 h-4',
    default: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  return (
    <div 
      className={`loader ${className}`}
      role="status"
      aria-live="polite"
      aria-label={text}
    >
      <div 
        className={`spinner ${sizes[size]}`}
        aria-hidden="true"
      ></div>
      {text && (
        <span className="ml-3 text-sm text-secondary" aria-live="polite">{text}</span>
      )}
    </div>
  );
};

LoadingSpinner.propTypes = {
  size: PropTypes.oneOf(['sm', 'default', 'lg', 'xl']),
  className: PropTypes.string,
  text: PropTypes.string
};

export default LoadingSpinner;
