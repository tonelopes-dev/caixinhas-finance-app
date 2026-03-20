
'use client';

import React, { useEffect, useState, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose
} from '@/components/ui/mobile-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { ArrowDown, ArrowUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { depositToGoalAction, withdrawFromGoalAction } from '@/app/(private)/goals/actions';
import { AddAccountPromptDialog } from '@/components/transactions/add-account-prompt-dialog';
import { cn } from '@/lib/utils';
import type { Account } from '@/lib/definitions';
import { useLoading } from '@/components/providers/loading-provider';

const initialState = {
  message: '',
  errors: undefined,
  success: false,
};

type GoalTransactionDialogProps = {
  type: 'deposit' | 'withdrawal';
  goalId: string;
  accounts: Account[];
  onComplete?: () => void;
  disabled?: boolean; 
  className?: string;
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Salvando...' : 'Salvar'}
    </Button>
  );
}

export function GoalTransactionDialog({ type, goalId, accounts, onComplete, disabled, className }: GoalTransactionDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [promptOpen, setPromptOpen] = useState(false);
  const { toast } = useToast();
  const { showLoading, hideLoading } = useLoading();
  
  const hasNoAccounts = accounts.length === 0;
  
  const handleTriggerClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (disabled) return;
    if (hasNoAccounts) {
      setPromptOpen(true);
    } else {
      setIsOpen(true);
    }
  };

  const actionToUse = type === 'deposit' ? depositToGoalAction : withdrawFromGoalAction;
  const [state, formAction] = useActionState(actionToUse, initialState);

  const Icon = type === 'deposit' ? ArrowUp : ArrowDown;
  const title = type === 'deposit' ? 'Fazer um depósito' : 'Fazer uma retirada';
  const buttonLabel = type === 'deposit' ? 'Depositar' : 'Retirar';
  const accountLabel = type === 'deposit' ? 'Da conta' : 'Para a conta';

  useEffect(() => {
    if (state.success) {
      hideLoading();
      toast({ title: 'Sucesso!', description: state.message });
      setIsOpen(false);
      onComplete?.();
    } else if (state.message || state.errors) {
      hideLoading();
      const firstError = state.errors ? Object.values(state.errors)[0]?.[0] : undefined;
      toast({ 
        title: 'Ops! Algo deu errado', 
        description: state.message || firstError || 'Verifique os campos e tente novamente.', 
        variant: 'destructive' 
      });
    }
  }, [state, toast, onComplete, hideLoading]);

  return (
    <>
      <AddAccountPromptDialog open={promptOpen} onOpenChange={setPromptOpen} />
      <Dialog open={isOpen && !hasNoAccounts} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button 
            variant={type === 'deposit' ? 'default' : 'outline'} 
            size="lg" 
            onClick={handleTriggerClick}
            disabled={disabled}
            className={cn(
                "w-full h-14 rounded-[20px] font-black uppercase tracking-widest text-sm transition-all active:scale-95",
                type === 'deposit' 
                    ? "bg-[#ff6b7b] hover:bg-[#fa8292] text-white shadow-lg shadow-[#ff6b7b]/30" 
                    : "border-2 border-[#ff6b7b]/20 text-[#ff6b7b] hover:bg-[#ff6b7b]/5",
                className
            )}
          >
            <Icon className="mr-2 h-5 w-5" />
            {buttonLabel}
          </Button>
        </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden border-none shadow-2xl bg-[#fdfcf7]" mobileOptimized={true}>
        <DialogHeader className="p-8 pb-6 bg-white/50 border-b border-[#2D241E]/5 space-y-2">
          <div className="flex items-center gap-3 mb-1">
              <div className="h-2 w-2 rounded-full bg-[#ff6b7b] animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#ff6b7b]">Minhas Caixinhas</span>
          </div>
          <DialogTitle className="text-3xl font-headline italic text-[#2D241E] tracking-tight">{title.split(' ')[0]} <span className="text-[#ff6b7b]">{title.split(' ').slice(1).join(' ')}</span></DialogTitle>
          <DialogDescription className="text-sm font-bold text-[#2D241E]/40 italic leading-relaxed">
            Insira o valor e selecione a conta que deseja {type === 'deposit' ? 'usar para depositar' : 'receber a retirada'}.
          </DialogDescription>
        </DialogHeader>
        <form 
          action={formAction}
          onSubmit={(e) => {
            const action = type === 'deposit' ? 'Depositando' : 'Retirando';
            showLoading(`${action}...`);
          }}
        >
          <div className="grid gap-6 p-8">
            <div className="space-y-2">
                <Label htmlFor="accountId" className="text-xs font-black uppercase tracking-widest text-[#2D241E]/40">{accountLabel}</Label>
                <Select name="accountId">
                    <SelectTrigger className="h-12 rounded-xl border-2 border-[#2D241E]/5 bg-white font-bold text-[#2D241E] focus:ring-[#ff6b7b]/20 transition-all">
                        <SelectValue placeholder="Selecione uma conta" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-[#2D241E]/5 shadow-xl">
                        {accounts.map(account => (
                            <SelectItem key={account.id} value={account.id} className="font-bold py-3 focus:bg-[#ff6b7b]/10 focus:text-[#ff6b7b] rounded-xl cursor-pointer">
                                {account.name} - {account.bank}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {state.errors?.accountId && <p className="text-xs font-bold text-destructive italic">{state.errors.accountId[0]}</p>}
            </div>
            <div className="space-y-2">
              <input type="hidden" name="goalId" value={goalId} />
              <Label htmlFor="amount" className="text-xs font-black uppercase tracking-widest text-[#2D241E]/40">Valor</Label>
              <Input 
                id="amount" 
                name="amount" 
                placeholder="R$ 0,00" 
                inputMode="decimal"
                className="h-12 rounded-xl border-2 border-[#2D241E]/5 bg-white font-black text-lg focus:ring-[#ff6b7b]/20 transition-all placeholder:text-[#2D241E]/10" 
              />
              {state.errors?.amount && <p className="text-xs font-bold text-destructive italic">{state.errors.amount[0]}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-xs font-black uppercase tracking-widest text-[#2D241E]/40">Descrição</Label>
              <Input id="description" name="description" placeholder="Ex: Férias de verão (opcional)" className="h-12 rounded-xl border-2 border-[#2D241E]/5 bg-white font-bold focus:ring-[#ff6b7b]/20 transition-all" />
               {state.errors?.description && <p className="text-xs font-bold text-destructive italic">{state.errors.description[0]}</p>}
            </div>
          </div>
          <DialogFooter className="p-8 bg-white/50 border-t border-[#2D241E]/5 gap-3">
            <DialogClose asChild>
              <Button type="button" variant="ghost" className="h-14 flex-1 rounded-xl font-black uppercase tracking-widest text-xs text-[#2D241E]/40 hover:text-[#2D241E] hover:bg-[#2D241E]/5">Cancelar</Button>
            </DialogClose>
            <Button 
                type="submit" 
                className="h-14 flex-1 rounded-xl font-black uppercase tracking-widest text-xs bg-gradient-to-r from-[#ff6b7b] to-[#ff8e9a] text-white shadow-xl shadow-[#ff6b7b]/20 border-none hover:shadow-[#ff6b7b]/40 transition-all"
            >
                {type === 'deposit' ? 'Confirmar Depósito' : 'Confirmar Retirada'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
    </>
  );
}
