"use client"

import { useEffect, useState } from 'react';

export function useIOSDetection() {
  const [isIOS, setIsIOS] = useState(false);
  const [isSafari, setIsSafari] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Detecta iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                       (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    
    // Detecta Safari
    const isSafariDevice = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    
    setIsIOS(isIOSDevice);
    setIsSafari(isSafariDevice);
  }, []);

  return {
    isIOS,
    isSafari,
    needsIOSFixes: isIOS || isSafari
  };
}