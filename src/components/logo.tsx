import type { SVGProps } from 'react';
import { Gift } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <Gift {...props} className={cn('text-primary', props.className)} />
  );
}
