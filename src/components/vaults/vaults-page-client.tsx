'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Check, Mail, Plus, X, MoreVertical, Pencil, Users } from 'lucide-react';
import Image from 'next/image';
import { Logo } from '@/components/logo';
import { CreateVaultDialog } from '@/components/vaults/create-vault-dialog';
import { EditVaultDialog } from '@/components/vaults/edit-vault-dialog';
import { acceptInvitationAction, declineInvitationAction } from '@/app/vaults/actions';
import { setWorkspaceAction } from '@/app/vaults/workspace-actions';
import { useToast } from '@/hooks/use-toast';
import { signOut } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';


type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  workspaceImageUrl: string | null;
  subscriptionStatus: string;
};

type Vault = {
  id: string;
  name: string;
  imageUrl: string;
  isPrivate: boolean;
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
  canCreateVaults?: boolean;
  canAccessPersonal?: boolean;
};

function WorkspaceCard({
  id,
  name,
  imageUrl,
  members,
  isPersonal = false,
  isPrivate = false,
  onEdit,
  onEditProfile,
  onConvert,
  isOwner = false,
  ownerId,
}: {
  id: string;
  name: string;
  imageUrl: string;
  members: User[];
  isPersonal?: boolean;
  isPrivate?: boolean;
  onEdit?: (vault: Vault) => void;
  onEditProfile?: () => void;
  onConvert?: () => void;
  isOwner?: boolean;
  ownerId?: string;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className="h-full relative group"
    >
      {onEdit && (
        <div className="absolute top-2 right-2 z-20">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="h-8 w-8 bg-background/80 backdrop-blur-sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isOwner && (
                <DropdownMenuItem onClick={() => onEdit({ id, name, imageUrl, isPrivate, ownerId: ownerId || '', members })}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar Espaço
                </DropdownMenuItem>
              )}
              {!isOwner && (
                <DropdownMenuItem disabled>
                  <Pencil className="mr-2 h-4 w-4 opacity-50" />
                  Apenas Proprietário
                </DropdownMenuItem>
              )}
              {isPersonal && onConvert && (
                <DropdownMenuItem onClick={onConvert}>
                  <ArrowRightLeft className="mr-2 h-4 w-4" />
                  Converter em Compartilhado
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      <form action={setWorkspaceAction} className="h-full">
        <input type="hidden" name="workspaceId" value={id} />
        <input type="hidden" name="isPersonal" value={isPersonal.toString()} />
        <button type="submit" className="h-full w-full text-left">
          <Card className="cursor-pointer transition-all hover:scale-[1.02] hover:shadow-xl group h-full flex flex-col w-full">
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
        </button>
      </form>
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
      <div className="font-medium">
        <span className="font-bold">{invitation.invitedBy}</span> te convidou para o cofre{' '}
        <span className="font-bold text-primary">{invitation.vaultName}</span>.
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
  canCreateVaults = true,
  canAccessPersonal = true,
}: VaultsPageClientProps) {
  const router = useRouter();
  const [isCreateVaultOpen, setCreateVaultOpen] = useState(false);
  const [editingVault, setEditingVault] = useState<Vault | null>(null);

  const { toast } = useToast();

  const handleCreateVaultClick = () => {
    if (!canCreateVaults) {
      toast({
        title: 'Acesso Restrito',
        description: 'Você precisa de uma assinatura ativa para criar novos cofres.',
        variant: 'destructive',
      });
      return;
    }
    setCreateVaultOpen(true);
  };

  const handleEditClick = (vault: Vault) => {
    setEditingVault(vault);
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
    router.refresh();
  };

  const handleConvertPersonal = async () => {
    setIsConverting(true);
    try {
      // TODO: Implementar conversão de conta pessoal para cofre compartilhado
      toast({
        title: result.success ? 'Sucesso' : 'Erro',
        description: result.message,
        variant: result.success ? 'default' : 'destructive',
      });
      if (result.success) {
        setConvertDialogOpen(false);
        router.refresh();
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao converter a conta.',
        variant: 'destructive',
      });
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <>
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-2">
            <Logo className="h-8 w-8" />
            <h1 className="font-headline text-xl font-bold text-foreground">Caixinhas</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="font-semibold">{currentUser.name}</p>
              <p className="text-xs text-muted-foreground">{currentUser.email}</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => router.push('/profile')}>
              Meu Perfil
            </Button>
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
            <div className="text-muted-foreground mt-2">
              Escolha um espaço de trabalho para começar a planejar.
            </div>
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

              {/* Vault Cards */}
              <AnimatePresence>
                {userVaults.map((vault) => (
                  <WorkspaceCard
                    key={vault.id}
                    id={vault.id}
                    name={vault.name}
                    imageUrl={vault.imageUrl}
                    isPrivate={vault.isPrivate}
                    members={vault.members}
                    isPersonal={false}
                    isOwner={vault.ownerId === currentUser.id}
                    ownerId={vault.ownerId}
                    onEdit={handleEditClick}
                  />
                ))}
              </AnimatePresence>
              
              {/* Create New Vault Card */}
              <Card
                onClick={handleCreateVaultClick}
                className={`flex flex-col items-center justify-center border-dashed border-2 transition-colors min-h-[220px] ${
                  canCreateVaults 
                    ? 'cursor-pointer hover:border-primary hover:bg-muted/50' 
                    : 'opacity-50 cursor-not-allowed'
                }`}
              >
                <CardContent className="p-6 text-center">
                  <Plus className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
                  <div className="font-semibold">Criar Novo Cofre</div>
                  {!canCreateVaults && (
                    <div className="text-xs text-muted-foreground mt-1">🔒 Requer assinatura</div>
                  )}
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
        {editingVault && (
          <EditVaultDialog
            open={!!editingVault}
            onOpenChange={(open) => !open && setEditingVault(null)}
            vault={editingVault}
          />
        )}
        



    </>
  );
}
