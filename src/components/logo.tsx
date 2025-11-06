import type { SVGProps } from 'react';
import { cn } from '@/lib/utils';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
      className={cn('text-primary', props.className)}
    >
      <title>DreamVault Logo</title>
      
      {/* Corpo da Caixa (formato de coração modificado) */}
      <path 
        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
        className="fill-accent stroke-accent"
      />
      
      <path 
        d="M12 5.67v15.56L4.22 13.45l-1.06-1.06a5.5 5.5 0 0 1 7.78-7.78L12 5.67z"
        className="fill-primary stroke-primary"
      />

       {/* Detalhe da fechadura */}
      <circle cx="12" cy="12" r="1.5" className="fill-background stroke-background" />
      
    </svg>
  );
}
