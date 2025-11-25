

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { getAccountsData } from './actions';
import { withPageAccess } from '@/lib/page-access';

import { Button } from '@/components/ui/button';
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
    <div className="flex min-h-screen w-full flex-col items-center bg-background p-4">
      <div className="w-full max-w-2xl space-y-8">
        <Button asChild variant="ghost" className="mb-4">
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para o Painel
          </Link>
        </Button>
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
