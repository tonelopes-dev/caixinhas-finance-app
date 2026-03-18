
'use client';

import { useActionState, useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useToast } from '@/hooks/use-toast';
import { createGoalAction, getUserVaultsAction, getCurrentVaultContextAction } from '@/app/(private)/goals/actions';
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
import { ArrowLeft, Lock, PiggyBank, Users, Check, Sparkles } from 'lucide-react';
import { DashboardBackground } from '@/components/dashboard/dashboard-background';
import { motion, AnimatePresence } from 'framer-motion';

type Vault = { id: string; name: string };
type GoalFormState = { errors?: { name?: string[]; emoji?: string[]; targetAmount?: string[]; ownerId?: string[] }; message?: string; success?: boolean };

const commonEmojis = ['✈️', '🏡', '🚗', '🎓', '💍', '👶', '🛠️', '🎁', '🎮', '❤️', '💼', '💰'];

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button 
      type="submit" 
      disabled={pending}
      className="h-14 w-full rounded-2xl font-black uppercase tracking-widest bg-gradient-to-br from-[#ff6b7b] to-[#fa8292] text-white hover:shadow-[#ff6b7b]/40 transition-all shadow-xl border-none"
    >
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
      
      const init = async () => {
        try {
          const [vaults, currentVaultId] = await Promise.all([
            getUserVaultsAction(),
            getCurrentVaultContextAction()
          ]);
          
          setUserVaults(vaults);

          if (currentVaultId && currentVaultId !== currentUserId) {
            const vault = vaults.find(v => v.id === currentVaultId);
            if (vault) {
              setOwnerType('vault');
              setOwnerId(currentVaultId);
            } else {
              setOwnerType('user');
              setOwnerId(currentUserId);
            }
          } else {
            setOwnerType('user');
            setOwnerId(currentUserId);
          }
        } catch (error) {
          console.error("Erro ao inicializar:", error);
          toast({ title: 'Erro', description: 'Não foi possível carregar as informações iniciais.', variant: 'destructive' });
          setOwnerType('user');
          setOwnerId(currentUserId);
        } finally {
          setIsLoading(false);
        }
      };
      
      init();
    }
  }, [status, router, session, toast]);

  const handleOwnerTypeChange = (type: string) => {
    setOwnerType(type);
    if (type === 'user') {
      if (session?.user?.id) setOwnerId(session.user.id);
    } else {
      if (userVaults.length > 0) {
        const currentSelectedVault = userVaults.find(v => v.id === ownerId);
        if (!currentSelectedVault) {
            setOwnerId(userVaults[0].id);
        }
      } else {
        setOwnerId('');
      }
    }
  };

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
      <div className="flex min-h-screen w-full items-center justify-center bg-[#fdfcf7]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#ff6b7b] border-t-transparent" />
      </div>
    );
  }

  return (
    <DashboardBackground>
      <div className="flex min-h-[calc(100vh-theme(spacing.16))] flex-1 flex-col gap-4 p-4 md:gap-8 md:p-10 items-center justify-center max-w-4xl mx-auto">
        <div className="w-full max-w-xl">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-8 flex items-center justify-between"
          >
            <Link 
              href="/goals" 
              className="group flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/50 backdrop-blur-md border border-white/80 shadow-sm hover:bg-white transition-all text-[#2D241E]/50 hover:text-[#2D241E] font-black uppercase tracking-widest text-[10px]"
            >
              <ArrowLeft className="h-4 w-4 transform group-hover:-translate-x-1 transition-transform" />
              Voltar
            </Link>
            
            <div className="text-right">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#ff6b7b]">Novo Objetivo</p>
              <h1 className="text-3xl font-bold font-headline italic text-[#2D241E]">Criar Caixinha</h1>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-[#fdfcf7] border-none rounded-[40px] shadow-2xl overflow-hidden">
              <form action={dispatch}>
                <input type="hidden" name="emoji" value={selectedEmoji} />
                <input type="hidden" name="ownerId" value={ownerId} />
                <input type="hidden" name="ownerType" value={ownerType} />
                <input type="hidden" name="visibility" value={ownerType === 'user' ? 'private' : 'shared'} />

                <CardHeader className="p-8 pb-4 bg-white/50 backdrop-blur-sm border-b border-[#2D241E]/5">
                  <CardTitle className="flex items-center gap-3 text-2xl font-bold text-[#2D241E]">
                    <div className="p-2 rounded-xl bg-[#ff6b7b]/10 text-[#ff6b7b]">
                      <Sparkles className="h-6 w-6" />
                    </div>
                    Nova Meta Financeira
                  </CardTitle>
                  <CardDescription className="text-lg font-medium text-[#2D241E]/50 italic">
                    Decida onde guardar sua nova meta e comece a poupar.
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-8 space-y-8">
                  <div className="space-y-4">
                    <Label className="text-xs font-black uppercase tracking-widest text-[#2D241E]/40 ml-1">Onde guardar a caixinha?</Label>
                     <RadioGroup value={ownerType} onValueChange={handleOwnerTypeChange} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Label 
                          htmlFor="ownerUser"
                          className={cn(
                            "flex flex-col items-center justify-center rounded-[32px] border-2 bg-white p-6 hover:bg-[#2D241E]/5 cursor-pointer transition-all duration-300 shadow-sm relative", 
                            ownerType === 'user' ? "border-[#ff6b7b] bg-[#ff6b7b]/5 ring-4 ring-[#ff6b7b]/10 shadow-lg shadow-[#ff6b7b]/10 scale-[1.02]" : "border-[#2D241E]/5"
                          )}
                        >
                          <RadioGroupItem value="user" id="ownerUser" className="sr-only" />
                          <div className={cn("p-4 rounded-2xl mb-4 transition-colors", ownerType === 'user' ? "bg-[#ff6b7b] text-white" : "bg-[#2D241E]/5 text-[#2D241E]/30")}>
                            <Lock className="h-6 w-6" />
                          </div>
                          <span className={cn("font-black uppercase tracking-widest text-[10px]", ownerType === 'user' ? "text-[#ff6b7b]" : "text-[#2D241E]/40")}>Pessoal</span>
                          <span className="text-[10px] text-center text-[#2D241E]/30 mt-1">Só você terá acesso</span>
                          {ownerType === 'user' && <Check className="absolute top-4 right-4 h-4 w-4 text-[#ff6b7b]" />}
                        </Label>

                        <Label 
                          htmlFor="ownerVault"
                          className={cn(
                            "flex flex-col items-center justify-center rounded-[32px] border-2 bg-white p-6 hover:bg-[#2D241E]/5 cursor-pointer transition-all duration-300 shadow-sm relative", 
                            ownerType === 'vault' ? "border-[#ff6b7b] bg-[#ff6b7b]/5 ring-4 ring-[#ff6b7b]/10 shadow-lg shadow-[#ff6b7b]/10 scale-[1.02]" : "border-[#2D241E]/5"
                          )}
                        >
                          <RadioGroupItem value="vault" id="ownerVault" className="sr-only" />
                          <div className={cn("p-4 rounded-2xl mb-4 transition-colors", ownerType === 'vault' ? "bg-[#ff6b7b] text-white" : "bg-[#2D241E]/5 text-[#2D241E]/30")}>
                            <Users className="h-6 w-6" />
                          </div>
                          <span className={cn("font-black uppercase tracking-widest text-[10px]", ownerType === 'vault' ? "text-[#ff6b7b]" : "text-[#2D241E]/40")}>Cofre</span>
                          <span className="text-[10px] text-center text-[#2D241E]/30 mt-1">Compartilhado com membros</span>
                          {ownerType === 'vault' && <Check className="absolute top-4 right-4 h-4 w-4 text-[#ff6b7b]" />}
                        </Label>
                    </RadioGroup>
                  </div>

                  {ownerType === 'vault' && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-3"
                      >
                        <Label htmlFor="vault-select" className="text-xs font-black uppercase tracking-widest text-[#2D241E]/40 ml-1">Selecione o Cofre</Label>
                        <Select value={ownerId} onValueChange={setOwnerId} required>
                          <SelectTrigger id="vault-select" className="h-14 rounded-2xl border-2 border-[#2D241E]/5 bg-white text-lg font-bold text-[#2D241E] transition-all shadow-sm">
                            <SelectValue placeholder={userVaults.length > 0 ? "Selecione um cofre..." : "Nenhum cofre encontrado"} />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl border-[#2D241E]/5 shadow-xl">
                            {userVaults.length > 0 ? (
                              userVaults.map(vault => <SelectItem key={vault.id} value={vault.id} className="rounded-xl font-bold text-[#2D241E] focus:bg-[#ff6b7b]/10 focus:text-[#ff6b7b]">{vault.name}</SelectItem>)
                            ) : (
                              <SelectItem value="none" disabled>Você não participa de nenhum cofre</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        {state?.errors?.ownerId && <p className="text-xs font-bold text-[#ff6b7b] ml-1">{state.errors.ownerId[0]}</p>}
                      </motion.div>
                  )}

                  <div className="space-y-3">
                    <Label htmlFor="name" className="text-xs font-black uppercase tracking-widest text-[#2D241E]/40 ml-1">Nome da Meta</Label>
                    <Input id="name" name="name" placeholder="Ex: Viagem dos Sonhos" required className="h-14 rounded-2xl border-2 border-[#2D241E]/5 bg-white text-lg font-bold text-[#2D241E] focus:border-[#ff6b7b] focus:ring-0 transition-all shadow-sm" />
                    {state?.errors?.name && <p className="text-xs font-bold text-[#ff6b7b] ml-1">{state.errors.name[0]}</p>}
                  </div>

                  <div className="space-y-4">
                    <Label className="text-xs font-black uppercase tracking-widest text-[#2D241E]/40 ml-1">Ícone (Emoji)</Label>
                    <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                      {commonEmojis.map(emoji => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => setSelectedEmoji(emoji)}
                          className={cn(
                            "flex h-12 w-12 items-center justify-center rounded-2xl border-2 text-2xl transition-all duration-300 shadow-sm hover:scale-110", 
                            selectedEmoji === emoji ? "border-[#ff6b7b] bg-[#ff6b7b]/10 ring-4 ring-[#ff6b7b]/5" : "border-[#2D241E]/5 bg-white"
                          )}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                    <div className="relative group">
                      <Input
                        id="emoji-custom"
                        placeholder="Ou digite um emoji customizado"
                        maxLength={2}
                        className="h-14 rounded-2xl border-2 border-[#2D241E]/5 bg-white text-center text-xl font-bold text-[#2D241E] focus:border-[#ff6b7b] focus:ring-0 transition-all shadow-sm"
                        onChange={(e) => setSelectedEmoji(e.target.value)}
                      />
                      <Sparkles className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#2D241E]/10 group-focus-within:text-[#ff6b7b] transition-colors" />
                    </div>
                    {state?.errors?.emoji && <p className="text-xs font-bold text-[#ff6b7b] ml-1">{state.errors.emoji[0]}</p>}
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="targetAmount" className="text-xs font-black uppercase tracking-widest text-[#2D241E]/40 ml-1">Quanto deseja guardar? (R$)</Label>
                    <Input
                      id="targetAmount"
                      name="targetAmount"
                      type="text"
                      inputMode="decimal"
                      placeholder="R$ 0,00"
                      required
                      className="h-20 rounded-[24px] border-2 border-[#2D241E]/5 bg-white text-center text-3xl font-black text-[#2D241E] focus:border-[#ff6b7b] focus:ring-0 transition-all shadow-inner"
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
                    {state?.errors?.targetAmount && <p className="text-xs font-bold text-[#ff6b7b] ml-1">{state.errors.targetAmount[0]}</p>}
                  </div>
                </CardContent>

                <CardFooter className="p-8 pt-0">
                  <SubmitButton />
                </CardFooter>
              </form>
            </Card>
          </motion.div>
        </div>
      </div>
    </DashboardBackground>
  );
}
