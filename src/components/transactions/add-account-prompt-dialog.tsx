
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
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
            <Landmark className="h-6 w-6 text-primary" />
          </div>
          <AlertDialogTitle className="text-center">Primeiro, adicione uma conta!</AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            Para registrar uma transação, você precisa ter pelo menos uma conta ou cartão cadastrado no seu espaço de trabalho.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-center pt-4">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Depois
          </Button>
          <Button onClick={handleNavigate}>
            Adicionar Conta
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
