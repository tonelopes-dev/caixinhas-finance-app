
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
import { buttonVariants } from '@/components/ui/button';
import { DropdownMenuItem } from '../ui/dropdown-menu';
import { Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState, useActionState } from 'react';
import { deleteTransaction } from '@/app/transactions/actions';
import { cn } from '@/lib/utils';
import { useLoading } from '@/components/providers/loading-provider';


export function DeleteTransactionDialog({ transactionId }: { transactionId: string }) {
  const { toast } = useToast();
  const { showLoading, hideLoading } = useLoading();
  const [open, setOpen] = useState(false);
  const [state, dispatch] = useActionState(deleteTransaction, { message: null, success: false });

  useEffect(() => {
    if (state?.message) {
      hideLoading();
      toast({
        title: state.success ? "Sucesso" : "Erro",
        description: state.message,
        variant: state.success ? "default" : "destructive",
      });
      if (state.success) {
        setOpen(false);
      }
    }
  }, [state, toast, hideLoading]);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className='text-destructive focus:text-destructive'>
            <Trash2 className="mr-2 h-4 w-4" />
            Excluir
        </DropdownMenuItem>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <form 
          action={dispatch}
          onSubmit={(e) => {
            showLoading('Excluindo transação...', false);
          }}
        >
          <input type="hidden" name="id" value={transactionId} />
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza absoluta?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente esta transação.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className='mt-4'>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction type="submit" className={cn(buttonVariants({ variant: "destructive" }))}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
