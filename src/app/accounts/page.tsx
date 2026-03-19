import { getAccountsData } from './actions';
import { withPageAccess } from '@/lib/page-access';
import { StandardBackButton } from '@/components/ui/standard-back-button';
import { AccountsManagement } from '@/components/profile/accounts-management';
import { CategoriesManagement } from '@/components/profile/categories-management';
import { DashboardBackground } from '@/components/dashboard/dashboard-background';

export default async function AccountsPage() {
  // Verifica acesso completo à página
  const { user } = await withPageAccess({ requireFullAccess: true });
  const userId = user.id;
  
  const { accounts, currentUser, userVaults, categories } = await getAccountsData(userId);

  return (
    <div className="relative min-h-screen flex flex-col overflow-x-hidden">
      <DashboardBackground />
      
      <div className="relative z-10 flex flex-1 flex-col p-4 md:p-10 pt-24 pb-32">
        <div className="mx-auto w-full max-w-6xl space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-4">
              <StandardBackButton href="/dashboard" label="Voltar para o Painel" className="mb-0" />
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#ff6b7b] ml-1">Configurações</p>
                <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight text-[#2D241E] italic">
                  Minhas <span className="text-[#ff6b7b] uppercase">Contas</span>
                </h1>
              </div>
            </div>
            <p className="max-w-xs text-sm text-muted-foreground italic font-medium">
              Gerencie seus cartões e categorias para uma organização financeira impecável.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            <div className="lg:col-span-3 space-y-8">
              <AccountsManagement
                accounts={accounts}
                currentUserId={currentUser.id}
                userVaults={userVaults}
                workspaceId={userId}
                workspaceName="seu"
                isVaultOwner={true}
              />
            </div>
            
            <div className="lg:col-span-2 space-y-8">
              <CategoriesManagement initialCategories={categories} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
