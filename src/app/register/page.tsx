'use client'

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/logo';
import Image from 'next/image';
import Link from 'next/link';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useActionState, useEffect } from 'react';
import { registerAction, type RegisterState } from './actions';
import { useToast } from '@/hooks/use-toast';
import { useFormStatus } from 'react-dom';


function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" className="w-full mt-4 py-6 text-lg" disabled={pending}>
            {pending ? 'Criando conta...' : 'Criar conta gratuitamente'}
        </Button>
    )
}

export default function RegisterPage() {
    const landingImage = PlaceHolderImages.find(img => img.id === 'couple-planning');
    const initialState: RegisterState = {};
    const [state, dispatch] = useActionState(registerAction, initialState);
    const { toast } = useToast();

    useEffect(() => {
        if(state?.message && state?.errors) {
            toast({
                title: "Erro de Validação",
                description: state.message,
                variant: 'destructive',
            })
        }
    }, [state, toast]);
    
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-card p-4">
        <div className="w-full max-w-6xl overflow-hidden rounded-2xl shadow-2xl md:grid md:grid-cols-2">
            <div className="relative hidden h-full md:block">
                <Image
                    src={landingImage?.imageUrl ?? 'https://picsum.photos/seed/3/800/1200'}
                    alt="Casal planejando suas finanças juntos"
                    fill
                    objectFit="cover"
                    data-ai-hint="couple planning finances"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent p-10 flex flex-col justify-end">
                    <h2 className="font-headline text-4xl font-bold text-white leading-tight">
                        “Sonhar sozinho é apenas um sonho. Sonhar junto é o começo da realidade.”
                    </h2>
                    <p className="mt-2 text-white/80">- Miguel de Cervantes</p>
                </div>
            </div>
            <div className="flex flex-col justify-center bg-background p-8 md:p-12">
                <Card className="w-full max-w-md border-0 shadow-none">
                    <form action={dispatch}>
                        <CardHeader className="text-center px-0">
                            <div className="mx-auto mb-4">
                                <Logo className="h-12 w-12" />
                            </div>
                            <CardTitle className="text-3xl font-headline">Realize seus sonhos em casal.</CardTitle>
                            <CardDescription className="text-base">
                                Comece a planejar e economizar para seus objetivos compartilhados hoje mesmo.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4 px-0">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Seu Nome</Label>
                                <Input id="name" name="name" placeholder="Como podemos te chamar?" required />
                                 {state?.errors?.name && <p className="text-sm font-medium text-destructive">{state.errors.name[0]}</p>}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">E-mail</Label>
                                <Input id="email" name="email" type="email" placeholder="seu.melhor@email.com" required />
                                {state?.errors?.email && <p className="text-sm font-medium text-destructive">{state.errors.email[0]}</p>}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="password">Crie uma Senha</Label>
                                <Input id="password" name="password" type="password" placeholder="Pelo menos 8 caracteres" required />
                                {state?.errors?.password && <p className="text-sm font-medium text-destructive">{state.errors.password[0]}</p>}
                            </div>
                            <SubmitButton />
                        </CardContent>
                        <CardFooter className="flex-col items-center justify-center text-sm px-0">
                            <p className="text-center text-muted-foreground">
                                Ao se cadastrar, você concorda com nossos{' '}
                                <Link href="/terms" className="underline hover:text-primary">
                                    Termos de Serviço
                                </Link>.
                            </p>
                            <p className="mt-4">
                                Já tem uma conta?{' '}
                                <Link href="/login" className="font-semibold text-primary underline-offset-4 hover:underline">
                                    Faça Login
                                </Link>
                            </p>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </div>
    </div>
  );
}
