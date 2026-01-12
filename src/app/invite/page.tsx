import { Users } from "lucide-react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { BackToDashboard } from "@/components/ui/back-to-dashboard";

import { authOptions } from "@/lib/auth";
import { VaultService } from "@/services/vault.service";
import { InvitePageClient } from "@/components/invite/invite-page-client";
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

  // Filtrar apenas cofres compartilhados (não privados) - apenas estes permitem convites
  const sharedVaults = userVaults.filter(v => !v.isPrivate);
  const formattedVaults = sharedVaults.map((v) => ({ id: v.id, name: v.name }));

  return (
    <div className="flex min-h-[calc(100vh-theme(spacing.16))] flex-1 flex-col gap-4 p-4 md:gap-8 md:p-10">
      <div className="mx-auto w-full max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex flex-col items-start gap-4">
            <BackToDashboard className="mb-5" />

            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Users className="h-6 w-6 text-primary" />
                Convites
              </h1>
              <p className="text-muted-foreground text-sm">
                Gerencie todos os seus convites de cofres e caixinhas
              </p>
            </div>
          </div>
        </div>

        <InvitePageClient
          userVaults={formattedVaults}
          userId={session.user.id}
          initialReceivedInvitations={receivedInvitations}
          initialSentInvitations={sentInvitations}
        />
      </div>
    </div>
  );
}
