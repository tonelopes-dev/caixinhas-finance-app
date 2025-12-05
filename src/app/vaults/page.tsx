import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUserVaultsData } from './actions';
import { VaultsPageClient } from '@/components/vaults';
import { AuthService } from '@/services/auth.service';
import { getAccessInfo } from '@/lib/access-control';
import { AccessBanner } from '@/components/ui/access-banner';

export default async function VaultSelectionPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  const userId = session.user.id;
  const [data, user] = await Promise.all([
    getUserVaultsData(userId),
    AuthService.getUserById(userId),
  ]);

  if (!data || !user || !data.currentUser || !data.userVaults || !data.userInvitations) {
    // Se não encontrar o usuário no banco, desloga por segurança
    redirect('/login?error=user_not_found');
  }

  // Usa o sistema centralizado de controle de acesso
  const accessInfo = getAccessInfo(user);

  return (
    <div className="flex min-h-[calc(100vh-theme(spacing.16))] flex-1 flex-col gap-4 p-4 md:gap-8 md:p-10">
      <div className="mx-auto w-full max-w-6xl">
        <AccessBanner
          status={accessInfo.status}
          daysRemaining={accessInfo.daysRemaining}
          message={accessInfo.message}
          showUpgradeButton={accessInfo.isRestricted}
        />
        <VaultsPageClient 
          currentUser={data.currentUser as any}
          userVaults={data.userVaults}
          userInvitations={data.userInvitations}
          canCreateVaults={accessInfo.canCreateVaults}
          canAccessPersonal={accessInfo.canAccessPersonalWorkspace}
        />
      </div>
    </div>
  );
}
