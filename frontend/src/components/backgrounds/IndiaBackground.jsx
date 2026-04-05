import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const IndiaBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resize);
    resize();

    const particleCount = window.innerWidth < 768 ? 30 : 60;
    const particles = [];

    class Particle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * canvas.width;
        this.y = canvas.height + Math.random() * 200;
        this.size = Math.random() * 3 + 2;
        this.speedY = Math.random() * 0.5 + 0.3;
        this.wobble = Math.random() * Math.PI * 2;
        this.wobbleSpeed = Math.random() * 0.05 + 0.02;
      }

      update() {
        this.y -= this.speedY;
        this.wobble += this.wobbleSpeed;
        this.x += Math.sin(this.wobble) * 0.5;

        if (this.y < -50) {
          this.reset();
        }
      }

      draw() {
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 2);
        gradient.addColorStop(0, '#FF6600'); // Saffron
        gradient.addColorStop(0.6, '#D4AF37'); // Gold
        gradient.addColorStop(1, 'rgba(255, 102, 0, 0)');

        ctx.beginPath();
        ctx.fillStyle = gradient;
        ctx.arc(this.x, this.y, this.size * 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#0A0015]">
      {/* Mandalas */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
        className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] opacity-10"
      >
        <MandalaSVG />
      </motion.div>

      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 180, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] opacity-5"
      >
        <MandalaSVG />
      </motion.div>

      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
      />
    </div>
  );
};

const MandalaSVG = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full text-[#D4AF37]" fill="currentColor">
    <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="0.5" />
    <circle cx="50" cy="50" r="10" fill="none" stroke="currentColor" strokeWidth="0.5" />
    {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => (
      <path
        key={deg}
        d="M50 10 Q60 30 50 50 Q40 30 50 10"
        transform={`rotate(${deg} 50 50)`}
        fill="none"
        stroke="currentColor"
        strokeWidth="0.5"
      />
    ))}
    {[22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5, 337.5].map(deg => (
      <path
        key={deg}
        d="M50 20 Q55 35 50 50 Q45 35 50 20"
        transform={`rotate(${deg} 50 50)`}
        fill="none"
        stroke="currentColor"
        strokeWidth="0.3"
      />
    ))}
  </svg>
);

export default IndiaBackground;
