'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Check, Mail, Plus, X, MoreVertical, Pencil, Users, Crown, Calendar, UserPlus } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { Logo } from '@/components/logo';
import { CreateVaultDialog } from '@/components/vaults/create-vault-dialog';
import { EditVaultDialog } from '@/components/vaults/edit-vault-dialog';
import { acceptInvitationAction, declineInvitationAction } from '@/app/vaults/actions';
import { setWorkspaceAction } from '@/app/vaults/workspace-actions';
import { useToast } from '@/hooks/use-toast';
import { performLogout } from '@/lib/auth-utils';
import { useAuthLoading } from '@/hooks/use-auth-loading';
import { LoadingScreen } from '@/components/ui/loading-screen';
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
  sender?: {
    name: string;
    avatarUrl: string | null;
  };
  vault?: {
    name: string;
    imageUrl: string | null;
    members: {
      user: {
        id: string;
        name: string;
        avatarUrl: string | null;
      };
    }[];
  } | null;
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
  const [isHovered, setIsHovered] = useState(false);

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

  const vaultImageUrl = invitation.vault?.imageUrl || 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1080';
  const memberAvatars = invitation.vault?.members.slice(0, 4) || [];
  const remainingMembers = (invitation.vault?.members.length || 0) - 4;

  return (
    <TooltipProvider delayDuration={300}>
      <motion.div
        layout
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, x: -50, scale: 0.95, transition: { duration: 0.3 } }}
        whileHover={{ y: -2, transition: { duration: 0.2 } }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className="group relative rounded-xl border-2 border-primary/20 bg-gradient-to-br from-card via-card to-primary/5 p-6 shadow-lg hover:border-primary/40 hover:shadow-xl transition-all duration-300"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-primary/5 to-accent/10 opacity-60" />
        
        {/* Vault Cover Image */}
        <div className="relative z-10 mb-4">
          <div className="flex items-start gap-4">
            <div className="relative overflow-hidden rounded-lg">
              <Image
                src={vaultImageUrl}
                alt={`Capa do cofre ${invitation.vaultName}`}
                width={80}
                height={80}
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <UserPlus className="h-4 w-4 text-primary" />
                <Badge variant="secondary" className="text-xs">
                  Convite Pendente
                </Badge>
              </div>
              
              <h4 className="text-lg font-bold text-foreground mb-1 truncate">
                {invitation.vaultName}
              </h4>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Avatar className="h-5 w-5">
                  <AvatarImage src={invitation.sender?.avatarUrl || ''} />
                  <AvatarFallback className="text-xs bg-primary/10">
                    {invitation.invitedBy.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span>
                  Convite de <span className="font-semibold text-foreground">{invitation.invitedBy}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Members Preview */}
        {memberAvatars.length > 0 && (
          <div className="relative z-10 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {invitation.vault?.members.length} {invitation.vault?.members.length === 1 ? 'membro' : 'membros'}
              </span>
            </div>
            
            <div className="flex items-center">
              <div className="flex -space-x-2">
                {memberAvatars.map((member, index) => (
                  <Tooltip key={member.user.id}>
                    <TooltipTrigger asChild>
                      <Avatar 
                        className="h-8 w-8 border-2 border-background hover:scale-110 hover:z-10 transition-all duration-200 cursor-pointer"
                        style={{ zIndex: memberAvatars.length - index }}
                      >
                        <AvatarImage src={member.user.avatarUrl || ''} />
                        <AvatarFallback className="text-xs bg-primary/20">
                          {member.user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </TooltipTrigger>
                    <TooltipContent 
                      side="top" 
                      className="z-[100] bg-popover border border-border shadow-xl px-3 py-2 rounded-lg"
                      sideOffset={8}
                      avoidCollisions={true}
                    >
                      <p className="font-medium text-sm whitespace-nowrap text-popover-foreground">
                        {member.user.name}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                ))}
                
                {remainingMembers > 0 && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-muted text-xs font-medium text-muted-foreground hover:scale-110 transition-all duration-200 cursor-pointer">
                        +{remainingMembers}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent 
                      side="top" 
                      className="z-[100] bg-popover border border-border shadow-xl px-3 py-2 rounded-lg"
                      sideOffset={8}
                      avoidCollisions={true}
                    >
                      <p className="text-sm whitespace-nowrap text-popover-foreground">
                        Mais {remainingMembers} {remainingMembers === 1 ? 'membro' : 'membros'}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="relative z-10 flex gap-3">
          <Button
            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all duration-200"
            onClick={handleAccept}
            disabled={!!isLoading}
          >
            {isLoading === 'accept' ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                Aceitar Convite
              </>
            )}
          </Button>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="border-destructive/20 hover:border-destructive hover:bg-destructive hover:text-destructive-foreground transition-all duration-200"
                onClick={handleDecline}
                disabled={!!isLoading}
              >
                {isLoading === 'decline' ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <X className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Recusar convite</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Hover Effect Overlay */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          animate={{ opacity: isHovered ? 1 : 0 }}
        />
      </motion.div>
    </TooltipProvider>
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
  const { isVisible, message, setAuthLoading } = useAuthLoading();

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
    await performLogout(setAuthLoading);
  };

  const handleInvitationAction = () => {
    router.refresh();
  };



  return (
    <>
      {isVisible && <LoadingScreen message={message} />}
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
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="flex items-center gap-2 text-2xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                      <Mail className="h-6 w-6 text-primary" /> 
                      Convites Pendentes
                    </h3>
                    <p className="text-muted-foreground mt-1">
                      {userInvitations.length} {userInvitations.length === 1 ? 'convite aguardando' : 'convites aguardando'} sua decisão
                    </p>
                  </div>
                  <Badge variant="secondary" className="px-3 py-1">
                    {userInvitations.length}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            <h3 className="text-xl font-semibold mb-4">Seus Cofres</h3>
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
