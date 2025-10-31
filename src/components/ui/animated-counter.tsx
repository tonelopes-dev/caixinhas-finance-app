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
  const motionValue = useMotionValue(0);
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
          : new Intl.NumberFormat("en-US").format(latest);
        ref.current.textContent = formattedValue;
      }
    });
    return unsubscribe;
  }, [springValue, formatter]);
  
  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const controls = springValue.on("change", (latest) => {
      node.textContent = formatter ? formatter(Math.round(latest)) : Math.round(latest).toString();
    });

    return () => controls();
  }, [springValue, formatter]);


  return <span ref={ref} className={className} />;
}
