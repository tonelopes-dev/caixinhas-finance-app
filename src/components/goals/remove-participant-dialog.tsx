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
import { X } from 'lucide-react';

interface RemoveParticipantDialogProps {
  participantName: string;
  goalName: string;
  disabled?: boolean;
}

export function RemoveParticipantDialog({
  participantName,
  goalName,
  disabled = false,
}: RemoveParticipantDialogProps) {
  const handleRemove = () => {
    // Em uma aplicação real, aqui você despacharia uma server action para remover o participante.
    console.log(`Removendo ${participantName} da caixinha "${goalName}".`);
  };

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
        <AlertDialogHeader>
          <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta ação não pode ser desfeita. Você irá remover{' '}
            <span className="font-bold text-foreground">{participantName}</span>{' '}
            da caixinha{' '}
            <span className="font-bold text-foreground">{goalName}</span>.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleRemove} variant="destructive">
            Remover
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
