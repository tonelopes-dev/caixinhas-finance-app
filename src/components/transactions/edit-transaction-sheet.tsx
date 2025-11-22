

'use client';

import React, { useEffect, useRef, useState, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { updateTransaction, type TransactionState } from '@/app/transactions/actions';
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
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar } from '../ui/calendar';
import { ptBR } from 'date-fns/locale';
import type { Transaction, Account, Goal } from '@/lib/definitions';
import { DropdownMenuItem } from '../ui/dropdown-menu';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? 'Salvando...' : 'Salvar Alterações'}
    </Button>
  );
}

const paymentMethods = [
    { value: 'credit_card', label: 'Cartão de Crédito' },
    { value: 'debit_card', label: 'Cartão de Débito' },
    { value: 'pix', label: 'Pix' },
    { value: 'boleto', label: 'Boleto' },
    { value: 'transfer', label: 'Transferência Bancária' },
    { value: 'cash', label: 'Dinheiro' },
]

export function EditTransactionSheet({ transaction, accounts, goals, categories }: { transaction: Transaction; accounts: Account[]; goals: Goal[], categories: any[] }) {
  const initialState: TransactionState = { success: false };
  const [state, dispatch] = useActionState(updateTransaction, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [open, setOpen] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<'income' | 'expense' | 'transfer' | ''>(transaction.type);
  const [date, setDate] = useState<Date | undefined>(new Date(transaction.date));
  const [sourceAccount, setSourceAccount] = useState<Account | null>(() => {
    return accounts.find(a => a.id === transaction.sourceAccountId) || null;
  });
  
  const getChargeType = () => {
    if (transaction.isInstallment) return 'installment';
    if (transaction.isRecurring) return 'recurring';
    return 'single';
  }
  const [chargeType, setChargeType] = useState(getChargeType());

  useEffect(() => {
    if (state.success) {
      toast({
        title: "Sucesso!",
        description: state.message,
      });
      setOpen(false);
    } else if (state.message) { // Handles both validation and server errors
      toast({
        title: "Erro",
        description: state.message,
        variant: "destructive",
      });
    }
  }, [state, toast]);

  const allSourcesAndDestinations = [
      ...accounts.map(a => ({ ...a, value: a.id, name: a.name })), 
      ...goals.map(g => ({ ...g, value: `goal-${g.id}`, name: `Caixinha: ${g.name}` }))
  ];
  
  const isCreditCardTransaction = sourceAccount?.type === 'credit_card';

  const getDefaultValue = (accountId: string | null | undefined, goalId: string | null | undefined) => {
    if (goalId) return `goal-${goalId}`;
    if (accountId) return accountId;
    return undefined;
  };
  
  const sourceDefaultValue = getDefaultValue(transaction.sourceAccountId, null);
  const destinationDefaultValue = getDefaultValue(transaction.destinationAccountId, transaction.goalId);
  
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
          <input type="hidden" name="ownerId" value={transaction.ownerId} />
          {isCreditCardTransaction && <input type="hidden" name="paymentMethod" value="credit_card" />}
          <div className="grid gap-4 py-4 overflow-y-auto pr-4">
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
                         <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
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
                                onSelect={(newDate) => { setDate(newDate || undefined); setPopoverOpen(false); }}
                                initialFocus
                                locale={ptBR}
                                />
                            </PopoverContent>
                        </Popover>
                        <input type="hidden" name="date" value={date?.toISOString() || ''} />
                         {state?.errors?.date && <p className="text-sm font-medium text-destructive">{state.errors.date[0]}</p>}
                    </div>


                    {(transactionType === 'expense' || transactionType === 'transfer') && (
                         <div className="space-y-2">
                            <Label htmlFor="sourceAccountId">Origem</Label>
                            <Select name="sourceAccountId" defaultValue={sourceDefaultValue} onValueChange={(value) => {
                                const account = accounts.find(a => a.id === value) || null;
                                setSourceAccount(account);
                            }}>
                                <SelectTrigger>
                                <SelectValue placeholder="De onde saiu o dinheiro?" />
                                </SelectTrigger>
                                <SelectContent>
                                    {allSourcesAndDestinations.map(item => <SelectItem key={item.value} value={item.value}>{item.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            {state?.errors?.sourceAccountId && <p className="text-sm font-medium text-destructive">{state.errors.sourceAccountId[0]}</p>}
                        </div>
                    )}
                    
                    {(transactionType === 'income' || transactionType === 'transfer') && (
                        <div className="space-y-2">
                            <Label htmlFor="destinationAccountId">Destino</Label>
                            <Select name="destinationAccountId" defaultValue={destinationDefaultValue}>
                                <SelectTrigger>
                                <SelectValue placeholder="Para onde foi o dinheiro?" />
                                </SelectTrigger>
                                <SelectContent>
                                     {allSourcesAndDestinations.map(item => <SelectItem key={item.value} value={item.value}>{item.name}</SelectItem>)}
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
                                {categories.map(cat => <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        {state?.errors?.category && <p className="text-sm font-medium text-destructive">{state.errors.category[0]}</p>}
                    </div>

                    {transactionType === 'expense' && !isCreditCardTransaction && (
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

                    {(transactionType === 'income' || transactionType === 'expense') && (
                      <div className="space-y-3 rounded-lg border p-3">
                            <Label>Tipo de cobrança</Label>
                             <RadioGroup name="chargeType" value={chargeType} onValueChange={setChargeType}>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="single" id="edit-single" />
                                    <Label htmlFor="edit-single" className="font-normal">Cobrança Única</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="recurring" id="edit-recurring" />
                                    <Label htmlFor="edit-recurring" className="font-normal">Pagamento Fixo (Recorrente)</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="installment" id="edit-installment" />
                                    <Label htmlFor="edit-installment" className="font-normal">Compra Parcelada</Label>
                                </div>
                            </RadioGroup>
                            
                            {chargeType === 'recurring' && <input type="hidden" name="isRecurring" value="on" />}
                            {chargeType === 'installment' && (
                                <>
                                    <input type="hidden" name="isInstallment" value="on" />
                                    <div className="grid grid-cols-2 gap-4 pt-2">
                                        <div className="space-y-1">
                                            <Label htmlFor="edit-installmentNumber">Parcela N°</Label>
                                            <Input id="edit-installmentNumber" name="installmentNumber" type="number" defaultValue={transaction.installmentNumber || ''} placeholder="Ex: 2" />
                                        </div>
                                         <div className="space-y-1">
                                            <Label htmlFor="edit-totalInstallments">De (Total)</Label>
                                            <Input id="edit-totalInstallments" name="totalInstallments" type="number" defaultValue={transaction.totalInstallments || ''} placeholder="Ex: 12" />
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </>
            )}

          </div>
          <SheetFooter className="mt-auto">
            <SubmitButton />
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
