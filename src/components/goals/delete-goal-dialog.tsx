
'use client';

import { deleteGoal } from '@/app/actions';
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

export function DeleteGoalDialog({ goalId, goalName, disabled }: { goalId: string, goalName: string, disabled?: boolean }) {
  const deleteGoalWithId = deleteGoal.bind(null);

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" className="w-full" disabled={disabled}>
            <Trash2 className="mr-2 h-4 w-4" />
            Excluir Caixinha
       </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <form action={deleteGoalWithId}>
          <input type="hidden" name="id" value={goalId} />
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza absoluta?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente a caixinha{' '}
              <span className="font-bold text-foreground">{goalName}</span> e todos os seus dados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className='mt-4'>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction type="submit" >Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
