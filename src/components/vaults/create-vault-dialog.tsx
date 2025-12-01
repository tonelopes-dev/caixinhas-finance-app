'use client';

import React from 'react';
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
import { ExternalLink, Plus, X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import Link from 'next/link';
import { VaultCreationSuccessDialog } from './vault-creation-success-dialog';
import { createVaultAction } from '@/app/vaults/actions';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useActionState } from 'react';

type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
};

const coverImages = [
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
    'https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?w=800',
    'https://images.unsplash.com/photo-1519642918688-7e43b19245d8?w=800',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
    'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800',
];

interface CreateVaultDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUser: User;
}

export function CreateVaultDialog({ open, onOpenChange, currentUser }: CreateVaultDialogProps) {
  const [vaultName, setVaultName] = React.useState('');
  const [selectedImage, setSelectedImage] = React.useState(coverImages[0]);
  const [customImageUrl, setCustomImageUrl] = React.useState('');
  const [isSuccessModalOpen, setSuccessModalOpen] = React.useState(false);
  const { toast } = useToast();
  const router = useRouter();
  
  const [state, formAction, isPending] = useActionState(createVaultAction, {
    message: null,
  });

  React.useEffect(() => {
    if (state?.message && !state?.errors) {
      toast({
        title: 'Sucesso',
        description: state.message,
      });
      
      // Reset form
      setVaultName('');
      setSelectedImage(coverImages[0]);
      setCustomImageUrl('');
      
      onOpenChange(false);
      setSuccessModalOpen(true);
      router.refresh();
    } else if (state?.errors) {
      toast({
        title: 'Erro',
        description: state.message || 'Erro ao criar cofre',
        variant: 'destructive',
      });
    }
  }, [state, toast, onOpenChange, router]);
  
  
  const handleRemoveMember = (userId: string) => {
    // Feature para ser implementada quando tivermos InvitationService
  };

  const handleImageSelection = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setCustomImageUrl('');
  }

  const handleCustomUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomImageUrl(e.target.value);
    setSelectedImage(e.target.value);
  }

  return (
    <>
        <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[525px]">
            <form action={formAction}>
                <DialogHeader>
                <DialogTitle className="font-headline text-xl">Criar Novo Cofre Compartilhado</DialogTitle>
                <DialogDescription>
                    Comece um novo espaço para planejar e economizar em conjunto.
                </DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                    <input type="hidden" name="userId" value={currentUser.id} />
                    <div className="space-y-2">
                        <Label htmlFor="vault-name">Nome do Cofre</Label>
                        <Input
                            id="vault-name"
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
                            <Label htmlFor="is-private" className="text-base">
                                Cofre Privado
                            </Label>
                            <p className="text-sm text-muted-foreground">
                                Cofres privados são visíveis apenas para você.
                            </p>
                        </div>
                        <Switch id="is-private" name="isPrivate" />
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center gap-2 mb-2">
                            <Label>Imagem de Capa</Label>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="outline" size="icon" className="h-6 w-6" asChild>
                                            <Link href="https://unsplash.com" target="_blank">
                                                <ExternalLink className="h-3 w-3" />
                                            </Link>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Copie a URL de uma imagem do Unsplash. Apenas URLs do unsplash.com são aceitas.</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                        {coverImages.map(imgSrc => (
                            <button type="button" key={imgSrc} onClick={() => handleImageSelection(imgSrc)} className={cn('relative h-20 w-full overflow-hidden rounded-md border-2 transition-all', selectedImage === imgSrc && !customImageUrl ? 'border-primary ring-2 ring-primary' : 'border-transparent')}>
                                <Image src={imgSrc} alt="Imagem de capa" fill className="object-cover" />
                            </button>
                        ))}
                        </div>
                        <div className="space-y-2 mt-2">
                            <Label htmlFor="custom-image-url">Ou cole a URL de uma imagem</Label>
                            <Input 
                                id="custom-image-url"
                                placeholder="https://images.unsplash.com/..."
                                value={customImageUrl}
                                onChange={handleCustomUrlChange}
                            />
                            <input type="hidden" name="imageUrl" value={selectedImage} />
                            {state?.errors?.imageUrl && (
                              <p className="text-sm text-destructive">{state.errors.imageUrl[0]}</p>
                            )}
                        </div>
                    </div>
                </div>
                <DialogFooter>
                <Button type="submit" disabled={isPending || !vaultName.trim()}>
                  {isPending ? 'Criando...' : 'Criar Cofre'}
                </Button>
                </DialogFooter>
            </form>
        </DialogContent>
        </Dialog>
        <VaultCreationSuccessDialog open={isSuccessModalOpen} onOpenChange={setSuccessModalOpen} />
    </>
  );
}
