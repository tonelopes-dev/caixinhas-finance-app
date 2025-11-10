import Image from 'next/image';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

type ImageProps = ComponentProps<typeof Image>;

export function Logo(props: Partial<ImageProps>) {
  const { className, ...rest } = props;
  
  // Fallback para desenvolvimento local
  if (process.env.NODE_ENV === 'development') {
    return (
      <img
        src="/logo-caixinhas.png"
        alt="Caixinhas Logo"
        width={48}
        height={48}
        className={cn('h-12 w-12 object-contain', className)}
        {...(rest as any)}
      />
    );
  }
  
  return (
    <Image
      src="/logo-caixinhas.png"
      alt="Caixinhas Logo"
      width={48}
      height={48}
      priority
      className={cn('h-12 w-12 object-contain', className)}
      {...rest}
    />
  );
}
