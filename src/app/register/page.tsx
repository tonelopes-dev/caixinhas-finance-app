'use client';

import { Logo } from '@/components/logo';
import { useActionLoading } from '@/components/providers/loading-provider';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { GradientButton } from '@/components/ui/gradient-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';
import { signIn } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';

function RegisterContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const inviteId = searchParams.get('invite');
    const landingImage = PlaceHolderImages.find(img => img.id === 'couple-planning');
    const [isLoading, setIsLoading] = useState(false);
    // @ts-expect-error - pendencia estrutural a ser revisada
    const { executeWithLoading } = useActionLoading();
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

            const signInResult = await signIn('credentials', {
                email: formData.email,
                password: formData.password,
                redirect: false,
            });

            if (signInResult?.ok) {
                const callbackUrl = searchParams.get('callbackUrl');
                if (callbackUrl) {
                    router.push(callbackUrl);
                } else if (inviteId) {
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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
        if (error) setError('');
    };
    
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 relative overflow-hidden flex items-center justify-center p-4">
        {/* Background Effects */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-10 left-10 w-32 h-32 border-4 border-primary/20 rounded-full animate-ping-slow" />
          <div className="absolute bottom-10 right-10 w-48 h-48 border-4 border-accent/20 rounded-full animate-ping-slow animation-delay-1000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-4 border-primary/10 rounded-full animate-ping-slow animation-delay-500" />
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-primary/5 to-accent/10 opacity-60" />
        </div>

        <div className="w-full max-w-5xl overflow-hidden rounded-[40px] shadow-2xl border-2 border-primary/10 backdrop-blur-md bg-card/80 md:grid md:grid-cols-2 relative z-10">
            {/* Image Section */}
            <div className="relative hidden h-full md:block">
                <Image
                    src={landingImage?.imageUrl ?? 'https://www.caixinhas.app/_next/image?url=%2Fphotos%2Ffamilia-joao-clara.png&w=1920&q=75'}
                    alt="Casal planejando suas finanças juntos"
                    fill
                    className="object-cover grayscale-[0.2] contrast-[1.1]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#2D241E]/90 via-[#2D241E]/40 to-transparent p-12 flex flex-col justify-end">
                    <div className="space-y-4">
                        <span className="inline-block px-3 py-1 rounded-full bg-[#ff6b7b]/20 border border-[#ff6b7b]/30 text-[#ff6b7b] text-[10px] font-black uppercase tracking-widest">
                            Em Casal
                        </span>
                        <h2 className="font-headline text-4xl font-bold text-white leading-tight italic">
                            “Sonhar sozinho é apenas um sonho. Sonhar junto é o começo da realidade.”
                        </h2>
                        <p className="text-white/60 font-medium text-sm">— Miguel de Cervantes</p>
                    </div>
                </div>
            </div>

            {/* Form Section */}
            <div className="flex flex-col justify-center p-8 md:p-12 bg-white/40">
                <Card className="w-full border-0 shadow-none bg-transparent">
                    <CardHeader className="text-center px-0 pt-0 pb-8">
                        <div className="mx-auto mb-6 flex items-center justify-center">
                            <div className="p-4 bg-gradient-to-br from-primary/10 via-accent/10 to-primary/5 rounded-3xl shadow-inner border border-white/40">
                                <Logo className="h-14 w-14 animate-float-logo" />
                            </div>
                        </div>
                        <CardTitle className="text-3xl font-headline font-black italic tracking-tight text-[#2D241E] mb-2 leading-tight">
                            Realize sonhos <br /> em casal.
                        </CardTitle>
                        <CardDescription className="text-sm font-medium text-[#2D241E]/60 max-w-[280px] mx-auto">
                            Comece a planejar e economizar para seus objetivos compartilhados hoje mesmo.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="grid gap-4 px-0">
                        <form onSubmit={handleSubmit} className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-[#2D241E]/60 ml-1">Seu Nome</Label>
                                <Input 
                                    id="name" 
                                    name="name" 
                                    placeholder="Como podemos te chamar?" 
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required 
                                    className="h-12 rounded-2xl border-primary/20 focus:border-primary focus:ring-primary/10 bg-white/60"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-[#2D241E]/60 ml-1">E-mail</Label>
                                <Input 
                                    id="email" 
                                    name="email" 
                                    type="email" 
                                    placeholder="seu.melhor@email.com" 
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required 
                                    className="h-12 rounded-2xl border-primary/20 focus:border-primary focus:ring-primary/10 bg-white/60"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest text-[#2D241E]/60 ml-1">Crie uma Senha</Label>
                                <div className="relative">
                                    <Input 
                                        id="password" 
                                        name="password" 
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Pelo menos 6 caracteres" 
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        required 
                                        className="h-12 rounded-2xl border-primary/20 focus:border-primary focus:ring-primary/10 bg-white/60 pr-10"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-1 top-1 h-10 w-10 p-0 rounded-xl hover:bg-transparent text-[#2D241E]/40 hover:text-[#2D241E]"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="confirmPassword" className="text-[10px] font-black uppercase tracking-widest text-[#2D241E]/60 ml-1">Confirmar Senha</Label>
                                <div className="relative">
                                    <Input 
                                        id="confirmPassword" 
                                        name="confirmPassword" 
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="Digite a senha novamente" 
                                        value={formData.confirmPassword}
                                        onChange={handleInputChange}
                                        required 
                                        className="h-12 rounded-2xl border-primary/20 focus:border-primary focus:ring-primary/10 bg-white/60 pr-10"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-1 top-1 h-10 w-10 p-0 rounded-xl hover:bg-transparent text-[#2D241E]/40 hover:text-[#2D241E]"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </div>

                            {error && (
                                <div className="p-3 rounded-xl bg-red-50 border border-red-100">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-red-500 text-center">{error}</p>
                                </div>
                            )}
                            
                            {success && (
                                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 text-center">{success}</p>
                                </div>
                            )}

                            <GradientButton 
                                type="submit" 
                                className="w-full mt-4 h-14 group overflow-hidden" 
                                disabled={isLoading}
                            >
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                    {isLoading ? 'Criando Conta...' : 'Começar Gratuitamente'}
                                    {!isLoading && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />}
                                </span>
                                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
                            </GradientButton>
                        </form>
                    </CardContent>

                    <CardFooter className="flex-col items-center justify-center text-center gap-6 px-0 pt-6 border-t border-[#2D241E]/5">
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-[#2D241E]/40">
                                Ao se cadastrar, você concorda com nossos
                            </p>
                            <div className="flex items-center justify-center gap-2">
                                <Link href="/terms" className="text-[10px] font-black uppercase tracking-widest text-[#2D241E] hover:text-[#ff6b7b]">
                                    Termos
                                </Link>
                                <span className="text-[#2D241E]/20">•</span>
                                <Link href="/privacy" className="text-[10px] font-black uppercase tracking-widest text-[#2D241E] hover:text-[#ff6b7b]">
                                    Privacidade
                                </Link>
                            </div>
                        </div>

                        <p className="text-[10px] font-black uppercase tracking-widest text-[#2D241E]/60 bg-white/60 px-4 py-2 rounded-full border border-white/80 shadow-sm">
                            Já tem uma conta?{' '}
                            <Link href="/login" className="text-[#ff6b7b] hover:text-[#ff6b7b]/80 ml-1 transition-colors">
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
      <div className="min-h-screen bg-[#fdfcf7] flex items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#ff6b7b] border-t-transparent shadow-xl shadow-[#ff6b7b]/20" />
      </div>
    }>
      <RegisterContent />
    </Suspense>
  );
}
