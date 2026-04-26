import React, { useMemo } from 'react';
import { motion as Motion } from 'framer-motion';

const DefaultBackground = () => {
  const particles = useMemo(() => Array.from({ length: 30 }).map((_, i) => {
    const pseudoRandom = (seed) => {
      const x = Math.sin(i + seed) * 10000;
      return x - Math.floor(x);
    };
    return {
      x: pseudoRandom(1) * 100, // 0 to 100vw
      duration: pseudoRandom(2) * 10 + 10,
      delay: pseudoRandom(3) * 20,
    };
  }), []);

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#020617]">
      {/* 2025 Aurora Animated Blobs (Refined) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
        <Motion.div 
          animate={{ x: [-100, 100, -100], y: [-50, 50, -50], scale: [1, 1.2, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-[#10b981] rounded-full filter blur-[100px] mix-blend-screen"
        />
        <Motion.div 
          animate={{ x: [100, -100, 100], y: [50, -50, 50], scale: [1.2, 1, 1.2] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: -5 }}
          className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#0ea5e9] rounded-full filter blur-[100px] mix-blend-screen"
        />
        <Motion.div 
          animate={{ x: [50, -50, 50], y: [100, -100, 100], scale: [1, 1.3, 1] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: -10 }}
          className="absolute top-[30%] right-[10%] w-[400px] h-[400px] bg-[#064e3b] rounded-full filter blur-[100px] mix-blend-screen"
        />
      </div>

      {/* Floating Particles */}
      {particles.map((p, i) => (
        <Motion.div
          key={i}
          initial={{ 
            x: `${p.x}vw`,
            y: window.innerHeight + 20,
            opacity: 0
          }}
          animate={{ 
            y: -20,
            opacity: [0, 0.4, 0.4, 0]
          }}
          transition={{ 
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "linear"
          }}
          className="absolute w-1 h-1 bg-[#10b981] rounded-full pointer-events-none"
        />
      ))}
    </div>
  );
};

export default DefaultBackground;
