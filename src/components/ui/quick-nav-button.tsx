'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LoadingScreen } from '@/components/ui/loading-screen';

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
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleClick = () => {
    setIsLoading(true);
    
    // Pequeno delay para mostrar a tela linda
    setTimeout(() => {
      router.push(href);
    }, 300);
  };

  return (
    <>
      {/* Tela linda de loading */}
      {isLoading && <LoadingScreen message="Navegando..." showProgress={false} />}
      
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
