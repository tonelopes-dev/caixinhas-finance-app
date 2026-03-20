import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { ReportsPageClient } from '@/components/reports/reports-page-client';
import Header from '@/components/dashboard/header';
import { User } from '@/lib/definitions';
import { DashboardBackground } from '@/components/dashboard/dashboard-background';

export default async function ReportsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  return (
    <main className="relative min-h-screen">
      <DashboardBackground />
      <Header user={session.user as User} partner={null} />
      <ReportsPageClient />
    </main>
  );
}