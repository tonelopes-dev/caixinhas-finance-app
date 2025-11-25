'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
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
import { Trash2 } from 'lucide-react';
import { deleteGoalAction } from '@/app/(private)/goals/actions';
import { useToast } from '@/hooks/use-toast';

export function DeleteGoalDialog({ goalId, goalName, disabled }: { goalId: string; goalName: string; disabled?: boolean }) {
  const [isPending, startTransition] = React.useTransition();
  const router = useRouter();
  const { toast } = useToast();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteGoalAction(goalId);
      if (result.success) {
        toast({
          title: 'Sucesso!',
          description: 'A caixinha foi excluída.',
        });
        router.push('/goals');
      } else {
        toast({
          title: 'Erro',
          description: result.message || 'Não foi possível excluir a caixinha.',
          variant: 'destructive',
        });
      }
    });
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" className="w-full" disabled={disabled}>
          <Trash2 className="mr-2 h-4 w-4" />
          Excluir Caixinha
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Você tem certeza absoluta?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta ação não pode ser desfeita. Isso excluirá permanentemente a caixinha{' '}
            <span className="font-bold text-foreground">{goalName}</span> e todos os seus dados.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-4">
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isPending} variant="destructive">
            {isPending ? 'Excluindo...' : 'Excluir'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
