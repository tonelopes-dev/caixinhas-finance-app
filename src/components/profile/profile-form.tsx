
'use client';

import React, { useEffect } from 'react';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { User } from '@/lib/definitions';
import { updateProfileAction, type ProfileActionState } from '@/app/profile/actions';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const coverImages = [
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
    'https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?w=800',
    'https://images.unsplash.com/photo-1519642918688-7e43b19245d8?w=800',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
    'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800',
];

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Salvando...' : 'Salvar Alterações'}
    </Button>
  );
}

export function ProfileForm({ user }: { user: User }) {
  const { toast } = useToast();
  const initialState: ProfileActionState = { message: null, errors: {} };
  const [state, formAction] = useActionState(updateProfileAction, initialState);
  const [selectedImage, setSelectedImage] = useState(user.avatarUrl || coverImages[0]);
  const [customImageUrl, setCustomImageUrl] = useState('');

  useEffect(() => {
    if (state.message && !state.errors) {
      toast({
        title: "Sucesso!",
        description: state.message,
      });
    } else if (state.message && state.errors) {
      toast({
        title: "Erro de Validação",
        description: state.message,
        variant: "destructive",
      });
    }
  }, [state, toast]);

  return (
    <Card>
      <form action={formAction}>
        <CardHeader>
          <CardTitle>Informações Pessoais</CardTitle>
          <CardDescription>
            Mantenha seus dados sempre atualizados.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="space-y-4">
              <Label>Foto de Perfil</Label>
              <div className="flex justify-center mb-4">
                <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-primary">
                  <Image
                    src={selectedImage}
                    alt="Profile preview"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
              <input type="hidden" name="avatarUrl" value={selectedImage} />
              
              <div className="grid grid-cols-6 gap-2 mb-4">
                {coverImages.map((img, index) => (
                  <div
                    key={index}
                    className={cn(
                      "relative aspect-square cursor-pointer rounded-md overflow-hidden border-2 transition-all",
                      selectedImage === img ? "border-primary ring-2 ring-primary ring-offset-2" : "border-transparent hover:border-muted-foreground/50"
                    )}
                    onClick={() => {
                      setSelectedImage(img);
                      setCustomImageUrl('');
                    }}
                  >
                    <Image
                      src={img}
                      alt={`Avatar option ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <Label htmlFor="customImage">Ou use uma URL personalizada</Label>
                <div className="flex gap-2">
                  <Input
                    id="customImage"
                    placeholder="https://..."
                    value={customImageUrl}
                    onChange={(e) => setCustomImageUrl(e.target.value)}
                  />
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => {
                      if (customImageUrl) setSelectedImage(customImageUrl);
                    }}
                  >
                    Aplicar
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" name="name" defaultValue={user.name} />
              {state?.errors?.name && <p className="text-sm text-destructive mt-1">{state.errors.name[0]}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" defaultValue={user.email} readOnly disabled />
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <SubmitButton />
        </CardFooter>
      </form>
    </Card>
  );
}
