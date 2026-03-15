import React, { useState, useRef } from 'react';

const TiltCard = ({ children, className = '' }) => {
    const cardRef = useRef(null);
    const [tiltStyles, setTiltStyles] = useState({});
    const [shineStyles, setShineStyles] = useState({ opacity: 0 });

    const handleMouseMove = (e) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        
        // Calculate mouse position relative to card center
        const x = e.clientX - rect.left; 
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        // Calculate rotation (max strictly limited to 8 degrees on edges)
        const tiltX = -((y - centerY) / centerY) * 8;
        const tiltY = ((x - centerX) / centerX) * 8;

        setTiltStyles({
            transform: `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.02, 1.02, 1.02)`,
            transition: 'transform 0.1s ease-out'
        });

        // Calculate shine position (percentage)
        const shineX = (x / rect.width) * 100;
        const shineY = (y / rect.height) * 100;

        setShineStyles({
            background: `radial-gradient(circle at ${shineX}% ${shineY}%, rgba(255,255,255,0.12), transparent 50%)`,
            opacity: 1
        });
    };

    const handleMouseLeave = () => {
        setTiltStyles({
            transform: `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`,
            transition: 'transform 0.5s cubic-bezier(0.25, 0.8, 0.25, 1)'
        });
        setShineStyles({ opacity: 0 });
    };

    return (
        <div 
            ref={cardRef}
            className={`relative overflow-hidden hover:shadow-[0_20px_60px_rgba(52,211,153,0.15)] transition-shadow duration-300 ${className}`}
            style={tiltStyles}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            {/* localized light shine effect */}
            <div 
                className="absolute inset-0 pointer-events-none transition-opacity duration-300 z-10" 
                style={shineStyles} 
            />
            {/* The actual content */}
            <div className="relative z-20 h-full">
                {children}
            </div>
        </div>
    );
};

export default TiltCard;
