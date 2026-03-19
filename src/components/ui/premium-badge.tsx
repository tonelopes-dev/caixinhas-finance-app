'use client';

import React from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

interface PremiumBadgeProps {
  className?: string;
}

export const PremiumBadge = ({ className = "" }: PremiumBadgeProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className={`relative group overflow-hidden ${className}`}
    >
      {/* Premium Glassmorphic Card */}
      <div className="relative z-10 p-8 rounded-[40px] bg-white/40 backdrop-blur-2xl border border-white/40 shadow-[0_20px_50px_rgba(0,0,0,0.05)] flex flex-col items-center text-center gap-4">
        
        {/* Subtle Shimmer Effect */}
        <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-gradient-to-br from-[#ff6b7b] to-[#d4af37] shadow-lg shadow-[#ff6b7b]/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-2xl font-headline font-bold text-[#2D241E] italic tracking-tight">
            Você é <span className="text-[#ff6b7b]">VIP Premium</span>
          </h3>
        </div>

        <div className="space-y-1">
          <p className="text-[#2D241E]/70 text-base font-medium italic">
            Acesso total ilimitado, sonhos sem fronteiras
          </p>
          <p className="text-[#2D241E]/40 text-sm font-bold uppercase tracking-[0.2em]">
            Continue realizando seus objetivos! 🚀
          </p>
        </div>

        {/* Decorative Gold Elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#d4af37]/5 blur-3xl rounded-full" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#ff6b7b]/5 blur-3xl rounded-full" />
      </div>

      {/* Outer Glow */}
      <div className="absolute -inset-1 bg-gradient-to-r from-[#ff6b7b]/20 to-[#d4af37]/20 rounded-[42px] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </motion.div>
  );
};
