"use client";

import React, { useEffect, useRef, useState, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { updateTransaction, type TransactionState } from '@/app/transactions/actions';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon, Edit, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar } from '../ui/calendar';
import { ptBR } from 'date-fns/locale';
import type { Transaction, Account, Goal } from '@/lib/definitions';
import { DropdownMenuItem } from '../ui/dropdown-menu';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { motion, AnimatePresence } from 'framer-motion';

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

  // State for multi-step form
  const [step, setStep] = useState(1);

  // Form fields state
  const [description, setDescription] = useState(transaction.description);
  const [amount, setAmount] = useState(transaction.amount.toString());
  const [transactionType, setTransactionType] = useState<'income' | 'expense' | 'transfer' | ''>(transaction.type);
  const [date, setDate] = useState<Date | undefined>(new Date(transaction.date));
  const [sourceAccountId, setSourceAccountId] = useState(transaction.sourceAccountId);
  const [destinationAccountId, setDestinationAccountId] = useState(transaction.destinationAccountId);
  const [category, setCategory] = useState(transaction.category);

  const getInitialChargeType = () => {
    if (transaction.isInstallment) return 'installment';
    if (transaction.isRecurring) return 'recurring';
    return 'single';
  }
  const [chargeType, setChargeType] = useState(getInitialChargeType());
  
  const [installmentValue, setInstallmentValue] = useState(() => {
    if (transaction.isInstallment && transaction.totalInstallments) {
        return (transaction.amount / transaction.totalInstallments).toFixed(2);
    }
    return '';
  });
  const [totalInstallments, setTotalInstallments] = useState(transaction.totalInstallments?.toString() || '');

  useEffect(() => {
    if (state.success) {
      toast({
        title: "Sucesso!",
        description: state.message,
      });
      setOpen(false);
    } else if (state.message) {
      toast({
        title: "Erro",
        description: state.message,
        variant: "destructive",
      });
    }
  }, [state, toast]);

  useEffect(() => {
    if (chargeType === 'installment') {
        const numInstallments = parseFloat(totalInstallments);
        const valPerInstallment = parseFloat(installmentValue);
        if (!isNaN(numInstallments) && numInstallments > 0 && !isNaN(valPerInstallment) && valPerInstallment > 0) {
            setAmount((numInstallments * valPerInstallment).toFixed(2));
        } else {
             // Don't clear if user is editing total amount directly now
        }
    }
  }, [installmentValue, totalInstallments, chargeType]);

  const allSourcesAndDestinations = [
      ...accounts.map(a => ({ ...a, value: a.id, name: a.name })), 
      ...goals.map(g => ({ ...g, value: `goal-${g.id}`, name: `Caixinha: ${g.name}` }))
  ];
  
  const sourceAccount = accounts.find(a => a.id === sourceAccountId) || null;
  const isCreditCardTransaction = sourceAccount?.type === 'credit_card';

  const getDefaultValue = (accountId: string | null | undefined, goalId: string | null | undefined) => {
    if (goalId) return `goal-${goalId}`;
    if (accountId) return accountId;
    return undefined;
  };
  
  const sourceDefaultValue = getDefaultValue(transaction.sourceAccountId, null);
  const destinationDefaultValue = getDefaultValue(transaction.destinationAccountId, (transaction as any).goalId);
  
  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);
  
  const isStep1Valid = description.trim() !== '' && parseFloat(amount) > 0;
  const isStep2Valid = transactionType !== '' && date;

  const formVariants = {
    hidden: { opacity: 0, x: 30 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -30 },
  };

  const steps = [
    { id: 1, title: 'O Essencial' },
    { id: 2, title: 'A Movimentação' },
    { id: 3, title: 'Detalhes' },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
        <DialogTrigger asChild>
            <button className='flex w-full items-center gap-2'>
                <Edit className="h-4 w-4" />
                Editar
            </button>
        </DialogTrigger>
      </DropdownMenuItem>
      <DialogContent className="flex flex-col">
        <DialogHeader>
          <DialogTitle>Editar Transação</DialogTitle>
          <DialogDescription>
            Atualize os detalhes da sua transação.
          </DialogDescription>
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="flex items-center gap-2 py-2">
            {steps.map((s, index) => (
                <React.Fragment key={s.id}>
                    <div className="flex items-center gap-2">
                        <div className={cn("flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold", step >= s.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
                            {s.id}
                        </div>
                        <span className={cn("text-sm font-medium", step >= s.id ? "text-foreground" : "text-muted-foreground")}>{s.title}</span>
                    </div>
                    {index < steps.length - 1 && <div className="flex-1 h-px bg-border" />}
                </React.Fragment>
            ))}
        </div>

        <form ref={formRef} action={dispatch} className="flex flex-1 flex-col justify-between overflow-hidden">
          <div className="flex-1 space-y-4 overflow-y-auto px-1 py-4">
            <input type="hidden" name="id" value={transaction.id} />
            <input type="hidden" name="ownerId" value={transaction.ownerId} />
            {isCreditCardTransaction && <input type="hidden" name="paymentMethod" value="credit_card" />}

            <AnimatePresence mode="wait">
                {step === 1 && (
                    <motion.div key="step1" variants={formVariants} initial="hidden" animate="visible" exit="exit" className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="description">Descrição</Label>
                            <Input id="description" name="description" value={description} onChange={(e) => setDescription(e.target.value)} />
                            {state?.errors?.description && <p className="text-sm font-medium text-destructive">{state.errors.description[0]}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="amount">Valor</Label>
                            <Input id="amount" name="amount" type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} />
                            {state?.errors?.amount && <p className="text-sm font-medium text-destructive">{state.errors.amount[0]}</p>}
                        </div>
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div key="step2" variants={formVariants} initial="hidden" animate="visible" exit="exit" className="space-y-4">
                         <div className="space-y-2">
                          <Label htmlFor="type">Tipo</Label>
                          <Select name="type" value={transactionType} onValueChange={(value) => setTransactionType(value as any)}>
                            <SelectTrigger><SelectValue placeholder="Selecione o tipo" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="expense">Saída</SelectItem>
                              <SelectItem value="income">Entrada</SelectItem>
                              <SelectItem value="transfer">Transferência</SelectItem>
                            </SelectContent>
                          </Select>
                           {state?.errors?.type && <p className="text-sm font-medium text-destructive">{state.errors.type[0]}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="date">Data</Label>
                            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                                <PopoverTrigger asChild>
                                    <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}>
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {date ? format(date, "PPP", { locale: ptBR }) : <span>Selecione a data</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar mode="single" selected={date} onSelect={(newDate) => { setDate(newDate || undefined); setPopoverOpen(false); }} initialFocus locale={ptBR} />
                                </PopoverContent>
                            </Popover>
                            <input type="hidden" name="date" value={date?.toISOString() || ''} />
                             {state?.errors?.date && <p className="text-sm font-medium text-destructive">{state.errors.date[0]}</p>}
                        </div>
                        {(transactionType === 'expense' || transactionType === 'transfer') && (
                             <div className="space-y-2">
                                <Label htmlFor="sourceAccountId">Origem</Label>
                                <Select name="sourceAccountId" defaultValue={sourceDefaultValue} onValueChange={(value) => {
                                    setSourceAccountId(value);
                                    const acc = accounts.find(a => a.id === value) || null;
                                    // setSourceAccount(acc);
                                }}>
                                    <SelectTrigger><SelectValue placeholder="De onde saiu o dinheiro?" /></SelectTrigger>
                                    <SelectContent>{allSourcesAndDestinations.map(item => <SelectItem key={item.value} value={item.value}>{item.name}</SelectItem>)}</SelectContent>
                                </Select>
                                {state?.errors?.sourceAccountId && <p className="text-sm font-medium text-destructive">{state.errors.sourceAccountId[0]}</p>}
                            </div>
                        )}
                        {(transactionType === 'income' || transactionType === 'transfer') && (
                            <div className="space-y-2">
                                <Label htmlFor="destinationAccountId">Destino</Label>
                                <Select name="destinationAccountId" defaultValue={destinationDefaultValue} onValueChange={(value) => setDestinationAccountId(value)}>
                                    <SelectTrigger><SelectValue placeholder="Para onde foi o dinheiro?" /></SelectTrigger>
                                    <SelectContent>{allSourcesAndDestinations.map(item => <SelectItem key={item.value} value={item.value}>{item.name}</SelectItem>)}</SelectContent>
                                </Select>
                                 {state?.errors?.destinationAccountId && <p className="text-sm font-medium text-destructive">{state.errors.destinationAccountId[0]}</p>}
                            </div>
                        )}
                    </motion.div>
                )}

                {step === 3 && (
                    <motion.div key="step3" variants={formVariants} initial="hidden" animate="visible" exit="exit" className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="category">Categoria</Label>
                            <Select name="category" value={typeof category === 'object' ? (category as any)?.name : category} onValueChange={setCategory}>
                                <SelectTrigger><SelectValue placeholder="Selecione a categoria" /></SelectTrigger>
                                <SelectContent>{categories.map(cat => <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>)}</SelectContent>
                            </Select>
                            {state?.errors?.category && <p className="text-sm font-medium text-destructive">{state.errors.category[0]}</p>}
                        </div>
                        {transactionType === 'expense' && !isCreditCardTransaction && (
                            <div className="space-y-2">
                                <Label htmlFor="paymentMethod">Método de Pagamento</Label>
                                <Select name="paymentMethod" defaultValue={transaction.paymentMethod}><SelectTrigger><SelectValue placeholder="Selecione o método" /></SelectTrigger><SelectContent>{paymentMethods.map(method => <SelectItem key={method.value} value={method.value}>{method.label}</SelectItem>)}</SelectContent></Select>
                                 {state?.errors?.paymentMethod && <p className="text-sm font-medium text-destructive">{state.errors.paymentMethod[0]}</p>}
                            </div>
                        )}
                        {(transactionType === 'income' || transactionType === 'expense') && (
                          <div className="space-y-3 rounded-lg border p-3">
                                <Label>Tipo de cobrança</Label>
                                 <RadioGroup name="chargeType" value={chargeType} onValueChange={(value) => setChargeType(value as any)}>
                                    <div className="flex items-center space-x-2"><RadioGroupItem value="single" id="edit-single" /><Label htmlFor="edit-single" className="font-normal">Cobrança Única</Label></div>
                                    <div className="flex items-center space-x-2"><RadioGroupItem value="recurring" id="edit-recurring" /><Label htmlFor="edit-recurring" className="font-normal">Pagamento Fixo (Recorrente)</Label></div>
                                    <div className="flex items-center space-x-2"><RadioGroupItem value="installment" id="edit-installment" /><Label htmlFor="edit-installment" className="font-normal">Compra Parcelada</Label></div>
                                </RadioGroup>
                                {chargeType === 'installment' && (
                                    <div className="grid grid-cols-2 gap-4 pt-2">
                                        <div className="space-y-1">
                                            <Label htmlFor="totalInstallments">Total de Parcelas</Label>
                                            <Input id="totalInstallments" name="totalInstallments" type="number" placeholder="Ex: 12" value={totalInstallments} onChange={e => setTotalInstallments(e.target.value)} />
                                        </div>
                                         <div className="space-y-1">
                                            <Label htmlFor="installmentValue">Valor da Parcela</Label>
                                            <Input id="installmentValue" name="installmentValue" type="number" step="0.01" placeholder="Ex: 99,90" value={installmentValue} onChange={e => setInstallmentValue(e.target.value)} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

          </div>
          <DialogFooter className="mt-auto pt-4 border-t">
            <div className="w-full flex justify-between items-center">
              {step > 1 ? (
                  <Button type="button" variant="ghost" onClick={prevStep}>
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Voltar
                  </Button>
              ) : <div />}

              {step < 3 ? (
                  <Button type="button" onClick={nextStep} disabled={step === 1 ? !isStep1Valid : !isStep2Valid}>
                      Avançar
                  </Button>
              ) : (
                  <SubmitButton />
              )}
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
