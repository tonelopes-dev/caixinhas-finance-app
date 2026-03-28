
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import Header from '@/components/dashboard/header';
import { DashboardBackground } from '@/components/dashboard/dashboard-background';
import { User } from '@/lib/definitions';

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden">
      <DashboardBackground />
      <Header user={session.user as User} partner={null} />
      <main className="relative z-10 flex-1 flex flex-col pt-24 w-full max-w-full overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
