
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { cookies } from 'next/headers';

import { authOptions } from '@/lib/auth';
import { getDashboardData } from './actions';
import { DashboardClient } from '@/components/dashboard/dashboard-client';
import { VaultService } from '@/services/vault.service';
import { CategoryService } from '@/services/category.service';
import { GoalService } from '@/services/goal.service';
import { AuthService } from '@/services/auth.service';
// Corrigido: O tipo correto é Vault, não o inexistente VaultWithMembers
import type { User, Vault } from '@/lib/definitions';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect('/login');
  }

  const userId = session.user.id;

  const currentUser: User | null = await AuthService.getUserById(userId);
  if (!currentUser) {
    redirect('/login');
  }

  // Corrigido: Adicionado 'await' para resolver a Promise de cookies
  const cookieStore = await cookies(); 
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
    GoalService.getGoals(owner.ownerId, owner.ownerType),
    // Corrigido: Nome do método e argumentos
    CategoryService.getUserCategories(owner.ownerId, owner.ownerType),
  ]);

  // Corrigido: Tipo explícito para 'v' é Vault
  const workspaceName =
    workspaceId === userId
      ? 'Pessoal'
      : userVaults.find((v: Vault) => v.id === workspaceId)?.name || 'Cofre';

  const { accounts = [], recentTransactions = [] } = dashboardData || {};

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
