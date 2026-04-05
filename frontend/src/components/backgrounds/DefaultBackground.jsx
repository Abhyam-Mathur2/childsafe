import React from 'react';
import { motion } from 'framer-motion';

const DefaultBackground = () => {
  const particles = Array.from({ length: 30 });

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#020617]">
      {/* 2025 Aurora Animated Blobs (Refined) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
        <motion.div 
          animate={{ x: [-100, 100, -100], y: [-50, 50, -50], scale: [1, 1.2, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-[#10b981] rounded-full filter blur-[100px] mix-blend-screen"
        />
        <motion.div 
          animate={{ x: [100, -100, 100], y: [50, -50, 50], scale: [1.2, 1, 1.2] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: -5 }}
          className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#0ea5e9] rounded-full filter blur-[100px] mix-blend-screen"
        />
        <motion.div 
          animate={{ x: [50, -50, 50], y: [100, -100, 100], scale: [1, 1.3, 1] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: -10 }}
          className="absolute top-[30%] right-[10%] w-[400px] h-[400px] bg-[#064e3b] rounded-full filter blur-[100px] mix-blend-screen"
        />
      </div>

      {/* Floating Particles */}
      {particles.map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            x: Math.random() * window.innerWidth,
            y: window.innerHeight + 20,
            opacity: 0
          }}
          animate={{ 
            y: -20,
            opacity: [0, 0.4, 0.4, 0]
          }}
          transition={{ 
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            delay: Math.random() * 20,
            ease: "linear"
          }}
          className="absolute w-1 h-1 bg-[#10b981] rounded-full pointer-events-none"
        />
      ))}
    </div>
  );
};

export default DefaultBackground;
