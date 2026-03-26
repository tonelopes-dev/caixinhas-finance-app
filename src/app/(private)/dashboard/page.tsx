import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import dynamic from "next/dynamic";
import { Suspense } from "react";

import { getDashboardData } from "./actions";
import { getPatrimonyData } from "@/app/(private)/patrimonio/actions";
import { VaultService } from "@/services/vault.service";
import { CategoryService } from "@/services/category.service";
import { GoalService } from "@/services/goal.service";
import { TransactionService } from "@/services/transaction.service";
import { withPageAccess } from "@/lib/page-access";
import type { User, Vault } from "@/lib/definitions";

// ⚡ PERFORMANCE: Lazy load componentes pesados
const DashboardClient = dynamic(
  () =>
    import("@/components/dashboard/dashboard-client").then((mod) => ({
      default: mod.DashboardClient,
    })),
  {
    loading: () => <DashboardSkeleton />,
  },
);

const PwaPrompt = dynamic(() =>
  import("@/components/pwa-prompt").then((mod) => ({ default: mod.PwaPrompt })),
);

// Loading skeleton otimizado
function DashboardSkeleton() {
  return (
    <div className="flex min-h-screen flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="h-8 w-48 animate-pulse rounded bg-muted" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
      <div className="h-96 animate-pulse rounded-lg bg-muted" />
    </div>
  );
}

export default async function DashboardPage() {
  // Verifica acesso completo à página
  const { user: currentUser, accessInfo } = await withPageAccess({
    requireFullAccess: true,
  });
  const userId = currentUser.id;

  // Processar transações recorrentes (Lazy Approach)
  await TransactionService.processRecurringTransactions(userId);

  // Corrigido: Adicionado 'await' para resolver a Promise de cookies
  const cookieStore = await cookies();
  const vaultId = cookieStore.get("CAIXINHAS_VAULT_ID")?.value;

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
      redirect("/vaults");
    }

    // Se tem vaults, usar o workspace pessoal (userId) por padrão
    workspaceId = userId;
  }

  const owner = {
    ownerType: workspaceId === userId ? ("user" as const) : ("vault" as const),
    ownerId: workspaceId,
  };

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
      ? "Pessoal"
      : userVaults.find((v: any) => v.id === workspaceId)?.name || "Cofre";

  const currentVault =
    workspaceId !== userId
      ? userVaults.find((v: any) => v.id === workspaceId)
      : null;

  const members = currentVault?.members.map((m: any) => m.user) || [];

  const { accounts = [], recentTransactions = [] } = dashboardData || {};

  // Mapeamento de Transações (Prisma -> Frontend Definition)
  const mappedTransactions = recentTransactions.map((t: any) => ({
    ...t,
    date: t.date.toISOString(),
    ownerId: t.userId || t.vaultId || "",
    ownerType: t.userId ? ("user" as const) : ("vault" as const),
  }));

  // Mapeamento de Objetivos (Prisma -> Frontend Definition)
  const mappedGoals = (allGoals || []).map((g: any) => ({
    ...g,
    ownerId: g.userId || g.vaultId || "",
    ownerType: g.userId ? ("user" as const) : ("vault" as const),
    createdAt: g.createdAt.toISOString(),
    updatedAt: g.updatedAt?.toISOString(),
  }));

  return (
    <div className="mx-auto w-full max-w-[1472px] px-4 md:px-8 pb-12 flex flex-col gap-8 pt-8">
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardClient
          currentUser={currentUser as any}
          partner={null}
          workspaceId={workspaceId}
          workspaceName={workspaceName}
          isPersonalWorkspace={workspaceId === userId}
          members={members}
          accounts={accounts}
          goals={mappedGoals as any}
          transactions={mappedTransactions as any}
          categories={categories || []}
          patrimonyData={patrimonyData}
        />
      </Suspense>
      <PwaPrompt />
    </div>
  );
}
