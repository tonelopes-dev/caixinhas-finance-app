import type { SVGProps } from 'react';
import { cn } from '@/lib/utils';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      className={cn('h-12 w-12', props.className)}
      {...props}
    >
      {/* Caixa do Presente */}
      <path
        fill="hsl(var(--primary) / 0.2)"
        stroke="hsl(var(--primary))"
        d="M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-7"
      />
      <rect
        fill="hsl(var(--primary) / 0.2)"
        stroke="hsl(var(--primary))"
        height="4"
        rx="1"
        width="18"
        x="3"
        y="8"
      />
      
      {/* Laço do Presente */}
      <path
        fill="hsl(var(--accent) / 0.3)"
        stroke="hsl(var(--accent))"
        d="M12 8v13"
      />
      <path
        fill="hsl(var(--accent) / 0.3)"
        stroke="hsl(var(--accent))"
        d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 5a4.8 8 0 0 1 4.5-2 2.5 2.5 0 0 1 0 5"
       />
    </svg>
  );
}
