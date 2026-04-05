import { useState, useEffect, useCallback } from 'react';
import { getThemeByCountryCode } from '../config/locationThemes';

const LOCAL_STORAGE_KEY = 'cse_location_theme';

export const useLocationTheme = () => {
  const [theme, setTheme] = useState(getThemeByCountryCode(null));
  const [countryCode, setCountryCode] = useState(null);
  const [countryName, setCountryName] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const resolveTheme = useCallback(async (lat, lon, overrideCode = null) => {
    setIsLoading(true);
    try {
      let code = overrideCode;
      let name = null;

      if (!code) {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
        const data = await response.json();
        code = data.address?.country_code;
        name = data.address?.country;
      }

      const selectedTheme = getThemeByCountryCode(code);
      setTheme(selectedTheme);
      setCountryCode(code);
      setCountryName(name || selectedTheme.name);

      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({
        code,
        name: name || selectedTheme.name,
        themeId: selectedTheme.id
      }));
    } catch (error) {
      console.error('Error resolving location theme:', error);
      const fallbackTheme = getThemeByCountryCode(null);
      setTheme(fallbackTheme);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setThemeOverride = useCallback((code) => {
    const selectedTheme = getThemeByCountryCode(code);
    setTheme(selectedTheme);
    setCountryCode(code);
    setCountryName(selectedTheme.name);
    
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({
      code,
      name: selectedTheme.name,
      themeId: selectedTheme.id
    }));
  }, []);

  useEffect(() => {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (cached) {
      const { code, name } = JSON.parse(cached);
      setTheme(getThemeByCountryCode(code));
      setCountryCode(code);
      setCountryName(name);
      setIsLoading(false);
      return;
    }

    if (!navigator.geolocation) {
      setTheme(getThemeByCountryCode(null));
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        resolveTheme(latitude, longitude);
      },
      (error) => {
        console.error('Geolocation error:', error);
        setTheme(getThemeByCountryCode(null));
        setIsLoading(false);
      }
    );
  }, [resolveTheme]);

  return { theme, countryCode, countryName, isLoading, setThemeOverride };
};
