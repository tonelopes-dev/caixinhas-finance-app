import type { SVGProps } from 'react';
import Image from 'next/image';

export function Logo(props: Omit<React.ComponentProps<typeof Image>, 'src' | 'alt'>) {
  return (
    <Image 
      src="/logo-teste.svg"
      alt="DreamVault Logo"
      width={128}
      height={128}
      priority
      {...props}
      />
  );
}
