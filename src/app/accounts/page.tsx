
'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { AccountsManagement } from '@/components/profile/accounts-management';
import withAuth from '@/components/auth/with-auth';

function AccountsPage() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-background p-4">
      <div className="w-full max-w-2xl">
        <Button asChild variant="ghost" className="mb-4">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para o Painel
          </Link>
        </Button>
        <AccountsManagement />
      </div>
    </div>
  );
}

export default withAuth(AccountsPage);
