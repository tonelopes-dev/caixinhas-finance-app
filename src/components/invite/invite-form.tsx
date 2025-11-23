'use client';

import { useActionState, useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Mail, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { sendPartnerInvite } from '@/app/invite/actions';
import type { GenericState } from '@/app/auth/actions';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button disabled={pending}>
      <Send className="mr-2 h-4 w-4" />
      {pending ? 'Enviando...' : 'Enviar Convite'}
    </Button>
  );
}

type InviteFormProps = {
  userVaults: { id: string; name: string }[];
};

export function InviteForm({ userVaults }: InviteFormProps) {
  const initialState: GenericState = {};
  const [state, dispatch] = useActionState(sendPartnerInvite, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.message && !state.errors) {
      toast({ title: 'Sucesso!', description: state.message });
      formRef.current?.reset();
    } else if (state.message && state.errors) {
      toast({
        title: 'Erro de Validação',
        description: state.message,
        variant: 'destructive',
      });
    }
  }, [state, toast]);

  return (
    <Card>
      <form action={dispatch} ref={formRef}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline">
            <Mail className="h-6 w-6 text-primary" />
            Convidar para um Cofre
          </CardTitle>
          <CardDescription>
            Envie um convite para que outra pessoa possa participar de um dos
            seus cofres.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="vaultId">Selecione o Cofre</Label>
            <Select name="vaultId" required>
              <SelectTrigger id="vaultId">
                <SelectValue placeholder="Escolha um cofre para convidar" />
              </SelectTrigger>
              <SelectContent>
                {userVaults.map((vault) => (
                  <SelectItem key={vault.id} value={vault.id}>
                    {vault.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {state?.errors?.vaultName && (
              <p className="text-sm font-medium text-destructive">
                {state.errors.vaultName[0]}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">E-mail do Convidado(a)</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="nome@example.com"
              required
            />
            {state?.errors?.email && (
              <p className="text-sm font-medium text-destructive">
                {state.errors.email[0]}
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <SubmitButton />
        </CardFooter>
      </form>
    </Card>
  );
}