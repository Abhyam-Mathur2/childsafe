import React from 'react';
import { motion } from 'framer-motion';

const PortugalBackground = () => {
  return (
    <div className="fixed inset-0 overflow-hidden bg-[#001233]">
      {/* Azulejo Tile Pattern */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='80' height='80' fill='none' stroke='%231B3A6B' stroke-width='0.5'/%3E%3Cpath d='M40 0l40 40-40 40L0 40z' fill='none' stroke='%231B3A6B' stroke-width='1'/%3E%3Ccircle cx='40' cy='40' r='10' fill='none' stroke='%231B3A6B' stroke-width='0.5'/%3E%3Cpath d='M0 0l20 20M80 0L60 20M0 80l20 60M80 80L60 60' stroke='%231B3A6B' stroke-width='0.5'/%3E%3C/svg%3E")`,
          backgroundSize: '80px 80px',
        }}
      />

      {/* Pulsing Overlay */}
      <motion.div 
        animate={{ opacity: [0.08, 0.12, 0.08] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-[#1B3A6B]"
      />

      {/* Atlantic Waves */}
      <div className="absolute bottom-0 left-0 right-0 h-48 pointer-events-none opacity-20">
        <motion.svg 
          viewBox="0 0 1440 320" 
          className="absolute bottom-0 w-full"
          animate={{ x: [-20, 20, -20] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        >
          <path 
            fill="#1B3A6B" 
            d="M0,160L48,176C96,192,192,224,288,224C384,224,480,192,576,165.3C672,139,768,117,864,128C960,139,1056,181,1152,197.3C1248,213,1344,203,1392,197.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          />
        </motion.svg>
        <motion.svg 
          viewBox="0 0 1440 320" 
          className="absolute bottom-[-20px] w-full"
          animate={{ x: [20, -20, 20] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        >
          <path 
            fill="#005F73" 
            d="M0,96L48,112C96,128,192,160,288,186.7C384,213,480,235,576,213.3C672,192,768,128,864,122.7C960,117,1056,171,1152,197.3C1248,224,1344,224,1392,224L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          />
        </motion.svg>
      </div>
    </div>
  );
};

export default PortugalBackground;
