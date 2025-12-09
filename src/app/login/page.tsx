'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { GradientButton } from '@/components/ui/gradient-button';
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
import Link from 'next/link';
import { FcGoogle } from 'react-icons/fc';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // Debug da sessão
  useEffect(() => {
    console.log('🔍 Status da sessão:', status);
    console.log('🔍 Dados da sessão:', session);
    console.log('🔍 Is loading:', isLoading);
    console.log('🔍 Current pathname:', window.location.pathname);
  }, [session, status, isLoading]);

  useEffect(() => {
    // Limpar dados de sessão ao carregar a página de login
    if (typeof window !== 'undefined') {
      localStorage.removeItem('CAIXINHAS_USER_ID');
      sessionStorage.removeItem('CAIXINHAS_VAULT_ID');
    }
  }, []);

  useEffect(() => {
    // Só redirecionar se estiver realmente autenticado e com sessão válida
    if (status === 'authenticated' && session?.user?.id) {
      console.log('✅ Usuário já autenticado, redirecionando...', session.user);
      localStorage.setItem('CAIXINHAS_USER_ID', session.user.id);
      
      // Usar replace para evitar voltar ao login no histórico
      router.replace('/vaults');
    }
  }, [session, status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        console.log('❌ Erro no login:', result.error);
        setError('Email ou senha incorretos');
        setIsLoading(false);
      } else if (result?.ok) {
        console.log('✅ Login bem-sucedido, redirecionando...');
        
        // Força redirecionamento direto
        setTimeout(() => {
          window.location.href = '/vaults';
        }, 500);
      }
    } catch (error) {
      console.error('❌ Erro no login:', error);
      setError('Erro ao fazer login. Tente novamente.');
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn('google', { callbackUrl: '/vaults' });
    } catch (error) {
      setError('Erro ao fazer login com Google');
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-32 h-32 border-4 border-primary/20 rounded-full animate-ping-slow" />
        <div className="absolute bottom-10 right-10 w-48 h-48 border-4 border-accent/20 rounded-full animate-ping-slow animation-delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-4 border-primary/10 rounded-full animate-ping-slow animation-delay-500" />
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-primary/5 to-accent/10 opacity-60" />
      </div>
      
      <div className="flex min-h-screen w-full items-center justify-center px-4 relative z-10">
        <Card className="w-full max-w-sm border-2 border-primary/20 shadow-2xl backdrop-blur-sm bg-card/95">
        <CardHeader className="text-center relative">
          <div className="mx-auto mb-4 flex items-center justify-center">
            <div className="p-3 bg-gradient-to-br from-primary/10 via-accent/10 to-primary/5 rounded-2xl">
              <Logo className="h-16 w-16 animate-float-logo" />
            </div>
          </div>
          <CardTitle className="text-2xl font-headline bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Bem-vindo(a) de volta!
          </CardTitle>
          <CardDescription className="text-muted-foreground mt-2">
            Entre com seu e-mail e senha para acessar sua conta.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {/* Botão do Google */}
          <Button
            type="button"
            variant="outline"
            className="w-full border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all duration-200 hover:scale-[1.02] relative overflow-hidden group"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
          >
            <span className="relative z-10 flex items-center">
              <FcGoogle className="mr-2 h-4 w-4" />
              Continuar com Google
            </span>
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          </Button>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-primary/20" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-4 py-1 text-muted-foreground font-medium rounded-full border border-primary/10">Ou</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-foreground font-medium">E-mail</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={handleInputChange}
                required
                autoComplete="email"
                className="border-primary/20 focus:border-primary focus:ring-primary/20 transition-all duration-200 hover:border-primary/30"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password" className="text-foreground font-medium">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  autoComplete="current-password"
                  className="border-primary/20 focus:border-primary focus:ring-primary/20 transition-all duration-200 hover:border-primary/30 pr-10"
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
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm font-medium text-destructive">{error}</p>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <Link 
                href="/forgot-password"
                className="text-sm text-muted-foreground hover:text-primary transition-all duration-200 hover:scale-105 relative group"
              >
                <span className="relative z-10">Esqueceu a senha?</span>
                <span className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded" />
              </Link>
            </div>
            
            <GradientButton className="w-full group relative overflow-hidden" type="submit" disabled={isLoading}>
              <span className="relative z-10 flex items-center justify-center">
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                    Entrando...
                  </>
                ) : (
                  'Entrar'
                )}
              </span>
              {!isLoading && (
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
              )}
            </GradientButton>
          </form>
        </CardContent>
        <CardFooter className="flex-col items-center justify-center text-sm border-t border-primary/10 pt-6">
          <p className="text-center">
            Não tem uma conta?{' '}
            <Link href="/register" className="font-semibold text-primary hover:text-primary/80 underline-offset-4 hover:underline transition-colors">
              Cadastre-se
            </Link>
          </p>
          <p className="mt-2">
            <Link href="/terms" className="text-xs text-muted-foreground hover:text-primary transition-colors hover:underline">
              Termos de Serviço
            </Link>
          </p>
        </CardFooter>
      </Card>
      </div>
    </div>
  );
}
