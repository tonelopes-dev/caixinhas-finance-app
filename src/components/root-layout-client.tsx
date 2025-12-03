'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useThemeSync } from '@/hooks/use-theme-sync';

export function RootLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Aplica temas automaticamente em todas as páginas
  useThemeSync();

  useEffect(() => {
    // Aplicar classes ao body
    document.body.className = cn(
      "antialiased app-body", // app-body aplica o gradiente em todas as páginas
      pathname.startsWith('/landing') ? 'font-sans' : 'font-body'
    );
  }, [pathname]);

  return <>{children}</>;
}
