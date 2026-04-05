import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

const LocationBackground = () => {
  const { theme } = useTheme();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (theme.media && theme.media.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % theme.media.length);
      }, 8000); // 8 second per image
      return () => clearInterval(interval);
    }
  }, [theme.id, theme.media]);

  // Reset index on theme change
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [theme.id]);

  const isVideo = theme.media?.[0]?.endsWith('.mp4');

  return (
    <div className="fixed inset-0 z-[-2] overflow-hidden bg-black">
      <AnimatePresence mode="wait">
        <motion.div
          key={`${theme.id}-${currentImageIndex}`}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 0.4, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 2 }}
          className="absolute inset-0"
        >
          {isVideo ? (
            <video
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover"
              src={theme.media[0]}
            />
          ) : (
            <div
              className="w-full h-full bg-cover bg-center"
              style={{ backgroundImage: `url(${theme.media[currentImageIndex]})` }}
            />
          )}
        </motion.div>
      </AnimatePresence>
      
      {/* Soft Vignette Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />
    </div>
  );
};

export default LocationBackground;
