
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
import { ExternalLink, Plus, X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { users } from '@/lib/data';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import type { User } from '@/lib/definitions';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import Link from 'next/link';

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
  currentUser: User | null;
}

export function CreateVaultDialog({ open, onOpenChange, currentUser }: CreateVaultDialogProps) {
  const [vaultName, setVaultName] = React.useState('');
  const [members, setMembers] = React.useState<User[]>(currentUser ? [currentUser] : []);
  const [selectedImage, setSelectedImage] = React.useState(coverImages[0]);
  const [customImageUrl, setCustomImageUrl] = React.useState('');
  const [email, setEmail] = React.useState('');

  const handleAddMember = (e: React.MouseEvent) => {
    e.preventDefault();
    const userToAdd = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (userToAdd && !members.some(m => m.id === userToAdd.id)) {
      setMembers([...members, userToAdd]);
      setEmail('');
    } else {
      // Em um app real, aqui mostraria um toast de erro.
      console.log('Usuário não encontrado ou já adicionado');
    }
  };
  
  const handleRemoveMember = (userId: string) => {
    // Prevent removing the current user
    if (userId === currentUser?.id) return;
    setMembers(members.filter(m => m.id !== userId));
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Em uma aplicação real, aqui você chamaria uma server action para criar o cofre.
    console.log({
        name: vaultName,
        ownerId: currentUser?.id,
        members,
        imageUrl: customImageUrl || selectedImage
    });
    onOpenChange(false); // Fecha o modal após a submissão
  }
  
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
        <form onSubmit={handleSubmit}>
            <DialogHeader>
            <DialogTitle className="font-headline text-xl">Criar Novo Cofre Compartilhado</DialogTitle>
            <DialogDescription>
                Comece um novo espaço para planejar e economizar em conjunto.
            </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
                <div className="space-y-2">
                    <Label htmlFor="vault-name">Nome do Cofre</Label>
                    <Input
                        id="vault-name"
                        value={vaultName}
                        onChange={(e) => setVaultName(e.target.value)}
                        placeholder="Ex: Reforma da Casa"
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label>Membros</Label>
                    <div className='flex flex-wrap gap-2'>
                        {members.map(member => (
                            <div key={member.id} className="flex items-center gap-2 rounded-full border bg-muted px-2 py-1">
                                <Avatar className="h-6 w-6">
                                    <AvatarImage src={member.avatarUrl} />
                                    <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <span className="text-sm font-medium">{member.name.split(' ')[0]}</span>
                                {member.id !== currentUser?.id && (
                                    <button onClick={() => handleRemoveMember(member.id)} className="text-muted-foreground hover:text-destructive">
                                        <X className="h-3 w-3" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <Input
                            type="email"
                            placeholder="Convidar por e-mail"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="outline" size="icon" onClick={handleAddMember}>
                                <Plus className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>O usuário receberá uma notificação no app ou um e-mail de convite.</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                    </div>
                </div>
                 <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-2">
                        <Label>Imagem de Capa</Label>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                     <Button variant="outline" size="icon" className="h-6 w-6" asChild>
                                        <Link href="https://unsplash.com/s/photos/house-saving" target="_blank">
                                            <ExternalLink className="h-3 w-3" />
                                        </Link>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Copie a URL de uma imagem do Unsplash. Apenas URLs do Unsplash são aceitas.</p>
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
                            placeholder="https://example.com/sua-imagem.png"
                            value={customImageUrl}
                            onChange={handleCustomUrlChange}
                        />
                    </div>
                </div>
            </div>
            <DialogFooter>
            <Button type="submit">Criar Cofre</Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
