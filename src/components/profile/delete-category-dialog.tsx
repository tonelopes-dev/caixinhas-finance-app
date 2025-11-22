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
import { Button, buttonVariants } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState, useActionState, useTransition } from 'react';
import { useFormStatus } from 'react-dom';
import { deleteCategory, type CategoryActionState } from '@/app/accounts/actions';
import type { Category } from '@/services/category.service';
import { cn } from '@/lib/utils';

interface DeleteCategoryDialogProps {
  category: Category;
  onSubmitting: (isSubmitting: boolean) => void;
}

function FormContent({ category, onSubmitting, setOpen }: { category: Category; onSubmitting: (isSubmitting: boolean) => void, setOpen: (open: boolean) => void }) {
  const { toast } = useToast();
  const initialState: CategoryActionState = {};
  const [state, formAction] = useActionState(deleteCategory, initialState);
  const { pending } = useFormStatus();

  useEffect(() => {
    onSubmitting(pending);
  }, [pending, onSubmitting]);
  
  useEffect(() => {
    if (state?.success) {
      toast({ title: 'Sucesso!', description: state.message });
      setOpen(false);
    } else if (state?.message) {
      toast({ title: 'Erro', description: state.message, variant: 'destructive' });
    }
  }, [state, toast, setOpen]);

  return (
     <form action={formAction}>
        <input type="hidden" name="id" value={category.id} />
        <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
            Esta ação não pode ser desfeita. Isso excluirá permanentemente a categoria{' '}
            <span className="font-bold text-foreground">{category.name}</span>.
            </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-4">
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction type="submit" variant="destructive" disabled={pending}>
            {pending ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
        </AlertDialogFooter>
    </form>
  )
}

export function DeleteCategoryDialog({ category, onSubmitting }: DeleteCategoryDialogProps) {
    const [open, setOpen] = useState(false);
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive">
          <Trash2 className="h-3 w-3" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <FormContent category={category} onSubmitting={onSubmitting} setOpen={setOpen} />
      </AlertDialogContent>
    </AlertDialog>
  );
}