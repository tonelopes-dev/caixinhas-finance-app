
"use client"

import React, { useEffect, useRef, useState, useActionState } from 'react';
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
import { CalendarIcon, PlusCircle, Repeat } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getMockDataForUser } from '@/lib/data';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar } from '../ui/calendar';
import { ptBR } from 'date-fns/locale';
import { useFormStatus } from 'react-dom';
import { Switch } from '../ui/switch';
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

export function AddTransactionSheet({ accounts: workspaceAccounts }: { accounts: Account[] }) {
  const initialState: TransactionState = {};
  const [state, dispatch] = useActionState(addTransaction, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [open, setOpen] = useState(false);
  const [promptOpen, setPromptOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<'income' | 'expense' | 'transfer' | ''>('');
  const [date, setDate] = useState<Date>();

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  
  const hasNoAccounts = workspaceAccounts.length === 0;

  const handleTriggerClick = () => {
    if (hasNoAccounts) {
      setPromptOpen(true);
    } else {
      setOpen(true);
    }
  };


  useEffect(() => {
    if (open) {
      const userId = localStorage.getItem('CAIXINHAS_USER_ID');
      const workspaceId = sessionStorage.getItem('CAIXINHAS_VAULT_ID');
      if (userId && workspaceId) {
        const { userAccounts, userGoals } = getMockDataForUser(userId, workspaceId);
        setAccounts(userAccounts);
        setGoals(userGoals);
      }
    }
  }, [open]);


  useEffect(() => {
    if (state.message && !state.errors) {
      toast({
        title: "Sucesso!",
        description: state.message,
      });
      formRef.current?.reset();
      setTransactionType('');
      setDate(undefined);
      setOpen(false);
    } else if (state.message && state.errors) {
      toast({
        title: "Erro de Validação",
        description: state.message,
        variant: "destructive",
      });
    }
  }, [state, toast]);
  
  const allSourcesAndDestinations = [...accounts, ...goals.map(g => ({ ...g, name: `Caixinha: ${g.name}`, type: 'goal' }))];

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
          <form ref={formRef} action={dispatch} className="flex flex-1 flex-col justify-between">
            <input type="hidden" name="ownerId" value={sessionStorage.getItem('CAIXINHAS_VAULT_ID') || ''} />
            <div className="grid gap-4 py-4 overflow-y-auto pr-4">
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
                              <Select name="sourceAccountId">
                                  <SelectTrigger>
                                  <SelectValue placeholder="De onde saiu o dinheiro?" />
                                  </SelectTrigger>
                                  <SelectContent>
                                      {allSourcesAndDestinations.map(item => <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>)}
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
                                      {allSourcesAndDestinations.map(item => <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>)}
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

                      {(transactionType === 'income' || transactionType === 'expense') && (
                        <div className="flex items-center justify-between space-x-2 rounded-lg border p-3">
                            <Label htmlFor="isRecurring" className="flex flex-col space-y-1">
                                <span className="font-medium flex items-center gap-2"><Repeat className="h-4 w-4" /> Transação Recorrente</span>
                                <span className="text-xs font-normal leading-snug text-muted-foreground">
                                  Marque se esta transação se repete mensalmente.
                                </span>
                            </Label>
                            <Switch id="isRecurring" name="isRecurring" />
                        </div>
                      )}

                  </>
              )}

            </div>
            <SheetFooter className='mt-auto'>
              <SubmitButton />
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </>
  )
}
