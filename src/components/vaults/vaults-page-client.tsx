
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Check, Mail, Plus, X } from 'lucide-react';
import Image from 'next/image';
import { Logo } from '@/components/logo';
import { CreateVaultDialog } from '@/components/vaults/create-vault-dialog';
import { acceptInvitationAction, declineInvitationAction } from '@/app/vaults/actions';
import { setWorkspaceAction } from '@/app/vaults/workspace-actions';
import { useToast } from '@/hooks/use-toast';
import { signOut } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';

type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  subscriptionStatus: string;
};

type Vault = {
  id: string;
  name: string;
  imageUrl: string;
  ownerId: string;
  members: User[];
};

type VaultInvitation = {
  id: string;
  vaultId: string;
  vaultName: string;
  invitedBy: string;
  status: 'pending' | 'accepted' | 'declined';
};

type VaultsPageClientProps = {
  currentUser: User;
  userVaults: Vault[];
  userInvitations: VaultInvitation[];
};

function WorkspaceCard({
  id,
  name,
  imageUrl,
  members,
  onSelect,
}: {
  id: string;
  name: string;
  imageUrl: string;
  members: User[];
  onSelect: (id: string) => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        onClick={() => onSelect(id)}
        className="cursor-pointer transition-transform hover:scale-[1.02] hover:shadow-xl group h-full flex flex-col"
      >
        <CardHeader className="p-0">
          <div className="relative h-40 w-full">
            <Image src={imageUrl} alt={name} fill className="object-cover rounded-t-lg" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          </div>
        </CardHeader>
        <CardContent className="p-4 flex-grow flex flex-col justify-between">
          <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors">
            {name}
          </CardTitle>
          {members && (
            <div className="flex -space-x-2 overflow-hidden mt-2">
              {members.map((member) => (
                <Avatar
                  key={member.id}
                  className="inline-block h-6 w-6 rounded-full border-2 border-card"
                >
                  <AvatarImage src={member.avatarUrl || ''} alt={member.name} />
                  <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                </Avatar>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function InvitationCard({
  invitation,
  userId,
  onAction,
}: {
  invitation: VaultInvitation;
  userId: string;
  onAction: () => void;
}) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<'accept' | 'decline' | null>(null);

  const handleAccept = async () => {
    setIsLoading('accept');
    try {
      const result = await acceptInvitationAction(invitation.id, userId);
      toast({
        title: result.success ? 'Sucesso' : 'Erro',
        description: result.message,
        variant: result.success ? 'default' : 'destructive',
      });
      if (result.success) onAction();
    } catch (error) {
      toast({ title: 'Erro', description: 'Erro ao aceitar convite', variant: 'destructive' });
    } finally {
      setIsLoading(null);
    }
  };

  const handleDecline = async () => {
    setIsLoading('decline');
    try {
      const result = await declineInvitationAction(invitation.id, userId);
      toast({
        title: 'Convite recusado',
        description: result.message,
        variant: result.success ? 'default' : 'destructive',
      });
      if (result.success) onAction();
    } catch (error) {
      toast({ title: 'Erro', description: 'Erro ao recusar convite', variant: 'destructive' });
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <motion.div
        layout
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: -50, transition: { duration: 0.3 } }}
        className="flex items-center justify-between rounded-lg border p-4 bg-card"
    >
      <div>
        <p className="font-medium">
          <span className="font-bold">{invitation.invitedBy}</span> te convidou para o cofre{' '}
          <span className="font-bold text-primary">{invitation.vaultName}</span>.
        </p>
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={handleAccept}
          disabled={!!isLoading}
        >
          {isLoading === 'accept' ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" /> : <Check className="h-4 w-4" />}
        </Button>
        <Button
          variant="destructive"
          size="icon"
          className="h-8 w-8"
          onClick={handleDecline}
          disabled={!!isLoading}
        >
          {isLoading === 'decline' ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" /> : <X className="h-4 w-4" />}
        </Button>
      </div>
    </motion.div>
  );
}

export function VaultsPageClient({
  currentUser,
  userVaults,
  userInvitations,
}: VaultsPageClientProps) {
  const router = useRouter();
  const [isCreateVaultOpen, setCreateVaultOpen] = useState(false);

  const handleSelectWorkspace = async (workspaceId: string) => {
    // Salvar no sessionStorage para compatibilidade com código existente
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('CAIXINHAS_VAULT_ID', workspaceId);
      localStorage.setItem('CAIXINHAS_USER_ID', currentUser.id);
    }
    
    // Salvar no cookie e redirecionar via Server Action
    await setWorkspaceAction(workspaceId, currentUser.id);
  };

  const handleLogout = async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('CAIXINHAS_USER_ID');
      sessionStorage.removeItem('CAIXINHAS_VAULT_ID');
    }
    await signOut({ 
      callbackUrl: '/login',
      redirect: true
    });
  };

  const handleInvitationAction = () => {
    // Recarregar a página para atualizar os dados
    router.refresh();
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-background p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-4xl">
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-2">
            <Logo className="h-8 w-8" />
            <h1 className="font-headline text-xl font-bold text-foreground">Caixinhas</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium">{currentUser.name}</p>
              <p className="text-xs text-muted-foreground">{currentUser.email}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              Sair
            </Button>
          </div>
        </header>

        <main>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-headline tracking-tight">
              Bem-vindo(a), {currentUser.name.split(' ')[0]}!
            </h2>
            <p className="text-muted-foreground mt-2">
              Escolha um espaço de trabalho para começar a planejar.
            </p>
          </div>

          <AnimatePresence>
            {userInvitations.length > 0 && (
              <motion.div layout className="mb-12">
                <h3 className="flex items-center gap-2 text-xl font-semibold mb-4">
                  <Mail className="h-5 w-5 text-primary" /> Convites Pendentes
                </h3>
                <div className="grid gap-4">
                  <AnimatePresence>
                    {userInvitations.map((inv) => (
                      <InvitationCard
                        key={inv.id}
                        invitation={inv}
                        userId={currentUser.id}
                        onAction={handleInvitationAction}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>


          <div>
            <h3 className="text-xl font-semibold mb-4">Seus Espaços</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Personal Account Card */}
              <WorkspaceCard
                id={currentUser.id}
                name="Minha Conta Pessoal"
                imageUrl={currentUser.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + currentUser.email}
                members={[currentUser]}
                onSelect={handleSelectWorkspace}
              />

              {/* Vault Cards */}
              <AnimatePresence>
                {userVaults.map((vault) => (
                  <WorkspaceCard
                    key={vault.id}
                    id={vault.id}
                    name={vault.name}
                    imageUrl={vault.imageUrl}
                    members={vault.members}
                    onSelect={handleSelectWorkspace}
                  />
                ))}
              </AnimatePresence>
              

              {/* Create New Vault Card */}
              <Card
                onClick={() => setCreateVaultOpen(true)}
                className="flex flex-col items-center justify-center border-dashed border-2 cursor-pointer transition-colors hover:border-primary hover:bg-muted/50 min-h-[220px]"
              >
                <CardContent className="p-6 text-center">
                  <Plus className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
                  <p className="font-semibold">Criar Novo Cofre</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
        <CreateVaultDialog
          open={isCreateVaultOpen}
          onOpenChange={setCreateVaultOpen}
          currentUser={currentUser}
        />
      </div>
    </div>
  );
}
