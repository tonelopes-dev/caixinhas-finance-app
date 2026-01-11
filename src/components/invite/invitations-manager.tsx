'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Mail, CheckCircle2, XCircle, Clock, Trash2, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { deleteInvitation, cancelInvitation, respondToInvitation } from '@/app/invite/actions';
import { useToast } from '@/hooks/use-toast';
import type { VaultInvitationData } from '@/services/vault.service';

type InvitationsManagerProps = {
  initialInvitations: VaultInvitationData[];
  initialSentInvitations?: VaultInvitationData[];
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'pending':
      return <Clock className="h-4 w-4 text-yellow-500" />;
    case 'accepted':
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    case 'declined':
      return <XCircle className="h-4 w-4 text-red-500" />;
    default:
      return <Mail className="h-4 w-4 text-gray-500" />;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'pending':
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
    case 'accepted':
      return <Badge variant="secondary" className="bg-green-100 text-green-800">Aceito</Badge>;
    case 'declined':
      return <Badge variant="secondary" className="bg-red-100 text-red-800">Recusado</Badge>;
    default:
      return <Badge variant="secondary">Desconhecido</Badge>;
  }
};

export function InvitationsManager({ initialInvitations, initialSentInvitations = [] }: InvitationsManagerProps) {
  const [invitations, setInvitations] = useState<VaultInvitationData[]>(initialInvitations);
  const [sentInvitations, setSentInvitations] = useState<VaultInvitationData[]>(initialSentInvitations);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleDeleteInvitation = (invitationId: string) => {
    startTransition(async () => {
      try {
        await deleteInvitation(invitationId);
        setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
        toast({ title: 'Convite removido com sucesso!' });
      } catch (error) {
        toast({ title: 'Erro ao remover convite', variant: 'destructive' });
      }
    });
  };

  const handleCancelInvitation = (invitationId: string) => {
    startTransition(async () => {
      try {
        await cancelInvitation(invitationId);
        setSentInvitations(prev => prev.filter(inv => inv.id !== invitationId));
        toast({ title: 'Convite cancelado com sucesso!' });
      } catch (error) {
        toast({ title: 'Erro ao cancelar convite', variant: 'destructive' });
      }
    });
  };

  const handleRespondInvitation = (invitationId: string, action: 'accept' | 'decline') => {
    startTransition(async () => {
      try {
        await respondToInvitation(invitationId, action);
        setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
        toast({ 
          title: action === 'accept' ? 'Convite aceito!' : 'Convite recusado!',
          description: action === 'accept' ? 'Você agora faz parte do cofre!' : 'O convite foi recusado.'
        });
      } catch (error) {
        toast({ title: 'Erro ao responder convite', variant: 'destructive' });
      }
    });
  };

  const pendingInvitations = invitations.filter(inv => inv.status === 'pending');
  const pendingSentInvitations = sentInvitations.filter(inv => inv.status === 'pending');

  return (
    <div className="space-y-6">
      <Tabs defaultValue="received" className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-11">
          <TabsTrigger value="received" className="flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4" />
            <span className="hidden sm:inline">Recebidos</span>
            <span className="sm:hidden">Receb.</span>
            ({pendingInvitations.length})
          </TabsTrigger>
          <TabsTrigger value="sent" className="flex items-center gap-2 text-sm">
            <UserPlus className="h-4 w-4" />
            <span className="hidden sm:inline">Enviados</span> 
            <span className="sm:hidden">Env.</span>
            ({pendingSentInvitations.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="received" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                Convites Recebidos
              </CardTitle>
              <CardDescription>
                Convites de cofres e caixinhas que você pode aceitar ou recusar.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingInvitations.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <div className="bg-muted/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Mail className="h-8 w-8 text-muted-foreground/60" />
                  </div>
                  <h3 className="font-medium text-muted-foreground mb-2">Nenhum convite pendente</h3>
                  <p className="text-sm text-muted-foreground/70">Quando alguém convidar você para um cofre ou caixinha, aparecerá aqui.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingInvitations.map((invitation) => (
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
                            Convite para o cofre <span className="text-primary font-semibold">{invitation.targetName}</span>
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Convidado por {invitation.sender?.name} • {new Date(invitation.createdAt).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <div className="flex-shrink-0 sm:hidden">
                          {getStatusIcon(invitation.status)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Button
                          size="sm"
                          onClick={() => handleRespondInvitation(invitation.id, 'accept')}
                          disabled={isPending}
                          className="flex-1 sm:flex-none"
                        >
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          Aceitar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRespondInvitation(invitation.id, 'decline')}
                          disabled={isPending}
                          className="flex-1 sm:flex-none"
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Recusar
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remover convite</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza de que deseja remover este convite? Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteInvitation(invitation.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Remover
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sent" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-primary" />
                Convites Enviados
              </CardTitle>
              <CardDescription>
                Convites que você enviou para outras pessoas.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sentInvitations.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <div className="bg-muted/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <UserPlus className="h-8 w-8 text-muted-foreground/60" />
                  </div>
                  <h3 className="font-medium text-muted-foreground mb-2">Nenhum convite enviado</h3>
                  <p className="text-sm text-muted-foreground/70">Use o formulário abaixo para convidar pessoas para seus cofres.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sentInvitations.map((invitation) => (
                    <div
                      key={invitation.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50 gap-4"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <Avatar className="h-10 w-10 flex-shrink-0">
                          <AvatarFallback>
                            {invitation.receiver?.name?.charAt(0) || invitation.receiverEmail?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm sm:text-base">
                            {invitation.receiver?.name || invitation.receiverEmail || 'Usuário convidado'}
                          </p>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            {invitation.receiverEmail || 'Email não disponível'}
                          </p>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            Cofre: {invitation.targetName} • {new Date(invitation.createdAt).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <div className="flex items-center">
                          {getStatusBadge(invitation.status)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 self-end sm:self-center">
                        {invitation.status === 'pending' && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                                <XCircle className="h-4 w-4 mr-1" />
                                Cancelar
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Cancelar convite</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza de que deseja cancelar este convite? O convidado não poderá mais aceitar.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Voltar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleCancelInvitation(invitation.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Cancelar Convite
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}