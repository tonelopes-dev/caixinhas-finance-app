
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

import { getDashboardData } from './actions';
import { DashboardClient } from '@/components/dashboard/dashboard-client';
import { VaultService } from '@/services/vault.service';
import { CategoryService } from '@/services/category.service';
import { GoalService } from '@/services/goal.service';
import { withPageAccess } from '@/lib/page-access';
import { PwaPrompt } from '@/components/pwa-prompt';
import Header from '@/components/dashboard/header';
import type { User, Vault } from '@/lib/definitions';

export default async function DashboardPage() {
  // Verifica acesso completo à página
  const { user: currentUser, accessInfo } = await withPageAccess({ requireFullAccess: true });
  const userId = currentUser.id;

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
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header user={currentUser} partner={null} />
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
      <PwaPrompt />
    </div>
  );
}
