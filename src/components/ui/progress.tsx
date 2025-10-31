"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"
import { motion, useSpring, useInView, useTransform } from "framer-motion"

import { cn } from "@/lib/utils"

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => {
  const progressRef = React.useRef(null);
  const isInView = useInView(progressRef, { once: true, amount: 0.5 });
  
  const springValue = useSpring(0, {
      damping: 30,
      stiffness: 100,
  });

  const scaleX = useTransform(springValue, [0, 100], [0, 1]);

  React.useEffect(() => {
    if (isInView) {
        springValue.set(value || 0);
    }
  }, [value, isInView, springValue]);

  return (
    <ProgressPrimitive.Root
      ref={progressRef}
      className={cn(
        "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
        className
      )}
      {...props}
    >
      <motion.div
        className="h-full w-full flex-1 bg-primary"
        style={{ 
          scaleX,
          transformOrigin: 'left' 
        }}
      />
    </ProgressPrimitive.Root>
  );
});
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress }
