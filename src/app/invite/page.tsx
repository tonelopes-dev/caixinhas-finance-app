import Link from "next/link";
import { ArrowLeft, Users } from "lucide-react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import { VaultService } from "@/services/vault.service";
import { InviteForm } from "@/components/invite/invite-form";
import { InvitationsManager } from "@/components/invite/invitations-manager";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getUserInvitations, getUserSentInvitations } from "./actions";

export default async function InvitePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login");
  }

  // Buscar dados necessários
  const [userVaults, receivedInvitations, sentInvitations] = await Promise.all([
    VaultService.getUserVaults(session.user.id),
    getUserInvitations(),
    getUserSentInvitations()
  ]);

  const formattedVaults = userVaults.map((v) => ({ id: v.id, name: v.name }));

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex flex-col items-start gap-4">
            <div className="mb-5">
              <Button asChild variant="ghost" size="sm">
                <Link href="/dashboard">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar para o Painel
                </Link>
              </Button>
            </div>

            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Users className="h-6 w-6 text-primary" />
                Gerenciar Convites
              </h1>
              <p className="text-muted-foreground text-sm">
                Convide pessoas para seus cofres e gerencie seus convites
              </p>
            </div>
          </div>
        </div>

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
                userVaults={formattedVaults}
                userId={session.user.id}
              />
            </CardContent>
          </Card>

          {/* Gerenciamento de Convites */}
          <InvitationsManager
            initialInvitations={receivedInvitations}
            initialSentInvitations={sentInvitations}
          />
        </div>
      </div>
    </div>
  );
}
