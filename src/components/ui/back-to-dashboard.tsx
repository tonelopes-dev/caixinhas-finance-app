'use client';

import { ArrowLeft } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';
import { QuickNavButton } from './quick-nav-button';

type BackToDashboardProps = {
  href?: string;
  className?: string;
};

export function BackToDashboard({ href = "/dashboard", className = "mb-4 w-fit" }: BackToDashboardProps) {
  const { themeVersion } = useTheme(); // Force re-render on theme change
  
  return (
    <QuickNavButton 
      href={href}
      variant="ghost" 
      className={className}
      key={themeVersion}
    >
      <ArrowLeft className="mr-2 h-4 w-4" />
      Voltar para o Painel
    </QuickNavButton>
  );
}