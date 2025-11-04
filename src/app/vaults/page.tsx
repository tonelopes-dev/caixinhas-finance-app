
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getMockDataForUser, type User as UserType } from '@/lib/data';
import type { Vault, VaultInvitation } from '@/lib/definitions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Check, Mail, Plus, X, User as UserIcon } from 'lucide-react';
import Image from 'next/image';
import { Logo } from '@/components/logo';

function WorkspaceCard({ id, name, imageUrl, members, onSelect }: { id: string; name: string; imageUrl: string; members: UserType[], onSelect: (id: string) => void }) {
  return (
    <Card
      onClick={() => onSelect(id)}
      className="cursor-pointer transition-transform hover:scale-[1.02] hover:shadow-xl group"
    >
      <CardHeader className="p-0">
        <div className="relative h-40 w-full">
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover rounded-t-lg"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors">{name}</CardTitle>
        {members && (
            <div className="flex -space-x-2 overflow-hidden mt-2">
                {members.map(member => (
                    <Avatar key={member.id} className="inline-block h-6 w-6 rounded-full border-2 border-card">
                        <AvatarImage src={member.avatarUrl} alt={member.name} />
                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                ))}
            </div>
        )}
      </CardContent>
    </Card>
  );
}


function InvitationCard({ invitation }: { invitation: VaultInvitation }) {
  return (
    <div className="flex items-center justify-between rounded-lg border p-4 bg-card">
      <div>
        <p className="font-medium">
          <span className="font-bold">{invitation.invitedBy}</span> te convidou para o cofre{' '}
          <span className="font-bold text-primary">{invitation.vaultName}</span>.
        </p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="icon" className="h-8 w-8">
          <Check className="h-4 w-4" />
        </Button>
        <Button variant="destructive" size="icon" className="h-8 w-8">
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default function VaultSelectionPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [userVaults, setUserVaults] = useState<Vault[]>([]);
  const [userInvitations, setUserInvitations] = useState<VaultInvitation[]>([]);

  useEffect(() => {
    const userId = localStorage.getItem('DREAMVAULT_USER_ID');
    if (!userId) {
      // This case is handled by withAuth, but it's a good safeguard.
      return;
    }
    
    // For the vaults page, we don't have a workspaceId yet.
    // We pass the userId as the "workspace" to get the user's general data.
    const { currentUser, userVaults, userInvitations } = getMockDataForUser(userId, userId);
    setCurrentUser(currentUser || null);
    setUserVaults(userVaults);
    setUserInvitations(userInvitations);

  }, []);

  const handleSelectWorkspace = (workspaceId: string) => {
    // workspaceId can be a userId or a vaultId
    sessionStorage.setItem('DREAMVAULT_VAULT_ID', workspaceId);
    router.push('/');
  };
  
  const handleLogout = () => {
    localStorage.removeItem('DREAMVAULT_USER_ID');
    sessionStorage.removeItem('DREAMVAULT_VAULT_ID');
    document.cookie = 'DREAMVAULT_USER_ID=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    router.push('/login');
  }

  if (!currentUser) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-background p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-4xl">
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-2">
            <Logo className="h-8 w-8" />
            <h1 className="font-headline text-xl font-bold text-foreground">DreamVault</h1>
          </div>
           <div className="flex items-center gap-4">
                <div className='text-right'>
                    <p className="text-sm font-medium">{currentUser.name}</p>
                    <p className="text-xs text-muted-foreground">{currentUser.email}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={handleLogout}>Sair</Button>
           </div>
        </header>
        
        <main>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-headline tracking-tight">Bem-vindo(a), {currentUser.name.split(' ')[0]}!</h2>
            <p className="text-muted-foreground mt-2">Escolha um espaço de trabalho para começar a planejar.</p>
          </div>

          {userInvitations.length > 0 && (
            <div className="mb-12">
              <h3 className="flex items-center gap-2 text-xl font-semibold mb-4"><Mail className="h-5 w-5 text-primary" /> Convites Pendentes</h3>
              <div className="grid gap-4">
                {userInvitations.map(inv => <InvitationCard key={inv.id} invitation={inv} />)}
              </div>
            </div>
          )}
          
          <div>
            <h3 className="text-xl font-semibold mb-4">Seus Espaços</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                 {/* Personal Account Card */}
                <WorkspaceCard 
                    id={currentUser.id}
                    name="Minha Conta Pessoal"
                    imageUrl={currentUser.avatarUrl}
                    members={[currentUser]}
                    onSelect={handleSelectWorkspace}
                />

                {/* Vault Cards */}
                {userVaults.map(vault => (
                    <WorkspaceCard 
                        key={vault.id} 
                        id={vault.id}
                        name={vault.name}
                        imageUrl={vault.imageUrl}
                        members={vault.members}
                        onSelect={handleSelectWorkspace} 
                    />
                ))}
                
                {/* Create New Vault Card */}
                <Card className="flex flex-col items-center justify-center border-dashed border-2 cursor-pointer transition-colors hover:border-primary hover:bg-muted/50">
                    <CardContent className="p-6 text-center">
                        <Plus className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
                        <p className="font-semibold">Criar Novo Cofre</p>
                    </CardContent>
                </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
