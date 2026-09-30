import React, { useMemo } from 'react';

const Particles = () => {
    // Generate deterministic values once so they don't jump around and stay pure
    const particles = useMemo(() => {
        return Array.from({ length: 30 }).map((_, i) => {
            const pseudoRandom = (seed) => {
                const x = Math.sin(i + seed) * 10000;
                return x - Math.floor(x);
            };

            return {
                id: i,
                size: pseudoRandom(1) * 4 + 2, // 2px to 6px
                left: pseudoRandom(2) * 100, // 0 to 100vw
                delay: pseudoRandom(3) * -20, // Negative delay so they start already on screen
                duration: pseudoRandom(4) * 8 + 6, // 6s to 14s duration
                opacity: pseudoRandom(5) * 0.5 + 0.1 // Max opacity 0.1 to 0.6
            };
        });
    }, []);

    return (
        <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
            {particles.map((p) => (
                <div
                    key={p.id}
                    className="absolute bg-emerald-300 rounded-full animate-rise mix-blend-screen"
                    style={{
                        width: `${p.size}px`,
                        height: `${p.size}px`,
                        left: `${p.left}%`,
                        bottom: '-10px',
                        animationDelay: `${p.delay}s`,
                        animationDuration: `${p.duration}s`,
                        opacity: p.opacity,
                        boxShadow: `0 0 ${p.size * 2}px rgba(110, 231, 183, 0.4)`
                    }}
                />
            ))}
        </div>
    );
};

export default Particles;
