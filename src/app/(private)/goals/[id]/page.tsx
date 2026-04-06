
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { notFound } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { getGoalDetails } from '../actions'; 
import { GoalDetailClient } from '@/components/goals/goal-detail-client';
import { DashboardBackground } from '@/components/dashboard/dashboard-background';
import { Transaction } from '@/lib/definitions';

export default async function GoalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; // No Next.js 15, params precisa ser aguardado
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  const data = await getGoalDetails(id, session.user.id);

  if (!data) {
    notFound();
  }

  // Mapear transações do Prisma para o tipo esperado pelo componente Client
  const mappedTransactions: Transaction[] = data.transactions.map(t => ({
    id: t.id,
    description: t.description,
    amount: t.amount,
    type: t.type as 'income' | 'expense' | 'transfer',
    date: t.date.toISOString(),
    ownerId: (t.userId || t.vaultId) as string,
    ownerType: t.userId ? 'user' : 'vault',
    category: t.category ? { name: t.category.name } : null,
    paymentMethod: t.paymentMethod as any,
    sourceAccountId: t.sourceAccountId,
    destinationAccountId: t.destinationAccountId,
    actorId: t.actorId,
    actor: t.actor ? { 
      id: t.actor.id, 
      name: t.actor.name, 
      avatarUrl: t.actor.avatarUrl || '' 
    } : null,
    isRecurring: t.isRecurring,
    isInstallment: t.isInstallment,
    totalInstallments: t.totalInstallments || undefined,
    paidInstallments: t.paidInstallments,
    goalId: t.goalId || undefined,
  }));

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <DashboardBackground />
      <div className="relative z-10 w-full">
        <GoalDetailClient
          goal={data.goal}
          transactions={mappedTransactions}
          accounts={data.accounts}
          vaults={data.vaults.map(vault => ({
            ...vault,
            imageUrl: vault.imageUrl || '',
            members: vault.members.map(member => ({
              id: member.user.id,
              name: member.user.name,
              email: member.user.email,
              avatarUrl: member.user.avatarUrl,
              workspaceImageUrl: null,
              subscriptionStatus: 'active' as const
            }))
          }))}
          userId={session.user.id}
        />
      </div>
    </div>
  );
}
