import { Users } from "lucide-react";
import { redirect } from "next/navigation";
import { BackToDashboard } from "@/components/ui/back-to-dashboard";
import { withPageAccess } from "@/lib/page-access";
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
  const { user } = await withPageAccess({ requireFullAccess: true });
  const userId = user.id;

  // Buscar dados necessários
  const [userVaults, receivedInvitations, sentInvitations] = await Promise.all([
    VaultService.getUserVaults(userId),
    getUserInvitations(),
    getUserSentInvitations()
  ]);

  // Filtrar apenas cofres compartilhados (não privados) - apenas estes permitem convites
  const sharedVaults = userVaults.filter(v => !v.isPrivate);
  const formattedVaults = sharedVaults.map((v) => ({ id: v.id, name: v.name }));

  return (
    <div className="pb-32 px-4 md:px-8 pt-8 text-[#2D241E]">
      <div className="mx-auto w-full max-w-7xl relative z-10">
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
          userId={userId}
          initialReceivedInvitations={receivedInvitations}
          initialSentInvitations={sentInvitations}
        />
      </div>
    </div>
  );
}
