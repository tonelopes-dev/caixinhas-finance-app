'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
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
import { Mail, Send, Users, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { sendPartnerInvite, getVaultMembers } from '@/app/invite/actions';
import type { GenericState } from '@/app/auth/actions';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';

function SubmitButton({ disabled }: { disabled?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button disabled={pending || disabled}>
      <Send className="mr-2 h-4 w-4" />
      {pending ? 'Enviando...' : 'Enviar Convite'}
    </Button>
  );
}

type InviteFormProps = {
  userVaults: { id: string; name: string }[];
  userId: string;
};

export function InviteForm({ userVaults, userId }: InviteFormProps) {
  const initialState: GenericState = {};
  const [state, dispatch] = useActionState(sendPartnerInvite, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [selectedVaultId, setSelectedVaultId] = useState<string>('');
  const [vaultMembers, setVaultMembers] = useState<any[]>([]);

  useEffect(() => {
    if (state.message && !state.errors) {
      toast({ title: 'Sucesso!', description: state.message });
      formRef.current?.reset();
      setSelectedVaultId('');
      setVaultMembers([]);
    } else if (state.message && state.errors) {
      toast({
        title: 'Erro de Validação',
        description: state.message,
        variant: 'destructive',
      });
    }
  }, [state, toast]);

  useEffect(() => {
    if (selectedVaultId) {
      getVaultMembers(selectedVaultId).then(setVaultMembers);
    } else {
      setVaultMembers([]);
    }
  }, [selectedVaultId]);

  return (
    <Card>
      <form action={dispatch} ref={formRef}>
        <input type="hidden" name="userId" value={userId} />
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
            <Select name="vaultId" required onValueChange={setSelectedVaultId} value={selectedVaultId}>
              <SelectTrigger id="vaultId">
                <SelectValue placeholder="Escolha um cofre para convidar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="personal" className="text-muted-foreground font-medium">
                  Minha Conta Pessoal (Privada)
                </SelectItem>
                {userVaults.map((vault) => (
                  <SelectItem key={vault.id} value={vault.id}>
                    {vault.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {state?.errors?.vaultId && (
              <p className="text-sm font-medium text-destructive">
                {state.errors.vaultId[0]}
              </p>
            )}
          </div>

          {selectedVaultId === 'personal' && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Sua conta pessoal é privada e não pode receber membros. Para compartilhar finanças, crie um novo cofre compartilhado no painel.
              </AlertDescription>
            </Alert>
          )}
          
          {vaultMembers.length > 0 && selectedVaultId !== 'personal' && (
            <Alert>
              <Users className="h-4 w-4" />
              <AlertDescription>
                <div className="font-medium mb-2">Membros atuais deste cofre:</div>
                <div className="space-y-2">
                  {vaultMembers.map((member) => (
                    <div key={member.userId} className="flex items-center gap-2 text-sm">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={member.user.avatarUrl || undefined} />
                        <AvatarFallback className="text-xs">
                          {member.user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span>{member.user.name}</span>
                      <span className="text-muted-foreground">({member.user.email})</span>
                      {member.role === 'owner' && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                          Dono
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          )}
          
          {selectedVaultId && selectedVaultId !== 'personal' && (
            <Alert variant="default" className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800 dark:text-blue-200">
                O usuário convidado precisa estar cadastrado no sistema para receber o convite.
              </AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">E-mail do Convidado(a)</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="nome@example.com"
              required
              disabled={selectedVaultId === 'personal'}
            />
            {state?.errors?.email && (
              <p className="text-sm font-medium text-destructive">
                {state.errors.email[0]}
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <SubmitButton disabled={selectedVaultId === 'personal'} />
        </CardFooter>
      </form>
    </Card>
  );
}
