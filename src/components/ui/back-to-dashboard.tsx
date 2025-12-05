'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';

type BackToDashboardProps = {
  href?: string;
  className?: string;
};

export function BackToDashboard({ href = "/dashboard", className = "mb-4 w-fit" }: BackToDashboardProps) {
  const { themeVersion } = useTheme(); // Force re-render on theme change
  
  return (
    <Button asChild variant="ghost" className={className} key={themeVersion}>
      <Link href={href}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar para o Painel
      </Link>
    </Button>
  );
}