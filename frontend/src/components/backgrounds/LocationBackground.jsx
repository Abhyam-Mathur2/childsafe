import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

const LocationBackground = () => {
  const { theme } = useTheme();
  const [currentStep, setCurrentStep] = useState('before');
  const [imageIndex, setImageIndex] = useState(0);
  const [loadedImages, setLoadedImages] = useState(new Set());
  const [failedImages, setFailedImages] = useState(new Set());

  const media = useMemo(() => {
    if (!theme?.media) return { before: [], after: [] };
    if (Array.isArray(theme.media)) return { before: [], after: theme.media };
    return theme.media;
  }, [theme]);

  const beforeImages = media.before || [];
  const afterImages = media.after || [];

  const handleNext = useCallback(() => {
    setCurrentStep((prev) => {
      if (prev === 'before' && afterImages.length > 0) {
        return 'after';
      } else {
        const maxIdx = Math.max(beforeImages.length, afterImages.length);
        setImageIndex((idx) => (idx + 1) % maxIdx);
        return 'before';
      }
    });
  }, [beforeImages.length, afterImages.length]);

  // Unified slideshow logic
  useEffect(() => {
    if (beforeImages.length === 0 && afterImages.length === 0) return;
    const interval = setInterval(handleNext, 8000);
    return () => clearInterval(interval);
  }, [handleNext, beforeImages.length, afterImages.length]);

  // Reset on theme change - moved to effect with safety check
  useEffect(() => {
    let mounted = true;
    if (mounted) {
      setCurrentStep('before');
      setImageIndex(0);
      setFailedImages(new Set());
    }
    return () => { mounted = false; };
  }, [theme.id]); 

  // ... rest of the component
  const currentImage = useMemo(() => {
    const list = media[currentStep] || [];
    if (list.length === 0) return media.after?.[0] || media.before?.[0];
    
    // Attempt to get the image, or find the next one if this one failed
    let idx = imageIndex % list.length;
    let img = list[idx];
    
    // Basic retry/skip logic if we know it failed
    if (failedImages.has(img)) {
        // Try to find the first non-failed image in the list
        img = list.find(item => !failedImages.has(item)) || list[0];
    }
    
    return img;
  }, [media, currentStep, imageIndex, failedImages]);

  // Specialized preloader for the current image to avoid flashes
  useEffect(() => {
    if (currentImage && typeof currentImage === 'string' && !currentImage.endsWith('.mp4') && !loadedImages.has(currentImage)) {
      const img = new Image();
      img.src = currentImage;
      img.onload = () => {
        setLoadedImages(prev => new Set([...prev, currentImage]));
      };
      img.onerror = () => {
        console.error(`[Background] Failed to load: ${currentImage}`);
        setFailedImages(prev => new Set([...prev, currentImage]));
        // If the current image fails, quickly move to next to avoid black screen
        handleNext();
      };
    }
  }, [currentImage, loadedImages, handleNext]);

  const isVideo = typeof currentImage === 'string' && (currentImage.endsWith('.mp4') || currentImage.includes('video'));
  const isImageReady = loadedImages.has(currentImage) || isVideo;

  return (
    <div className="fixed inset-0 z-[-10] overflow-hidden bg-[#020202]">
      {/* Immediate Visual Buffer - Thematic Gradient */}
      <div 
        className={`absolute inset-0 transition-all duration-[3000ms] ${
          currentStep === 'before' 
            ? 'bg-[radial-gradient(circle_at_center,_#1a1a1a_0%,_#000_100%)]' 
            : 'bg-[radial-gradient(circle_at_center,_#061a12_0%,_#000_100%)]'
        }`}
      />

      <AnimatePresence mode="wait">
        {isImageReady && (
          <motion.div
            key={`${theme.id}-${currentStep}-${imageIndex}-${currentImage}`}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ 
                opacity: 0.7, 
                scale: 1,
                filter: currentStep === 'before' ? 'grayscale(90%) brightness(0.6)' : 'grayscale(0%) brightness(0.8)'
            }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 2.5, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            {isVideo ? (
              <video
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover"
                src={currentImage}
              />
            ) : (
              <div 
                className="w-full h-full bg-cover bg-center transition-all duration-1000"
                style={{ backgroundImage: `url(${currentImage})` }}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Narrative Label */}
      <div className="absolute bottom-12 left-12 z-[10] hidden md:block">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex items-center gap-4"
          >
            <div className={`h-px w-12 ${currentStep === 'before' ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]'}`} />
            <span className={`text-[10px] font-black uppercase tracking-[0.4em] ${currentStep === 'before' ? 'text-red-400' : 'text-emerald-400'}`}>
              {currentStep === 'before' ? 'Current Reality' : 'Potential Future'}
            </span>
          </motion.div>
        </AnimatePresence>
      </div>
      
      {/* Premium Overlays */}
      <div className="absolute inset-0 bg-black/30 z-[1]" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/90 z-[2]" />
    </div>
  );
};

export default LocationBackground;
