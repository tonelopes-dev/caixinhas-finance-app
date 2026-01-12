'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Bell, Check, X } from 'lucide-react';
import { BackToDashboard } from '@/components/ui/back-to-dashboard';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
import { respondToInvitation } from '@/app/invite/actions';
import { useToast } from '@/hooks/use-toast';
import type { VaultInvitationData } from '@/services/vault.service';

type InvitationsPageClientProps = {
  initialInvitations: VaultInvitationData[];
};

export function InvitationsPageClient({ initialInvitations }: InvitationsPageClientProps) {
  const [invitations, setInvitations] = useState<VaultInvitationData[]>(initialInvitations);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleRespondInvitation = (invitationId: string, action: 'accept' | 'decline') => {
    startTransition(async () => {
      try {
        await respondToInvitation(invitationId, action);
        setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
        toast({ 
          title: action === 'accept' ? 'Convite aceito!' : 'Convite recusado!',
          description: action === 'accept' 
            ? 'Você agora faz parte do cofre! Acesse a seção de Cofres para começar.' 
            : 'O convite foi recusado.'
        });
      } catch (error) {
        toast({ 
          title: 'Erro ao responder convite', 
          description: 'Tente novamente mais tarde.',
          variant: 'destructive' 
        });
      }
    });
  };

  const pendingInvitations = invitations.filter(inv => inv.status === 'pending');

  return (
    <div className="flex min-h-[calc(100vh-theme(spacing.16))] flex-1 flex-col gap-4 p-4 md:gap-8 md:p-10">
      <div className="mx-auto w-full max-w-2xl">
        <BackToDashboard className="mb-4" />
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline">
              <Bell className="h-6 w-6 text-primary" />
              Convites Pendentes
            </CardTitle>
            <CardDescription>
              Você foi convidado(a) para participar destes cofres.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {pendingInvitations.length === 0 ? (
              <div className="text-center py-12 px-4">
                <div className="bg-muted/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Bell className="h-8 w-8 text-muted-foreground/60" />
                </div>
                <h3 className="font-medium text-muted-foreground mb-2">Nenhum convite pendente</h3>
                <p className="text-sm text-muted-foreground/70">
                  Quando alguém convidar você para um cofre, aparecerá aqui.
                </p>
              </div>
            ) : (
              pendingInvitations.map(invitation => (
                <div 
                  key={invitation.id} 
                  className="flex flex-col sm:flex-row sm:items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50 gap-4"
                >
                  <div className="flex items-start gap-4 flex-1">
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarFallback>
                        {invitation.sender?.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">
                        Convite para o cofre{' '}
                        <span className="text-primary font-semibold">{invitation.targetName}</span>
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Enviado por <span className="font-medium">{invitation.sender?.name || 'Usuário'}</span>
                      </p>
                      {invitation.createdAt && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(invitation.createdAt).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 sm:ml-4">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleRespondInvitation(invitation.id, 'accept')}
                      disabled={isPending}
                      className="flex items-center gap-2"
                    >
                      <Check className="h-4 w-4" />
                      <span className="hidden sm:inline">Aceitar</span>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isPending}
                          className="flex items-center gap-2"
                        >
                          <X className="h-4 w-4" />
                          <span className="hidden sm:inline">Recusar</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Recusar convite?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja recusar o convite para o cofre{' '}
                            <span className="font-semibold text-foreground">{invitation.targetName}</span>?
                            Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleRespondInvitation(invitation.id, 'decline')}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Recusar Convite
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
