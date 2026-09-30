import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';

const CursorEffect = () => {
    const [isHovering, setIsHovering] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [isMouseDown, setIsMouseDown] = useState(false);

    // Main cursor coordinates
    const cursorX = useMotionValue(-100);
    const cursorY = useMotionValue(-100);

    // Spring configuration for ultra-smooth movement
    const springConfig = { damping: 25, stiffness: 250, mass: 0.5 };
    const springX = useSpring(cursorX, springConfig);
    const springY = useSpring(cursorY, springConfig);

    // Trailing effect coordinates
    const trailerX = useSpring(cursorX, { damping: 30, stiffness: 150 });
    const trailerY = useSpring(cursorY, { damping: 30, stiffness: 150 });

    useEffect(() => {
        const moveCursor = (e) => {
            cursorX.set(e.clientX);
            cursorY.set(e.clientY);
            if (!isVisible) setIsVisible(true);
        };

        const handleMouseDown = () => setIsMouseDown(true);
        const handleMouseUp = () => setIsMouseDown(false);

        const handleMouseOver = (e) => {
            const target = e.target;
            const isClickable = target.closest('button, a, input, select, textarea, [role="button"], .glass-card, .nav-link');
            setIsHovering(!!isClickable);
        };

        const handleMouseOut = () => setIsVisible(false);
        const handleMouseEnter = () => setIsVisible(true);

        window.addEventListener('mousemove', moveCursor);
        window.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mouseup', handleMouseUp);
        window.addEventListener('mouseover', handleMouseOver);
        document.body.addEventListener('mouseleave', handleMouseOut);
        document.body.addEventListener('mouseenter', handleMouseEnter);

        // Hide default cursor
        document.body.style.cursor = 'none';

        return () => {
            window.removeEventListener('mousemove', moveCursor);
            window.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('mouseover', handleMouseOver);
            document.body.removeEventListener('mouseleave', handleMouseOut);
            document.body.removeEventListener('mouseenter', handleMouseEnter);
            document.body.style.cursor = 'auto';
        };
    }, [cursorX, cursorY, isVisible]);

    return (
        <div className="pointer-events-none fixed inset-0 z-[99999] overflow-hidden hidden md:block">
            <AnimatePresence>
                {isVisible && (
                    <>
                        {/* Smooth Trailer / Outer Ring */}
                        <motion.div
                            className="absolute rounded-full border border-emerald-400/30 bg-emerald-400/5 mix-blend-screen"
                            style={{
                                x: trailerX,
                                y: trailerY,
                                translateX: '-50%',
                                translateY: '-50%',
                                width: isHovering ? 80 : 40,
                                height: isHovering ? 80 : 40,
                            }}
                            transition={{
                                width: { type: 'spring', ...springConfig },
                                height: { type: 'spring', ...springConfig }
                            }}
                        />

                        {/* Spotlight Glow */}
                        <motion.div
                            className="absolute rounded-full bg-emerald-500/10 blur-3xl"
                            style={{
                                x: springX,
                                y: springY,
                                translateX: '-50%',
                                translateY: '-50%',
                                width: isHovering ? 150 : 100,
                                height: isHovering ? 150 : 100,
                            }}
                        />

                        {/* Main Cursor Core */}
                        <motion.div
                            className="absolute rounded-full bg-white z-[1]"
                            style={{
                                x: springX,
                                y: springY,
                                translateX: '-50%',
                                translateY: '-50%',
                                scale: isMouseDown ? 0.8 : isHovering ? 1.5 : 1,
                            }}
                            animate={{
                                width: isHovering ? 4 : 6,
                                height: isHovering ? 4 : 6,
                                backgroundColor: isHovering ? '#34d399' : '#ffffff',
                            }}
                        />

                        {/* Interactive Ring on Hover */}
                        {isHovering && (
                            <motion.div
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.5, opacity: 0 }}
                                className="absolute rounded-full border border-white/20 backdrop-blur-[1px]"
                                style={{
                                    x: springX,
                                    y: springY,
                                    translateX: '-50%',
                                    translateY: '-50%',
                                    width: 50,
                                    height: 50,
                                }}
                            />
                        )}
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CursorEffect;
