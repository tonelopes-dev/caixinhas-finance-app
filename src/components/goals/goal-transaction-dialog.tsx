"use client"

import React, { useEffect, useRef, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { goalTransaction, type GoalTransactionState } from '@/app/actions';
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
};

export function GoalTransactionDialog({ type, goalId }: GoalTransactionDialogProps) {
  const initialState: GoalTransactionState = {};
  const [state, dispatch] = useActionState(goalTransaction, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [open, setOpen] = React.useState(false);

  useEffect(() => {
    if (state.message && !state.errors) {
      toast({
        title: "Sucesso!",
        description: state.message,
      });
      formRef.current?.reset();
      setOpen(false);
    } else if (state.message && state.errors) {
      toast({
        title: "Erro de Validação",
        description: state.message,
        variant: "destructive",
      });
    }
  }, [state, toast]);

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
        <form ref={formRef} action={dispatch}>
            <input type="hidden" name="type" value={type} />
            <input type="hidden" name="goalId" value={goalId} />
            <div className="grid gap-4 py-4">
                <div className="space-y-2">
                <Label htmlFor="amount" className="text-right">
                    Valor
                </Label>
                <Input id="amount" name="amount" type="number" step="0.01" placeholder="R$ 0,00" />
                {state?.errors?.amount && <p className="text-sm font-medium text-destructive">{state.errors.amount[0]}</p>}
                </div>
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="ghost">Cancelar</Button>
                </DialogClose>
                <SubmitButton type={type} />
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
