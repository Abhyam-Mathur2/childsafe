import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

const FallingLeaves = () => {
    const leaves = useMemo(() => {
        return Array.from({ length: 25 }).map((_, i) => ({
            id: i,
            size: Math.random() * 20 + 10, // 10px to 30px
            left: Math.random() * 100, // 0 to 100vw
            delay: Math.random() * -30, // Negative delay so they start already on screen
            duration: Math.random() * 15 + 15, // 15s to 30s duration
            opacity: Math.random() * 0.4 + 0.1,
            rotation: Math.random() * 360,
            sway: Math.random() * 100 - 50, // -50px to 50px
        }));
    }, []);

    const leafSVG = (
        <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 2,11.5 2,13.5C2,15.5 3.75,17.25 3.75,17.25C7,8 17,8 17,8Z" />
        </svg>
    );

    return (
        <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
            {leaves.map((l) => (
                <motion.div
                    key={l.id}
                    className="absolute text-emerald-400/20"
                    style={{
                        width: `${l.size}px`,
                        height: `${l.size}px`,
                        left: `${l.left}%`,
                        top: '-50px',
                        opacity: l.opacity,
                    }}
                    animate={{
                        y: ['0vh', '110vh'],
                        x: [0, l.sway, 0, -l.sway, 0],
                        rotate: [l.rotation, l.rotation + 360],
                    }}
                    transition={{
                        y: { duration: l.duration, repeat: Infinity, ease: "linear", delay: l.delay },
                        x: { duration: l.duration / 3, repeat: Infinity, ease: "easeInOut" },
                        rotate: { duration: l.duration / 2, repeat: Infinity, ease: "linear" }
                    }}
                >
                    {leafSVG}
                </motion.div>
            ))}
        </div>
    );
};

export default FallingLeaves;
