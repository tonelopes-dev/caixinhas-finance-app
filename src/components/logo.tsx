import Image from 'next/image';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

type ImageProps = ComponentProps<typeof Image>;

export function Logo(props: Partial<ImageProps>) {
  const { className, ...rest } = props;
  return (
    <Image
      src="/logo-caixinhas.png"
      alt="Caixinhas Logo"
      width={48}
      height={48}
      priority
      className={cn('h-12 w-12', className)}
      {...rest}
    />
  );
}
