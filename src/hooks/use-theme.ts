'use client';

import { useEffect, useState } from 'react';

export function useTheme() {
  const [themeVersion, setThemeVersion] = useState(0);

  useEffect(() => {
    const handleThemeChange = (event: Event) => {
      console.log('Theme change detected, updating components...', event);
      setThemeVersion(prev => prev + 1);
    };

    // Escuta mudanças de tema
    window.addEventListener('theme-changed', handleThemeChange);

    return () => {
      window.removeEventListener('theme-changed', handleThemeChange);
    };
  }, []);

  return { themeVersion };
}