
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { cookies } from 'next/headers';
import { authOptions } from '@/lib/auth';
import { getDashboardData } from './actions';
import DashboardClient from '@/components/dashboard/dashboard-client';
import { VaultService } from '@/services/vault.service';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/login');
  }
  
  const cookieStore = cookies();
  const userId = session.user.id;
  const vaultId = cookieStore.get('CAIXINHAS_VAULT_ID')?.value;

  let workspaceId: string;

  if (vaultId) {
    const isMember = await VaultService.isMember(vaultId, userId);
    
    if (isMember) {
      workspaceId = vaultId;
    } else {
      workspaceId = userId;
    }
  } else {
    workspaceId = userId;
  }

  const dashboardData = await getDashboardData(userId, workspaceId);
  const userVaults = await VaultService.getUserVaults(userId);

  const workspaceName =
    workspaceId === userId
      ? session.user.name || 'Pessoal'
      : userVaults.find((v) => v.id === workspaceId)?.name || 'Cofre';

  return (
    <DashboardClient
      userName={session.user.name || 'Usuário'}
      workspaceId={workspaceId}
      workspaceName={workspaceName}
      isVault={workspaceId !== userId}
      userVaults={userVaults}
      accounts={dashboardData.accounts}
      featuredGoals={dashboardData.featuredGoals}
      recentTransactions={dashboardData.recentTransactions}
      balanceSummary={dashboardData.balanceSummary}
      monthlySummary={null}
    />
  );
}
