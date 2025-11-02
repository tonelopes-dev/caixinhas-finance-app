
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
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { removeParticipantFromGoal } from '@/app/actions';
import { X } from 'lucide-react';

interface RemoveParticipantDialogProps {
  participantId: string;
  participantName: string;
  goalId: string;
  goalName: string;
  disabled?: boolean;
}

export function RemoveParticipantDialog({
  participantId,
  participantName,
  goalId,
  goalName,
  disabled = false,
}: RemoveParticipantDialogProps) {
  
  const removeParticipantAction = removeParticipantFromGoal.bind(null);

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-destructive"
          disabled={disabled}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Remover</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <form action={removeParticipantAction}>
           <input type="hidden" name="goalId" value={goalId} />
           <input type="hidden" name="participantId" value={participantId} />
            <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
                <p>
                Esta ação não pode ser desfeita. Você irá remover{' '}
                <span className="font-bold text-foreground">{participantName}</span>{' '}
                da caixinha{' '}
                <span className="font-bold text-foreground">{goalName}</span>.
                </p>
                <p className="mt-2 text-destructive">
                <strong>Atenção:</strong> Todas as transferências que este participante fez para a caixinha serão removidas e o saldo total será recalculado.
                </p>
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-4">
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction type="submit" variant="destructive">
                Remover
            </AlertDialogAction>
            </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
