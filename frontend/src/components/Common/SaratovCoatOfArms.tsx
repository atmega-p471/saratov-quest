import React, { useState } from 'react';
import { Box, BoxProps } from '@mui/material';

interface SaratovCoatOfArmsProps extends Omit<BoxProps, 'component'> {
  width?: number | string | { xs?: number; md?: number };
  height?: number | string | { xs?: number; md?: number };
  alt?: string;
}

const SaratovCoatOfArms: React.FC<SaratovCoatOfArmsProps> = ({
  width = 28,
  height = 28,
  alt = "Герб Саратовской области",
  sx,
  ...props
}) => {
  const [imageError, setImageError] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  return (
    <Box
      component="img"
      src={imageError ? "/images/coat-of-arms-placeholder.svg" : "/images/saratov-coat-of-arms.png"}
      alt={alt}
      onError={handleImageError}
      onLoad={handleImageLoad}
      sx={{
        width,
        height,
        display: 'inline-block',
        ...sx,
      }}
      {...props}
    />
  );
};

export default SaratovCoatOfArms;
