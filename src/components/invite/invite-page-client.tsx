'use client';

import { useState, useCallback } from 'react';
import { InviteForm } from './invite-form';
import { InvitationsManager } from './invitations-manager';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, Plus } from 'lucide-react';
import Link from 'next/link';
import { getUserSentInvitations, getUserReceivedInvitations } from '@/app/invite/actions';
import type { VaultInvitationData } from '@/services/vault.service';

type InvitePageClientProps = {
  userVaults: { id: string; name: string }[];
  userId: string;
  initialReceivedInvitations: VaultInvitationData[];
  initialSentInvitations: VaultInvitationData[];
};

export function InvitePageClient({ 
  userVaults, 
  userId, 
  initialReceivedInvitations, 
  initialSentInvitations 
}: InvitePageClientProps) {
  const [receivedInvitations, setReceivedInvitations] = useState(initialReceivedInvitations);
  const [sentInvitations, setSentInvitations] = useState(initialSentInvitations);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshInvitations = useCallback(async () => {
    if (isRefreshing) return; // Evita chamadas duplicadas
    
    setIsRefreshing(true);
    try {
      const [received, sent] = await Promise.all([
        getUserReceivedInvitations(),
        getUserSentInvitations(),
      ]);
      setReceivedInvitations(received);
      setSentInvitations(sent);
    } catch (error) {
      console.error('Erro ao recarregar convites:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing]);

  return (
    <div className="space-y-6">
      {/* Gerenciamento de Convites - PRIMEIRO */}
      <InvitationsManager
        initialInvitations={receivedInvitations}
        initialSentInvitations={sentInvitations}
        key={`${receivedInvitations.length}-${sentInvitations.length}`}
      />

      {/* Formulário de Convite - POR ÚLTIMO */}
      <Card>
        <CardHeader>
          <CardTitle>Enviar Novo Convite</CardTitle>
          <CardDescription>
            Convide alguém para participar de um dos seus cofres compartilhados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {userVaults.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-3">
                  <p className="font-medium">Você não possui nenhum cofre compartilhado ainda.</p>
                  <p className="text-sm text-muted-foreground">
                    Para enviar convites, você precisa primeiro criar um cofre compartilhado. 
                    Cofres compartilhados permitem que várias pessoas colaborem juntas.
                  </p>
                  <Button asChild size="sm" className="mt-2">
                    <Link href="/vaults">
                      <Plus className="h-4 w-4 mr-2" />
                      Criar Cofre Compartilhado
                    </Link>
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          ) : (
            <InviteForm
              userVaults={userVaults}
              userId={userId}
              onInviteSent={refreshInvitations}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}