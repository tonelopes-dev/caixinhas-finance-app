"use client"

import React, { useEffect, useRef } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { addTransaction, type TransactionState } from '@/app/actions';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';


function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Salvando...' : 'Salvar Transação'}
    </Button>
  );
}


export function AddTransactionSheet() {
  const initialState: TransactionState = {};
  const [state, dispatch] = useFormState(addTransaction, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [open, setOpen] = React.useState(false);

  useEffect(() => {
    if (state.message && !state.errors) {
      toast({
        title: "Sucesso!",
        description: state.message,
      });
      formRef.current?.reset();
      setOpen(false);
    } else if (state.message && state.errors) {
      toast({
        title: "Erro de Validação",
        description: state.message,
        variant: "destructive",
      });
    }
  }, [state, toast]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button size="sm">
            <PlusCircle className="mr-2 h-4 w-4" />
            Adicionar
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Adicionar Nova Transação</SheetTitle>
          <SheetDescription>
            Registre uma nova entrada ou saída para manter tudo organizado.
          </SheetDescription>
        </SheetHeader>
        <form ref={formRef} action={dispatch}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Descrição
              </Label>
              <Input id="description" name="description" placeholder="Ex: Jantar de aniversário" className="col-span-3" />
            </div>
             {state?.errors?.description && <p className="col-span-4 text-right text-sm font-medium text-destructive">{state.errors.description[0]}</p>}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Valor
              </Label>
              <Input id="amount" name="amount" type="number" step="0.01" placeholder="R$ 150,00" className="col-span-3" />
            </div>
             {state?.errors?.amount && <p className="col-span-4 text-right text-sm font-medium text-destructive">{state.errors.amount[0]}</p>}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Tipo
              </Label>
              <Select name="type">
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">Saída</SelectItem>
                  <SelectItem value="income">Entrada</SelectItem>
                </SelectContent>
              </Select>
            </div>
             {state?.errors?.type && <p className="col-span-4 text-right text-sm font-medium text-destructive">{state.errors.type[0]}</p>}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Categoria
              </Label>
              <Input id="category" name="category" placeholder="Ex: Lazer" className="col-span-3" />
            </div>
            {state?.errors?.category && <p className="col-span-4 text-right text-sm font-medium text-destructive">{state.errors.category[0]}</p>}
          </div>
          <SheetFooter>
            <SubmitButton />
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
