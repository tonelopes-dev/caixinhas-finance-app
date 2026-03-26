"use client";

import { useState, lazy, Suspense } from "react";
import type { User, Account, Goal, Transaction } from "@/lib/definitions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { WorkspaceNavigationHandler } from "@/components/dashboard/workspace-navigation-handler";
import type { PatrimonyData } from "@/app/(private)/patrimonio/actions";
import { MemberAvatars } from "@/components/ui/member-avatars";

// ⚡ PERFORMANCE: Lazy load componentes pesados
const GoalBuckets = lazy(() => import("@/components/dashboard/goal-buckets"));
const RecentTransactions = lazy(
  () => import("@/components/dashboard/recent-transactions"),
);
const NetWorthSummary = lazy(
  () => import("@/components/dashboard/net-worth-summary"),
);
const MotivationalNudge = lazy(() =>
  import("@/components/dashboard/motivational-nudge").then((mod) => ({
    default: mod.MotivationalNudge,
  })),
);
const AnimatedDiv = lazy(() =>
  import("@/components/ui/animated-div").then((mod) => ({
    default: mod.AnimatedDiv,
  })),
);

// Loading skeletons
const CardSkeleton = () => (
  <div className="h-48 animate-pulse rounded-lg bg-muted" />
);

const TransactionsSkeleton = () => (
  <div className="space-y-4">
    {[1, 2, 3].map((i) => (
      <div key={i} className="h-16 animate-pulse rounded bg-muted" />
    ))}
  </div>
);

type DashboardClientProps = {
  currentUser: User;
  partner: User | null;
  workspaceId: string;
  workspaceName: string;
  isPersonalWorkspace: boolean;
  members?: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
  }[];
  accounts: Account[];
  goals: Goal[];
  transactions: Transaction[];
  categories: any[];
  patrimonyData?: PatrimonyData;
};

export function DashboardClient({
  currentUser,
  partner,
  workspaceId,
  workspaceName,
  isPersonalWorkspace,
  members,
  accounts,
  goals,
  transactions,
  categories,
  patrimonyData,
}: DashboardClientProps) {
  const [transactionFilter, setTransactionFilter] = useState<
    "all" | "income" | "expense" | "transfer"
  >("all");

  // Se tiver dados de patrimônio global, usa eles para o resumo.
  // Caso contrário, usa os dados locais do workspace (fallback).

  const summaryAccounts = patrimonyData ? patrimonyData.accounts : accounts;
  const summaryGoals = patrimonyData ? patrimonyData.goals : goals;

  // 1. Calcula o total guardado em objetivos (caixinhas)
  const goalAssets = summaryGoals.reduce((sum, g) => sum + g.currentAmount, 0);

  // 2. Calcula o total de ativos líquidos (contas correntes/poupança)
  const liquidAssetsRaw = summaryAccounts
    .filter((a) => a.type === "checking" || a.type === "savings")
    .reduce((sum, a) => sum + a.balance, 0);

  // 3. Mantém o valor total líquido (sem subtrair objetivos) para alinhar com a página de patrimônio
  const liquidAssets = liquidAssetsRaw;

  // 4. Calcula o total investido em contas de investimento
  const investedAssets = summaryAccounts
    .filter((a) => a.type === "investment")
    .reduce((sum, a) => sum + a.balance, 0);

  // O total para "Investido p/ Sonhos" é a soma de contas de investimento + caixinhas
  const totalInvestedForGoals = investedAssets + goalAssets;

  const almostThereGoal = goals.find(
    (g) =>
      g.currentAmount / g.targetAmount >= 0.95 &&
      g.currentAmount / g.targetAmount < 1,
  );

  return (
    <main className="flex-1">
      <WorkspaceNavigationHandler />
      <div className="mx-auto w-full max-w-8xl">
        <Suspense
          fallback={<div className="h-20 animate-pulse rounded bg-muted" />}
        >
          <AnimatedDiv transition={{ duration: 0.8 }}>
            <div className="flex flex-col gap-4 mb-12">
              <div className="flex items-center justify-between flex-wrap gap-6">
                <div className="space-y-2">
                  <h1 className="font-headline text-xl sm:text-3xl font-bold tracking-tight text-[#2D241E]">
                    Painel:{" "}
                    <span className="text-[#ff6b7b] uppercase">
                      {workspaceName}
                    </span>
                  </h1>
                </div>

                {!isPersonalWorkspace && members && members.length > 1 && (
                  <div className="flex items-center gap-4 bg-white p-2.5 shadow-sm border-2 border-[#2D241E]/5 rounded-[24px] transition-all hover:shadow-md hover:border-primary/10">
                    <div className="flex items-center gap-2 pl-2">
                      <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                      <span className="text-sm font-black text-[#2D241E] uppercase tracking-wider">
                        Membros
                      </span>
                    </div>
                    <MemberAvatars
                      members={members.map((m) => ({
                        name: m.name,
                        avatarUrl: m.avatarUrl,
                      }))}
                      size="lg"
                      limit={5}
                      borderColor="ring-white"
                      className="p-1"
                    />
                  </div>
                )}
              </div>
            </div>
          </AnimatedDiv>
        </Suspense>

        {almostThereGoal && (
          <Suspense fallback={<CardSkeleton />}>
            <AnimatedDiv
              transition={{ delay: 0.1, duration: 0.8 }}
              className="mb-8"
            >
              <MotivationalNudge goal={almostThereGoal} />
            </AnimatedDiv>
          </Suspense>
        )}

        <div className="grid gap-8 xl:grid-cols-3">
          <div className="grid auto-rows-max items-start gap-8 xl:col-span-2">
            <Suspense fallback={<CardSkeleton />}>
              <AnimatedDiv transition={{ delay: 0.2, duration: 0.8 }}>
                <NetWorthSummary
                  liquidAssets={liquidAssets}
                  investedAssets={totalInvestedForGoals}
                />
              </AnimatedDiv>
            </Suspense>

            <Suspense fallback={<TransactionsSkeleton />}>
              <AnimatedDiv transition={{ delay: 0.3, duration: 0.8 }}>
                <RecentTransactions
                  transactions={transactions}
                  accounts={accounts}
                  goals={goals}
                  categories={categories}
                  ownerId={workspaceId}
                  ownerType={isPersonalWorkspace ? "user" : "vault"}
                  typeFilter={transactionFilter}
                  onFilterChange={setTransactionFilter}
                  disablePrivacyMode={true}
                />
              </AnimatedDiv>
            </Suspense>
          </div>
          <div className="grid auto-rows-max items-start gap-8">
            <Suspense fallback={<CardSkeleton />}>
              <AnimatedDiv transition={{ delay: 0.4, duration: 0.8 }}>
                <GoalBuckets goals={goals} workspaceName={workspaceName} />
              </AnimatedDiv>
            </Suspense>
          </div>
        </div>
      </div>
    </main>
  );
}

export default DashboardClient;
