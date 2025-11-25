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

  if (!data || !user) {
    // Se não encontrar o usuário no banco, desloga por segurança
    redirect('/login?error=user_not_found');
  }

  // Usa o sistema centralizado de controle de acesso
  const accessInfo = getAccessInfo(user);

  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-background p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-4xl">
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
