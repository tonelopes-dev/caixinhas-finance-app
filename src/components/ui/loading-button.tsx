'use client';

import { forwardRef, ButtonHTMLAttributes } from 'react';
import { Button } from '@/components/ui/button';
import { InlineLoading } from '@/components/ui/loading-screen';
import { cn } from '@/lib/utils';

interface LoadingButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  asChild?: boolean;
}

export const LoadingButton = forwardRef<HTMLButtonElement, LoadingButtonProps>(
  ({ children, loading = false, loadingText, className, disabled, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'transition-all duration-200 relative overflow-hidden',
          loading && 'cursor-not-allowed',
          className
        )}
        {...props}
      >
        {loading ? (
          <div className="flex items-center space-x-2">
            <InlineLoading size="sm" />
            <span>{loadingText || 'Carregando...'}</span>
          </div>
        ) : (
          children
        )}
        
        {/* Efeito shimmer quando carregando */}
        {loading && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
        )}
      </Button>
    );
  }
);

LoadingButton.displayName = 'LoadingButton';