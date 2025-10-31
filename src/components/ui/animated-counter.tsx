"use client";

import { useEffect, useRef } from "react";
import { useInView, useMotionValue, useSpring, motion } from "framer-motion";

type AnimatedCounterProps = {
  value: number;
  className?: string;
  formatter?: (value: number) => string;
};

export function AnimatedCounter({ value, className, formatter }: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);
  const isInView = useInView(ref, { once: true, margin: "-10px" });

  useEffect(() => {
    if (isInView) {
      motionValue.set(value);
    }
  }, [motionValue, isInView, value]);

  useEffect(() => {
    const spring = useSpring(motionValue, {
      damping: 60,
      stiffness: 200,
    });
    const unsubscribe = spring.on("change", (latest) => {
      if (ref.current) {
        const formattedValue = formatter 
          ? formatter(latest)
          : new Intl.NumberFormat("en-US").format(latest);
        ref.current.textContent = formattedValue;
      }
    });
    return unsubscribe;
  }, [motionValue, formatter]);
  
  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const controls = motionValue.on("change", (latest) => {
      node.textContent = formatter ? formatter(Math.round(latest)) : Math.round(latest).toString();
    });

    return () => controls();
  }, [motionValue, formatter]);


  return <span ref={ref} className={className} />;
}
