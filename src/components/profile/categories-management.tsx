'use client';

import React from 'react';
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
import { Badge } from '../ui/badge';

const expenseCategories = ['Alimentação', 'Transporte', 'Casa', 'Lazer', 'Saúde', 'Utilidades', 'Outros'];

function EditCategoryDialog({ category }: { category: string }) {
  const [open, setOpen] = React.useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6">
                <Edit className="h-3 w-3" />
            </Button>
        </DialogTrigger>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Editar Categoria</DialogTitle>
                <DialogDescription>
                    Altere o nome da sua categoria de despesa.
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="category-name">Nome da Categoria</Label>
                    <Input
                        id="category-name"
                        defaultValue={category}
                    />
                </div>
            </div>
            <DialogFooter>
                <Button onClick={() => setOpen(false)}>
                    Salvar Alterações
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
  )
}

function DeleteCategoryDialog({ category }: { category: string }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-6 w-6">
          <Trash2 className="h-3 w-3" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta ação não pode ser desfeita. Isso excluirá permanentemente a categoria{' '}
            <span className="font-bold text-foreground">{category}</span>.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction>Excluir</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function CategoriesManagement() {
    const [open, setOpen] = React.useState(false);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Categorias de Despesa</CardTitle>
          <CardDescription>
            Personalize as categorias para organizar suas transações.
          </CardDescription>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <PlusCircle className="mr-2 h-4 w-4" />
              Adicionar
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Nova Categoria</DialogTitle>
              <DialogDescription>
                Crie uma nova categoria para classificar suas despesas.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="category-name">Nome da Categoria</Label>
                <Input
                  id="category-name"
                  placeholder="Ex: Educação"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setOpen(false)}>
                Salvar Categoria
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {expenseCategories.map((category) => (
            <Badge key={category} variant="outline" className="group relative items-center gap-2 py-1.5 pl-3 pr-1 text-sm">
                <span>{category}</span>
                <div className="ml-1 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <EditCategoryDialog category={category} />
                    <DeleteCategoryDialog category={category} />
                </div>
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
