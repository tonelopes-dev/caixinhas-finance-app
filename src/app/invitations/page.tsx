'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Bell, Check } from 'lucide-react';
import { BackToDashboard } from '@/components/ui/back-to-dashboard';
import { invitations } from '@/lib/data';
import { DeclineInvitationDialog } from '@/components/invitations/decline-invitation-dialog';

export default function InvitationsPage() {
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
              Você foi convidado(a) para participar destas caixinhas e cofres.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {invitations.filter(inv => inv.status === 'pending').map(invitation => (
              <div key={invitation.id} className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium">
                    <span className="font-bold">{invitation.invitedBy}</span> te convidou para {invitation.type === 'vault' ? 'o cofre' : 'a caixinha'} <span className="font-bold text-primary">{invitation.goalName}</span>.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon">
                    <Check className="h-4 w-4" />
                    <span className="sr-only">Aceitar</span>
                  </Button>
                  <DeclineInvitationDialog invitation={invitation} />
                </div>
              </div>
            ))}
            {invitations.filter(inv => inv.status === 'pending').length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                    Você não tem nenhum convite pendente.
                </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
