'use client';

import React, { useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle
} from '@/components/ui/dialog';
import { PartyPopper, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface VaultCreationSuccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VaultCreationSuccessDialog({ open, onOpenChange }: VaultCreationSuccessDialogProps) {
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        onOpenChange(false);
      }, 10000); // Fecha o modal após 10 segundos

      return () => clearTimeout(timer);
    }
  }, [open, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-xl border-none shadow-2xl p-0 overflow-hidden rounded-3xl">
        <DialogTitle className="sr-only">Cofre criado com sucesso</DialogTitle>
        
        <div className="relative p-8 flex flex-col items-center justify-center text-center overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary/20 blur-[80px] rounded-full -z-10" />
            
            <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", damping: 12, stiffness: 200 }}
                className="relative mb-6"
            >
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                <div className="relative bg-primary text-white p-4 rounded-2xl shadow-lg shadow-primary/20">
                    <CheckCircle2 className="h-12 w-12" />
                </div>
                <motion.div
                    animate={{ 
                        scale: [1, 1.2, 1],
                        rotate: [0, 10, -10, 0]
                    }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute -top-2 -right-2 bg-accent text-white p-1.5 rounded-full shadow-md"
                >
                    <PartyPopper className="h-5 w-5" />
                </motion.div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
                className="space-y-6"
            >
                <div className="space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight text-foreground bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text">
                        Cofre Criado! ✨
                    </h2>
                    <p className="text-muted-foreground leading-relaxed max-w-[280px] mx-auto text-[15px]">
                        Parabéns! Você deu o <span className="font-semibold text-primary">primeiro passo</span> para realizar seus sonhos.
                    </p>
                </div>

                <div className="relative group mx-auto">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 via-accent/30 to-primary/30 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
                    <div className="relative flex items-center justify-center bg-background/40 backdrop-blur-md border border-white/20 px-6 py-3.5 rounded-2xl shadow-sm overflow-hidden">
                        <motion.div 
                            animate={{ x: [-100, 200] }}
                            transition={{ repeat: Infinity, duration: 3, ease: "linear", repeatDelay: 1 }}
                            className="absolute inset-0 w-20 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-100%]"
                        />
                        <p className="text-[14px] font-bold text-primary tracking-wide uppercase">
                            Agora é só criar as suas caixinhas!
                        </p>
                    </div>
                </div>
            </motion.div>

            <div className="w-full mt-8 space-y-4">
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <motion.div 
                        initial={{ width: "100%" }}
                        animate={{ width: "0%" }}
                        transition={{ duration: 10, ease: "linear" }}
                        className="h-full bg-primary"
                    />
                </div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                    Fechando em instantes...
                </p>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
