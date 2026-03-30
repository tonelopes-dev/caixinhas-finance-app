
'use client';

import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Landmark } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AddAccountPromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddAccountPromptDialog({ open, onOpenChange }: AddAccountPromptDialogProps) {
  const router = useRouter();

  const handleNavigate = () => {
    router.push('/accounts');
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-white/95 backdrop-blur-2xl border-none rounded-[40px] shadow-2xl p-0 overflow-hidden max-w-md">
        <div className="p-6 sm:p-10 space-y-6 sm:space-y-8">
          <AlertDialogHeader className="space-y-4 sm:space-y-6">
            <div className="mx-auto flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-3xl bg-white shadow-xl shadow-[#ff6b7b]/10 border border-[#ff6b7b]/5 group transition-all duration-500 hover:scale-110 active:scale-95">
              <Landmark className="h-8 w-8 sm:h-10 sm:w-10 text-[#ff6b7b] transition-transform duration-500 group-hover:rotate-12" />
            </div>
            <div className="space-y-2 sm:space-y-3 text-center">
              <AlertDialogTitle className="text-2xl sm:text-3xl font-black tracking-tighter text-[#2D241E] leading-tight px-4">
                Ops! Precisamos de uma <span className="text-[#ff6b7b]">Conta</span>.
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm sm:text-base font-bold text-[#2D241E]/40 leading-relaxed italic">
                Para registrar sua primeira movimentação, você precisa ter pelo menos uma conta ou cartão cadastrado.
              </AlertDialogDescription>
            </div>
          </AlertDialogHeader>
          
          <div className="flex flex-col gap-3">
            <Button 
              onClick={handleNavigate}
              className="h-14 sm:h-16 px-6 sm:px-8 rounded-2xl font-black uppercase tracking-[0.2em] text-white shadow-[0_10px_30px_rgba(255,107,123,0.3)] bg-gradient-to-r from-[#ff6b7b] to-[#ff8e9a] border-none hover:shadow-xl active:scale-95 transition-all text-[10px] sm:text-xs"
            >
              Criar Minha Primeira Conta
            </Button>
            
            <Button 
              variant="ghost" 
              onClick={() => onOpenChange(false)}
              className="h-14 sm:h-16 px-6 sm:px-8 rounded-2xl font-black uppercase tracking-[0.2em] text-[#2D241E]/30 hover:text-[#2D241E] hover:bg-[#2D241E]/5 transition-all text-[10px] sm:text-xs"
            >
              Agora não
            </Button>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
