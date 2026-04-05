import React, { createContext, useContext, useEffect } from 'react';
import { useLocationTheme } from '../hooks/useLocationTheme';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const { theme, countryCode, countryName, isLoading, setThemeOverride } = useLocationTheme();

  useEffect(() => {
    if (!theme) return;

    const root = document.documentElement;
    const { colors, typography, personality } = theme;

    // Inject CSS Custom Properties
    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });

    root.style.setProperty('--font-heading', typography.headingFont);
    root.style.setProperty('--font-body', typography.bodyFont);
    root.style.setProperty('--border-radius-card', personality.borderRadius === 'sharp' ? '0' : personality.borderRadius);
    root.style.setProperty('--border-radius-button', personality.borderRadius === 'pill' ? '9999px' : personality.borderRadius);
    root.style.setProperty('--color-glow', colors.glow);
    
    // Derived properties
    root.style.setProperty('--shadow-glow', `0 0 20px ${colors.glow}`);
    
    // Handle specific fonts if they are Google Fonts
    const loadFont = (fontFamily) => {
      const fontName = fontFamily.split(',')[0].replace(/'/g, '');
      const linkId = `google-font-${fontName.toLowerCase().replace(/\s+/g, '-')}`;
      
      if (!document.getElementById(linkId)) {
        const link = document.createElement('link');
        link.id = linkId;
        link.rel = 'stylesheet';
        link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/\s+/g, '+')}:wght@400;700;900&display=swap`;
        document.head.appendChild(link);
      }
    };

    loadFont(typography.headingFont);
    loadFont(typography.bodyFont);

  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, countryCode, countryName, isLoading, setThemeOverride }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
