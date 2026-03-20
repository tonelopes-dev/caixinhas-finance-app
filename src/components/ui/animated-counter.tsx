"use client";

import { cn } from "@/lib/utils";

type AnimatedCounterProps = {
  value: number;
  className?: string;
  formatter?: (value: number) => string;
};

export function AnimatedCounter({ value, className, formatter }: AnimatedCounterProps) {
  const formattedValue = formatter 
    ? formatter(value)
    : new Intl.NumberFormat("pt-BR").format(value);

  return (
    <span className={cn("tabular-nums", className)}>
      {formattedValue}
    </span>
  );
}
