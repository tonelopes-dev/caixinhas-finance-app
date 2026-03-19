'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface PremiumLogoProps {
  className?: string;
  onClick?: () => void;
}

export function PremiumLogo({ className, onClick }: PremiumLogoProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-4 py-2 bg-white/40 backdrop-blur-xl border border-white/60 rounded-2xl shadow-sm group cursor-pointer transition-all duration-300 hover:bg-white/60",
        className
      )}
    >
      <div className="h-9 w-9 relative shrink-0 transform group-hover:rotate-6 transition-transform duration-500">
        <Image
          src="/logo-caixinhas.png"
          alt="Caixinhas Logo"
          fill
          className="object-contain"
          priority
        />
      </div>
      <span className="text-xl font-headline font-black italic text-[#2D241E] tracking-tight hidden sm:block leading-none">
        Caixinhas
      </span>
    </motion.div>
  );
}
