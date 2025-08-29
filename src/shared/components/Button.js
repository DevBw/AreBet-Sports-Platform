import React from 'react';
import PropTypes from 'prop-types';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'medium',
  loading = false,
  disabled = false,
  className = '',
  onClick,
  type = 'button',
  ...props 
}) => {
  const baseClasses = `
    inline-flex items-center justify-center font-medium rounded-lg 
    transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2
    relative overflow-hidden group
  `;
  
  const variants = {
    primary: `
      bg-gradient-to-r from-indigo-600 to-blue-600 
      hover:from-indigo-700 hover:to-blue-700
      text-white focus:ring-indigo-500
      shadow-md hover:shadow-lg
      transform hover:scale-105 transition-transform
    `,
    secondary: `
      bg-gradient-to-r from-cyan-500 to-teal-500
      hover:from-cyan-600 hover:to-teal-600
      text-white focus:ring-cyan-500
      shadow-md hover:shadow-lg
      transform hover:scale-105 transition-transform
    `,
    outline: `
      border-2 border-indigo-600 text-indigo-600 
      hover:bg-indigo-600 hover:text-white 
      focus:ring-indigo-500 bg-white/80 backdrop-blur-sm
      hover:backdrop-blur-none
    `,
    ghost: `
      text-indigo-600 hover:bg-indigo-50 
      focus:ring-indigo-500
      dark:hover:bg-indigo-900/20
    `,
    premium: `
      bg-gradient-to-r from-amber-500 to-orange-500
      hover:from-amber-600 hover:to-orange-600
      text-white focus:ring-amber-500
      shadow-lg hover:shadow-xl transform hover:scale-105 transition-transform
      before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent
      before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-1000
    `,
    danger: `
      bg-gradient-to-r from-red-500 to-pink-500
      hover:from-red-600 hover:to-pink-600
      text-white focus:ring-red-500
      shadow-md hover:shadow-lg
    `
  };
  
  const sizes = {
    xs: 'px-2 py-1 text-xs',
    small: 'px-3 py-2 text-sm',
    medium: 'px-4 py-2.5 text-sm',
    large: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg'
  };
  
  const disabledClasses = disabled || loading ? 'opacity-50 cursor-not-allowed' : '';
  
  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${disabledClasses} ${className}`.trim();
  
  const handleClick = (e) => {
    if (!disabled && !loading && onClick) {
      onClick(e);
    }
  };

  return (
    <button
      type={type}
      className={classes}
      onClick={handleClick}
      disabled={disabled || loading}
      aria-disabled={disabled || loading}
      aria-busy={loading}
      {...props}
    >      
      {loading && (
        <svg className="animate-spin -ml-1 mr-3 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      
      <span className="relative z-10">
        {loading ? 'Loading...' : children}
      </span>
    </button>
  );
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary', 'outline', 'ghost', 'premium', 'danger']),
  size: PropTypes.oneOf(['xs', 'small', 'medium', 'large', 'xl']),
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  onClick: PropTypes.func,
  type: PropTypes.oneOf(['button', 'submit', 'reset'])
};

export { Button };
export default Button;
