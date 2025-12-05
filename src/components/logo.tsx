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
  
  // Fallback para desenvolvimento local
  if (process.env.NODE_ENV === 'development') {
    return (
      <img
        src="/logo-caixinhas.png"
        alt="Caixinhas Logo"
        width={w}
        height={h}
        className={cn('object-contain', className)}
        style={{ width: w, height: h }}
        {...(rest as any)}
      />
    );
  }
  
  return (
    <Image
      src="/logo-caixinhas.png"
      alt="Caixinhas Logo"
      width={w}
      height={h}
      priority
      className={cn('object-contain', className)}
      style={{ width: w, height: h }}
      {...rest}
    />
  );
}
