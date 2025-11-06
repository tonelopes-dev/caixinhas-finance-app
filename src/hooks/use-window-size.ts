
'use client';

import { useState, useEffect } from 'react';

// Defina a interface para o tamanho da janela
interface Size {
  width: number | undefined;
  height: number | undefined;
}

// Hook para obter o tamanho da janela
export function useWindowSize(): Size {
  const [windowSize, setWindowSize] = useState<Size>({
    width: undefined,
    height: undefined,
  });

  useEffect(() => {
    // Handler para ser chamado no redimensionamento da janela
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    // Adiciona o event listener
    window.addEventListener('resize', handleResize);

    // Chama o handler imediatamente para obter o tamanho inicial
    handleResize();

    // Remove o event listener na limpeza
    return () => window.removeEventListener('resize', handleResize);
  }, []); // O array vazio garante que o efeito só rode no mount e unmount

  return windowSize;
}
