import { GoalsPageClient } from '@/components/goals/goals-page-client';
import { Button } from '@/components/ui/button';
import { StandardBackButton } from '@/components/ui/standard-back-button';
import { withPageAccess } from '@/lib/page-access';
import Link from 'next/link';
import { getGoalsPageData } from './actions';

export default async function GoalsPage() {
  const { user } = await withPageAccess({ requireFullAccess: true });
  const userId = user.id;

  const data = await getGoalsPageData(userId);

  if (!data) {
    return (
      <div className="container max-w-5xl mx-auto p-4 md:p-8">
        <p className="text-center text-muted-foreground">Erro ao carregar dados.</p>
      </div>
    );
  }

  return (
    <div className="pb-32 px-4 md:px-8 pt-8 text-[#2D241E]">
      <div className="mx-auto w-full max-w-5xl">
        <StandardBackButton href="/dashboard" label="Voltar para o Painel" className="mb-6 opacity-80 hover:opacity-100 transition-opacity" />
          
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
              ...member.user,
              avatarUrl: member.user.avatarUrl || ''
            } as any))
          }))}
          userId={userId} 
        />
      </div>
    </div>
  );
}
