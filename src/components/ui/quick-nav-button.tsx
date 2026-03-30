'use client';

import { useLoading } from '@/components/providers/loading-provider';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface QuickNavButtonProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  disabled?: boolean;
}

export function QuickNavButton({ 
  href, 
  children, 
  className,
  variant = 'default',
  size = 'default',
  disabled
}: QuickNavButtonProps) {
  const { isLoading, showLoading } = useLoading();
  const router = useRouter();

  const handleClick = () => {
    showLoading("Carregando...");
    
    // Pequeno delay para mostrar a tela linda
    setTimeout(() => {
      router.push(href);
    }, 100);
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        disabled={disabled || isLoading}
        onClick={handleClick}
        className={cn(className)}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Carregando...
          </>
        ) : (
          children
        )}
      </Button>
    </>
  );
}
