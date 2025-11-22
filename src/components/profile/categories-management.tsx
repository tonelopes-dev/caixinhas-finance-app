'use client';

import React, { useEffect, useState } from 'react';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash2, Edit } from 'lucide-react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { useToast } from '@/hooks/use-toast';
import { createCategory, updateCategory, deleteCategory, type CategoryActionState } from '@/app/accounts/actions';
import type { Category } from '@/services/category.service';
import { Skeleton } from '../ui/skeleton';
import { cn } from '@/lib/utils';

function SubmitButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();
  return <Button type="submit" disabled={pending}>{pending ? pendingLabel : label}</Button>;
}

function EditCategoryDialog({ category }: { category: Category }) {
  const [open, setOpen] = React.useState(false);
  const { toast } = useToast();
  const initialState: CategoryActionState = {};
  const [state, formAction] = useActionState(updateCategory, initialState);

  useEffect(() => {
    if (state?.success) {
      toast({ title: 'Sucesso!', description: state.message });
      setOpen(false);
    } else if (state?.message) {
      toast({ title: 'Erro', description: state.message, variant: 'destructive' });
    }
  }, [state, toast]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-primary">
          <Edit className="h-3 w-3" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form action={formAction}>
          <input type="hidden" name="id" value={category.id} />
          <DialogHeader>
            <DialogTitle>Editar Categoria</DialogTitle>
            <DialogDescription>Altere o nome da sua categoria de despesa.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="category-name">Nome da Categoria</Label>
              <Input id="category-name" name="name" defaultValue={category.name} required />
              {state?.errors?.name && <p className="text-sm text-destructive">{state.errors.name[0]}</p>}
            </div>
          </div>
          <DialogFooter>
            <SubmitButton label="Salvar Alterações" pendingLabel="Salvando..." />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteCategoryDialog({ category, onDeleting }: { category: Category; onDeleting: (id: string | null) => void }) {
  const { toast } = useToast();
  const initialState: CategoryActionState = {};
  const [state, formAction] = useActionState(deleteCategory, initialState);
  const { pending } = useFormStatus();

  useEffect(() => {
    if (pending) {
      onDeleting(category.id);
    } else {
      onDeleting(null);
    }
  }, [pending, onDeleting, category.id]);

  useEffect(() => {
    if (state?.success) {
      toast({ title: 'Sucesso!', description: state.message });
    } else if (state?.message) {
      toast({ title: 'Erro', description: state.message, variant: 'destructive' });
    }
  }, [state, toast]);

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive">
          <Trash2 className="h-3 w-3" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
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
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function CategoriesManagement({ initialCategories }: { initialCategories: Category[] }) {
  const [open, setOpen] = React.useState(false);
  const { toast } = useToast();
  const initialState: CategoryActionState = {};
  const [state, formAction] = useActionState(createCategory, initialState);
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null);

  useEffect(() => {
    if (state?.success) {
      toast({ title: 'Sucesso!', description: state.message });
      setOpen(false);
    } else if (state?.message) {
      toast({ title: 'Erro', description: state.message, variant: 'destructive' });
    }
  }, [state, toast]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Categorias de Despesa</CardTitle>
          <CardDescription>Personalize as categorias para organizar suas transações.</CardDescription>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <PlusCircle className="mr-2 h-4 w-4" />
              Adicionar
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form action={formAction}>
              <DialogHeader>
                <DialogTitle>Adicionar Nova Categoria</DialogTitle>
                <DialogDescription>Crie uma nova categoria para classificar suas despesas.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="new-category-name">Nome da Categoria</Label>
                  <Input id="new-category-name" name="name" placeholder="Ex: Educação" required />
                  {state?.errors?.name && <p className="text-sm text-destructive">{state.errors.name[0]}</p>}
                </div>
              </div>
              <DialogFooter>
                <SubmitButton label="Salvar Categoria" pendingLabel="Salvando..." />
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {initialCategories.map((category) => {
            const isDeleting = deletingCategoryId === category.id;
            const isAnyDeleting = deletingCategoryId !== null;

            if (isDeleting) {
              return null; // Don't render the item being deleted
            }

            if (isAnyDeleting) {
              return (
                <Skeleton key={category.id} className="h-8 w-32 rounded-full" />
              );
            }
            
            return (
              <div
                key={category.id}
                className={cn(
                  "group inline-flex items-center gap-1 rounded-full border border-border bg-transparent px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-accent/50",
                  deletingCategoryId && "opacity-50 pointer-events-none"
                )}
              >
                <span>{category.name}</span>
                <div className="flex items-center">
                  <EditCategoryDialog category={category} />
                  <DeleteCategoryDialog category={category} onDeleting={setDeletingCategoryId} />
                </div>
              </div>
            );
          })}
          {initialCategories.length === 0 && !deletingCategoryId && (
            <p className="text-sm text-muted-foreground">Nenhuma categoria personalizada criada.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
