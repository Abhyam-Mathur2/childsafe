import React, { useState, useEffect } from 'react';

const RippleButton = ({ children, onClick, className = '', disabled = false, type = "button", ...props }) => {
  const [coords, setCoords] = useState({ x: -1, y: -1 });
  const [isRippling, setIsRippling] = useState(false);

  useEffect(() => {
    if (coords.x !== -1 && coords.y !== -1) {
      setIsRippling(true);
      const timer = setTimeout(() => setIsRippling(false), 600);
      return () => clearTimeout(timer);
    }
  }, [coords]);

  const handleClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setCoords({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    if (onClick) onClick(e);
  };

  return (
    <button
      type={type}
      className={`relative overflow-hidden ${className}`}
      onClick={handleClick}
      disabled={disabled}
      {...props}
    >
      {isRippling && (
        <span
          className="absolute bg-white/30 rounded-full animate-ripple pointer-events-none"
          style={{
            left: coords.x,
            top: coords.y,
            transform: 'translate(-50%, -50%)',
            width: '20px',
            height: '20px'
          }}
        />
      )}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </button>
  );
};

export default RippleButton;
