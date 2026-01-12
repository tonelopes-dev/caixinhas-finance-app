
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
  disabled?: boolean; // Para casos específicos como saque sem saldo
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Salvando...' : 'Salvar'}
    </Button>
  );
}

export function GoalTransactionDialog({ type, goalId, accounts, onComplete, disabled }: GoalTransactionDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [promptOpen, setPromptOpen] = useState(false);
  const { toast } = useToast();
  const { showLoading, hideLoading } = useLoading();
  
  const hasNoAccounts = accounts.length === 0;
  
  const handleTriggerClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (disabled) {
      // Se está desabilitado (ex: saque sem saldo), não faz nada
      return;
    }
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
    } else if (state.message) {
      hideLoading();
      toast({ title: 'Erro', description: state.message, variant: 'destructive' });
    }
  }, [state, toast, onComplete, hideLoading]);

  // Limpa o estado ao fechar o diálogo
  useEffect(() => {
    if (!isOpen) {
        // Reset state logic if needed
    }
  }, [isOpen]);

  return (
    <>
      <AddAccountPromptDialog open={promptOpen} onOpenChange={setPromptOpen} />
      <Dialog open={isOpen && !hasNoAccounts} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button 
            variant={type === 'deposit' ? 'default' : 'secondary'} 
            size="sm" 
            onClick={handleTriggerClick}
            disabled={disabled}
          >
            <Icon className="mr-2 h-4 w-4" />
            {buttonLabel}
          </Button>
        </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] md:max-h-none" mobileOptimized={true}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Insira o valor e selecione a conta que deseja {type === 'deposit' ? 'usar para depositar' : 'receber a retirada'}.
          </DialogDescription>
        </DialogHeader>
        <form 
          action={formAction}
          onSubmit={(e) => {
            const action = type === 'deposit' ? 'Depositando' : 'Retirando';
            showLoading(`${action}...`, false);
          }}
        >
          <input type="hidden" name="goalId" value={goalId} />
          <div className="grid gap-4 py-4">
            {/* CORRIGIDO: Campo de seleção de conta adicionado */}
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="accountId" className="text-right">{accountLabel}</Label>
                <Select name="accountId">
                    <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Selecione uma conta" />
                    </SelectTrigger>
                    <SelectContent>
                        {accounts.map(account => (
                            <SelectItem key={account.id} value={account.id}>
                                {account.name} - {account.bank}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {state.errors?.accountId && <p className="col-span-4 text-right text-sm font-medium text-destructive">{state.errors.accountId[0]}</p>}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">Valor</Label>
              <Input id="amount" name="amount" placeholder="R$ 0,00" className="col-span-3" />
              {state.errors?.amount && <p className="col-span-4 text-right text-sm font-medium text-destructive">{state.errors.amount[0]}</p>}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">Descrição</Label>
              <Input id="description" name="description" placeholder="Ex: Férias de verão (opcional)" className="col-span-3" />
               {state.errors?.description && <p className="col-span-4 text-right text-sm font-medium text-destructive">{state.errors.description[0]}</p>}
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="ghost">Cancelar</Button>
            </DialogClose>
            <SubmitButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
    </>
  );
}
