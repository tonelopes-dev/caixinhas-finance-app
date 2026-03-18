
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BackToDashboard } from '@/components/ui/back-to-dashboard';
import { authOptions } from '@/lib/auth';
import { GoalsPageClient } from '@/components/goals/goals-page-client';
import { getGoalsPageData } from './actions';
import { DashboardBackground } from '@/components/dashboard/dashboard-background';

export default async function GoalsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/login');
  }

  const data = await getGoalsPageData(session.user.id);

  if (!data) {
    return (
      <div className="container max-w-5xl mx-auto p-4 md:p-8">
        <p className="text-center text-muted-foreground">Erro ao carregar dados.</p>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden">
      <DashboardBackground />
      
      <div className="relative z-10 flex flex-1 flex-col px-4 md:px-8 pt-24 pb-32">
        <div className="mx-auto w-full max-w-5xl">
          <BackToDashboard className="mb-6 opacity-80 hover:opacity-100 transition-opacity" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div className="space-y-2">
              <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight text-[#2D241E]">
                Minhas <span className="text-[#ff6b7b] uppercase">Caixinhas</span>
              </h1>
              <p className="text-muted-foreground text-lg">
                Gerencie seus sonhos e acompanhe seu progresso de perto.
              </p>
            </div>
            
            <Link href="/goals/new" className="w-full md:w-auto">
              <Button className="gradient-button w-full h-14 px-8 rounded-[20px] text-lg font-bold uppercase tracking-widest">
                Nova Caixinha
              </Button>
            </Link>
          </div>

          <GoalsPageClient 
            goals={data.goals} 
            vaults={data.vaults.map(vault => ({
              ...vault,
              imageUrl: vault.imageUrl || '',
              members: vault.members.map(member => ({
                id: member.user.id,
                name: member.user.name,
                email: member.user.email,
                avatarUrl: member.user.avatarUrl || ''
              }))
            }))}
            userId={session.user.id} 
          />
        </div>
      </div>
    </div>
  );
}
