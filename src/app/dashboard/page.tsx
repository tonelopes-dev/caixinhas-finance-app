
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { cookies } from 'next/headers';

import { authOptions } from '@/lib/auth';
import { getDashboardData } from './actions';
import { DashboardClient } from '@/components/dashboard/dashboard-client';
import { VaultService, CategoryService, GoalService, AuthService } from '@/services';
import type { User, VaultWithMembers } from '@/lib/definitions';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect('/login');
  }

  const userId = session.user.id;

  // 1. Buscar o objeto User completo
  const currentUser: User | null = await AuthService.getUserById(userId);
  if (!currentUser) {
    redirect('/login'); // Se o utilizador não for encontrado na DB, redirecionar
  }

  const cookieStore = cookies();
  const vaultId = cookieStore.get('CAIXINHAS_VAULT_ID')?.value;

  let workspaceId = userId;
  if (vaultId) {
    const isMember = await VaultService.isMember(vaultId, userId);
    if (isMember) {
      workspaceId = vaultId;
    }
  }

  const owner = { ownerType: workspaceId === userId ? 'user' as const : 'vault' as const, ownerId: workspaceId };

  const [dashboardData, userVaults, allGoals, categories] = await Promise.all([
    getDashboardData(userId, workspaceId),
    VaultService.getUserVaults(userId),
    GoalService.getGoals(owner),
    CategoryService.getCategories(owner),
  ]);

  // 2. Adicionar tipo explícito para 'v'
  const workspaceName =
    workspaceId === userId
      ? 'Pessoal'
      : userVaults.find((v: VaultWithMembers) => v.id === workspaceId)?.name || 'Cofre';

  const { accounts = [], recentTransactions = [] } = dashboardData || {};

  // 3. Passar o 'currentUser' completo
  return (
    <DashboardClient
      currentUser={currentUser} 
      partner={null}
      workspaceId={workspaceId}
      workspaceName={workspaceName}
      isPersonalWorkspace={workspaceId === userId}
      accounts={accounts}
      goals={allGoals || []}
      transactions={recentTransactions || []}
      categories={categories || []}
    />
  );
}
