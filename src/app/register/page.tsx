'use client'

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
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
import { FcGoogle } from 'react-icons/fc';
import { Eye, EyeOff } from 'lucide-react';

function RegisterContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const inviteId = searchParams.get('invite');
    const landingImage = PlaceHolderImages.find(img => img.id === 'couple-planning');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccess('');

        // Validações
        if (formData.password !== formData.confirmPassword) {
            setError('As senhas não coincidem');
            setIsLoading(false);
            return;
        }

        if (formData.password.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres');
            setIsLoading(false);
            return;
        }

        try {
            // Registrar usuário
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erro ao criar conta');
            }

            setSuccess('Conta criada com sucesso! Fazendo login...');

            // Fazer login automaticamente após registro
            const signInResult = await signIn('credentials', {
                email: formData.email,
                password: formData.password,
                redirect: false,
            });

            if (signInResult?.ok) {
                // Se há convite, redireciona para página de convites
                if (inviteId) {
                    router.push('/invitations');
                } else {
                    router.push('/vaults');
                }
            } else {
                setError('Conta criada, mas houve erro no login. Tente fazer login manualmente.');
            }
        } catch (error: any) {
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        try {
            await signIn('google', { callbackUrl: '/vaults' });
        } catch (error) {
            setError('Erro ao fazer registro com Google');
            setIsLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };
    
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-card p-4">
        <div className="w-full max-w-6xl overflow-hidden rounded-2xl shadow-2xl md:grid md:grid-cols-2">
            <div className="relative hidden h-full md:block">
                <Image
                    src={landingImage?.imageUrl ?? 'https://www.caixinhas.app/_next/image?url=%2Fphotos%2Ffamilia-joao-clara.png&w=1920&q=75'}
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
                <Card className="w-full max-w-md border-0 shadow-none p-4">
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
                        {/* Botão do Google */}
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full py-6 text-lg"
                            onClick={handleGoogleSignIn}
                            disabled={isLoading}
                        >
                            <FcGoogle className="mr-2 h-5 w-5" />
                            Continuar com Google
                        </Button>
                        
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">Ou</span>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Seu Nome</Label>
                                <Input 
                                    id="name" 
                                    name="name" 
                                    placeholder="Como podemos te chamar?" 
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required 
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">E-mail</Label>
                                <Input 
                                    id="email" 
                                    name="email" 
                                    type="email" 
                                    placeholder="seu.melhor@email.com" 
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required 
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="password">Crie uma Senha</Label>
                                <div className="relative">
                                    <Input 
                                        id="password" 
                                        name="password" 
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Pelo menos 6 caracteres" 
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        required 
                                        className="pr-10"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                                        ) : (
                                            <Eye className="h-4 w-4 text-muted-foreground" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                                <div className="relative">
                                    <Input 
                                        id="confirmPassword" 
                                        name="confirmPassword" 
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="Digite a senha novamente" 
                                        value={formData.confirmPassword}
                                        onChange={handleInputChange}
                                        required 
                                        className="pr-10"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                                        ) : (
                                            <Eye className="h-4 w-4 text-muted-foreground" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                            {error && (
                                <p className="text-sm font-medium text-destructive">{error}</p>
                            )}
                            {success && (
                                <p className="text-sm font-medium text-green-600">{success}</p>
                            )}
                            <Button type="submit" className="w-full mt-4 py-6 text-lg" disabled={isLoading}>
                                {isLoading ? 'Criando conta...' : 'Criar conta gratuitamente'}
                            </Button>
                        </form>
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
                </Card>
            </div>
        </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    }>
      <RegisterContent />
    </Suspense>
  );
}
