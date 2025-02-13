import React from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  loading?: 'lazy' | 'eager';
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  sizes = '100vw',
  loading = 'lazy'
}) => {
  // Generera olika bildstorlekar
  const generateSrcSet = () => {
    const widths = [320, 640, 768, 1024, 1280];
    const baseUrl = new URL(src, window.location.origin);
    const extension = baseUrl.pathname.split('.').pop();
    const basePath = baseUrl.pathname.slice(0, -(extension?.length || 0) - 1);

    return widths
      .map(width => `${basePath}-${width}.${extension} ${width}w`)
      .join(', ');
  };

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading={loading}
      sizes={sizes}
      srcSet={generateSrcSet()}
    />
  );
};

export default OptimizedImage; 