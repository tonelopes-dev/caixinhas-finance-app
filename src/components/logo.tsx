import type { SVGProps } from 'react';
import { Archive } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <Archive {...props} className={cn('text-primary', props.className)} />
  );
}
