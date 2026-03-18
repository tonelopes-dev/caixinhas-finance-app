'use client';

import { ArrowLeft } from 'lucide-react';
import { QuickNavButton } from './quick-nav-button';
import { cn } from '@/lib/utils';

type StandardBackButtonProps = {
  href: string;
  label: string;
  className?: string;
};

/**
 * Componente padronizado para botões de "Voltar" com design premium.
 * Inclui efeito de glassmorphism, animação de seta e transição suave.
 */
export function StandardBackButton({ href, label, className }: StandardBackButtonProps) {
  return (
    <div className={cn("mb-8", className)}>
      <QuickNavButton 
        href={href}
        variant="ghost" 
        className="group h-10 px-4 rounded-xl border border-white/50 bg-white/40 backdrop-blur-sm shadow-sm text-sm font-bold text-[#2D241E]/60 hover:text-[#2D241E] hover:bg-white/60 transition-all flex items-center w-fit"
      >
        <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1 text-[#ff6b7b]" />
        {label}
      </QuickNavButton>
    </div>
  );
}
