'use client';

import { inviteMemberAction, removeMemberAction, type InviteMemberState } from '@/app/(private)/profile/actions';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import type { User } from '@/lib/definitions';
import { Loader2, Send, UserPlus, X } from 'lucide-react';
import React, { useActionState, useRef, useTransition } from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

function DeleteGuestDialog({ 
  guestName, 
  disabled, 
  onConfirm, 
  isLoading 
}: { 
  guestName: string; 
  disabled: boolean; 
  onConfirm: () => void;
  isLoading: boolean;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-xl text-[#2D241E]/40 hover:text-destructive hover:bg-destructive/5 transition-all duration-300"
          disabled={disabled || isLoading}
          title={disabled ? 'Você não tem permissão para remover este membro' : 'Remover membro'}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <X className="h-4 w-4" />
          )}
          <span className="sr-only">Remover</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-[#fdfcf7] border-none rounded-[32px] shadow-2xl overflow-hidden p-0 max-w-[425px]">
        <div className="p-8 space-y-6">
          <AlertDialogHeader className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-destructive/10 flex items-center justify-center">
                <svg className="h-6 w-6 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <AlertDialogTitle className="font-headline text-2xl font-bold text-destructive italic">Remover <span className="uppercase tracking-tighter">Membro</span></AlertDialogTitle>
                <AlertDialogDescription className="text-sm font-medium text-destructive/60 italic">
                  Esta ação não pode ser desfeita
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>
          
          <div className="space-y-4">
            <div className="rounded-2xl bg-destructive/5 p-5 border border-destructive/10">
              <p className="text-sm font-bold text-[#2D241E]">
                Você está prestes a remover{' '}
                <span className="text-destructive">{guestName}</span>{' '}
                do cofre compartilhado.
              </p>
              <p className="text-xs font-medium text-destructive/40 mt-2 italic leading-relaxed">
                Após a remoção, este usuário perderá todo o acesso às informações e transações deste cofre.
              </p>
            </div>
          </div>

          <AlertDialogFooter className="flex flex-col sm:flex-row gap-3">
            <AlertDialogCancel 
              disabled={isLoading}
              className="h-14 flex-1 rounded-2xl font-black uppercase tracking-widest text-[10px] border-[#2D241E]/10 text-[#2D241E]/60 hover:bg-[#2D241E]/5 transition-all"
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={onConfirm}
              disabled={isLoading}
              className="h-14 flex-1 rounded-2xl font-black uppercase tracking-widest text-[10px] bg-destructive text-white shadow-xl shadow-destructive/20 border-none hover:bg-destructive/90 transition-all active:scale-[0.98]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Removendo...
                </>
              ) : (
                <>
                  <X className="h-4 w-4 mr-2" />
                  Sim, Remover
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}

interface GuestsManagementProps {
  members: User[];
  vaultOwnerId: string;
  currentUserId: string;
  vaultId: string;
  currentUser?: User;
}

// @ts-expect-error - pendencia estrutural a ser revisada
export function GuestsManagement({ members, vaultOwnerId, currentUserId, vaultId, currentUser }: GuestsManagementProps) {
  const [open, setOpen] = React.useState(false);
  const [isPending, startTransition] = useTransition();
  const [removingUserId, setRemovingUserId] = React.useState<string | null>(null);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const isCurrentUserOwner = vaultOwnerId === currentUserId;

  const initialState: InviteMemberState = {};
  const [state, dispatch] = useActionState(inviteMemberAction, initialState);

  React.useEffect(() => {
    if (state.message && !state.errors) {
      toast({ title: 'Sucesso!', description: state.message });
      formRef.current?.reset();
      setOpen(false);
    } else if (state.message && state.errors) {
      toast({
        title: 'Erro',
        description: state.message,
        variant: 'destructive',
      });
    }
  }, [state, toast]);

  // @ts-expect-error - pendencia estrutural a ser revisada
  const handleRemoveMember = (userId: string, userName: string) => {
    setRemovingUserId(userId);
    startTransition(async () => {
      try {
        const result = await removeMemberAction(vaultId, userId);
        if (result.success) {
          toast({
            title: 'Sucesso!',
            description: result.message,
          });
        } else {
          toast({
            title: 'Erro',
            description: result.message,
            variant: 'destructive',
          });
        }
      } catch (error) {
        toast({
          title: 'Erro',
          description: 'Ocorreu um erro ao remover o membro.',
          variant: 'destructive',
        });
      } finally {
        setRemovingUserId(null);
      }
    });
  };

  return (
    <div className="relative overflow-hidden rounded-[40px] bg-white/40 backdrop-blur-3xl border border-white/60 shadow-[0_20px_50px_rgba(45,36,30,0.06)] transition-all duration-500">
      <div className="p-8 md:p-10 space-y-2 border-b border-[#2D241E]/5 bg-white/30">
        <div className="flex items-center gap-4">
          <div className="rounded-2xl bg-[#ff6b7b]/10 p-3 shadow-inner">
            <svg className="h-6 w-6 text-[#ff6b7b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <h2 className="text-3xl font-headline font-bold text-[#2D241E] italic">Equipe do <span className="text-[#ff6b7b]">Cofre</span></h2>
            <p className="text-xs font-medium text-[#2D241E]/40 italic">Gerencie quem tem acesso a este compartilhamento financeiro.</p>
          </div>
        </div>
      </div>
          
      {/* Stats and Button Row */}
      <div className="p-8 md:p-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 bg-white/30 backdrop-blur-sm border-b border-[#2D241E]/5">
        <div className="flex items-center gap-3 text-sm">
          <div className="h-3 w-3 rounded-full bg-[#ff6b7b] animate-pulse shadow-[0_0_10px_rgba(255,107,123,0.5)]" />
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-headline font-black text-[#2D241E]">{members?.length || 0}</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#2D241E]/40">
              {members?.length === 1 ? 'membro ativo' : 'membros ativos'}
            </span>
          </div>
        </div>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button 
              size="default" 
              disabled={!isCurrentUserOwner}
              className="h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-[10px] bg-gradient-to-br from-[#ff6b7b] to-[#fa8292] text-white shadow-xl shadow-[#ff6b7b]/20 border-none hover:shadow-2xl hover:shadow-[#ff6b7b]/30 transition-all duration-300 active:scale-[0.98] w-full sm:w-auto"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Convidar Parceiro
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#fdfcf7] border-none rounded-[32px] shadow-2xl overflow-hidden p-0 max-w-[500px]">
            <form action={dispatch} ref={formRef}>
              <input type="hidden" name="vaultId" value={vaultId} />
              <div className="p-8 space-y-8">
                <DialogHeader className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#ff6b7b]/10 flex items-center justify-center">
                      <UserPlus className="h-6 w-6 text-[#ff6b7b]" />
                    </div>
                    <div>
                      <DialogTitle className="font-headline text-2xl font-bold text-[#2D241E] italic">Convidar <span className="text-[#ff6b7b]">Membro</span></DialogTitle>
                      <DialogDescription className="text-sm font-medium text-[#2D241E]/50 italic text-pretty">
                        Adicione um parceiro ao seu cofre compartilhado.
                      </DialogDescription>
                    </div>
                  </div>
                </DialogHeader>
                
                <div className="space-y-6">
                  <div className="rounded-2xl bg-white/60 p-5 border border-[#2D241E]/5 shadow-sm">
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                        <svg className="h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-[#2D241E]">Como funciona</p>
                        <p className="text-[10px] font-medium text-[#2D241E]/40 mt-1 italic leading-relaxed">
                          Envie o convite para qualquer e-mail. Se a pessoa não tiver cadastro, receberá instruções para registro e acesso imediato.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-[0.2em] text-[#2D241E]/40 ml-1">
                      E-mail do Convidado
                    </Label>
                    <div className="relative">
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="exemplo@email.com"
                        className="h-14 rounded-2xl border-2 border-[#2D241E]/5 bg-white text-lg font-bold text-[#2D241E] focus:border-[#ff6b7b] focus:ring-0 transition-all shadow-sm"
                        required
                      />
                    </div>
                    {state?.errors?.email && (
                      <div className="flex items-center gap-2 text-xs font-bold text-[#ff6b7b] bg-[#ff6b7b]/5 p-3 rounded-xl border border-[#ff6b7b]/10">
                        {state.errors.email[0]}
                      </div>
                    )}
                  </div>
                </div>

                <DialogFooter className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setOpen(false)}
                    disabled={isPending}
                    className="h-14 flex-1 rounded-2xl font-black uppercase tracking-widest text-[10px] border-[#2D241E]/10 text-[#2D241E]/60 hover:bg-[#2D241E]/5 transition-all"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isPending}
                    className="h-14 flex-1 rounded-2xl font-black uppercase tracking-widest text-[10px] bg-gradient-to-br from-[#ff6b7b] to-[#fa8292] text-white shadow-xl shadow-[#ff6b7b]/20 border-none hover:shadow-2xl hover:shadow-[#ff6b7b]/30 transition-all active:scale-[0.98]"
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Enviar Convite
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="p-8 md:p-10 space-y-4 bg-white/10">
        {members && members.length > 0 ? (
          members.map((member) => {
            const isOwner = member.id === vaultOwnerId;
            const isSelf = member.id === currentUserId;
            const canBeRemoved = isCurrentUserOwner && !isOwner;

            return (
              <div
                key={member.id}
                className={`group relative flex items-center justify-between rounded-[32px] border p-5 shadow-sm transition-all duration-500 overflow-hidden ${
                  isSelf 
                    ? 'bg-white/70 border-[#ff6b7b]/20 shadow-lg shadow-[#ff6b7b]/5' 
                    : 'bg-white/40 border-[#2D241E]/5 hover:bg-white/80 hover:border-[#ff6b7b]/20 shadow-none hover:shadow-xl hover:shadow-[#2D241E]/5'
                }`}
              >
                {/* Indicador de posição */}
                <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-12 bg-gradient-to-b from-[#ff6b7b]/30 to-[#ff6b7b] rounded-r-full transition-all duration-500 ${
                  isSelf ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0 group-hover:opacity-100 group-hover:scale-y-100'
                }`} />
                
                <div className="flex items-center gap-5 flex-1 min-w-0">
                  {/* Avatar com indicador de status */}
                  <div className="relative flex-shrink-0">
                    <Avatar className="h-16 w-16 border-4 border-white shadow-xl ring-1 ring-black/5 transition-transform duration-500 group-hover:scale-105">
                      <AvatarImage src={member.avatarUrl || undefined} alt={member.name ?? 'Usuário'} />
                      <AvatarFallback className="text-xl font-headline font-black bg-gradient-to-br from-[#ff6b7b]/20 to-[#ff6b7b]/10 text-[#ff6b7b]">
                        {member.name ? member.name.charAt(0).toUpperCase() : 'U'}
                      </AvatarFallback>
                    </Avatar>
                    {isOwner && (
                      <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 border-2 border-white flex items-center justify-center shadow-lg" title="Proprietário">
                        <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  
                  {/* Info do membro */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h4 className="font-headline text-xl font-bold text-[#2D241E] italic truncate">{member.name}</h4>
                      {isSelf && (
                        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-[#ff6b7b] bg-[#ff6b7b]/5 px-2 py-1 rounded-lg border border-[#ff6b7b]/10">
                          Você
                        </span>
                      )}
                      {isOwner ? (
                        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-amber-600 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200">
                          Proprietário
                        </span>
                      ) : (
                        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-[#2D241E]/40 bg-[#2D241E]/5 px-2 py-1 rounded-lg border border-[#2D241E]/10">
                          Membro
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-medium text-[#2D241E]/40 truncate flex items-center gap-2 italic">
                      {member.email}
                    </p>
                  </div>
                </div>

                {/* Botão de remover */}
                <div className="flex-shrink-0 ml-4">
                  {!isOwner && (
                    <DeleteGuestDialog 
                      guestName={member.name ?? 'Convidado'} 
                      disabled={!canBeRemoved}
                      onConfirm={() => handleRemoveMember(member.id, member.name ?? 'Convidado')}
                      isLoading={removingUserId === member.id}
                    />
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="rounded-[40px] border-4 border-dashed border-[#2D241E]/5 bg-white/20 overflow-hidden">
            <div className="p-16 text-center">
              <div className="flex flex-col items-center gap-6">
                <div className="w-24 h-24 rounded-[40px] bg-white/60 flex items-center justify-center shadow-xl border border-white group">
                  <UserPlus className="h-10 w-10 text-[#ff6b7b] group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div>
                  <p className="font-headline text-2xl font-bold text-[#2D241E] italic">
                    Cofre ainda <span className="text-[#ff6b7b]">Solitário</span>
                  </p>
                  <p className="text-sm font-medium text-[#2D241E]/40 mt-3 max-w-sm mx-auto italic leading-relaxed">
                    {isCurrentUserOwner 
                      ? 'Convide pessoas para colaborar e gerenciar esse porto seguro junto com você.'
                      : 'Este cofre ainda não tem outros membros além do proprietário.'
                    }
                  </p>
                </div>
                {isCurrentUserOwner && (
                  <Button 
                    size="default" 
                    className="h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-[10px] bg-gradient-to-br from-[#ff6b7b] to-[#fa8292] text-white shadow-xl shadow-[#ff6b7b]/20 border-none hover:shadow-2xl hover:shadow-[#ff6b7b]/30 transition-all active:scale-[0.98] gap-3"
                    onClick={() => setOpen(true)}
                  >
                    <UserPlus className="h-4 w-4" />
                    Convidar Parceiro
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
