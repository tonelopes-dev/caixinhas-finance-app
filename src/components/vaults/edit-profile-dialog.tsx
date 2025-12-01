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
import { ExternalLink } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import Link from 'next/link';
import { updateUserAction } from '@/app/profile/actions';
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

type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
};

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
}

export function EditProfileDialog({ open, onOpenChange, user }: EditProfileDialogProps) {
  const [name, setName] = React.useState(user.name);
  const [selectedImage, setSelectedImage] = React.useState(user.avatarUrl || coverImages[0]);
  const [customImageUrl, setCustomImageUrl] = React.useState('');
  const { toast } = useToast();
  const router = useRouter();
  
  const [state, formAction, isPending] = useActionState(updateUserAction, {
    message: null,
    success: false
  });

  React.useEffect(() => {
    if (open) {
        setName(user.name);
        setSelectedImage(user.avatarUrl || coverImages[0]);
        setCustomImageUrl('');
    }
  }, [open, user]);

  React.useEffect(() => {
    if (state?.success) {
      toast({
        title: 'Sucesso',
        description: state.message,
      });
      onOpenChange(false);
      router.refresh();
    } else if (state?.success === false && state?.message) {
      toast({
        title: 'Erro',
        description: state.message,
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <form action={formAction}>
            <DialogHeader>
            <DialogTitle className="font-headline text-xl">Editar Perfil Pessoal</DialogTitle>
            <DialogDescription>
                Atualize suas informações e a imagem da sua conta pessoal.
            </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
                <div className="space-y-2">
                    <Label htmlFor="user-name">Seu Nome</Label>
                    <Input
                        id="user-name"
                        name="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Seu nome"
                        required
                    />
                    {state?.errors?.name && (
                      <p className="text-sm text-destructive">{state.errors.name[0]}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-2">
                        <Label>Imagem de Perfil / Capa</Label>
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
                                    <p>Copie a URL de uma imagem do Unsplash.</p>
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
            <Button type="submit" disabled={isPending || !name.trim()}>
              {isPending ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
