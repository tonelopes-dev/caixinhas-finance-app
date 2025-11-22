"use client";

import { useEffect, useRef } from "react";
import { useInView, useMotionValue, useSpring } from "framer-motion";

type AnimatedCounterProps = {
  value: number;
  className?: string;
  formatter?: (value: number) => string;
};

export function AnimatedCounter({ value, className, formatter }: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  // Inicia o valor com 0 ou o valor inicial, se for para começar sem animação
  const motionValue = useMotionValue(value > 0 ? 0 : value);
  const springValue = useSpring(motionValue, {
    damping: 60,
    stiffness: 200,
  });
  const isInView = useInView(ref, { once: true, margin: "-10px" });

  useEffect(() => {
    if (isInView) {
      motionValue.set(value);
    }
  }, [motionValue, isInView, value]);

  useEffect(() => {
    const unsubscribe = springValue.on("change", (latest) => {
      if (ref.current) {
        const formattedValue = formatter 
          ? formatter(latest)
          : new Intl.NumberFormat("pt-BR").format(latest);
        ref.current.textContent = formattedValue;
      }
    });
    return unsubscribe;
  }, [springValue, formatter]);
  
  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // Define o valor inicial formatado para evitar o "vazio" antes da animação
    const initialFormattedValue = formatter ? formatter(motionValue.get()) : new Intl.NumberFormat("pt-BR").format(motionValue.get());
    node.textContent = initialFormattedValue;

    const controls = springValue.on("change", (latest) => {
      node.textContent = formatter ? formatter(latest) : latest.toLocaleString('pt-BR');
    });

    return () => controls();
  }, [springValue, formatter, motionValue]);

  return <span ref={ref} className={className} />;
}
