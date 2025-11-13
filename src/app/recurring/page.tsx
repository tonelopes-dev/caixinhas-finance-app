
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RecurringPageClient } from '@/components/recurring/recurring-page-client';
import { getRecurringData } from './actions';

export default async function RecurringPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('CAIXINHAS_USER_ID')?.value;
  const workspaceId = cookieStore.get('CAIXINHAS_VAULT_ID')?.value;

  if (!userId || !workspaceId) {
    redirect('/login');
  }

  const data = await getRecurringData(userId, workspaceId);

  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-background p-4">
      <div className="w-full max-w-4xl">
        <Button asChild variant="ghost" className="mb-4">
          <Link href="/transactions">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Transações
          </Link>
        </Button>
        <RecurringPageClient recurring={data.recurring} installments={data.installments} />
      </div>
    </div>
  );
}
