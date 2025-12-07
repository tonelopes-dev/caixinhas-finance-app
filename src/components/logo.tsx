import Image from 'next/image';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

type ImageProps = ComponentProps<typeof Image>;

interface LogoProps extends Partial<ImageProps> {
  w?: number;
  h?: number;
}

export function Logo(props: LogoProps) {
  const { className, w = 48, h = 48, ...rest } = props;
  
  // Definir tamanhos em alta resolução para diferentes densidades de tela
  // Para logos grandes (hero), usar resolução ainda maior
  const isLargeLogo = w > 200 || h > 200;
  const multiplier = isLargeLogo ? 3 : 2; // 3x para logos grandes, 2x para pequenas
  const highResW = w * multiplier;
  const highResH = h * multiplier;

  // Fallback para desenvolvimento local
  if (process.env.NODE_ENV === 'development') {
    return (
      <img
        src="/logo-caixinhas.png"
        alt="Caixinhas - Planejamento Financeiro para Casais"
        width={highResW}
        height={highResH}
        className={cn('object-contain', className)}
        style={{ 
          width: w, 
          height: h,
          imageRendering: '-webkit-optimize-contrast'
        }}
        loading="eager"
        decoding="sync"
        {...(rest as any)}
      />
    );
  }
  
  return (
    <Image
      src="/logo-caixinhas.png"
      alt="Caixinhas - Planejamento Financeiro para Casais"
      width={highResW}
      height={highResH}
      priority
      quality={100}
      placeholder="empty"
      className={cn('object-contain', className)}
      style={{ 
        width: w, 
        height: h,
        imageRendering: '-webkit-optimize-contrast'
      } as React.CSSProperties}
      sizes={`(max-width: 640px) ${Math.min(w, 300)}px, (max-width: 768px) ${Math.min(w, 400)}px, (max-width: 1024px) ${Math.min(w, 500)}px, (max-width: 1280px) ${Math.min(w, 600)}px, (max-width: 1536px) ${Math.min(w, 700)}px, ${w}px`}
      {...rest}
    />
  );
}
