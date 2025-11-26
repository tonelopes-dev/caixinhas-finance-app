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
import { ExternalLink } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import Link from 'next/link';
import { updateVaultAction } from '@/app/vaults/actions';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useActionState } from 'react';

const coverImages = [
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
    'https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?w=800',
    'https://images.unsplash.com/photo-1519642918688-7e43b19245d8?w=800',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
    'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800',
];

interface EditVaultDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vault: {
    id: string;
    name: string;
    imageUrl: string;
    isPrivate: boolean;
  };
}

export function EditVaultDialog({ open, onOpenChange, vault }: EditVaultDialogProps) {
  const [vaultName, setVaultName] = React.useState(vault.name);
  const [selectedImage, setSelectedImage] = React.useState(vault.imageUrl);
  const [customImageUrl, setCustomImageUrl] = React.useState('');
  const [isPrivate, setIsPrivate] = React.useState(vault.isPrivate);
  const { toast } = useToast();
  const router = useRouter();
  
  const [state, formAction, isPending] = useActionState(updateVaultAction, {
    message: null,
  });

  // Reset form when vault changes or dialog opens
  React.useEffect(() => {
    if (open) {
        setVaultName(vault.name);
        setIsPrivate(vault.isPrivate);
        if (coverImages.includes(vault.imageUrl)) {
            setSelectedImage(vault.imageUrl);
            setCustomImageUrl('');
        } else {
            setSelectedImage('');
            setCustomImageUrl(vault.imageUrl);
        }
    }
  }, [open, vault]);

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

  const handleImageSelection = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setCustomImageUrl('');
  }

  const handleCustomUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomImageUrl(e.target.value);
    setSelectedImage(e.target.value);
  }

  const finalImageUrl = customImageUrl || selectedImage;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <form action={formAction}>
            <input type="hidden" name="vaultId" value={vault.id} />
            <input type="hidden" name="imageUrl" value={finalImageUrl} />
            
            <DialogHeader>
            <DialogTitle className="font-headline text-xl">Editar Cofre</DialogTitle>
            <DialogDescription>
                Atualize as informações do seu cofre compartilhado.
            </DialogDescription>
            </DialogHeader>

            <div className="grid gap-6 py-4">
                {/* Preview da Imagem */}
                <div className="relative h-32 w-full overflow-hidden rounded-lg border shadow-sm">
                    <Image 
                        src={finalImageUrl || coverImages[0]} 
                        alt="Preview da capa" 
                        fill 
                        className="object-cover transition-all hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                        <span className="text-white font-bold text-lg truncate">{vaultName || 'Nome do Cofre'}</span>
                    </div>
                </div>

                <div className="space-y-2">
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

                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <Label>Imagem de Capa</Label>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-6 text-xs text-muted-foreground" asChild>
                                        <Link href="https://unsplash.com" target="_blank">
                                            Buscar no Unsplash <ExternalLink className="ml-1 h-3 w-3" />
                                        </Link>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Encontre imagens incríveis no Unsplash</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-3">
                    {coverImages.map(imgSrc => (
                        <button 
                            type="button" 
                            key={imgSrc} 
                            onClick={() => handleImageSelection(imgSrc)} 
                            className={cn(
                                'relative h-16 w-full overflow-hidden rounded-md border-2 transition-all hover:opacity-90', 
                                selectedImage === imgSrc && !customImageUrl 
                                    ? 'border-primary ring-2 ring-primary ring-offset-1' 
                                    : 'border-transparent hover:border-muted-foreground/20'
                            )}
                        >
                            <Image src={imgSrc} alt="Opção de capa" fill className="object-cover" />
                            {selectedImage === imgSrc && !customImageUrl && (
                                <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                                    <div className="bg-primary text-primary-foreground rounded-full p-0.5">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                    </div>
                                </div>
                            )}
                        </button>
                    ))}
                    </div>

                    <div className="space-y-2 pt-2">
                        <Label htmlFor="edit-custom-image-url" className="text-xs text-muted-foreground">Ou use uma URL personalizada</Label>
                        <Input 
                            id="edit-custom-image-url"
                            // name="imageUrl" -> Removido para não conflitar com o hidden input
                            placeholder="https://images.unsplash.com/..."
                            value={customImageUrl}
                            onChange={handleCustomUrlChange}
                            className="text-sm"
                        />
                        {state?.errors?.imageUrl && (
                          <p className="text-sm text-destructive">{state.errors.imageUrl[0]}</p>
                        )}
                    </div>
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
