'use server';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

import { authOptions } from '@/lib/auth';
import { VaultService } from '@/services';
import { InviteForm } from '@/components/invite/invite-form';
import { Button } from '@/components/ui/button';

export default async function InvitePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect('/login');
  }

  const userVaults = await VaultService.getUserVaults(session.user.id);
  const formattedVaults = userVaults.map(v => ({ id: v.id, name: v.name }));

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <Button asChild variant="ghost" className="mb-4">
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para o Painel
          </Link>
        </Button>
        <InviteForm userVaults={formattedVaults} />
      </div>
    </div>
  );
}