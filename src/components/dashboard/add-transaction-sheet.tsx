"use client"

import React, { useEffect, useRef, useState } from 'react';
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
import { accounts, goals } from '@/lib/data';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? 'Salvando...' : 'Salvar Transação'}
    </Button>
  );
}

const categories = {
    expense: ['Alimentação', 'Transporte', 'Casa', 'Lazer', 'Saúde', 'Educação', 'Roupas', 'Utilidades', 'Outros'],
    income: ['Salário', 'Freelance', 'Investimentos', 'Presente', 'Outros'],
    transfer: ['Caixinha', 'Transferência entre contas']
}

const paymentMethods = [
    { value: 'credit_card', label: 'Cartão de Crédito' },
    { value: 'debit_card', label: 'Cartão de Débito' },
    { value: 'pix', label: 'Pix' },
    { value: 'boleto', label: 'Boleto' },
    { value: 'transfer', label: 'Transferência Bancária' },
    { value: 'cash', label: 'Dinheiro' },
]

export function AddTransactionSheet() {
  const initialState: TransactionState = {};
  const [state, dispatch] = useFormState(addTransaction, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [open, setOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<'income' | 'expense' | 'transfer' | ''>('');

  useEffect(() => {
    if (state.message && !state.errors) {
      toast({
        title: "Sucesso!",
        description: state.message,
      });
      formRef.current?.reset();
      setTransactionType('');
      setOpen(false);
    } else if (state.message && state.errors) {
      toast({
        title: "Erro de Validação",
        description: state.message,
        variant: "destructive",
      });
    }
  }, [state, toast]);
  
  const allDestinations = [...accounts.map(a => ({...a, type: 'account'})), ...goals.map(g => ({id: g.id, name: `Caixinha: ${g.name}`}))];


  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button size="sm">
            <PlusCircle className="mr-2 h-4 w-4" />
            Adicionar
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>Adicionar Nova Transação</SheetTitle>
          <SheetDescription>
            Registre uma nova entrada, saída ou transferência para manter tudo organizado.
          </SheetDescription>
        </SheetHeader>
        <form ref={formRef} action={dispatch} className="flex flex-1 flex-col justify-between">
          <div className="grid gap-4 py-4">
             <div className="space-y-2">
              <Label htmlFor="type">Tipo</Label>
              <Select name="type" onValueChange={(value) => setTransactionType(value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">Saída</SelectItem>
                  <SelectItem value="income">Entrada</SelectItem>
                  <SelectItem value="transfer">Transferência</SelectItem>
                </SelectContent>
              </Select>
               {state?.errors?.type && <p className="text-sm font-medium text-destructive">{state.errors.type[0]}</p>}
            </div>
            
            {transactionType && (
                <>
                    <div className="space-y-2">
                        <Label htmlFor="description">Descrição</Label>
                        <Input id="description" name="description" placeholder="Ex: Jantar de aniversário" />
                        {state?.errors?.description && <p className="text-sm font-medium text-destructive">{state.errors.description[0]}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="amount">Valor</Label>
                        <Input id="amount" name="amount" type="number" step="0.01" placeholder="R$ 150,00" />
                        {state?.errors?.amount && <p className="text-sm font-medium text-destructive">{state.errors.amount[0]}</p>}
                    </div>

                    {(transactionType === 'expense' || transactionType === 'transfer') && (
                         <div className="space-y-2">
                            <Label htmlFor="sourceAccountId">Origem</Label>
                            <Select name="sourceAccountId">
                                <SelectTrigger>
                                <SelectValue placeholder="De onde saiu o dinheiro?" />
                                </SelectTrigger>
                                <SelectContent>
                                    {accounts.map(acc => <SelectItem key={acc.id} value={acc.id}>{acc.name} ({acc.bank})</SelectItem>)}
                                    {transactionType === 'transfer' && goals.map(goal => <SelectItem key={goal.id} value={goal.id}>Caixinha: {goal.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            {state?.errors?.sourceAccountId && <p className="text-sm font-medium text-destructive">{state.errors.sourceAccountId[0]}</p>}
                        </div>
                    )}
                    
                    {(transactionType === 'income' || transactionType === 'transfer') && (
                        <div className="space-y-2">
                            <Label htmlFor="destinationAccountId">Destino</Label>
                            <Select name="destinationAccountId">
                                <SelectTrigger>
                                <SelectValue placeholder="Para onde foi o dinheiro?" />
                                </SelectTrigger>
                                <SelectContent>
                                     {accounts.map(acc => <SelectItem key={acc.id} value={acc.id}>{acc.name} ({acc.bank})</SelectItem>)}
                                     {transactionType === 'transfer' && goals.map(goal => <SelectItem key={goal.id} value={goal.id}>Caixinha: {goal.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                             {state?.errors?.destinationAccountId && <p className="text-sm font-medium text-destructive">{state.errors.destinationAccountId[0]}</p>}
                        </div>
                    )}
                    
                     <div className="space-y-2">
                        <Label htmlFor="category">Categoria</Label>
                        <Select name="category">
                            <SelectTrigger>
                            <SelectValue placeholder="Selecione a categoria" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories[transactionType]?.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        {state?.errors?.category && <p className="text-sm font-medium text-destructive">{state.errors.category[0]}</p>}
                    </div>

                    {transactionType === 'expense' && (
                        <div className="space-y-2">
                            <Label htmlFor="paymentMethod">Método de Pagamento</Label>
                            <Select name="paymentMethod">
                                <SelectTrigger>
                                <SelectValue placeholder="Selecione o método" />
                                </SelectTrigger>
                                <SelectContent>
                                    {paymentMethods.map(method => <SelectItem key={method.value} value={method.value}>{method.label}</SelectItem>)}
                                </SelectContent>
                            </Select>
                             {state?.errors?.paymentMethod && <p className="text-sm font-medium text-destructive">{state.errors.paymentMethod[0]}</p>}
                        </div>
                    )}
                </>
            )}

          </div>
          <SheetFooter>
            <SubmitButton />
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
