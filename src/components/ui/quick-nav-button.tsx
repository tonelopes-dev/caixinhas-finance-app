'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLoading } from '@/components/providers/loading-provider';

interface QuickNavButtonProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  disabled?: boolean;
  replace?: boolean;
}

export function QuickNavButton({ 
  href, 
  children, 
  className,
  variant = 'default',
  size = 'default',
  disabled,
  replace = false
}: QuickNavButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { showLoading, hideLoading } = useLoading();
  const router = useRouter();

  const handleClick = async () => {
    if (disabled || isLoading) return;

    setIsLoading(true);
    showLoading('Navegando...');
    
    try {
      if (replace) {
        router.replace(href);
      } else {
        router.push(href);
      }
      
      // Mantém loading até navegação completar (mínimo de 800ms para UX)
      setTimeout(() => {
        setIsLoading(false);
        hideLoading();
      }, 800);
    } catch (error) {
      setIsLoading(false);
      hideLoading();
      console.error('Navigation error:', error);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      disabled={disabled || isLoading}
      onClick={handleClick}
      className={cn(
        'transition-all duration-200',
        isLoading && 'opacity-70',
        className
      )}
    >
      {isLoading ? (
        <div className="flex items-center space-x-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Carregando...</span>
        </div>
      ) : (
        children
      )}
    </Button>
  );
}

// Hook para usar em componentes personalizados
export function useQuickNav() {
  const [isNavigating, setIsNavigating] = useState(false);
  const { showLoading, hideLoading } = useLoading();
  const router = useRouter();

  const navigate = async (href: string, replace = false) => {
    if (isNavigating) return;

    setIsNavigating(true);
    showLoading('Navegando...');
    
    try {
      if (replace) {
        router.replace(href);
      } else {
        router.push(href);
      }
      
      // Mantém loading até navegação completar (mínimo de 800ms para UX)
      setTimeout(() => {
        setIsNavigating(false);
        hideLoading();
      }, 800);
    } catch (error) {
      setIsNavigating(false);
      hideLoading();
      console.error('Navigation error:', error);
    }
  };

  return { isNavigating, navigate };
}