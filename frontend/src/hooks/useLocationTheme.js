import { useState, useEffect, useCallback, useRef } from 'react';
import { getThemeByCountryCode } from '../config/locationThemes';

const LOCAL_STORAGE_KEY = 'cse_location_theme';

export const useLocationTheme = () => {
  const [theme, setTheme] = useState(getThemeByCountryCode(null));
  const [countryCode, setCountryCode] = useState(null);
  const [countryName, setCountryName] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Once the user manually picks a theme, the still-in-flight (or any future)
  // geolocation auto-detect must not silently overwrite that choice - it was
  // doing exactly that a few seconds after every click, since the browser's
  // getCurrentPosition -> Nominatim reverse-geocode round trip is slower than
  // a user's first click on the preview widget.
  const manualOverrideRef = useRef(false);

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

      if (manualOverrideRef.current) return;

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
      if (manualOverrideRef.current) return;
      const fallbackTheme = getThemeByCountryCode(null);
      setTheme(fallbackTheme);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setThemeOverride = useCallback((code) => {
    manualOverrideRef.current = true;

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
