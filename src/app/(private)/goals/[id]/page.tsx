
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { notFound } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { getGoalDetails } from '../actions'; 
import { GoalDetailClient } from '@/components/goals/goal-detail-client';
import { DashboardBackground } from '@/components/dashboard/dashboard-background';

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

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <DashboardBackground />
      <div className="relative z-10 w-full">
        <GoalDetailClient
          goal={data.goal}
          // @ts-expect-error - pendencia estrutural a ser revisada
          transactions={data.transactions as any[]}
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
