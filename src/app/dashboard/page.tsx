import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

import { getDashboardData } from './actions';
import { getPatrimonyData } from '@/app/patrimonio/actions';
import { DashboardClient } from '@/components/dashboard/dashboard-client';
import { VaultService } from '@/services/vault.service';
import { CategoryService } from '@/services/category.service';
import { GoalService } from '@/services/goal.service';
import { TransactionService } from '@/services/transaction.service';
import { withPageAccess } from '@/lib/page-access';
import { PwaPrompt } from '@/components/pwa-prompt';
import Header from '@/components/dashboard/header';
import type { User, Vault } from '@/lib/definitions';

export default async function DashboardPage() {
  // Verifica acesso completo à página
  const { user: currentUser, accessInfo } = await withPageAccess({ requireFullAccess: true });
  const userId = currentUser.id;

  // Processar transações recorrentes (Lazy Approach)
  await TransactionService.processRecurringTransactions(userId);

  // Corrigido: Adicionado 'await' para resolver a Promise de cookies
  const cookieStore = await cookies(); 
  const vaultId = cookieStore.get('CAIXINHAS_VAULT_ID')?.value;

  let workspaceId = userId;
  if (vaultId) {
    const isMember = await VaultService.isMember(vaultId, userId);
    if (isMember) {
      workspaceId = vaultId;
    }
  } else {
    // Se não há vault definido no cookie, tenta usar o primeiro cofre do usuário
    const userVaults = await VaultService.getUserVaults(userId);
    if (userVaults.length > 0) {
      workspaceId = userVaults[0].id;
    }
  }

  const owner = { ownerType: workspaceId === userId ? 'user' as const : 'vault' as const, ownerId: workspaceId };

  const [dashboardData, userVaults, allGoals, categories, patrimonyData] = await Promise.all([
    getDashboardData(userId, workspaceId),
    VaultService.getUserVaults(userId),
    GoalService.getGoals(owner.ownerId, owner.ownerType),
    CategoryService.getUserCategories(userId),
    getPatrimonyData(userId),
  ]);

  const workspaceName =
    workspaceId === userId
      ? 'Pessoal'
      : userVaults.find((v: any) => v.id === workspaceId)?.name || 'Cofre';

  const currentVault = workspaceId !== userId 
    ? userVaults.find((v: any) => v.id === workspaceId)
    : null;

  const members = currentVault?.members.map((m: any) => m.user) || [];

  const { accounts = [], recentTransactions = [] } = dashboardData || {};

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header user={currentUser as User} partner={null} />
      <DashboardClient
        currentUser={currentUser as User}
        partner={null}
        workspaceId={workspaceId}
        workspaceName={workspaceName}
        isPersonalWorkspace={workspaceId === userId}
        members={members}
        accounts={accounts}
        goals={allGoals || []}
        transactions={recentTransactions || []}
        categories={categories || []}
        patrimonyData={patrimonyData}
      />
      <PwaPrompt />
    </div>
  );
}
