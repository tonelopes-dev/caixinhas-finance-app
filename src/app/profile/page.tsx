'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { ProfileForm } from '@/components/profile/profile-form';
import { GuestsManagement } from '@/components/profile/guests-management';
import { AccountsManagement } from '@/components/profile/accounts-management';
import { CategoriesManagement } from '@/components/profile/categories-management';

export default function ProfilePage() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-background p-4">
      <div className="w-full max-w-6xl">
        <Button asChild variant="ghost" className="mb-4">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para o Painel
          </Link>
        </Button>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <h2 className="text-2xl font-headline font-bold">Configurações</h2>
            <p className="text-muted-foreground">
              Gerencie suas informações pessoais, financeiras e de acesso.
            </p>
          </div>
          <div className="grid auto-rows-max grid-cols-1 items-start gap-8 lg:col-span-2">
            <ProfileForm />
            <AccountsManagement />
            <CategoriesManagement />
            <GuestsManagement />
          </div>
        </div>
      </div>
    </div>
  );
}
