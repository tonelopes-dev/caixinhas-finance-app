

"use client"

import React, { useEffect, useRef, useState, useActionState } from 'react';
import { addTransaction, type TransactionState } from '@/app/transactions/actions';
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
import { CalendarIcon, PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar } from '../ui/calendar';
import { ptBR } from 'date-fns/locale';
import { useFormStatus } from 'react-dom';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { Account, Goal } from '@/lib/definitions';
import { AddAccountPromptDialog } from '../transactions/add-account-prompt-dialog';


function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? 'Salvando...' : 'Salvar Transação'}
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

export function AddTransactionSheet({ accounts: workspaceAccounts, goals: workspaceGoals, ownerId, categories }: { accounts: Account[], goals: Goal[], ownerId: string, categories: any[] }) {
  const initialState: TransactionState = { success: false };
  const [state, dispatch] = useActionState(addTransaction, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [open, setOpen] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [promptOpen, setPromptOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<'income' | 'expense' | 'transfer' | ''>('');
  const [date, setDate] = useState<Date>();
  const [sourceAccount, setSourceAccount] = useState<Account | null>(null);
  const [chargeType, setChargeType] = useState('single');
  
  const hasNoAccounts = workspaceAccounts.length === 0;

  const handleTriggerClick = () => {
    if (hasNoAccounts) {
      setPromptOpen(true);
    } else {
      setOpen(true);
    }
  };

  useEffect(() => {
    if (state.success === true) {
      toast({
        title: "Sucesso!",
        description: state.message,
      });
      formRef.current?.reset();
      setTransactionType('');
      setSourceAccount(null);
      setChargeType('single');
      setDate(undefined);
      setOpen(false);
    } else if (state.success === false && state.message) {
      toast({
        title: "Erro",
        description: state.message,
        variant: "destructive",
      });
    }
  }, [state, toast]);
  
  const allSourcesAndDestinations = [
      ...workspaceAccounts.map(a => ({ ...a, value: a.id, name: a.name })), 
      ...workspaceGoals.map(g => ({ ...g, value: `goal-${g.id}`, name: `Caixinha: ${g.name}` }))
  ];
  
  const isCreditCardTransaction = sourceAccount?.type === 'credit_card';

  return (
    <>
      <AddAccountPromptDialog open={promptOpen} onOpenChange={setPromptOpen} />
      <Sheet open={open} onOpenChange={setOpen}>
        <Button size="sm" onClick={handleTriggerClick}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Adicionar
        </Button>
        <SheetContent className="flex flex-col">
          <SheetHeader>
            <SheetTitle>Adicionar Nova Transação</SheetTitle>
            <SheetDescription>
              Registre uma nova entrada, saída ou transferência para manter tudo organizado.
            </SheetDescription>
          </SheetHeader>
          <form ref={formRef} action={dispatch} className="flex flex-1 flex-col justify-between overflow-hidden">
            <input type="hidden" name="ownerId" value={ownerId} />
             {isCreditCardTransaction && <input type="hidden" name="paymentMethod" value="credit_card" />}
            <div className="flex-1 space-y-4 overflow-y-auto px-1 py-4">
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
                              <Select name="sourceAccountId" onValueChange={(value) => {
                                const account = workspaceAccounts.find(a => a.id === value) || null;
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
                              <Select name="destinationAccountId">
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
                          <Select name="category">
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

                      {(transactionType === 'income' || transactionType === 'expense') && (
                        <div className="space-y-3 rounded-lg border p-3">
                            <Label>Tipo de cobrança</Label>
                             <RadioGroup name="chargeType" defaultValue="single" value={chargeType} onValueChange={setChargeType}>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="single" id="single" />
                                    <Label htmlFor="single" className="font-normal">Cobrança Única</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="recurring" id="recurring" />
                                    <Label htmlFor="recurring" className="font-normal">Pagamento Fixo (Recorrente)</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="installment" id="installment" />
                                    <Label htmlFor="installment" className="font-normal">Compra Parcelada</Label>
                                </div>
                            </RadioGroup>
                            
                            {chargeType === 'recurring' && <input type="hidden" name="isRecurring" value="on" />}
                            {chargeType === 'installment' && (
                                <>
                                    <input type="hidden" name="isInstallment" value="on" />
                                    <div className="grid grid-cols-2 gap-4 pt-2">
                                        <div className="space-y-1">
                                            <Label htmlFor="installmentNumber">Parcela N°</Label>
                                            <Input id="installmentNumber" name="installmentNumber" type="number" placeholder="Ex: 2" />
                                        </div>
                                         <div className="space-y-1">
                                            <Label htmlFor="totalInstallments">De (Total)</Label>
                                            <Input id="totalInstallments" name="totalInstallments" type="number" placeholder="Ex: 12" />
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                      )}

                  </>
              )}

            </div>
            <SheetFooter className='mt-auto pt-4 border-t'>
              <SubmitButton />
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </>
  )
}
