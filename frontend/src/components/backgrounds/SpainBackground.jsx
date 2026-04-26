import React, { useMemo } from 'react';
import { motion as Motion } from 'framer-motion';

const SpainBackground = () => {
  const petals = useMemo(() => Array.from({ length: 20 }).map((_, i) => {
    const pseudoRandom = (seed) => {
      const x = Math.sin(i + seed) * 10000;
      return x - Math.floor(x);
    };
    return {
      initialX: pseudoRandom(1) * 100, // 0 to 100vw
      animateX: pseudoRandom(2) * 100,
      duration: pseudoRandom(3) * 10 + 10,
      delay: pseudoRandom(4) * 20,
    };
  }), []);

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#0D0D0D]">
      {/* Radial Gradient Base */}
      <div 
        className="absolute inset-0"
        style={{ 
          background: 'radial-gradient(circle at center, #8B0000 0%, #0D0D0D 80%)',
          opacity: 0.6
        }}
      />

      {/* Geometric Diamond Pattern */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l30 30-30 30L0 30z' fill='none' stroke='%23C1121F' stroke-width='1'/%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px',
          animation: 'drift 60s linear infinite'
        }}
      />

      {/* Falling Rose Petals */}
      {petals.map((petal, i) => (
        <Motion.div
          key={i}
          initial={{ 
            y: -20, 
            x: `${petal.initialX}vw`,
            rotate: 0,
            opacity: 0
          }}
          animate={{ 
            y: window.innerHeight + 20,
            x: `calc(${petal.animateX}vw + ${Math.sin(i) * 50}px)`,
            rotate: 360,
            opacity: [0, 0.6, 0.6, 0]
          }}
          transition={{ 
            duration: petal.duration,
            repeat: Infinity,
            delay: petal.delay,
            ease: "linear"
          }}
          className="absolute w-4 h-5 pointer-events-none"
        >
          <svg viewBox="0 0 20 25" className="w-full h-full text-[#C1121F] fill-current">
            <ellipse cx="10" cy="12.5" rx="8" ry="11" />
          </svg>
        </Motion.div>
      ))}

      <style>{`
        @keyframes drift {
          from { background-position: 0 0; }
          to { background-position: 60px 60px; }
        }
      `}</style>
    </div>
  );
};

export default SpainBackground;
