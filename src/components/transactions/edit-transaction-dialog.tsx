
"use client";

import React, { useEffect, useRef, useState, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { updateTransaction, type TransactionState } from '@/app/(private)/transactions/actions';
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
import { CalendarIcon, Edit, ArrowLeft, Check, Repeat, PlusCircle } from 'lucide-react';
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

export function EditTransactionDialog({ transaction, accounts, goals, categories, trigger }: { transaction: Transaction; accounts: Account[]; goals: Goal[], categories: any[], trigger?: React.ReactNode }) {
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
    return isValid;
  })();

  const isStep3Valid = amount !== '' && parseFloat(amount) > 0;
  
  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) return;
    
    // We can use the dispatch directly if we want, but since it's a form action, 
    // it's better to just let the action prop handle it but only when we are on the right step.
    // However, to be extra safe, we'll manually handle it like in AddTransaction.
    const formData = new FormData();
    formData.append('id', transaction.id);
    formData.append('ownerId', transaction.ownerId);
    formData.append('description', description);
    formData.append('category', category);
    formData.append('type', transactionType);
    formData.append('date', date?.toISOString() || '');
    if (sourceAccountId) formData.append('sourceAccountId', sourceAccountId);
    if (destinationAccountId) formData.append('destinationAccountId', destinationAccountId);
    formData.append('chargeType', chargeType);
    if (totalInstallments) formData.append('totalInstallments', totalInstallments);
    formData.append('amount', amount);
    if (paymentMethod) formData.append('paymentMethod', paymentMethod);
    
    showLoading('Atualizando transação...');
    
    React.startTransition(() => {
        dispatch(formData);
    });
  };

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
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="icon" className="h-8 w-8 text-[#2D241E]/40 hover:text-[#ff6b7b] hover:bg-[#ff6b7b]/10 rounded-xl transition-all">
            <Edit className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="flex flex-col h-full max-h-[92vh] sm:max-h-[85vh] md:max-w-xl bg-white/95 backdrop-blur-2xl border-none rounded-[40px] shadow-2xl p-0 overflow-hidden" mobileOptimized={true}>
        <DialogHeader className="p-6 sm:p-10 pb-4 sm:pb-8 bg-white/50 border-b border-[#2D241E]/5 space-y-2 sm:space-y-3">
          <div className="flex items-center gap-3 mb-1 sm:mb-2">
              <div className="h-2 w-2 rounded-full bg-[#ff6b7b] animate-pulse" />
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] text-[#ff6b7b]">Ajustar Lançamento</span>
          </div>
          <DialogTitle className="text-2xl sm:text-4xl font-headline italic text-[#2D241E] tracking-tight">Editar <span className="text-[#ff6b7b]">Transação</span></DialogTitle>
          <DialogDescription className="text-sm sm:text-lg font-bold text-[#2D241E]/40 leading-relaxed italic">
            Refine as informações deste registro financeiro de forma simples e elegante.
          </DialogDescription>
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="flex items-center justify-between gap-1 px-6 py-4 sm:px-10 sm:py-8 bg-white/30 border-b border-[#2D241E]/5">
            {steps.map((s, index) => (
                <React.Fragment key={s.id}>
                    <div className="flex flex-col items-center gap-1.5 group">
                        <div className={cn(
                          "flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl sm:rounded-2xl text-[10px] sm:text-[11px] font-black transition-all duration-500", 
                          step === s.id ? "bg-[#2D241E] text-white shadow-xl shadow-[#2D241E]/20 scale-110" : 
                          step > s.id ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "bg-white text-[#2D241E]/20 border border-[#2D241E]/10"
                        )}>
                            {step > s.id ? <Check className="h-4 w-4 sm:h-5 sm:w-5" /> : s.id}
                        </div>
                        <span className={cn(
                          "text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-center min-w-[50px] sm:min-w-[60px]", 
                          step >= s.id ? "text-[#2D241E]" : "text-[#2D241E]/20"
                        )}>
                          {s.title.split(' ')[0]}
                        </span>
                    </div>
                    {index < steps.length - 1 && (
                      <div className="flex-1 px-1 sm:px-4 mb-5 sm:mb-6">
                        <div className={cn("h-0.5 rounded-full transition-all duration-700", step > s.id ? "bg-emerald-500" : "bg-[#2D241E]/5")} />
                      </div>
                    )}
                </React.Fragment>
            ))}
        </div>

        <form 
          onSubmit={handleFinalSubmit}
          className="flex flex-1 flex-col justify-between overflow-hidden bg-white/30"
        >
          <div className="flex-1 space-y-6 sm:space-y-8 overflow-y-auto px-6 py-6 sm:px-10 sm:py-10 min-h-0 overscroll-contain custom-scrollbar">
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
                    <motion.div key="step1" variants={formVariants} initial="hidden" animate="visible" exit="exit" className="space-y-8">
                        <div className="space-y-4">
                            <label htmlFor="description_field" className="text-[10px] font-black uppercase tracking-[0.2em] text-[#2D241E]/30 ml-1">Descrição</label>
                            <Input 
                              id="description_field" 
                              placeholder="Título da transação" 
                              value={description} 
                              onChange={(e) => setDescription(e.target.value)} 
                              className="h-16 rounded-2xl border-white border-2 bg-white/60 text-lg font-bold text-[#2D241E] focus:bg-white focus:border-[#ff6b7b] focus:ring-4 focus:ring-[#ff6b7b]/5 transition-all shadow-sm" 
                            />
                            {state?.errors?.description && <p className="text-xs font-black text-[#ff6b7b] ml-1 uppercase">{state.errors.description[0]}</p>}
                        </div>
                        {!isGoalTransaction && (
                          <div className="space-y-4">
                              <label htmlFor="category_field" className="text-[10px] font-black uppercase tracking-[0.2em] text-[#2D241E]/30 ml-1">Categoria</label>
                              <Select value={category} onValueChange={setCategory}>
                                  <SelectTrigger id="category_field" className="h-16 rounded-2xl border-white border-2 bg-white/60 text-lg font-bold text-[#2D241E] transition-all hover:bg-white focus:ring-4 focus:ring-[#ff6b7b]/5">
                                      <SelectValue placeholder="Selecione a categoria" />
                                  </SelectTrigger>
                                  <SelectContent className="rounded-[28px] border-white/40 shadow-2xl backdrop-blur-3xl bg-[#fdfcf7]/95 p-2">
                                    {categories.map(cat => <SelectItem key={cat.id} value={cat.name} className="font-black rounded-xl py-3 px-4">{cat.name}</SelectItem>)}
                                  </SelectContent>
                              </Select>
                              {state?.errors?.category && <p className="text-xs font-black text-[#ff6b7b] ml-1 uppercase">{state.errors.category[0]}</p>}
                          </div>
                        )}
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div key="step2" variants={formVariants} initial="hidden" animate="visible" exit="exit" className="space-y-8">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                              <label htmlFor="type_field" className="text-[10px] font-black uppercase tracking-[0.2em] text-[#2D241E]/30 ml-1">Tipo</label>
                              <Select value={transactionType} onValueChange={(value) => setTransactionType(value as any)}>
                                <SelectTrigger id="type_field" className="h-16 rounded-2xl border-white border-2 bg-white/60 text-lg font-bold text-[#2D241E] transition-all hover:bg-white focus:ring-4 focus:ring-[#ff6b7b]/5">
                                    <SelectValue placeholder="Tipo de transação" />
                                </SelectTrigger>
                                <SelectContent className="rounded-[28px] border-white/40 shadow-2xl backdrop-blur-3xl bg-[#fdfcf7]/95 p-2">
                                  <SelectItem value="expense" className="font-black rounded-xl py-3 px-4 text-[#ff6b7b]">Saída</SelectItem>
                                  <SelectItem value="income" className="font-black rounded-xl py-3 px-4 text-emerald-600">Entrada</SelectItem>
                                  <SelectItem value="transfer" className="font-black rounded-xl py-3 px-4 text-blue-600">Transferência</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-4">
                                <label htmlFor="date_field" className="text-[10px] font-black uppercase tracking-[0.2em] text-[#2D241E]/30 ml-1">Data</label>
                                <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                                    <PopoverTrigger asChild>
                                        <Button 
                                            id="date_field" 
                                            variant={"outline"} 
                                            type="button"
                                            className={cn("h-16 w-full rounded-2xl border-white border-2 bg-white/60 text-lg font-bold text-[#2D241E] justify-start", !date && "text-[#2D241E]/20")}
                                        >
                                            <CalendarIcon className="mr-3 h-5 w-5 text-[#ff6b7b]" />
                                            {date ? format(date, "PPP", { locale: ptBR }) : <span>Selecione a data</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-2 rounded-[32px] overflow-hidden border-white/40 shadow-2xl backdrop-blur-3xl bg-[#fdfcf7]/95" align="center">
                                        <Calendar 
                                            mode="single" 
                                            selected={date} 
                                            onSelect={(newDate) => { setDate(newDate || undefined); setPopoverOpen(false); }} 
                                            locale={ptBR} 
                                            className="font-inter"
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>

                        <div className="space-y-8 pt-4">
                          {(transactionType === 'expense' || transactionType === 'transfer') && (
                               <div className="space-y-4">
                                  <label htmlFor="sourceAccountId_field" className="text-[10px] font-black uppercase tracking-[0.2em] text-[#2D241E]/30 ml-1">Origem do Dinheiro</label>
                                   <Select value={sourceAccountId || sourceDefaultValue || ''} onValueChange={(value) => setSourceAccountId(value)}>
                                       <SelectTrigger id="sourceAccountId_field" className="h-16 rounded-2xl border-white border-2 bg-white/60 text-lg font-bold text-[#2D241E] transition-all hover:bg-white focus:ring-4 focus:ring-[#ff6b7b]/5">
                                         <SelectValue placeholder="Conta de saída" />
                                       </SelectTrigger>
                                       <SelectContent className="rounded-[28px] border-white/40 shadow-2xl backdrop-blur-3xl bg-[#fdfcf7]/95 p-2">
                                         {allSourcesAndDestinations.map(item => <SelectItem key={item.value} value={item.value} className="font-black rounded-xl py-3 px-4">{item.name}</SelectItem>)}
                                       </SelectContent>
                                   </Select>
                              </div>
                          )}
                          {(transactionType === 'income' || transactionType === 'transfer') && (
                              <div className="space-y-4">
                                  <label htmlFor="destinationAccountId_field" className="text-[10px] font-black uppercase tracking-[0.2em] text-[#2D241E]/30 ml-1">Destino do Dinheiro</label>
                                  <Select value={destinationAccountId || destinationDefaultValue || ''} onValueChange={(value) => setDestinationAccountId(value)}>
                                      <SelectTrigger id="destinationAccountId_field" className="h-16 rounded-2xl border-white border-2 bg-white/60 text-lg font-bold text-[#2D241E] transition-all hover:bg-white focus:ring-4 focus:ring-[#ff6b7b]/5">
                                        <SelectValue placeholder="Conta de destino" />
                                      </SelectTrigger>
                                      <SelectContent className="rounded-[28px] border-white/40 shadow-2xl backdrop-blur-3xl bg-[#fdfcf7]/95 p-2">
                                        {allSourcesAndDestinations.map(item => <SelectItem key={item.value} value={item.value} className="font-black rounded-xl py-3 px-4">{item.name}</SelectItem>)}
                                      </SelectContent>
                                  </Select>
                              </div>
                          )}
                        </div>
                    </motion.div>
                )}

                {step === 3 && (
                    <motion.div key="step3" variants={formVariants} initial="hidden" animate="visible" exit="exit" className="space-y-10">
                        {(transactionType === 'income' || transactionType === 'expense') && (
                            <div className="space-y-6">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#2D241E]/30 ml-1">Frequência</label>
                                <RadioGroup value={chargeType} onValueChange={(value) => setChargeType(value as any)} className="grid grid-cols-3 gap-4">
                                    {[
                                        { id: 'single', label: 'Único', icon: Check },
                                        { id: 'recurring', label: 'Fixo', icon: Repeat },
                                        { id: 'installment', label: 'Parcelado', icon: CalendarIcon }
                                    ].map((option) => (
                                        <label 
                                            key={option.id}
                                            htmlFor={`edit-${option.id}`}
                                            className={cn(
                                                "flex flex-col items-center justify-center p-4 rounded-3xl border-2 transition-all cursor-pointer gap-2",
                                                chargeType === option.id 
                                                    ? "bg-[#2D241E] border-[#2D241E] text-white shadow-xl scale-105" 
                                                    : "bg-white border-white hover:border-[#2D241E]/10 text-[#2D241E]/40"
                                            )}
                                        >
                                            <RadioGroupItem value={option.id} id={`edit-${option.id}`} className="sr-only" />
                                            <option.icon className="h-5 w-5" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">{option.label}</span>
                                        </label>
                                    ))}
                                </RadioGroup>

                                {chargeType === 'installment' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 animate-in fade-in slide-in-from-top-4 duration-500">
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#2D241E]/30 ml-1">Total Parcelas</label>
                                            <Input type="number" inputMode="numeric" placeholder="Ex: 12" value={totalInstallments} onChange={e => setTotalInstallments(e.target.value)} className="h-16 rounded-2xl border-white border-2 bg-white/60 text-lg font-bold text-[#2D241E]" />
                                        </div>
                                         <div className="space-y-4">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#2D241E]/30 ml-1">Valor Parcela</label>
                                            <Input type="number" inputMode="decimal" step="0.01" placeholder="0,00" value={installmentValue} onChange={e => setInstallmentValue(e.target.value)} className="h-16 rounded-2xl border-white border-2 bg-white/60 text-lg font-bold text-[#2D241E]" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="space-y-4">
                            <label htmlFor="amount" className="text-[10px] font-black uppercase tracking-[0.2em] text-[#2D241E]/30 ml-1">Valor Total</label>
                            <div className="relative">
                                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-[#2D241E]/20">R$</span>
                                <Input 
                                    id="amount" 
                                    name="amount" 
                                    type="number" 
                                    inputMode="decimal"
                                    step="0.01" 
                                    value={amount} 
                                    onChange={(e) => setAmount(e.target.value)} 
                                    readOnly={chargeType === 'installment'} 
                                    className={cn(
                                        "h-24 pl-20 text-4xl font-black rounded-3xl border-white border-4 bg-white shadow-lg tracking-tighter text-[#2D241E] transition-all",
                                        chargeType === 'installment' ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "focus:border-[#ff6b7b] focus:ring-4 focus:ring-[#ff6b7b]/5"
                                    )}
                                />
                            </div>
                            {state?.errors?.amount && <p className="text-xs font-black text-[#ff6b7b] ml-1 uppercase">{state.errors.amount[0]}</p>}
                        </div>

                        {transactionType === 'expense' && !isCreditCardTransaction && (
                            <div className="space-y-4">
                                <label htmlFor="paymentMethod_field" className="text-[10px] font-black uppercase tracking-[0.2em] text-[#2D241E]/30 ml-1">Pagamento</label>
                                <Select value={paymentMethod || transaction.paymentMethod || ''} onValueChange={setPaymentMethod}>
                                    <SelectTrigger id="paymentMethod_field" className="h-16 rounded-2xl border-white border-2 bg-white/60 text-lg font-bold text-[#2D241E] transition-all hover:bg-white focus:ring-4 focus:ring-[#ff6b7b]/5">
                                        <SelectValue placeholder="Forma de pagamento" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-[28px] border-white/40 shadow-2xl backdrop-blur-3xl bg-[#fdfcf7]/95 p-2">
                                      {paymentMethods.map(method => <SelectItem key={method.value} value={method.value} className="font-black rounded-xl py-3 px-4">{method.label}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

          </div>
          <DialogFooter className='mt-auto p-6 sm:p-10 bg-white/50 border-t border-[#2D241E]/5'>
            <div className="w-full flex justify-between items-center gap-4 sm:gap-6">
              {step > 1 ? (
                  <Button type="button" variant="ghost" onClick={prevStep} className="h-14 sm:h-16 px-4 sm:px-8 rounded-2xl font-black text-[#2D241E]/40 hover:text-[#2D241E] hover:bg-[#2D241E]/5 transition-all uppercase tracking-widest text-[10px] sm:text-xs">
                      <ArrowLeft className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5" />
                      Voltar
                  </Button>
              ) : <div />}

              {step < 3 ? (
                  <Button 
                    type="button" 
                    onClick={nextStep} 
                    disabled={(step === 1 && !isStep1Valid) || (step === 2 && !isStep2Valid) || (step === 3 && !isStep3Valid)} 
                    className="h-14 sm:h-16 px-6 sm:px-12 rounded-2xl font-black uppercase tracking-[0.2em] bg-[#2D241E] text-white hover:bg-[#4A3B32] transition-all shadow-[0_10px_30px_rgba(45,36,30,0.2)] disabled:opacity-30 text-[10px] sm:text-xs"
                  >
                      Próximo Passo
                  </Button>
              ) : (
                  <Button 
                    type="submit" 
                    disabled={!isStep3Valid}
                    className="flex-1 sm:flex-none h-14 sm:h-16 px-6 sm:px-12 rounded-2xl font-black uppercase tracking-[0.2em] bg-gradient-to-r from-[#ff6b7b] to-[#ff8e9a] text-white hover:shadow-[0_10_10px_rgba(255,107,123,0.3)] transition-all shadow-xl border-none text-[10px] sm:text-xs"
                  >
                      Salvar Alterações
                  </Button>
              )}
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
      </Dialog>
  )
}
