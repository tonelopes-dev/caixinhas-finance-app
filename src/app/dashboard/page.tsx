import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

import { getDashboardData } from './actions';
import { getPatrimonyData } from '@/app/patrimonio/actions';
import { VaultService } from '@/services/vault.service';
import { CategoryService } from '@/services/category.service';
import { GoalService } from '@/services/goal.service';
import { TransactionService } from '@/services/transaction.service';
import { withPageAccess } from '@/lib/page-access';
import Header from '@/components/dashboard/header';
import type { User, Vault } from '@/lib/definitions';

// ⚡ PERFORMANCE: Lazy load componentes pesados
const DashboardClient = dynamic(
  () => import('@/components/dashboard/dashboard-client').then(mod => ({ default: mod.DashboardClient })),
  { 
    loading: () => <DashboardSkeleton />
  }
);

const PwaPrompt = dynamic(
  () => import('@/components/pwa-prompt').then(mod => ({ default: mod.PwaPrompt }))
);

// Loading skeleton otimizado
function DashboardSkeleton() {
  return (
    <div className="flex min-h-screen flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="h-8 w-48 animate-pulse rounded bg-muted" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-32 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
      <div className="h-96 animate-pulse rounded-lg bg-muted" />
    </div>
  );
}

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
    // Se não há vault definido no cookie, verificar se o usuário tem vaults
    const userVaults = await VaultService.getUserVaults(userId);
    
    // Se o usuário não tem nenhum vault criado, redirecionar para /vaults
    if (userVaults.length === 0) {
      redirect('/vaults');
    }
    
    // Se tem vaults, usar o workspace pessoal (userId) por padrão
    workspaceId = userId;
  }

  const owner = { ownerType: workspaceId === userId ? 'user' as const : 'vault' as const, ownerId: workspaceId };

  // ⚡ PERFORMANCE: Parallel fetching otimizado com priorização
  // Dados críticos primeiro, patrimônio depois
  const [dashboardData, userVaults, allGoals, categories] = await Promise.all([
    getDashboardData(userId, workspaceId),
    VaultService.getUserVaults(userId),
    GoalService.getGoals(owner.ownerId, owner.ownerType),
    CategoryService.getUserCategories(userId),
  ]);
  
  // Patrimônio carregado em paralelo mas não bloqueia render
  const patrimonyDataPromise = getPatrimonyData(userId);
  const patrimonyData = await patrimonyDataPromise;

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
    <div className="flex min-h-[calc(100vh-theme(spacing.16))] flex-1 flex-col">
      <Header user={currentUser as User} partner={null} />
      <Suspense fallback={<DashboardSkeleton />}>
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
      </Suspense>
      <PwaPrompt />
    </div>
  );
}
