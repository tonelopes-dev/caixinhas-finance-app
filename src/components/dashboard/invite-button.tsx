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
      className="bg-[#fdfcf7] hover:bg-[#f6f3f1] hover:text-[#2D241E] border border-[#2D241E]/10 rounded-full text-[#2D241E] font-bold h-11 px-6 shadow-sm transition-all hover:shadow-md active:scale-95 group"
    >
      <UserPlus className="h-5 w-5 md:mr-2 text-[#ff6b7b] transition-transform group-hover:rotate-12" />
      <span className="hidden md:inline text-sm tracking-tight">
        {isNavigating ? 'Carregando...' : 'Convidar'}
      </span>
    </Button>
  );
}