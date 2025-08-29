import React from 'react';
import PropTypes from 'prop-types';
import Icon from './Icon';

/**
 * Standardized error message component to reduce duplicate error UI across the app
 */
const ErrorMessage = ({ 
  error, 
  className = '',
  icon = 'alert-triangle',
  variant = 'danger' // danger, warning, info
}) => {
  if (!error) return null;

  const variantStyles = {
    danger: 'bg-red-500 bg-opacity-10 border-red-500 text-red-400',
    warning: 'bg-yellow-500 bg-opacity-10 border-yellow-500 text-yellow-400',
    info: 'bg-blue-500 bg-opacity-10 border-blue-500 text-blue-400'
  };

  return (
    <div className={`${variantStyles[variant]} border p-4 rounded-lg ${className}`}>
      <div className="flex items-center gap-2">
        <Icon name={icon} size={20} />
        <span>{error}</span>
      </div>
    </div>
  );
};

ErrorMessage.propTypes = {
  error: PropTypes.string,
  className: PropTypes.string,
  icon: PropTypes.string,
  variant: PropTypes.oneOf(['danger', 'warning', 'info'])
};

export default ErrorMessage;