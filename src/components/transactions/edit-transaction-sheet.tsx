'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { updateTransaction, type TransactionState } from '@/app/actions';
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
import { CalendarIcon, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { accounts, goals } from '@/lib/data';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar } from '../ui/calendar';
import { ptBR } from 'date-fns/locale';
import type { Transaction } from '@/lib/definitions';
import { DropdownMenuItem } from '../ui/dropdown-menu';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? 'Salvando...' : 'Salvar Alterações'}
    </Button>
  );
}

const categories = {
    expense: ['Alimentação', 'Transporte', 'Casa', 'Lazer', 'Saúde', 'Utilidades', 'Outros'],
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

export function EditTransactionSheet({ transaction }: { transaction: Transaction }) {
  const initialState: TransactionState = {};
  const [state, dispatch] = useActionState(updateTransaction, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [open, setOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<'income' | 'expense' | 'transfer' | ''>(transaction.type);
  const [date, setDate] = useState<Date | undefined>(new Date(transaction.date));


  useEffect(() => {
    if (state.message && !state.errors) {
      toast({
        title: "Sucesso!",
        description: state.message,
      });
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
      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
        <SheetTrigger asChild>
            <button className='flex w-full items-center gap-2'>
                <Edit className="h-4 w-4" />
                Editar
            </button>
        </SheetTrigger>
      </DropdownMenuItem>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>Editar Transação</SheetTitle>
          <SheetDescription>
            Atualize os detalhes da sua transação.
          </SheetDescription>
        </SheetHeader>
        <form ref={formRef} action={dispatch} className="flex flex-1 flex-col justify-between">
          <input type="hidden" name="id" value={transaction.id} />
          <div className="grid gap-4 py-4">
             <div className="space-y-2">
              <Label htmlFor="type">Tipo</Label>
              <Select name="type" defaultValue={transaction.type} onValueChange={(value) => setTransactionType(value as any)}>
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
                        <Input id="description" name="description" defaultValue={transaction.description} />
                        {state?.errors?.description && <p className="text-sm font-medium text-destructive">{state.errors.description[0]}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="amount">Valor</Label>
                        <Input id="amount" name="amount" type="number" step="0.01" defaultValue={transaction.amount} />
                        {state?.errors?.amount && <p className="text-sm font-medium text-destructive">{state.errors.amount[0]}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="date">Data</Label>
                         <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !date && "text-muted-foreground"
                                )}
                                >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date ? format(date, "PPP", { locale: ptBR }) : <span>Selecione a data</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                initialFocus
                                locale={ptBR}
                                />
                            </PopoverContent>
                        </Popover>
                        <input type="hidden" name="date" value={date?.toISOString()} />
                         {state?.errors?.date && <p className="text-sm font-medium text-destructive">{state.errors.date[0]}</p>}
                    </div>


                    {(transactionType === 'expense' || transactionType === 'transfer') && (
                         <div className="space-y-2">
                            <Label htmlFor="sourceAccountId">Origem</Label>
                            <Select name="sourceAccountId" defaultValue={transaction.sourceAccountId}>
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
                            <Select name="destinationAccountId" defaultValue={transaction.destinationAccountId}>
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
                        <Select name="category" defaultValue={transaction.category}>
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
                            <Select name="paymentMethod" defaultValue={transaction.paymentMethod}>
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
