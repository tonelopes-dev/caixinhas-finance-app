
'use client';

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
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
      <AlertDialogContent className="bg-[#fdfcf7] border-none rounded-[32px] p-8 shadow-2xl max-w-md">
        <AlertDialogHeader className="space-y-4">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[24px] bg-white shadow-sm border border-[#2D241E]/5 mb-2 group transition-all hover:scale-110">
            <Landmark className="h-10 w-10 text-[#ff6b7b] transition-transform group-hover:rotate-12" />
          </div>
          <div className="space-y-2">
            <AlertDialogTitle className="text-center font-headline text-3xl font-bold tracking-tight text-[#2D241E]">
              Ops! Precisamos de uma conta.
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-lg font-medium text-[#2D241E]/60 leading-relaxed">
              Para registrar sua primeira movimentação, você precisa ter pelo menos uma conta ou cartão cadastrado.
            </AlertDialogDescription>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex flex-col sm:flex-row gap-3 pt-6 sm:justify-center">
          <Button 
            variant="ghost" 
            onClick={() => onOpenChange(false)}
            className="h-14 px-8 rounded-2xl font-bold text-[#201C1C]/40 hover:text-[#2D241E] hover:bg-transparent transition-all"
          >
            Agora não
          </Button>
          <Button 
            onClick={handleNavigate}
            className="h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-white shadow-lg bg-gradient-to-br from-[#ff6b7b] to-[#fa8292] border-none hover:shadow-[#ff6b7b]/40 active:scale-95 transition-all"
          >
            Adicionar Conta
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
