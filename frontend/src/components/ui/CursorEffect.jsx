import React, { useState, useEffect } from 'react';

const CursorEffect = () => {
    const [position, setPosition] = useState({ x: -100, y: -100 });
    const [isHovering, setIsHovering] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const onMouseMove = (e) => {
            setPosition({ x: e.clientX, y: e.clientY });
            if (!isVisible) setIsVisible(true);
        };

        const onMouseEnter = () => setIsVisible(true);
        const onMouseLeave = () => setIsVisible(false);

        const handleMouseOver = (e) => {
            const isClickable = e.target.closest('button, a, input, select, textarea, [role="button"], .glass-card');
            setIsHovering(!!isClickable);
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseenter', onMouseEnter);
        window.addEventListener('mouseleave', onMouseLeave);
        window.addEventListener('mouseover', handleMouseOver);

        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseenter', onMouseEnter);
            window.removeEventListener('mouseleave', onMouseLeave);
            window.removeEventListener('mouseover', handleMouseOver);
        };
    }, [isVisible]);

    if (!isVisible) return null;

    return (
        <>
            {/* Spotlight Effect */}
            <div 
                className="pointer-events-none fixed inset-0 z-[9998] hidden md:block"
                style={{
                    background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(52, 211, 153, 0.05), transparent 80%)`
                }}
            />
            
            <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden hidden md:block">
                {/* Main Cursor Dot */}
                <div
                    className={`absolute rounded-full transition-all duration-300 ease-out will-change-transform ${
                        isHovering 
                            ? 'w-12 h-12 bg-white/10 backdrop-blur-[2px] border border-white/20' 
                            : 'w-4 h-4 bg-emerald-400/80 shadow-[0_0_15px_rgba(52,211,153,0.6)]'
                    }`}
                    style={{
                        left: `${position.x}px`,
                        top: `${position.y}px`,
                        transform: 'translate(-50%, -50%)',
                    }}
                >
                    {isHovering && (
                        <div className="absolute inset-0 rounded-full animate-ping bg-emerald-400/20 duration-1000" />
                    )}
                </div>

                {/* Trailing particle effect */}
                <div
                    className="absolute w-2 h-2 rounded-full bg-emerald-400/30 blur-[1px] transition-all duration-500 ease-out"
                    style={{
                        left: `${position.x}px`,
                        top: `${position.y}px`,
                        transform: 'translate(-50%, -50%)',
                        transitionDelay: '50ms'
                    }}
                />
            </div>
        </>
    );
};

export default CursorEffect;
