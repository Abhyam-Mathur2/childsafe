import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { themes } from '../../config/locationThemes';

const ThemeDemoBanner = () => {
  const { theme, setThemeOverride } = useTheme();
  const [isVisible, setIsVisible] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    // Only show if explicitly requested via localStorage
    const showDemo = localStorage.getItem('cse_show_theme_demo') === 'true';
    setIsVisible(showDemo);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('cse_show_theme_demo', 'false');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[200] w-full max-w-md px-4 pointer-events-none">
      <motion.div 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="glass-card !p-0 border-[var(--color-primary)]/30 overflow-hidden pointer-events-auto shadow-2xl"
      >
        <div className="flex items-center justify-between p-3 bg-[var(--color-primary)]/10">
          <div className="flex items-center gap-2">
            <Globe size={16} className="text-[var(--color-primary)]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text)]">
              Theme Preview: {theme.greeting.flag} {theme.name}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-1 hover:bg-white/10 rounded-lg transition-colors text-white">
              {isCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
            </button>
            <button onClick={handleDismiss} className="p-1 hover:bg-rose-500/20 rounded-lg transition-colors text-white">
              <X size={14} />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {!isCollapsed && (
            <motion.div 
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0 }}
              className="p-4"
            >
              <div className="flex justify-between gap-2">
                {Object.values(themes).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setThemeOverride(t.countryCode === 'default' ? null : t.countryCode)}
                    className={`text-2xl p-2 rounded-xl border-2 transition-all ${
                      theme.id === t.id 
                        ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10' 
                        : 'border-transparent bg-white/5 hover:bg-white/10'
                    }`}
                    title={t.name}
                  >
                    {t.greeting.flag}
                  </button>
                ))}
              </div>
              <button 
                onClick={() => {
                  localStorage.removeItem('cse_location_theme');
                  window.location.reload();
                }}
                className="w-full mt-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-[var(--color-primary)] transition-colors"
              >
                Reset to Auto-Detect
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default ThemeDemoBanner;
