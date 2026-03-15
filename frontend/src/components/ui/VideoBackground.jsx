import React, { useRef, useEffect } from 'react';

const VideoBackground = ({ opacity = 0.5 }) => {
  const videoRef = useRef(null);
  
  // Directly using the local file in the public/assets folder
  const videoUrl = "/assets/auth-bg.mp4";

  // Professional Backup in case local file fails
  const premiumPlaceholder = "https://assets.mixkit.co/videos/preview/mixkit-forest-stream-in-the-sunlight-529-large.mp4";

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(error => {
        console.warn("Autoplay was prevented. This is normal for some browsers until user interaction.", error);
      });
    }
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-[-2] bg-slate-950">
      {/* Premium Background Gradient (Visible while video loads) */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#064e3b,transparent_70%),radial-gradient(circle_at_bottom_left,#020617,transparent_70%)]"></div>
      
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-1/2 left-1/2 min-w-full min-h-full -translate-x-1/2 -translate-y-1/2 object-cover transition-opacity duration-1000"
        style={{ opacity: 0 }} // Start invisible and fade in when loaded
        onLoadedData={(e) => {
            console.log("Local environment video loaded successfully");
            e.target.style.opacity = opacity;
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
      
      {/* Dark overlay for text clarity and premium depth */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"></div>
    </div>
  );
};

export default VideoBackground;
