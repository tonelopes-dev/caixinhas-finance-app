
import { getUserAllGoals } from '@/app/(private)/goals/actions';
import { RecurringPageClient } from '@/components/recurring/recurring-page-client';
import { StandardBackButton } from '@/components/ui/standard-back-button';
import { withPageAccess } from '@/lib/page-access';
import { AccountService } from '@/services/account.service';
import { CategoryService } from '@/services/category.service';
import { cookies } from 'next/headers';
import { getRecurringData } from './actions';

export default async function RecurringPage() {
  const { user } = await withPageAccess({ requireFullAccess: true });
  const userId = user.id;
  const cookieStore = await cookies();
  const vaultId = cookieStore.get('CAIXINHAS_VAULT_ID')?.value || userId;
  const actualWorkspaceId = vaultId;
  const isPersonalWorkspace = actualWorkspaceId === userId;
  const ownerType = isPersonalWorkspace ? 'user' : 'vault';

  // Fetch all necessary data for the page and its actions
  const [
    recurringData, 
    allAccounts, 
    allGoalsData, 
    allCategories
  ] = await Promise.all([
    getRecurringData(actualWorkspaceId, ownerType),
    AccountService.getUserAccounts(userId),
    getUserAllGoals(userId),
    CategoryService.getUserCategories(userId)
  ]);
  const allGoals = allGoalsData.goals;

  return (
    <div className="pb-32 px-4 md:px-8 pt-8 text-[#2D241E]">
      <div className="mx-auto w-full max-w-4xl">
        <StandardBackButton href="/transactions" label="Voltar para Transações" />
        <RecurringPageClient
          recurringExpenses={recurringData.recurringExpenses}
          recurringIncomes={recurringData.recurringIncomes}
          installmentExpenses={recurringData.installmentExpenses}
          installmentIncomes={recurringData.installmentIncomes}
          allAccounts={allAccounts}
          allGoals={allGoals}
          allCategories={allCategories}
          workspaceId={actualWorkspaceId}
        />
      </div>
    </div>
  );
}
