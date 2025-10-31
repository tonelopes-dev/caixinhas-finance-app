"use client";

import { motion } from "framer-motion";
import type { HTMLMotionProps } from "framer-motion";

type AnimatedDivProps = HTMLMotionProps<"div">;

export function AnimatedDiv({ children, ...props }: AnimatedDivProps) {
  const variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={variants}
      transition={{ duration: 0.5 }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
