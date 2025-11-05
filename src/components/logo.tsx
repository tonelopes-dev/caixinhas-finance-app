import type { SVGProps } from 'react';
import Image from 'next/image';

export function Logo(props: Omit<React.ComponentProps<typeof Image>, 'src' | 'alt'>) {
  return (
    <Image 
      src="/teste-logo-2.png"
      alt="DreamVault Logo"
      width={128}
      height={128}
      priority
      {...props}
      />
  );
}
