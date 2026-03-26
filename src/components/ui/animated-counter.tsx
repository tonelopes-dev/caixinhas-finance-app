"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type AnimatedCounterProps = {
  value: number;
  className?: string;
  formatter?: (value: number) => string;
};

export function AnimatedCounter({ value, className, formatter }: AnimatedCounterProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const formattedValue = formatter 
    ? formatter(value)
    : new Intl.NumberFormat("pt-BR").format(value);

  if (!mounted) {
    return <span className={cn("tabular-nums invisible", className)}>{formattedValue}</span>;
  }

  return (
    <span className={cn("tabular-nums", className)}>
      {formattedValue}
    </span>
  );
}
