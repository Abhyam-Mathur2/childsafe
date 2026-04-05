import React from 'react';
import { motion } from 'framer-motion';

const ItalyBackground = () => {
  const leaves = Array.from({ length: 15 });

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#1A0A00]">
      {/* Marble Texture Effect */}
      <div 
        className="absolute inset-0 opacity-40"
        style={{
          background: `
            radial-gradient(ellipse at 20% 50%, rgba(193, 68, 14, 0.15), transparent),
            radial-gradient(ellipse at 80% 20%, rgba(201, 162, 39, 0.1), transparent),
            radial-gradient(ellipse at 50% 80%, rgba(61, 85, 12, 0.12), transparent)
          `,
          filter: 'contrast(120%) brightness(80%)'
        }}
      />
      
      {/* Noise overlay for marble feel */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

      {/* Floating Olive Leaves */}
      {leaves.map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            y: -20, 
            x: Math.random() * window.innerWidth,
            rotate: Math.random() * 360,
            opacity: 0
          }}
          animate={{ 
            y: window.innerHeight + 20,
            x: `calc(${Math.random() * 100}vw + ${Math.cos(i) * 100}px)`,
            rotate: 720,
            opacity: [0, 0.4, 0.4, 0]
          }}
          transition={{ 
            duration: Math.random() * 15 + 15,
            repeat: Infinity,
            delay: Math.random() * 30,
            ease: "linear"
          }}
          className="absolute w-6 h-3 pointer-events-none"
        >
          <div 
            className="w-full h-full bg-[#3D550C]"
            style={{ clipPath: 'ellipse(50% 25% at 50% 50%)' }}
          />
        </motion.div>
      ))}

      {/* Warm Vignette */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at center, transparent 30%, rgba(59, 21, 0, 0.4) 100%)'
        }}
      />
    </div>
  );
};

export default ItalyBackground;
