'use client';

import {
    Dialog,
    DialogContent,
    DialogTitle
} from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import { CheckCircle2, PartyPopper } from 'lucide-react';
import { useEffect } from 'react';

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
      <DialogContent className="sm:max-w-md bg-[#fdfcf7] border-none shadow-2xl p-0 overflow-hidden rounded-[40px]">
        <DialogTitle className="sr-only">Cofre criado com sucesso</DialogTitle>
        
        <div className="relative p-10 flex flex-col items-center justify-center text-center overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-[#ff6b7b]/10 blur-[80px] rounded-full -z-10" />
            
            <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", damping: 12, stiffness: 200 }}
                className="relative mb-8"
            >
                <div className="absolute inset-0 bg-[#ff6b7b]/20 blur-2xl rounded-full" />
                <div className="relative bg-white text-[#ff6b7b] p-6 rounded-[24px] shadow-xl border border-[#2D241E]/5">
                    <CheckCircle2 className="h-14 w-14" />
                </div>
                <motion.div
                    animate={{ 
                        scale: [1, 1.2, 1],
                        rotate: [0, 10, -10, 0]
                    }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute -top-3 -right-3 bg-[#ff6b7b] text-white p-2 rounded-full shadow-lg border-4 border-white"
                >
                    <PartyPopper className="h-6 w-6" />
                </motion.div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
                className="space-y-8"
            >
                <div className="space-y-3">
                    <h2 className="text-4xl md:text-5xl font-headline font-bold tracking-tight text-[#2D241E] italic">
                        Cofre Criado! ✨
                    </h2>
                    <p className="text-lg font-medium text-[#2D241E]/60 leading-relaxed max-w-[300px] mx-auto">
                        Parabéns! Você deu o <span className="font-bold text-[#ff6b7b]">primeiro passo</span> para realizar seus sonhos.
                    </p>
                </div>

                <div className="relative group mx-auto max-w-fit">
                    <div className="absolute -inset-1 bg-gradient-to-r from-[#ff6b7b]/30 via-[#fa8292]/30 to-[#ff6b7b]/30 rounded-2xl blur-lg opacity-30 group-hover:opacity-60 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
                    <div className="relative flex items-center justify-center bg-white/40 backdrop-blur-md border border-[#2D241E]/10 px-8 py-4 rounded-[20px] shadow-sm overflow-hidden">
                        <motion.div 
                            animate={{ x: [-150, 300] }}
                            transition={{ repeat: Infinity, duration: 3, ease: "linear", repeatDelay: 1 }}
                            className="absolute inset-0 w-32 bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12 translate-x-[-100%]"
                        />
                        <p className="text-sm font-black text-[#2D241E] tracking-widest uppercase">
                            Hora de começar a poupar!
                        </p>
                    </div>
                </div>
            </motion.div>

            <div className="w-full mt-10 space-y-4">
                <div className="h-2 w-full bg-[#2D241E]/5 rounded-full overflow-hidden p-0.5 border border-[#2D241E]/5">
                    <motion.div 
                        initial={{ width: "100%" }}
                        animate={{ width: "0%" }}
                        transition={{ duration: 10, ease: "linear" }}
                        className="h-full bg-gradient-to-r from-[#ff6b7b] to-[#fa8292] rounded-full"
                    />
                </div>
                <p className="text-[10px] text-[#201C1C]/30 uppercase tracking-[0.2em] font-black">
                    Fechando em instantes
                </p>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
