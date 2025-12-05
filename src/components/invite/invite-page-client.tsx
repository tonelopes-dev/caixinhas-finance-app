'use client';

import { useState } from 'react';
import { InviteForm } from './invite-form';
import { InvitationsManager } from './invitations-manager';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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

  const refreshInvitations = async () => {
    try {
      const [received, sent] = await Promise.all([
        getUserReceivedInvitations(),
        getUserSentInvitations(),
      ]);
      setReceivedInvitations(received);
      setSentInvitations(sent);
    } catch (error) {
      console.error('Erro ao recarregar convites:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Formulário de Convite */}
      <Card>
        <CardHeader>
          <CardTitle>Enviar Convite</CardTitle>
          <CardDescription>
            Convide alguém para participar de um dos seus cofres
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InviteForm
            userVaults={userVaults}
            userId={userId}
            onInviteSent={refreshInvitations}
          />
        </CardContent>
      </Card>

      {/* Gerenciamento de Convites */}
      <InvitationsManager
        initialInvitations={receivedInvitations}
        initialSentInvitations={sentInvitations}
      />
    </div>
  );
}