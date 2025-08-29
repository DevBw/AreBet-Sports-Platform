import React, { useState, useRef, useEffect } from 'react';

const LazyImage = ({
  src,
  alt = '',
  className = '',
  width,
  height,
  fallbackSrc = '/api/placeholder/40/40',
  onLoad,
  onError,
  ...props
}) => {
  const [imageSrc, setImageSrc] = useState(null);
  const [imageState, setImageState] = useState('loading'); // loading, loaded, error
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { 
        threshold: 0.1,
        rootMargin: '50px' // Start loading 50px before coming into view
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  // Load image when in view
  useEffect(() => {
    if (isInView && src) {
      setImageState('loading');
      
      const img = new Image();
      
      img.onload = () => {
        setImageSrc(src);
        setImageState('loaded');
        if (onLoad) onLoad();
      };
      
      img.onerror = () => {
        setImageSrc(fallbackSrc);
        setImageState('error');
        if (onError) onError();
      };
      
      img.src = src;
    }
  }, [isInView, src, fallbackSrc, onLoad, onError]);

  // Skeleton/placeholder while loading
  const renderPlaceholder = () => (
    <div 
      className={`bg-gray-700 skeleton flex items-center justify-center ${className}`}
      style={{ width, height }}
      aria-label="Loading image..."
    >
      <svg 
        className="w-6 h-6 text-gray-500" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
        />
      </svg>
    </div>
  );

  return (
    <div ref={imgRef} className="relative">
      {!isInView || imageState === 'loading' ? (
        renderPlaceholder()
      ) : (
        <img
          src={imageSrc}
          alt={alt}
          className={`transition-opacity duration-300 ${
            imageState === 'loaded' ? 'opacity-100' : 'opacity-0'
          } ${className}`}
          width={width}
          height={height}
          loading="lazy"
          {...props}
        />
      )}
    </div>
  );
};

export default LazyImage;