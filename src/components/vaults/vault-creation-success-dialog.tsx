
'use client';

import React, { useEffect } from 'react';
import Confetti from 'react-confetti';
import {
  Dialog,
  DialogContent,
  DialogTitle
} from '@/components/ui/dialog';
import { PartyPopper } from 'lucide-react';
import { useWindowSize } from '@/hooks/use-window-size';
import { Logo } from '../logo';

interface VaultCreationSuccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VaultCreationSuccessDialog({ open, onOpenChange }: VaultCreationSuccessDialogProps) {
  const { width, height } = useWindowSize();

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        onOpenChange(false);
      }, 12000); // Fecha o modal após 12 segundos

      return () => clearTimeout(timer);
    }
  }, [open, onOpenChange]);

  if (!open) {
    return null;
  }

  return (
    <>
      <div className="fixed inset-0 z-[100] pointer-events-none">
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={400}
          gravity={0.1}
        />
      </div>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md text-center p-8 flex flex-col items-center justify-center">
            <DialogTitle className="sr-only">Cofre criado com sucesso</DialogTitle>
            <PartyPopper className="h-16 w-16 text-primary animate-in zoom-in-50" />
            <h2 className="text-2xl font-headline font-bold mt-4">Cofre criado com sucesso!</h2>
            <p className="text-muted-foreground mt-2">
                Parabéns! Você está a um passo de organizar suas finanças, realizar seus sonhos e abençoar as pessoas que você ama. O próximo passo é criar suas caixinhas!
            </p>
            <div className="h-1 w-full bg-primary/20 rounded-full mt-6 overflow-hidden">
                <div className="h-full bg-primary animate-progress-bar"></div>
            </div>
             <style jsx>{`
                @keyframes progress-bar-animation {
                    from { width: 100%; }
                    to { width: 0%; }
                }
                .animate-progress-bar {
                    animation: progress-bar-animation 12s linear forwards;
                }
            `}</style>
        </DialogContent>
      </Dialog>
    </>
  );
}
