
"use client"

import React, { useEffect, useRef, useState, useActionState, startTransition } from 'react';
import { addTransaction, type TransactionState } from '@/app/transactions/actions';
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
import { CalendarIcon, PlusCircle, Repeat, ArrowLeft, Check } from 'lucide-react';
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
import { motion, AnimatePresence } from 'framer-motion';
import { Checkbox } from '../ui/checkbox';
import { useLoading } from '@/components/providers/loading-provider';

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

interface AddTransactionDialogProps {
  accounts: Account[];
  goals: Goal[];
  ownerId: string;
  categories: any[];
  chargeType?: 'single' | 'recurring' | 'installment';
  fullWidth?: boolean;
  className?: string;
}

export function AddTransactionDialog({ accounts: workspaceAccounts, goals: workspaceGoals, ownerId, categories, chargeType: initialChargeType = 'single', fullWidth = false, className }: AddTransactionDialogProps) {
  const initialState: TransactionState = { success: false };
  const [state, dispatch] = useActionState(addTransaction, initialState);
  const { toast } = useToast();
  const { showLoading, hideLoading } = useLoading();
  const [open, setOpen] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [promptOpen, setPromptOpen] = useState(false);
  
  const [step, setStep] = useState(1);

  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [transactionType, setTransactionType] = useState<'income' | 'expense' | 'transfer' | ''>('');
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [sourceAccountId, setSourceAccountId] = useState<string | null>(null);
  const [destinationAccountId, setDestinationAccountId] = useState<string | null>(null);
  const [chargeType, setChargeType] = useState(initialChargeType);
  const [installmentValue, setInstallmentValue] = useState('');
  const [totalInstallments, setTotalInstallments] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [projectRecurring, setProjectRecurring] = useState(false);

  const hasNoAccounts = workspaceAccounts.length === 0;

  const handleTriggerClick = () => {
    if (hasNoAccounts) {
      setPromptOpen(true);
    } else {
      resetFormState();
      setOpen(true);
    }
  };
  
  const resetFormState = () => {
      setStep(1);
      setDescription('');
      setCategory('');
      setTransactionType('');
      setDate(new Date());
      setSourceAccountId(null);
      setDestinationAccountId(null);
      setChargeType(initialChargeType);
      setInstallmentValue('');
      setTotalInstallments('');
      setAmount('');
      setProjectRecurring(false);
  }

  useEffect(() => {
    if (state.success === true) {
      hideLoading();
      toast({
        title: "Sucesso!",
        description: state.message,
      });
      resetFormState();
      setOpen(false);
    } else if (state.success === false && state.message) {
      hideLoading();
      toast({
        title: "Erro",
        description: state.message,
        variant: "destructive",
      });
    }
  }, [state, toast, initialChargeType, hideLoading]);

  useEffect(() => {
    if (chargeType === 'installment') {
        const numInstallments = parseFloat(totalInstallments);
        const valPerInstallment = parseFloat(installmentValue);

        if (!isNaN(numInstallments) && numInstallments > 0 && !isNaN(valPerInstallment) && valPerInstallment > 0) {
            const calculatedTotal = (numInstallments * valPerInstallment);
            setAmount(calculatedTotal.toFixed(2));
        } else {
            setAmount('');
        }
    }
  }, [installmentValue, totalInstallments, chargeType]);
  
  const allSourcesAndDestinations = [
      ...workspaceAccounts.map(a => ({ ...a, value: a.id, name: a.name })), 
      ...workspaceGoals.map(g => ({ ...g, value: `goal-${g.id}`, name: `Caixinha: ${g.name}` }))
  ];
  
  const sourceAccount = workspaceAccounts.find(a => a.id === sourceAccountId) || null;
  const isCreditCardTransaction = sourceAccount?.type === 'credit_card';

  // Filter destinations to exclude the selected source
  const availableDestinations = allSourcesAndDestinations.filter(item => item.value !== sourceAccountId);
  // Filter sources to exclude the selected destination (if selected first, though less common flow)
  const availableSources = allSourcesAndDestinations.filter(item => item.value !== destinationAccountId);

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);
  
  const isStep1Valid = description.trim() !== '' && category !== '';
  const isStep2Valid = transactionType !== '' && date && (
    transactionType === 'income' ? !!destinationAccountId :
    transactionType === 'expense' ? !!sourceAccountId :
    !!sourceAccountId && !!destinationAccountId
  );
  
  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('ownerId', ownerId);
    
    // Hidden fields for all steps
    formData.append('description', description);
    formData.append('category', category);
    formData.append('type', transactionType || '');
    formData.append('date', date?.toISOString() || new Date().toISOString());
    if (sourceAccountId) formData.append('sourceAccountId', sourceAccountId);
    if (destinationAccountId) formData.append('destinationAccountId', destinationAccountId);

    // Final step fields
    if (paymentMethod) formData.append('paymentMethod', paymentMethod);
    formData.append('chargeType', chargeType);
    if (totalInstallments) formData.append('totalInstallments', totalInstallments);
    formData.append('amount', amount);
    if (projectRecurring) formData.append('projectRecurring', 'true');
    
    showLoading('Salvando transação...');
    
    startTransition(() => {
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

  const isDecember = date ? date.getMonth() === 11 : false;

  return (
    <>
      <AddAccountPromptDialog open={promptOpen} onOpenChange={setPromptOpen} />
      <Dialog open={open} onOpenChange={setOpen}>
        <Button 
          size="sm" 
          onClick={handleTriggerClick}
          className={cn(
            "h-12 rounded-2xl font-black text-xs uppercase tracking-[0.15em] transition-all active:scale-90 shadow-xl",
            "bg-gradient-to-br from-[#ff6b7b] via-[#fa8292] to-[#ff6b7b] bg-[length:200%_auto] animate-gradient-slow text-white border-none shadow-[#ff6b7b]/30 hover:shadow-[#ff6b7b]/50 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-[#ff6b7b] focus-visible:ring-offset-2",
            fullWidth && "w-full justify-center",
            className
          )}
        >
          {initialChargeType === 'recurring' ? (
            <>
              <Repeat className="mr-2 h-4 w-4" />
              Adicionar Recorrência
            </>
          ) : (
            <>
              <PlusCircle className="mr-2 h-4 w-4" />
              Adicionar
            </>
          )}
        </Button>
        <DialogContent className="flex flex-col h-full max-h-[92vh] sm:max-h-[85vh] md:max-w-xl bg-white/95 backdrop-blur-2xl border-none rounded-[40px] shadow-2xl p-0 overflow-hidden" mobileOptimized={true}>
          <DialogHeader className="p-6 sm:p-10 pb-4 sm:pb-8 bg-white/50 border-b border-[#2D241E]/5 space-y-2 sm:space-y-3">
            <div className="flex items-center gap-3 mb-1 sm:mb-2">
                <div className="h-2 w-2 rounded-full bg-[#ff6b7b] animate-pulse" />
                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] text-[#ff6b7b]">Nova Transação</span>
            </div>
            <DialogTitle className="text-2xl sm:text-4xl font-headline italic text-[#2D241E] tracking-tight">Registrar <span className="text-[#ff6b7b]">Movimentação</span></DialogTitle>
            <DialogDescription className="text-sm sm:text-lg font-bold text-[#2D241E]/40 leading-relaxed italic">
              Organize suas finanças registrando entradas, saídas ou transferências.
            </DialogDescription>
          </DialogHeader>

          {/* Premium Stepper */}
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

          <form onSubmit={handleFinalSubmit} className="flex flex-1 flex-col justify-between overflow-hidden bg-white/30">
            <div className="flex-1 space-y-6 sm:space-y-8 overflow-y-auto px-6 py-6 sm:px-10 sm:py-10 min-h-0 overscroll-contain custom-scrollbar">
              <AnimatePresence mode="wait">
                  {step === 1 && (
                      <motion.div key="step1" variants={formVariants} initial="hidden" animate="visible" exit="exit" className="space-y-8">
                          <div className="space-y-4">
                              <label htmlFor="description_field" className="text-[10px] font-black uppercase tracking-[0.2em] text-[#2D241E]/30 ml-1">Descrição do Lançamento</label>
                              <Input 
                                id="description_field" 
                                placeholder="O que você está pagando ou recebendo?" 
                                value={description} 
                                onChange={(e) => setDescription(e.target.value)} 
                                className="h-16 rounded-2xl border-white border-2 bg-white/60 text-lg font-bold text-[#2D241E] focus:bg-white focus:border-[#ff6b7b] focus:ring-4 focus:ring-[#ff6b7b]/5 transition-all shadow-sm placeholder:text-[#2D241E]/20" 
                              />
                              {state?.errors?.description && <p className="text-xs font-black text-[#ff6b7b] ml-1 uppercase tracking-widest">{state.errors.description[0]}</p>}
                          </div>
                          
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
                              {state?.errors?.category && <p className="text-xs font-black text-[#ff6b7b] ml-1 uppercase tracking-widest">{state.errors.category[0]}</p>}
                          </div>
                      </motion.div>
                  )}

                  {step === 2 && (
                       <motion.div key="step2" variants={formVariants} initial="hidden" animate="visible" exit="exit" className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <label htmlFor="type_field" className="text-[10px] font-black uppercase tracking-[0.2em] text-[#2D241E]/30 ml-1">Tipo de Operação</label>
                                    <Select value={transactionType} onValueChange={(value) => setTransactionType(value as any)}>
                                        <SelectTrigger id="type_field" className="h-16 rounded-2xl border-white border-2 bg-white/60 text-lg font-bold text-[#2D241E] transition-all hover:bg-white focus:ring-4 focus:ring-[#ff6b7b]/5">
                                            <SelectValue placeholder="Tipo" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-[28px] border-white/40 shadow-2xl backdrop-blur-3xl bg-[#fdfcf7]/95 p-2">
                                            <SelectItem value="expense" className="font-black rounded-xl py-3 px-4 text-[#ff6b7b]">Saída / Despesa</SelectItem>
                                            <SelectItem value="income" className="font-black rounded-xl py-3 px-4 text-emerald-600">Entrada / Receita</SelectItem>
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
                                      <label htmlFor="sourceAccountId_field" className="text-[10px] font-black uppercase tracking-[0.2em] text-[#2D241E]/30 ml-1">De onde sai o dinheiro?</label>
                                      <Select value={sourceAccountId || ''} onValueChange={(value) => setSourceAccountId(value)}>
                                          <SelectTrigger id="sourceAccountId_field" className="h-16 rounded-2xl border-white border-2 bg-white/60 text-lg font-bold text-[#2D241E] transition-all hover:bg-white focus:ring-4 focus:ring-[#ff6b7b]/5">
                                            <SelectValue placeholder="Selecione a conta de origem" />
                                          </SelectTrigger>
                                          <SelectContent className="rounded-[28px] border-white/40 shadow-2xl backdrop-blur-3xl bg-[#fdfcf7]/95 p-2">
                                            {availableSources.map(item => <SelectItem key={item.value} value={item.value} className="font-black rounded-xl py-3 px-4">{item.name}</SelectItem>)}
                                          </SelectContent>
                                      </Select>
                                  </div>
                                )}
                                
                                {(transactionType === 'income' || transactionType === 'transfer') && (
                                  <div className="space-y-4">
                                      <label htmlFor="destinationAccountId_field" className="text-[10px] font-black uppercase tracking-[0.2em] text-[#2D241E]/30 ml-1">Para onde vai o dinheiro?</label>
                                      <Select value={destinationAccountId || ''} onValueChange={(value) => setDestinationAccountId(value)}>
                                          <SelectTrigger id="destinationAccountId_field" className="h-16 rounded-2xl border-white border-2 bg-white/60 text-lg font-bold text-[#2D241E] transition-all hover:bg-white focus:ring-4 focus:ring-[#ff6b7b]/5">
                                            <SelectValue placeholder="Selecione a conta de destino" />
                                          </SelectTrigger>
                                          <SelectContent className="rounded-[28px] border-white/40 shadow-2xl backdrop-blur-3xl bg-[#fdfcf7]/95 p-2">
                                            {availableDestinations.map(item => <SelectItem key={item.value} value={item.value} className="font-black rounded-xl py-3 px-4">{item.name}</SelectItem>)}
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
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#2D241E]/30 ml-1">Frequência e Lançamento</label>
                                    <RadioGroup value={chargeType} onValueChange={(value) => setChargeType(value as any)} className="grid grid-cols-3 gap-4">
                                        {[
                                            { id: 'single', label: 'Único', icon: Check },
                                            { id: 'recurring', label: 'Fixo', icon: Repeat },
                                            { id: 'installment', label: 'Parcelado', icon: CalendarIcon }
                                        ].map((option) => (
                                            <label 
                                                key={option.id}
                                                htmlFor={option.id}
                                                className={cn(
                                                    "flex flex-col items-center justify-center p-4 rounded-3xl border-2 transition-all cursor-pointer gap-2",
                                                    chargeType === option.id 
                                                        ? "bg-[#2D241E] border-[#2D241E] text-white shadow-xl scale-105" 
                                                        : "bg-white border-white hover:border-[#2D241E]/10 text-[#2D241E]/40"
                                                )}
                                            >
                                                <RadioGroupItem value={option.id} id={option.id} className="sr-only" />
                                                <option.icon className="h-5 w-5" />
                                                <span className="text-[10px] font-black uppercase tracking-widest">{option.label}</span>
                                            </label>
                                        ))}
                                    </RadioGroup>

                                    {chargeType === 'installment' && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 animate-in fade-in slide-in-from-top-4 duration-500">
                                            <div className="space-y-4">
                                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#2D241E]/30 ml-1">Qtd. de Parcelas</label>
                                                <Input type="number" placeholder="Ex: 12" value={totalInstallments} onChange={e => setTotalInstallments(e.target.value)} className="h-16 rounded-2xl border-white border-2 bg-white/60 text-lg font-bold text-[#2D241E]" />
                                            </div>
                                            <div className="space-y-4">
                                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#2D241E]/30 ml-1">Valor da Parcela</label>
                                                <Input type="number" step="0.01" placeholder="R$ 0,00" value={installmentValue} onChange={e => setInstallmentValue(e.target.value)} className="h-16 rounded-2xl border-white border-2 bg-white/60 text-lg font-bold text-[#2D241E]" />
                                            </div>
                                        </div>
                                    )}

                                    {chargeType === 'recurring' && !isDecember && (
                                        <div className="bg-[#2D241E]/5 p-6 rounded-3xl border border-[#2D241E]/5 flex items-start gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
                                            <Checkbox id="projectRecurring" checked={projectRecurring} onCheckedChange={(checked) => setProjectRecurring(checked as boolean)} className="mt-1 h-6 w-6 rounded-lg border-2 border-[#2D241E]/20 data-[state=checked]:bg-[#ff6b7b] data-[state=checked]:border-[#ff6b7b]" />
                                            <div className="space-y-1">
                                                <label htmlFor="projectRecurring" className="text-sm font-black text-[#2D241E] leading-tight cursor-pointer">Replicar até o fim do ano?</label>
                                                <p className="text-xs font-bold text-[#2D241E]/40 leading-relaxed uppercase tracking-widest">Cria uma cópia automática para cada mês restante de 2026.</p>
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
                                        type="number" 
                                        step="0.01" 
                                        placeholder="0,00" 
                                        value={amount} 
                                        onChange={(e) => setAmount(e.target.value)} 
                                        readOnly={chargeType === 'installment'}
                                        className={cn(
                                            "h-24 pl-20 text-4xl font-black rounded-3xl border-white border-4 bg-white shadow-lg tracking-tighter text-[#2D241E] transition-all",
                                            chargeType === 'installment' ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "focus:border-[#ff6b7b] focus:ring-4 focus:ring-[#ff6b7b]/5"
                                        )}
                                    />
                                </div>
                                {state?.errors?.amount && <p className="text-xs font-black text-[#ff6b7b] ml-1 uppercase tracking-widest">{state.errors.amount[0]}</p>}
                            </div>

                            {transactionType === 'expense' && !isCreditCardTransaction && (
                                <div className="space-y-4">
                                    <label htmlFor="paymentMethod_field" className="text-[10px] font-black uppercase tracking-[0.2em] text-[#2D241E]/30 ml-1">Forma de Pagamento</label>
                                    <Select value={paymentMethod || ''} onValueChange={setPaymentMethod}>
                                        <SelectTrigger id="paymentMethod_field" className="h-16 rounded-2xl border-white border-2 bg-white/60 text-lg font-bold text-[#2D241E] transition-all hover:bg-white focus:ring-4 focus:ring-[#ff6b7b]/5">
                                            <SelectValue placeholder="Como você pagou?" />
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
                      disabled={(step === 1 && !isStep1Valid) || (step === 2 && !isStep2Valid)} 
                      className="h-14 sm:h-16 px-6 sm:px-12 rounded-2xl font-black uppercase tracking-[0.2em] bg-[#2D241E] text-white hover:bg-[#4A3B32] transition-all shadow-[0_10px_30px_rgba(45,36,30,0.2)] disabled:opacity-30 text-[10px] sm:text-xs"
                    >
                        Próximo Passo
                    </Button>
                ) : (
                    <Button 
                      type="submit" 
                      className="flex-1 sm:flex-none h-14 sm:h-16 px-6 sm:px-12 rounded-2xl font-black uppercase tracking-[0.2em] bg-gradient-to-r from-[#ff6b7b] to-[#ff8e9a] text-white hover:shadow-[0_10px_30px_rgba(255,107,123,0.3)] transition-all shadow-xl border-none text-[10px] sm:text-xs"
                    >
                        Finalizar e Salvar
                    </Button>
                )}
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
