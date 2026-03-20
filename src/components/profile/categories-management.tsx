'use client';

import React, { useEffect, useState, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit } from 'lucide-react';
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
import { createCategory, updateCategory, addDefaultCategories, type CategoryActionState } from '@/app/(private)/accounts/actions';
import type { Category } from '@/services/category.service';
import { Skeleton } from '../ui/skeleton';
import { DeleteCategoryDialog } from './delete-category-dialog';

function SubmitButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <Button 
      type="submit" 
      disabled={pending}
      className="w-full h-14 rounded-2xl font-black uppercase tracking-widest bg-gradient-to-br from-[#ff6b7b] to-[#fa8292] text-white shadow-xl shadow-[#ff6b7b]/20 border-none"
    >
      {pending ? pendingLabel : label}
    </Button>
  );
}

function AddDefaultCategoriesButton() {
  const { toast } = useToast();
  const initialState: CategoryActionState = {};
  const [state, formAction] = useActionState(addDefaultCategories, initialState);

  useEffect(() => {
    if (state?.success) {
      toast({ title: 'Sucesso!', description: state.message });
    } else if (state?.message) {
      toast({ title: 'Erro', description: state.message, variant: 'destructive' });
    }
  }, [state, toast]);

  return (
    <form action={formAction}>
      <Button 
        type="submit"
        className="gradient-button h-12 px-6 rounded-full font-black uppercase tracking-widest text-[10px] shadow-lg shadow-[#ff6b7b]/20"
      >
        Gerar Categorias Padrão
      </Button>
    </form>
  );
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
        <Button variant="ghost" size="icon" className="h-6 w-6 text-[#2D241E]/20 hover:text-[#ff6b7b] transition-colors">
          <Edit className="h-3 w-3" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-[#fdfcf7] border-none rounded-[40px] shadow-2xl p-0 overflow-hidden max-w-sm">
        <form action={formAction}>
          <input type="hidden" name="id" value={category.id} />
          <DialogHeader className="p-8 pb-4 bg-white/50 backdrop-blur-sm border-b border-[#2D241E]/5">
            <DialogTitle className="text-xl font-bold font-headline text-[#2D241E] italic">Editar <span className="text-[#ff6b7b]">Categoria</span></DialogTitle>
            <DialogDescription className="text-xs font-medium text-[#2D241E]/40 italic">Altere o nome da sua categoria de despesa.</DialogDescription>
          </DialogHeader>
          <div className="p-8 space-y-6">
            <div className="space-y-3">
              <Label htmlFor="category-name" className="text-[10px] font-black uppercase tracking-widest text-[#2D241E]/40 ml-1">Nome da Categoria</Label>
              <Input 
                id="category-name" 
                name="name" 
                defaultValue={category.name} 
                className="h-14 rounded-2xl border-2 border-[#2D241E]/5 bg-white text-lg font-bold text-[#2D241E] focus:border-[#ff6b7b] focus:ring-0 transition-all shadow-sm"
                required 
              />
              {state?.errors?.name && <p className="text-xs text-red-500 font-bold ml-1">{state.errors.name[0]}</p>}
            </div>
          </div>
          <DialogFooter className="p-8 pt-0">
            <SubmitButton label="Salvar Alterações" pendingLabel="Salvando..." />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function CategoriesManagement({ initialCategories }: { initialCategories: Category[] }) {
  const [open, setOpen] = React.useState(false);
  const { toast } = useToast();
  const initialState: CategoryActionState = {};
  const [state, formAction] = useActionState(createCategory, initialState);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (state?.success) {
      toast({ title: 'Sucesso!', description: state.message });
      setOpen(false);
    } else if (state?.message) {
      toast({ title: 'Erro', description: state.message, variant: 'destructive' });
    }
  }, [state, toast]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between px-2">
        <div className="space-y-1">
          <h2 className="font-headline text-2xl font-bold text-[#2D241E] italic">Categorias de <span className="text-[#ff6b7b]">Despesa</span></h2>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#2D241E]/30 italic">Organização Financeira</p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="icon" className="h-10 w-10 rounded-full bg-[#2D241E]/5 hover:bg-[#ff6b7b]/10 text-[#2D241E]/40 hover:text-[#ff6b7b] transition-all border-none">
              <PlusCircle className="h-5 w-5" />
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#fdfcf7] border-none rounded-[40px] shadow-2xl p-0 overflow-hidden max-w-sm">
            <form action={formAction}>
              <DialogHeader className="p-8 pb-4 bg-white/50 backdrop-blur-sm border-b border-[#2D241E]/5">
                <DialogTitle className="text-xl font-bold font-headline text-[#2D241E] italic">Nova <span className="text-[#ff6b7b]">Categoria</span></DialogTitle>
                <DialogDescription className="text-xs font-medium text-[#2D241E]/40 italic">Crie uma nova categoria para classificar suas despesas.</DialogDescription>
              </DialogHeader>
              <div className="p-8 space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="new-category-name" className="text-[10px] font-black uppercase tracking-widest text-[#2D241E]/40 ml-1">Nome da Categoria</Label>
                  <Input 
                    id="new-category-name" 
                    name="name" 
                    placeholder="Ex: Educação, Lazer..." 
                    className="h-14 rounded-2xl border-2 border-[#2D241E]/5 bg-white text-lg font-bold text-[#2D241E] focus:border-[#ff6b7b] focus:ring-0 transition-all shadow-sm"
                    required 
                  />
                  {state?.errors?.name && <p className="text-xs text-red-500 font-bold ml-1">{state.errors.name[0]}</p>}
                </div>
              </div>
              <DialogFooter className="p-8 pt-0">
                <SubmitButton label="Salvar Categoria" pendingLabel="Salvando..." />
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-wrap gap-3">
        {isDeleting && initialCategories.map(c => <Skeleton key={c.id} className="h-10 w-32 rounded-full bg-white/40" />)}
        {!isDeleting && initialCategories.map((category) => (
          <div
            key={category.id}
            className="group relative inline-flex items-center gap-2 rounded-full bg-white/40 backdrop-blur-xl border border-white/60 px-5 py-2.5 text-xs font-black uppercase tracking-widest text-[#2D241E]/60 transition-all duration-500 hover:bg-white hover:text-[#ff6b7b] hover:shadow-xl hover:shadow-[#ff6b7b]/10 hover:-translate-y-1"
          >
            <span className="opacity-40 font-bold">#</span>
            <span>{category.name}</span>
            <div className="flex items-center ml-2 border-l border-[#2D241E]/10 pl-2">
              <EditCategoryDialog category={category} />
              <DeleteCategoryDialog category={category} onSubmitting={setIsDeleting} />
            </div>
          </div>
        ))}
        {!isDeleting && initialCategories.length === 0 && (
          <div className="w-full py-12 flex flex-col items-center justify-center text-center space-y-4 bg-white/20 backdrop-blur-sm rounded-[40px] border-2 border-dashed border-[#2D241E]/5">
            <div className="space-y-1">
              <p className="font-bold text-[#2D241E]">Sem categorias?</p>
              <p className="text-xs text-muted-foreground italic mb-6">Comece agora mesmo!</p>
              <AddDefaultCategoriesButton />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}