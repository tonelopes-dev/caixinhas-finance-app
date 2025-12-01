'use client';

import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ExternalLink, Trash2, UserMinus, UserPlus, X } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import Link from 'next/link';
import { 
  updateVaultAction, 
  deleteVaultAction, 
  removeMemberAction, 
  inviteToVaultAction,
  getVaultPendingInvitationsAction,
  cancelInvitationAction
} from '@/app/vaults/actions';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useActionState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from '@/components/ui/badge';

const coverImages = [
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
    'https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?w=800',
    'https://images.unsplash.com/photo-1519642918688-7e43b19245d8?w=800',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
    'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800',
];

type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  subscriptionStatus: string;
};

interface EditVaultDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vault: {
    id: string;
    name: string;
    imageUrl: string | null; // Allow null for image URL
    isPrivate: boolean;
    ownerId: string;
    members: User[];
  };
}

export function EditVaultDialog({ open, onOpenChange, vault }: EditVaultDialogProps) {
  const [vaultName, setVaultName] = useState(vault.name);
  const [selectedPresetImage, setSelectedPresetImage] = useState<string | null>(null);
  const [customImageUrlInput, setCustomImageUrlInput] = useState<string | null>(null);
  const [localImageFile, setLocalImageFile] = useState<File | null>(null);
  const [localImagePreviewUrl, setLocalImagePreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPrivate, setIsPrivate] = useState(vault.isPrivate);
  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [pendingInvitations, setPendingInvitations] = useState<any[]>([]);
  const { toast } = useToast();
  const router = useRouter();
  
  const [state, formAction, isPending] = useActionState(updateVaultAction, {
    message: null,
  });

  // Determine the final image URL for display
  const displayImageUrl = localImagePreviewUrl || customImageUrlInput || selectedPresetImage || vault.imageUrl || coverImages[0];

  // Fetch pending invitations
  const fetchPendingInvitations = React.useCallback(async () => {
    if (open && vault.id) {
      const invitations = await getVaultPendingInvitationsAction(vault.id);
      setPendingInvitations(invitations);
    }
  }, [open, vault.id]);

  // Reset form when vault changes or dialog opens
  React.useEffect(() => {
    if (open) {
        setVaultName(vault.name);
        setIsPrivate(vault.isPrivate);
        // Reset image states based on current vault image
        if (vault.imageUrl && coverImages.includes(vault.imageUrl)) {
            setSelectedPresetImage(vault.imageUrl);
            setCustomImageUrlInput(null);
        } else if (vault.imageUrl) {
            setSelectedPresetImage(null);
            setCustomImageUrlInput(vault.imageUrl);
        } else {
            setSelectedPresetImage(coverImages[0]); // Default preset if no image
            setCustomImageUrlInput(null);
        }
        setLocalImageFile(null);
        setLocalImagePreviewUrl(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        fetchPendingInvitations();
    }
  }, [open, vault, fetchPendingInvitations]);

  React.useEffect(() => {
    if (state?.message && !state?.errors) {
      toast({
        title: 'Sucesso',
        description: state.message,
      });
      onOpenChange(false);
      router.refresh();
    } else if (state?.errors) {
      toast({
        title: 'Erro',
        description: state.message || 'Erro ao atualizar cofre',
        variant: 'destructive',
      });
    }
  }, [state, toast, onOpenChange, router]);

  const handlePresetImageSelection = (imageUrl: string) => {
    setSelectedPresetImage(imageUrl);
    setCustomImageUrlInput(null); // Clear custom URL
    setLocalImageFile(null); // Clear local file
    setLocalImagePreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  const handleCustomUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setCustomImageUrlInput(url || null);
    setSelectedPresetImage(null); // Clear preset selection
    setLocalImageFile(null); // Clear local file
    setLocalImagePreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setLocalImageFile(file);
    if (file) {
      setLocalImagePreviewUrl(URL.createObjectURL(file));
      setSelectedPresetImage(null); // Clear preset selection
      setCustomImageUrlInput(null); // Clear custom URL
    } else {
      setLocalImagePreviewUrl(null);
    }
  }

  const handleRemoveImage = () => {
    setLocalImageFile(null);
    setLocalImagePreviewUrl(null);
    setSelectedPresetImage(null); // Explicitly set to null to indicate removal
    setCustomImageUrlInput(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  const handleInvite = async () => {
    if (!inviteEmail) return;
    setIsInviting(true);
    try {
      const result = await inviteToVaultAction(vault.id, inviteEmail);
      toast({
        title: result.success ? 'Convite enviado' : 'Erro',
        description: result.message,
        variant: result.success ? 'default' : 'destructive',
      });
      if (result.success) {
        setInviteEmail('');
        fetchPendingInvitations();
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao enviar convite',
        variant: 'destructive',
      });
    } finally {
      setIsInviting(false);
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    try {
      const result = await cancelInvitationAction(invitationId, vault.id); // Pass vault.id
      toast({
        title: result.success ? 'Convite cancelado' : 'Erro',
        description: result.message,
        variant: result.success ? 'default' : 'destructive',
      });
      if (result.success) {
        fetchPendingInvitations();
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao cancelar convite',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveMember = async (userId: string) => {
    try {
      const result = await removeMemberAction(vault.id, userId);
      toast({
        title: result.success ? 'Membro removido' : 'Erro',
        description: result.message,
        variant: result.success ? 'default' : 'destructive',
      });
      if (result.success) router.refresh();
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao remover membro',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteVault = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteVaultAction(vault.id);
      toast({
        title: result.success ? 'Cofre excluído' : 'Erro',
        description: result.message,
        variant: result.success ? 'default' : 'destructive',
      });
      if (result.success) {
        onOpenChange(false);
        router.refresh();
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao excluir cofre',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <form action={formAction} encType="multipart/form-data"> {/* Add encType */}
            <input type="hidden" name="vaultId" value={vault.id} />
            {/* Hidden input for imageUrl, only if no file is selected. 
                If a file is selected, the action will handle the upload. 
                If customImageUrlInput is null, it means the user cleared it or it wasn't there.
                If selectedPresetImage is null, it means no preset is selected.
                If both are null, it means the image is explicitly removed.
            */}
            {!localImageFile && (
                <input 
                    type="hidden" 
                    name="imageUrl" 
                    value={customImageUrlInput ?? selectedPresetImage ?? ''} 
                />
            )}
            
            <DialogHeader>
            <DialogTitle className="font-headline text-xl">Gerenciar Cofre</DialogTitle>
            <DialogDescription>
                Atualize as informações, gerencie membros ou exclua o cofre.
            </DialogDescription>
            </DialogHeader>

            <div className="grid gap-6 py-4">
                {/* Preview da Imagem */}
                <div className="relative h-40 w-full rounded-md border flex items-center justify-center overflow-hidden">
                    {displayImageUrl ? (
                        <Image src={displayImageUrl} alt="Preview da Imagem" fill className="object-cover" />
                    ) : (
                        <span className="text-muted-foreground">Sem imagem</span>
                    )}
                    {(localImageFile || customImageUrlInput || selectedPresetImage) && ( 
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2 rounded-full bg-background/80"
                            onClick={handleRemoveImage}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>

                <div className="space-y-2"> {/* Increased spacing */}
                    <Label htmlFor="edit-vault-name">Nome do Cofre</Label>
                    <Input
                        id="edit-vault-name"
                        name="name"
                        value={vaultName}
                        onChange={(e) => setVaultName(e.target.value)}
                        placeholder="Ex: Reforma da Casa"
                        required
                    />
                    {state?.errors?.name && (
                      <p className="text-sm text-destructive">{state.errors.name[0]}</p>
                    )}
                </div>

                <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                        <Label htmlFor="edit-is-private" className="text-base">
                            Cofre Privado
                        </Label>
                        <p className="text-sm text-muted-foreground">
                            Cofres privados são visíveis apenas para você.
                        </p>
                    </div>
                    <Switch 
                        id="edit-is-private" 
                        name="isPrivate" 
                        checked={isPrivate}
                        onCheckedChange={setIsPrivate}
                    />
                </div>

                <div className="space-y-4">
                    <Label>Imagem de Capa</Label>

                    {/* File Upload Input */}
                    <div className="space-y-2">
                        <Label htmlFor="image-file">Upload de Imagem (local)</Label>
                        <Input
                            id="image-file"
                            type="file"
                            name="imageFile" 
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                        />
                    </div>

                    {/* Preset Images */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 mb-2">
                            <Label>Ou selecione uma imagem predefinida</Label>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                        {coverImages.map(imgSrc => (
                            <button 
                                type="button" 
                                key={imgSrc} 
                                onClick={() => handlePresetImageSelection(imgSrc)} 
                                className={cn(
                                    'relative h-20 w-full overflow-hidden rounded-md border-2 transition-all hover:opacity-90', 
                                    selectedPresetImage === imgSrc && !localImageFile && !customImageUrlInput 
                                        ? 'border-primary ring-2 ring-primary ring-offset-1' 
                                        : 'border-transparent hover:border-muted-foreground/20'
                                )}
                            >
                                <Image src={imgSrc} alt="Opção de capa" fill className="object-cover" />
                                {selectedPresetImage === imgSrc && !localImageFile && !customImageUrlInput && (
                                    <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                                        <div className="bg-primary text-primary-foreground rounded-full p-0.5">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                        </div>
                                    </div>
                                )}
                            </button>
                        ))}
                        </div>
                    </div>

                    {/* Custom URL Input */}
                    <div className="space-y-2 mt-2">
                        <Label htmlFor="edit-custom-image-url" className="text-xs text-muted-foreground">Ou cole a URL de uma imagem externa</Label>
                        <Input 
                            id="edit-custom-image-url"
                            placeholder="https://images.unsplash.com/..."
                            value={customImageUrlInput ?? ''} // Ensure it's not null for controlled input
                            onChange={handleCustomUrlChange}
                            className="text-sm"
                        />
                        {state?.errors?.imageUrl && (
                          <p className="text-sm text-destructive">{state.errors.imageUrl[0]}</p>
                        )}
                    </div>
                </div>

                <div className="space-y-3">
                    <Label>Membros</Label>
                    <div className="flex gap-2">
                        <Input 
                            placeholder="E-mail do novo membro" 
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                        />
                        <Button type="button" onClick={handleInvite} disabled={isInviting || !inviteEmail}>
                            {isInviting ? 'Enviando...' : <><UserPlus className="mr-2 h-4 w-4" /> Convidar</>}
                        </Button>
                    </div>
                    
                    <div className="space-y-2 mt-4">
                        {vault.members.map((member) => (
                            <div key={member.id} className="flex items-center justify-between p-2 rounded-lg border bg-card">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={member.avatarUrl || ''} />
                                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-sm font-medium">{member.name}</p>
                                        <p className="text-xs text-muted-foreground">{member.email}</p>
                                    </div>
                                </div>
                                {member.id !== vault.ownerId && (
                                    <Button 
                                        type="button" 
                                        variant="ghost" 
                                        size="icon" 
                                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                        onClick={() => handleRemoveMember(member.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                                {member.id === vault.ownerId && (
                                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">Dono</span>
                                )}
                            </div>
                        ))}

                        {/* Lista de Convites Pendentes */}
                        {pendingInvitations.length > 0 && (
                          <>
                            <Label className="text-xs text-muted-foreground mt-4 block">Convites Pendentes</Label>
                            {pendingInvitations.map((invitation) => (
                              <div key={invitation.id} className="flex items-center justify-between p-2 rounded-lg border border-dashed bg-muted/30">
                                <div className="flex items-center gap-3">
                                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                                    <UserPlus className="h-4 w-4 text-muted-foreground" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium">{invitation.email}</p>
                                    <div className="flex items-center gap-2">
                                      <Badge variant="outline" className="text-[10px] h-5 px-1 bg-yellow-500/10 text-yellow-600 border-yellow-200">
                                        Pendente
                                      </Badge>
                                      <span className="text-[10px] text-muted-foreground">
                                        Enviado por {invitation.invitedBy}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <Button 
                                  type="button" 
                                  variant="ghost" 
                                  size="icon" 
                                  className="text-muted-foreground hover:text-destructive"
                                  onClick={() => handleCancelInvitation(invitation.id)}
                                  title="Cancelar convite"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </>
                        )}
                    </div>
                </div>


                <div className="pt-4 border-t">
                    <Label className="text-destructive mb-2 block">Zona de Perigo</Label>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button type="button" variant="destructive" className="w-full">
                                <Trash2 className="mr-2 h-4 w-4" /> Excluir Cofre
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Esta ação não pode ser desfeita. Isso excluirá permanentemente o cofre 
                                    <span className="font-bold"> {vault.name} </span> 
                                    e removerá todos os dados associados.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDeleteVault} disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                    {isDeleting ? 'Excluindo...' : 'Sim, excluir cofre'}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>
            <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                <Button type="submit" disabled={isPending || !vaultName.trim()}>
                  {isPending ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
