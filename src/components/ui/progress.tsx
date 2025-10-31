"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"
import { motion, useInView } from "framer-motion"

import { cn } from "@/lib/utils"

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => {
  const progressRef = React.useRef(null);
  const isInView = useInView(progressRef, { once: true });

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
          transformOrigin: 'left'
        }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: isInView ? (value || 0) / 100 : 0 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      />
    </ProgressPrimitive.Root>
  );
});
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress }
