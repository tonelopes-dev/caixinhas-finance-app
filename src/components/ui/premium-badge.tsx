'use client';

import React from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface PremiumBadgeProps {
  className?: string;
}

export const PremiumBadge = ({ className = "" }: PremiumBadgeProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      className={cn("relative group", className)}
    >
      {/* Glow effect (outside overflow-hidden) */}
      <div className="absolute -inset-2 bg-gradient-to-tr from-[#ff6b7b]/10 via-[#d4af37]/5 to-[#ff6b7b]/10 rounded-[48px] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      
      {/* Main Container with Shadow and Blur */}
      <div className="relative z-10 p-8 md:p-10 rounded-[40px] bg-white/50 backdrop-blur-xl border border-white/60 shadow-[0_20px_50px_rgba(45,36,25,0.06)] flex flex-col items-center text-center gap-6 overflow-hidden">
        
        {/* Shimmer Effect */}
        <div className="absolute inset-0 -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12" />

        <div className="flex items-center gap-4">
          <div className="relative">
             <div className="absolute -inset-1 bg-[#ff6b7b]/20 blur-lg rounded-full animate-pulse" />
             <div className="relative h-12 w-12 rounded-2xl bg-gradient-to-br from-[#ff6b7b] to-[#fa8292] shadow-[0_8px_20px_rgba(255,107,123,0.3)] flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
             </div>
          </div>
          <h3 className="text-2xl font-headline font-bold text-[#2D241E] italic tracking-tight">
            Você é <span className="text-[#ff6b7b]">VIP Premium</span>
          </h3>
        </div>

        <div className="space-y-2">
          <p className="text-[#2D241E]/80 text-lg font-medium italic leading-tight">
            Acesso total ilimitado, sonhos sem fronteiras
          </p>
          <div className="pt-1">
             <span className="text-[10px] font-bold text-[#2D241E]/30 uppercase tracking-[0.3em] bg-[#f6f3f1] px-4 py-1.5 rounded-full inline-block">
                Continue realizando seus objetivos! ✨
             </span>
          </div>
        </div>

        {/* Decorative Gold Elements */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#d4af37]/10 blur-[80px] rounded-full" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#ff6b7b]/10 blur-[80px] rounded-full" />
      </div>
    </motion.div>
  );
};
