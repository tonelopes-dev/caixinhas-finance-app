import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getDashboardData } from './actions';
import DashboardClient from '@/components/dashboard/dashboard-client';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  const userId = session.user.id;
  const savedWorkspaceId = userId; // Por enquanto usando o próprio userId como workspace

  const data = await getDashboardData(userId, savedWorkspaceId);

  if (!data) {
    redirect('/login');
  }

  return <DashboardClient {...data as any} />;
}
