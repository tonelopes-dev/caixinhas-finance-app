
"use client"

import React, { useEffect, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { depositToGoalAction, withdrawFromGoalAction } from '@/app/goals/actions';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowDown, ArrowUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AccountService } from '@/services';
import type { Account } from '@/lib/definitions';
import { useSession } from 'next-auth/react';

type GoalTransactionDialogProps = {
  type: 'deposit' | 'withdrawal';
  goalId: string;
  onComplete?: () => void;
};

export function GoalTransactionDialog({ type, goalId, onComplete }: GoalTransactionDialogProps) {
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const { data: session } = useSession();

  useEffect(() => {
    if (open && session?.user?.id) {
      const fetchAccounts = async () => {
        // Buscamos todas as contas do usuário para ele poder escolher.
        const userAccounts = await AccountService.getUserAccounts(session.user.id);
        const nonCreditAccounts = userAccounts.filter(a => a.type !== 'credit_card');
        setAccounts(nonCreditAccounts);
      };
      fetchAccounts();
    }
  }, [open, session]);


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const amount = parseFloat(formData.get('amount') as string);
    const description = formData.get('description') as string || '';
    const accountId = formData.get('accountId') as string;

    if (!accountId) {
        toast({ title: "Erro", description: "Por favor, selecione uma conta.", variant: "destructive" });
        setIsSubmitting(false);
        return;
    }

    try {
      let result;
      if (type === 'deposit') {
        result = await depositToGoalAction(goalId, amount, accountId, description);
      } else {
        result = await withdrawFromGoalAction(goalId, amount, accountId, description);
      }

      if (result.success) {
        toast({
          title: "Sucesso!",
          description: result.message,
        });
        formRef.current?.reset();
        setOpen(false);
        onComplete?.();
      } else {
        toast({
          title: "Erro",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const title = type === 'deposit' ? 'Guardar Dinheiro' : 'Retirar Dinheiro';
  const description = type === 'deposit' ? 'Mova dinheiro de uma conta para a sua caixinha.' : 'Resgate dinheiro da sua caixinha para uma conta.';
  const buttonText = type === 'deposit' ? 'Guardar Dinheiro' : 'Retirar Dinheiro';
  const ButtonIcon = type === 'deposit' ? ArrowDown : ArrowUp;
  const accountLabel = type === 'deposit' ? 'De qual conta vai sair o dinheiro?' : 'Para qual conta vai o dinheiro?';
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex-1" variant={type === 'deposit' ? 'default' : 'secondary'}>
            <ButtonIcon className="mr-2 h-4 w-4" />
            {buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>
        <form ref={formRef} onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">
                      Valor
                  </Label>
                  <Input id="amount" name="amount" type="number" step="0.01" placeholder="R$ 0,00" required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="accountId">{accountLabel}</Label>
                    <Select name="accountId" required>
                        <SelectTrigger id="accountId">
                            <SelectValue placeholder="Selecione a conta" />
                        </SelectTrigger>
                        <SelectContent>
                            {accounts.map(account => (
                                <SelectItem key={account.id} value={account.id}>
                                    {account.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">
                      Descrição (opcional)
                  </Label>
                  <Input id="description" name="description" type="text" placeholder="Ex: Adiantamento do 13º" />
                </div>
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="ghost">Cancelar</Button>
                </DialogClose>
                <Button type="submit" disabled={isSubmitting} variant={type === 'withdrawal' ? 'destructive' : 'default'}>
                  {isSubmitting ? 'Salvando...' : buttonText}
                </Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
