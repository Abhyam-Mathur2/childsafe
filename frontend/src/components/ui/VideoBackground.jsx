import React, { useRef, useEffect, useState } from 'react';

/**
 * VideoBackground Component
 * Optimized for high performance and smooth rendering.
 */
const VideoBackground = ({ opacity = 0.5 }) => {
  const videoRef = useRef(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  
  const videoUrl = "/assets/auth-bg.mp4";
  const posterUrl = "/assets/auth-bg-poster.jpg"; 

  const premiumPlaceholder = "https://assets.mixkit.co/videos/preview/mixkit-forest-stream-in-the-sunlight-529-large.mp4";

  useEffect(() => {
    if (videoRef.current) {
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

  const effectiveOpacity = Math.max(opacity, 0.62);

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden pointer-events-none z-[-2] bg-slate-950">
      {/* 
        Stage 1: Base Gradient (Immediate)
      */}
      <div className="absolute inset-0 bg-[#020617]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#064e3b,transparent_70%)] opacity-35"></div>
      
      {/* 
        Stage 2: Video Layer 
        Added 'will-change-transform' and 'translate-z-0' to trigger hardware acceleration.
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
        className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-700 ease-in-out transform-gpu will-change-transform ${
          isVideoLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ 
            opacity: isVideoLoaded ? effectiveOpacity : 0,
            transform: 'translateZ(0)',
            filter: 'contrast(1.04) saturate(1.06)',
        }}
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
        Stage 3: Simplified Overlays 
        Removed backdrop-blur as it causes major lag on many GPUs.
        Using a standard semi-transparent black overlay instead.
      */}
      <div className="absolute inset-0 bg-black/18"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/10 via-transparent to-slate-950/45"></div>
    </div>
  );
};

export default VideoBackground;
