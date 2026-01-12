'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';
import { useLoading } from '@/components/providers/loading-provider';

export function InviteButton() {
  const { themeVersion } = useTheme(); // Force re-render on theme change
  const { showLoading, hideLoading } = useLoading();
  const [isNavigating, setIsNavigating] = useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault(); // Previne navegação padrão
    
    if (isNavigating) return; // Evita cliques múltiplos
    
    setIsNavigating(true);
    
    try {
      // showLoading('✉️ Carregando página de convites...');
      
      // Simula o tempo de carregamento da página
      await new Promise(resolve => setTimeout(resolve, 800));
      
      window.location.href = '/invite';
    } catch (error) {
      console.error('Erro ao navegar:', error);
      hideLoading();
      setIsNavigating(false);
    }
  };
  
  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleClick}
      disabled={isNavigating}
      key={themeVersion}
    >
      <UserPlus className="h-4 w-4 md:mr-2" />
      <span className="hidden md:inline">
        {isNavigating ? 'Carregando...' : 'Convidar'}
      </span>
    </Button>
  );
}