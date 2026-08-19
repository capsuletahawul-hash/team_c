import React, { useState } from 'react';

interface ImageWithSkeletonProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  skeletonClassName?: string;
  containerClassName?: string;
}

export const ImageWithSkeleton: React.FC<ImageWithSkeletonProps> = ({
  src,
  alt,
  className = '',
  skeletonClassName = 'w-full h-full rounded-2xl',
  containerClassName = 'relative w-full h-full overflow-hidden',
  ...props
}) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={containerClassName}>
      {!loaded && (
        <div className={`skeleton-shimmer absolute inset-0 z-10 ${skeletonClassName}`} />
      )}
      <img
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        className={`${className} ${loaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`}
        {...props}
      />
    </div>
  );
};

export default ImageWithSkeleton;
