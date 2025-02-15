import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const ImageOptimizer = ({ 
  src, 
  alt, 
  sizes = '100vw',
  className,
  loading = 'lazy',
  ...props 
}) => {
  const [imageSrc, setImageSrc] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadImage = async () => {
      try {
        // Kontrollera om bilden finns i cache
        const cachedImage = sessionStorage.getItem(src);
        if (cachedImage) {
          setImageSrc(cachedImage);
          return;
        }

        // Ladda och optimera bilden
        const response = await fetch(src);
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        
        // Spara i cache
        sessionStorage.setItem(src, objectUrl);
        setImageSrc(objectUrl);
      } catch (err) {
        console.error('Error loading image:', err);
        setError(true);
      }
    };

    loadImage();

    // Cleanup
    return () => {
      if (imageSrc) {
        URL.revokeObjectURL(imageSrc);
      }
    };
  }, [src]);

  if (error) {
    return (
      <div className={`bg-gray-200 dark:bg-gray-700 ${className}`} {...props}>
        <span className="sr-only">{alt}</span>
      </div>
    );
  }

  return (
    <img
      src={imageSrc || src}
      alt={alt}
      sizes={sizes}
      loading={loading}
      className={className}
      {...props}
    />
  );
};

ImageOptimizer.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
  sizes: PropTypes.string,
  className: PropTypes.string,
  loading: PropTypes.oneOf(['lazy', 'eager']),
};

export default ImageOptimizer; 