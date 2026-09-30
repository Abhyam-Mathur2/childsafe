import React, { useMemo } from 'react';
import { motion as Motion } from 'framer-motion';

const ItalyBackground = () => {
  const leaves = useMemo(() => Array.from({ length: 15 }).map((_, i) => {
    const pseudoRandom = (seed) => {
      const x = Math.sin(i + seed) * 10000;
      return x - Math.floor(x);
    };
    return {
      initialX: pseudoRandom(1) * 100, // 0 to 100vw
      initialRotate: pseudoRandom(2) * 360,
      animateX: pseudoRandom(3) * 100,
      duration: pseudoRandom(4) * 15 + 15,
      delay: pseudoRandom(5) * 30,
    };
  }), []);

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
      {leaves.map((leaf, i) => (
        <Motion.div
          key={i}
          initial={{ 
            y: -20, 
            x: `${leaf.initialX}vw`,
            rotate: leaf.initialRotate,
            opacity: 0
          }}
          animate={{ 
            y: window.innerHeight + 20,
            x: `calc(${leaf.animateX}vw + ${Math.cos(i) * 100}px)`,
            rotate: 720,
            opacity: [0, 0.4, 0.4, 0]
          }}
          transition={{ 
            duration: leaf.duration,
            repeat: Infinity,
            delay: leaf.delay,
            ease: "linear"
          }}
          className="absolute w-6 h-3 pointer-events-none"
        >
          <div 
            className="w-full h-full bg-[#3D550C]"
            style={{ clipPath: 'ellipse(50% 25% at 50% 50%)' }}
          />
        </Motion.div>
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
