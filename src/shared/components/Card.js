import React from 'react';

const Card = ({ 
  children, 
  className = '', 
  hover = true, 
  onClick,
  ...props 
}) => {
  const classes = [
    'card',
    hover && 'hover-lift cursor-pointer',
    className
  ].filter(Boolean).join(' ');

  return (
    <div
      className={classes}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};

// Card sub-components
Card.Header = ({ children, className = '' }) => (
  <div className={`card-header ${className}`}>
    {children}
  </div>
);

Card.Title = ({ children, className = '' }) => (
  <h3 className={`card-title ${className}`}>
    {children}
  </h3>
);

Card.Subtitle = ({ children, className = '' }) => (
  <p className={`card-subtitle ${className}`}>
    {children}
  </p>
);

Card.Content = ({ children, className = '' }) => (
  <div className={`card-content ${className}`}>
    {children}
  </div>
);

Card.Footer = ({ children, className = '' }) => (
  <div className={`card-footer ${className}`}>
    {children}
  </div>
);

export { Card };
export default Card;
