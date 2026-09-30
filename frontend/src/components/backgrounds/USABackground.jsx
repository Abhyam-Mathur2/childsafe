import React, { useMemo } from 'react';
import { motion as Motion } from 'framer-motion';

const USABackground = () => {
  const nodes = useMemo(() => Array.from({ length: 12 }).map(() => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    duration: Math.random() * 3 + 2,
    delay: Math.random() * 5,
  })), []);

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#001233]">
      {/* Tech Blueprint Grid */}
      <div 
        className="absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #00D4FF 1px, transparent 1px),
            linear-gradient(to bottom, #00D4FF 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          animation: 'grid-pan 60s linear infinite'
        }}
      />

      {/* Top Aurora Effect */}
      <div className="absolute top-0 left-0 right-0 h-[40vh] pointer-events-none overflow-hidden">
        <Motion.div 
          animate={{ x: [-100, 100, -100], y: [-20, 20, -20], scale: [1, 1.2, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-20 left-0 w-[60%] h-[150%] bg-[#0066FF] blur-[120px] opacity-20 rounded-full"
        />
        <Motion.div 
          animate={{ x: [100, -100, 100], y: [20, -20, 20], scale: [1.2, 1, 1.2] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-20 right-0 w-[60%] h-[150%] bg-[#00D4FF] blur-[120px] opacity-20 rounded-full"
        />
        <Motion.div 
          animate={{ opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 left-[20%] w-[60%] h-full bg-white blur-[150px] opacity-10 rounded-full"
        />
      </div>

      {/* Glowing Nodes */}
      {nodes.map((node, i) => (
        <Motion.div
          key={i}
          initial={{ 
            x: node.x,
            y: node.y,
            scale: 1,
            opacity: 0.2
          }}
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.6, 0.2]
          }}
          transition={{ 
            duration: node.duration,
            repeat: Infinity,
            delay: node.delay,
            ease: "easeInOut"
          }}
          className="absolute w-2 h-2 rounded-full bg-[#00D4FF] pointer-events-none"
          style={{ boxShadow: '0 0 10px #00D4FF, 0 0 20px #00D4FF' }}
        />
      ))}

      <style>{`
        @keyframes grid-pan {
          from { background-position: 0 0; }
          to { background-position: 40px 40px; }
        }
      `}</style>
    </div>
  );
};

export default USABackground;
