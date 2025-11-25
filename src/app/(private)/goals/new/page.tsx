
'use client';

import { useActionState, useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useToast } from '@/hooks/use-toast';
import { createGoalAction } from '@/app/(private)/goals/actions';
import { VaultService } from '@/services/vault.service';
import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Lock, PiggyBank, Users } from 'lucide-react';

type Vault = { id: string; name: string };
type GoalFormState = { errors?: { name?: string[]; emoji?: string[]; targetAmount?: string[]; ownerId?: string[] }; message?: string };

const commonEmojis = ['✈️', '🏡', '🚗', '🎓', '💍', '👶', '🛠️', '🎁', '🎮', '❤️', '💼', '💰'];

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Criando...' : 'Criar Caixinha'}
    </Button>
  );
}

export default function NewGoalPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  
  const initialState: GoalFormState = {};
  const [state, dispatch] = useActionState(createGoalAction, initialState);

  const [ownerType, setOwnerType] = useState('user');
  const [ownerId, setOwnerId] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('💰');
  const [userVaults, setUserVaults] = useState<Vault[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
    if (status === 'authenticated' && session?.user?.id) {
      const currentUserId = session.user.id;
      // Define o proprietário padrão como o usuário logado
      setOwnerId(currentUserId);
      
      const fetchVaults = async () => {
        try {
          const vaults = await VaultService.getUserVaults(currentUserId);
          setUserVaults(vaults.map(v => ({ id: v.id, name: v.name })));
        } catch (error) {
          console.error("Erro ao buscar cofres:", error);
          toast({ title: 'Erro', description: 'Não foi possível carregar seus cofres.', variant: 'destructive' });
        } finally {
          setIsLoading(false);
        }
      };
      fetchVaults();
    }
  }, [status, router, session, toast]);

  useEffect(() => {
    // Atualiza o ownerId quando o tipo de proprietário muda
    if (ownerType === 'user') {
      if (session?.user?.id) setOwnerId(session.user.id);
    } else {
      // Se houver cofres, define o primeiro como padrão, senão limpa
      setOwnerId(userVaults.length > 0 ? userVaults[0].id : '');
    }
  }, [ownerType, session, userVaults]);

  useEffect(() => {
    if (state.message || state.errors) {
      toast({
        title: state.errors ? "Erro de Validação" : "Aviso",
        description: state.message || 'Verifique os campos do formulário.',
        variant: 'destructive',
      });
    } else if(state.success) {
        toast({ title: 'Sucesso!', description: 'Sua caixinha foi criada.' });
        router.push('/goals');
    }
  }, [state, toast, router]);


  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <Button asChild variant="ghost" className="mb-4">
          <Link href="/goals">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Link>
        </Button>
        <Card>
          <form action={dispatch}>
            {/* Campos ocultos que serão gerenciados pelo estado do componente */}
            <input type="hidden" name="emoji" value={selectedEmoji} />
            <input type="hidden" name="ownerId" value={ownerId} />
            <input type="hidden" name="ownerType" value={ownerType} />
            {/* A visibilidade agora é definida na action do servidor */}
            <input type="hidden" name="visibility" value={ownerType === 'user' ? 'private' : 'shared'} />

            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-headline">
                <PiggyBank className="h-6 w-6 text-primary" />
                Criar Nova Caixinha
              </CardTitle>
              <CardDescription>
                Decida onde sua nova meta será guardada: em seu espaço pessoal ou em um cofre compartilhado.
              </CardDescription>
            </CardHeader>

            <CardContent className="grid gap-6">
              <div className="space-y-3">
                <Label>Onde guardar a caixinha?</Label>
                 <RadioGroup value={ownerType} onValueChange={setOwnerType} className="grid grid-cols-2 gap-4">
                    <Label className={cn("flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer", ownerType === 'user' && "border-primary")}>
                      <RadioGroupItem value="user" id="ownerUser" className="sr-only" />
                      <Lock className="mb-3 h-6 w-6" />
                      Pessoal (Só eu vejo)
                    </Label>
                     <Label className={cn("flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer", ownerType === 'vault' && "border-primary")}>
                      <RadioGroupItem value="vault" id="ownerVault" className="sr-only" />
                      <Users className="mb-3 h-6 w-6" />
                      Cofre (Compartilhado)
                    </Label>
                </RadioGroup>
              </div>

              {ownerType === 'vault' && (
                  <div className="space-y-2">
                    <Label htmlFor="vault-select">Selecione o Cofre</Label>
                    <Select value={ownerId} onValueChange={setOwnerId} required>
                      <SelectTrigger id="vault-select">
                        <SelectValue placeholder={userVaults.length > 0 ? "Selecione um cofre..." : "Nenhum cofre encontrado"} />
                      </SelectTrigger>
                      <SelectContent>
                        {userVaults.length > 0 ? (
                          userVaults.map(vault => <SelectItem key={vault.id} value={vault.id}>{vault.name}</SelectItem>)
                        ) : (
                          <SelectItem value="" disabled>Você não participa de nenhum cofre</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    {state?.errors?.ownerId && <p className="text-sm font-medium text-destructive">{state.errors.ownerId[0]}</p>}
                  </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">Nome da Meta</Label>
                <Input id="name" name="name" placeholder="Ex: Viagem dos Sonhos" required />
                {state?.errors?.name && <p className="text-sm font-medium text-destructive">{state.errors.name[0]}</p>}
              </div>

              <div className="space-y-2">
                <Label>Ícone (Emoji)</Label>
                <div className="grid grid-cols-6 gap-2">
                  {commonEmojis.map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setSelectedEmoji(emoji)}
                      className={cn("flex h-12 w-12 items-center justify-center rounded-lg border-2 text-2xl transition-all", selectedEmoji === emoji ? "border-primary bg-primary/10" : "border-border bg-muted/50")}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
                <Input
                  id="emoji-custom"
                  placeholder="Ou digite um emoji aqui"
                  maxLength={2}
                  className="mt-2 text-center"
                  onChange={(e) => setSelectedEmoji(e.target.value)}
                />
                {state?.errors?.emoji && <p className="text-sm font-medium text-destructive">{state.errors.emoji[0]}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetAmount">Valor da Meta (R$)</Label>
                <Input
                  id="targetAmount"
                  name="targetAmount"
                  type="text"
                  inputMode="decimal"
                  placeholder="R$ 20.000,00"
                  required
                  onChange={(e) => {
                      let value = e.target.value.replace(/\D/g, '');
                      if (value) {
                        const numberValue = Number(value) / 100;
                        e.target.value = numberValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                      } else {
                        e.target.value = '';
                      }
                  }}
                />
                {state?.errors?.targetAmount && <p className="text-sm font-medium text-destructive">{state.errors.targetAmount[0]}</p>}
              </div>

            </CardContent>
            <CardFooter>
              <SubmitButton />
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
