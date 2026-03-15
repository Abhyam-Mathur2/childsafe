import React, { useRef, useEffect, useState } from 'react';

/**
 * VideoBackground Component
 * Optimized for high performance and smooth loading.
 * 
 * Performance Tip: For a 56MB video, it's CRITICAL to compress it.
 * Recommended: Use Handbrake (https://handbrake.fr/) to compress to < 5MB 
 * and convert to .webm format for even faster loading.
 */
const VideoBackground = ({ opacity = 0.5 }) => {
  const videoRef = useRef(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  
  const videoUrl = "/assets/auth-bg.mp4";
  // Consider adding a poster image at public/assets/auth-bg-poster.jpg
  const posterUrl = "/assets/auth-bg-poster.jpg"; 

  // Professional Backup in case local file fails or is too slow
  const premiumPlaceholder = "https://assets.mixkit.co/videos/preview/mixkit-forest-stream-in-the-sunlight-529-large.mp4";

  useEffect(() => {
    if (videoRef.current) {
      // Force muted play for autoplay compliance
      videoRef.current.muted = true;
      const playPromise = videoRef.current.play();

      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.warn("Autoplay interaction required", error);
        });
      }
    }
  }, []);

  const handleVideoLoad = () => {
    setIsVideoLoaded(true);
  };

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-[-2] bg-slate-950">
      {/* 
        Stage 1: Premium Background Gradient (Immediate) 
        This is what the user sees for the first 0-1 seconds.
      */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#064e3b,transparent_70%),radial-gradient(circle_at_bottom_left,#020617,transparent_70%)] opacity-80"></div>
      
      {/* 
        Stage 2: Video Layer 
        Uses object-cover to ensure it fills the screen without distortion.
      */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        poster={posterUrl}
        preload="auto"
        onLoadedData={handleVideoLoad}
        className={`absolute top-1/2 left-1/2 min-w-full min-h-full -translate-x-1/2 -translate-y-1/2 object-cover transition-opacity duration-1000 ${
          isVideoLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ opacity: isVideoLoaded ? opacity : 0 }}
        onError={(e) => {
            console.warn("Local video failed to load, trying fallback...");
            if (e.target.src !== premiumPlaceholder) {
                e.target.src = premiumPlaceholder;
                e.target.load();
                e.target.play();
            }
        }}
      >
        <source src={videoUrl} type="video/mp4" />
        <source src={premiumPlaceholder} type="video/mp4" />
      </video>
      
      {/* 
        Stage 3: Premium Overlays 
        Adds depth, reduces compression artifacts, and ensures text readability.
      */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/50"></div>
    </div>
  );
};

export default VideoBackground;
