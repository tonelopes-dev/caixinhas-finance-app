import type { SVGProps } from 'react';
import { PiggyBank } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <PiggyBank {...props} className={cn('text-primary', props.className)} />
  );
}
