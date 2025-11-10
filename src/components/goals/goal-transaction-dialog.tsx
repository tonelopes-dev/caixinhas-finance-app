"use client"

import React, { useEffect, useRef, useState as useStateReact } from 'react';
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
import { ArrowDown, ArrowUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';


function SubmitButton({ type }: { type: 'deposit' | 'withdrawal' }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} variant={type === 'withdrawal' ? 'destructive' : 'default'}>
      {pending ? 'Salvando...' : type === 'deposit' ? 'Guardar' : 'Retirar'}
    </Button>
  );
}

type GoalTransactionDialogProps = {
  type: 'deposit' | 'withdrawal';
  goalId: string;
  onComplete?: () => void;
};

export function GoalTransactionDialog({ type, goalId, onComplete }: GoalTransactionDialogProps) {
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [open, setOpen] = useStateReact(false);
  const [isSubmitting, setIsSubmitting] = useStateReact(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const amount = parseFloat(formData.get('amount') as string);
    const description = formData.get('description') as string || '';

    try {
      let result;
      if (type === 'deposit') {
        result = await depositToGoalAction(goalId, amount, description);
      } else {
        result = await withdrawFromGoalAction(goalId, amount, description);
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
  const description = type === 'deposit' ? 'Quanto você quer guardar na sua caixinha?' : 'Quanto você quer retirar da sua caixinha?';
  const buttonText = type === 'deposit' ? 'Guardar Dinheiro' : 'Retirar Dinheiro';
  const ButtonIcon = type === 'deposit' ? ArrowDown : ArrowUp;
  
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
                  <Label htmlFor="amount" className="text-right">
                      Valor
                  </Label>
                  <Input id="amount" name="amount" type="number" step="0.01" placeholder="R$ 0,00" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-right">
                      Descrição (opcional)
                  </Label>
                  <Input id="description" name="description" type="text" placeholder="Ex: Mesada de janeiro" />
                </div>
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="ghost">Cancelar</Button>
                </DialogClose>
                <Button type="submit" disabled={isSubmitting} variant={type === 'withdrawal' ? 'destructive' : 'default'}>
                  {isSubmitting ? 'Salvando...' : type === 'deposit' ? 'Guardar' : 'Retirar'}
                </Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
