
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
} from "@/components/ui/mobile-dialog"
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
import { useLoading } from '@/components/providers/loading-provider';

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

export function EditTransactionDialog({ transaction, accounts, goals, categories }: { transaction: Transaction; accounts: Account[]; goals: Goal[], categories: any[] }) {
  const initialState: TransactionState = { success: false };
  const [state, dispatch] = useActionState(updateTransaction, initialState);
  const { toast } = useToast();
  const { showLoading, hideLoading } = useLoading();
  const [open, setOpen] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);

  // State for multi-step form
  const [step, setStep] = useState(1);

  const isGoalTransaction = !!transaction.goalId;

  // Form fields state
  const [description, setDescription] = useState(transaction.description);
  const [amount, setAmount] = useState(transaction.amount.toString());
  const [transactionType, setTransactionType] = useState<'income' | 'expense' | 'transfer' | ''>(transaction.type);
  const [date, setDate] = useState<Date | undefined>(new Date(transaction.date));
  const [sourceAccountId, setSourceAccountId] = useState(transaction.sourceAccountId || '');
  const [destinationAccountId, setDestinationAccountId] = useState(transaction.destinationAccountId || '');
  const [category, setCategory] = useState(
    isGoalTransaction ? 'Caixinha' : (typeof transaction.category === 'object' ? (transaction.category as any)?.name : transaction.category)
  );
  const [paymentMethod, setPaymentMethod] = useState<string | null>(transaction.paymentMethod || null);


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
      hideLoading();
      toast({
        title: "Sucesso!",
        description: state.message,
      });
      setOpen(false);
    } else if (state.message) {
      hideLoading();
      toast({
        title: "Erro",
        description: state.message,
        variant: "destructive",
      });
    }
  }, [state, toast, hideLoading]);

  // Garantir que os valores iniciais estejam definidos
  useEffect(() => {
    if (!sourceAccountId && transaction.sourceAccountId) {
      setSourceAccountId(transaction.sourceAccountId);
    }
    if (!destinationAccountId && transaction.destinationAccountId) {
      setDestinationAccountId(transaction.destinationAccountId);
    }
    // Para transações de caixinha, definir o destino corretamente
    if (isGoalTransaction && !destinationAccountId) {
      setDestinationAccountId(`goal-${transaction.goalId}`);
    }
  }, [transaction, sourceAccountId, destinationAccountId, isGoalTransaction]);

  useEffect(() => {
    if (chargeType === 'installment') {
        const numInstallments = parseFloat(totalInstallments);
        const valPerInstallment = parseFloat(installmentValue);
        if (!isNaN(numInstallments) && numInstallments > 0 && !isNaN(valPerInstallment) && valPerInstallment > 0) {
            setAmount((numInstallments * valPerInstallment).toFixed(2));
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
  
  const isStep1Valid = description.trim() !== '' && category !== '';
  
  // Validação mais robusta para etapa 2
  const isStep2Valid = (() => {
    const hasType = transactionType !== '';
    const hasDate = !!date;
    
    let hasAccounts = false;
    
    if (transactionType === 'income') {
      hasAccounts = !!(destinationAccountId || destinationDefaultValue);
    } else if (transactionType === 'expense') {
      hasAccounts = !!(sourceAccountId || sourceDefaultValue);
    } else if (transactionType === 'transfer') {
      hasAccounts = !!(sourceAccountId || sourceDefaultValue) && !!(destinationAccountId || destinationDefaultValue);
    }
    
    const isValid = hasType && hasDate && hasAccounts;
    
    // Debug log (pode ser removido em produção)
    console.log('🔍 Step 2 Validation:', {
      transactionType,
      hasDate,
      sourceAccountId,
      destinationAccountId,
      sourceDefaultValue,
      destinationDefaultValue,
      hasAccounts,
      isValid
    });
    
    return isValid;
  })();

  const formVariants = {
    hidden: { opacity: 0, x: 30 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -30 },
  };

  const steps = [
    { id: 1, title: 'O Essencial' },
    { id: 2, title: 'A Movimentação' },
    { id: 3, title: 'Valores e Detalhes' },
  ];

  const frequencyLabels = {
    income: {
        single: "Recebimento Único",
        recurring: "Recebimento Fixo (Recorrente)",
        installment: "Recebimento Parcelado",
        label: "Frequência do Recebimento"
    },
    expense: {
        single: "Cobrança Única",
        recurring: "Pagamento Fixo (Recorrente)",
        installment: "Compra Parcelada",
        label: "Frequência da Cobrança"
    },
    transfer: {
        label: ""
    },
    '': {
        label: ""
    }
  };

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
      <DialogContent className="flex flex-col max-h-[90vh] md:max-h-none" mobileOptimized={true}>
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

        <form 
          action={dispatch} 
          onSubmit={(e) => {
            showLoading('Atualizando transação...', false);
          }}
          className="flex flex-1 flex-col justify-between overflow-hidden min-h-0"
        >
          <div className="flex-1 space-y-4 overflow-y-auto px-1 py-4 min-h-0 overscroll-contain">
            {/* Hidden inputs for form data */}
            <input type="hidden" name="id" value={transaction.id} />
            <input type="hidden" name="ownerId" value={transaction.ownerId} />

            {/* Hidden inputs for controlled fields */}
            <input type="hidden" name="description" value={description} />
            <input type="hidden" name="category" value={category} />
            <input type="hidden" name="type" value={transactionType} />
            <input type="hidden" name="date" value={date?.toISOString() || ''} />
            {sourceAccountId && <input type="hidden" name="sourceAccountId" value={sourceAccountId} />}
            {destinationAccountId && <input type="hidden" name="destinationAccountId" value={destinationAccountId} />}
            <input type="hidden" name="chargeType" value={chargeType} />
            {totalInstallments && <input type="hidden" name="totalInstallments" value={totalInstallments} />}
            {transaction.paidInstallments && <input type="hidden" name="paidInstallments" value={JSON.stringify(transaction.paidInstallments)} />}
            <input type="hidden" name="amount" value={amount} />
            {paymentMethod && <input type="hidden" name="paymentMethod" value={paymentMethod} />}

            <AnimatePresence mode="wait">
                {step === 1 && (
                    <motion.div key="step1" variants={formVariants} initial="hidden" animate="visible" exit="exit" className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="description_field">Descrição</Label>
                            <Input id="description_field" value={description} onChange={(e) => setDescription(e.target.value)} />
                            {state?.errors?.description && <p className="text-sm font-medium text-destructive">{state.errors.description[0]}</p>}
                        </div>
                        {!isGoalTransaction && (
                          <div className="space-y-2">
                              <Label htmlFor="category_field">Categoria</Label>
                              <Select value={category} onValueChange={setCategory}>
                                  <SelectTrigger id="category_field"><SelectValue placeholder="Selecione a categoria" /></SelectTrigger>
                                  <SelectContent>{categories.map(cat => <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>)}</SelectContent>
                              </Select>
                              {state?.errors?.category && <p className="text-sm font-medium text-destructive">{state.errors.category[0]}</p>}
                          </div>
                        )}
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div key="step2" variants={formVariants} initial="hidden" animate="visible" exit="exit" className="space-y-4">
                         <div className="space-y-2">
                          <Label htmlFor="type_field">Tipo</Label>
                          <Select value={transactionType} onValueChange={(value) => setTransactionType(value as any)}>
                            <SelectTrigger id="type_field"><SelectValue placeholder="Selecione o tipo" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="expense">Saída</SelectItem>
                              <SelectItem value="income">Entrada</SelectItem>
                              <SelectItem value="transfer">Transferência</SelectItem>
                            </SelectContent>
                          </Select>
                           {state?.errors?.type && <p className="text-sm font-medium text-destructive">{state.errors.type[0]}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="date_field">Data</Label>
                            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                                <PopoverTrigger asChild>
                                    <Button 
                                        id="date_field" 
                                        variant={"outline"} 
                                        type="button"
                                        className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                                        style={{ touchAction: 'manipulation' }}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {date ? format(date, "PPP", { locale: ptBR }) : <span>Selecione a data</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent 
                                    className="w-auto p-0" 
                                    align="center"
                                    side="bottom"
                                    sideOffset={8}
                                >
                                    <Calendar 
                                        mode="single" 
                                        selected={date} 
                                        onSelect={(newDate) => { 
                                            setDate(newDate || undefined); 
                                            setPopoverOpen(false); 
                                        }} 
                                        initialFocus 
                                        locale={ptBR} 
                                    />
                                </PopoverContent>
                            </Popover>
                             {state?.errors?.date && <p className="text-sm font-medium text-destructive">{state.errors.date[0]}</p>}
                        </div>
                        {(transactionType === 'expense' || transactionType === 'transfer') && (
                             <div className="space-y-2">
                                <Label htmlFor="sourceAccountId_field">Origem</Label>
                                <Select value={sourceAccountId || sourceDefaultValue || ''} onValueChange={(value) => {
                                    setSourceAccountId(value);
                                }}>
                                    <SelectTrigger id="sourceAccountId_field"><SelectValue placeholder="De onde saiu o dinheiro?" /></SelectTrigger>
                                    <SelectContent>{allSourcesAndDestinations.map(item => <SelectItem key={item.value} value={item.value}>{item.name}</SelectItem>)}</SelectContent>
                                </Select>
                                {state?.errors?.sourceAccountId && <p className="text-sm font-medium text-destructive">{state.errors.sourceAccountId[0]}</p>}
                            </div>
                        )}
                        {(transactionType === 'income' || transactionType === 'transfer') && (
                            <div className="space-y-2">
                                <Label htmlFor="destinationAccountId_field">Destino</Label>
                                <Select value={destinationAccountId || destinationDefaultValue || ''} onValueChange={(value) => setDestinationAccountId(value)}>
                                    <SelectTrigger id="destinationAccountId_field"><SelectValue placeholder="Para onde foi o dinheiro?" /></SelectTrigger>
                                    <SelectContent>{allSourcesAndDestinations.map(item => <SelectItem key={item.value} value={item.value}>{item.name}</SelectItem>)}</SelectContent>
                                </Select>
                                 {state?.errors?.destinationAccountId && <p className="text-sm font-medium text-destructive">{state.errors.destinationAccountId[0]}</p>}
                            </div>
                        )}
                    </motion.div>
                )}

                {step === 3 && (
                    <motion.div key="step3" variants={formVariants} initial="hidden" animate="visible" exit="exit" className="space-y-4">
                        {(transactionType === 'income' || transactionType === 'expense') && (
                            <div className="space-y-3 rounded-lg border p-3">
                                <Label>{frequencyLabels[transactionType]?.label || 'Frequência'}</Label>
                                <RadioGroup value={chargeType} onValueChange={(value) => setChargeType(value as any)}>
                                    <div className="flex items-center space-x-2"><RadioGroupItem value="single" id="edit-single" /><Label htmlFor="edit-single" className="font-normal">{frequencyLabels[transactionType]?.single || 'Único'}</Label></div>
                                    <div className="flex items-center space-x-2"><RadioGroupItem value="recurring" id="edit-recurring" /><Label htmlFor="edit-recurring" className="font-normal">{frequencyLabels[transactionType]?.recurring || 'Recorrente'}</Label></div>
                                    <div className="flex items-center space-x-2"><RadioGroupItem value="installment" id="edit-installment" /><Label htmlFor="edit-installment" className="font-normal">{frequencyLabels[transactionType]?.installment || 'Parcelado'}</Label></div>
                                </RadioGroup>
                                {chargeType === 'installment' && (
                                    <div className="grid grid-cols-2 gap-4 pt-2">
                                        <div className="space-y-1">
                                            <Label htmlFor="totalInstallments_field">Total de Parcelas</Label>
                                            <Input id="totalInstallments_field" type="number" placeholder="Ex: 12" value={totalInstallments} onChange={e => setTotalInstallments(e.target.value)} />
                                        </div>
                                         <div className="space-y-1">
                                            <Label htmlFor="installmentValue">Valor da Parcela</Label>
                                            <Input id="installmentValue" name="installmentValue" type="number" step="0.01" placeholder="Ex: 99,90" value={installmentValue} onChange={e => setInstallmentValue(e.target.value)} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="amount">Valor Total</Label>
                            <Input id="amount" name="amount" type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} readOnly={chargeType === 'installment'}/>
                            {state?.errors?.amount && <p className="text-sm font-medium text-destructive">{state.errors.amount[0]}</p>}
                        </div>

                        {transactionType === 'expense' && !isCreditCardTransaction && (
                            <div className="space-y-2">
                                <Label htmlFor="paymentMethod_field">Método de Pagamento</Label>
                                <Select value={paymentMethod || transaction.paymentMethod || ''} onValueChange={setPaymentMethod}>
                                    <SelectTrigger id="paymentMethod_field"><SelectValue placeholder="Selecione o método" /></SelectTrigger>
                                    <SelectContent>{paymentMethods.map(method => <SelectItem key={method.value} value={method.value}>{method.label}</SelectItem>)}</SelectContent>
                                </Select>
                                 {state?.errors?.paymentMethod && <p className="text-sm font-medium text-destructive">{state.errors.paymentMethod[0]}</p>}
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
                  <Button type="button" onClick={nextStep} disabled={(step === 1 && !isStep1Valid) || (step === 2 && !isStep2Valid)}>
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
