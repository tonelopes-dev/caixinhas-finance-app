
import { getAccountsData } from './actions';
import { withPageAccess } from '@/lib/page-access';
import { BackToDashboard } from '@/components/ui/back-to-dashboard';
import { AccountsManagement } from '@/components/profile/accounts-management';
import { CategoriesManagement } from '@/components/profile/categories-management';

export default async function AccountsPage() {
  // Verifica acesso completo à página
  const { user } = await withPageAccess({ requireFullAccess: true });
  const userId = user.id;
  // A lógica do workspaceId é menos relevante aqui agora, mas mantemos para consistência do nome
  const workspaceId = userId; 
  const workspaceName = "seu"; // Simplificado, já que a página agora mostra todas as contas

  const { accounts, currentUser, userVaults, categories } = await getAccountsData(userId);

  return (
    <div className="flex min-h-[calc(100vh-theme(spacing.16))] flex-1 flex-col gap-4 p-4 md:gap-8 md:p-10">
      <div className="mx-auto w-full max-w-2xl space-y-8">
        <BackToDashboard className="mb-4" />
        <AccountsManagement
          accounts={accounts}
          currentUserId={currentUser.id}
          userVaults={userVaults}
          workspaceId={workspaceId} // Ainda pode ser útil para saber o contexto atual
          workspaceName={workspaceName}
          isVaultOwner={true} // Simplificado, o usuário sempre é "dono" do seu gerenciamento
        />
        <CategoriesManagement initialCategories={categories} />
      </div>
    </div>
  );
}
