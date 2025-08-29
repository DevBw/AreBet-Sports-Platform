import React, { useState, useRef, useEffect, memo } from 'react';
import PropTypes from 'prop-types';
import Icon from './Icon';

const OptimizedImage = ({ 
  src, 
  alt, 
  className = '', 
  fallback = null,
  placeholder = null,
  lazy = true,
  ...props 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isInView, setIsInView] = useState(!lazy);
  const imgRef = useRef(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy || isInView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [lazy, isInView]);

  const handleLoad = () => {
    setIsLoaded(true);
    setIsError(false);
  };

  const handleError = () => {
    setIsError(true);
    setIsLoaded(false);
  };

  // Default placeholder
  const defaultPlaceholder = (
    <div className={`bg-gray-200 animate-pulse flex items-center justify-center ${className}`}>
      <Icon name="image" size={20} className="text-gray-400" />
    </div>
  );

  // Default fallback
  const defaultFallback = (
    <div className={`bg-gray-100 flex items-center justify-center ${className}`}>
      <Icon name="image-off" size={20} className="text-gray-400" />
    </div>
  );

  return (
    <div ref={imgRef} className={`relative inline-block ${className}`}>
      {/* Show placeholder while loading */}
      {!isLoaded && !isError && (placeholder || defaultPlaceholder)}
      
      {/* Show fallback on error */}
      {isError && (fallback || defaultFallback)}
      
      {/* Actual image */}
      {isInView && (
        <img
          src={src}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          className={`
            ${isLoaded ? 'opacity-100' : 'opacity-0'} 
            ${isError ? 'hidden' : ''} 
            transition-opacity duration-300 
            ${className}
          `}
          loading={lazy ? 'lazy' : 'eager'}
          {...props}
        />
      )}
    </div>
  );
};

OptimizedImage.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
  className: PropTypes.string,
  fallback: PropTypes.node,
  placeholder: PropTypes.node,
  lazy: PropTypes.bool
};

export default memo(OptimizedImage);