
'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { Goal } from '@/lib/definitions';

interface VisibilityChangeDialogProps {
  open: boolean;
  newVisibility: Goal['visibility'] | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export function VisibilityChangeDialog({
  open,
  newVisibility,
  onConfirm,
  onCancel,
}: VisibilityChangeDialogProps) {

  const messages = {
    shared: {
      title: 'Tornar a Caixinha Compartilhada?',
      description:
        'Todos os membros deste cofre poderão ver e contribuir para esta caixinha. O progresso dela contará para as metas compartilhadas do cofre. Você confirma esta ação?',
    },
    private: {
      title: 'Tornar a Caixinha Privada?',
      description:
        'Apenas você e os participantes que você convidar diretamente poderão ver esta caixinha. Ela não será visível para outros membros do cofre. Você confirma esta ação?',
    },
  };

  const content = newVisibility ? messages[newVisibility] : null;

  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <AlertDialogContent>
        {content && (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle>{content.title}</AlertDialogTitle>
              <AlertDialogDescription>
                {content.description}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={onCancel}>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={onConfirm}>Confirmar</AlertDialogAction>
            </AlertDialogFooter>
          </>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
}
