import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { ProfileForm } from '@/components/profile/profile-form';
import { GuestsManagement } from '@/components/profile/guests-management';

export default function ProfilePage() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-background p-4">
      <div className="w-full max-w-4xl">
        <Button asChild variant="ghost" className="mb-4">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para o Painel
          </Link>
        </Button>
        <div className="grid gap-8 md:grid-cols-3">
          <div className="md:col-span-1">
            <h2 className="text-2xl font-headline font-bold">Seu Perfil</h2>
            <p className="text-muted-foreground">
              Atualize suas informações pessoais e gerencie seus convidados.
            </p>
          </div>
          <div className="grid auto-rows-max items-start gap-8 md:col-span-2">
            <ProfileForm />
            <GuestsManagement />
          </div>
        </div>
      </div>
    </div>
  );
}
