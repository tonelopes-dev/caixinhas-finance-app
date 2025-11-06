import type { SVGProps } from 'react';
import { cn } from '@/lib/utils';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
      className={cn('text-primary', props.className)}
    >
      <title>DreamVault Logo</title>
      {/* Metade Esquerda do Coração/Cofre - Cor Primária */}
      <path
        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09"
        className="fill-primary stroke-primary"
      />
      {/* Metade Direita do Coração/Cofre - Cor de Destaque */}
      <path
        d="M12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3c-1.74 0-3.41.81-4.5 2.09"
        className="fill-accent stroke-accent"
      />
       {/* Fechadura do cofre */}
      <circle cx="12" cy="12" r="1.5" className="fill-background stroke-background" />
    </svg>
  );
}
