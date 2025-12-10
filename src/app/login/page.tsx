'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import { clearAuthSession } from '@/lib/auth-utils';
import { Button } from '@/components/ui/button';
import { GradientButton } from '@/components/ui/gradient-button';
import { LoadingButton } from '@/components/ui/loading-button';
import { useLoading, useActionLoading } from '@/components/providers/loading-provider';
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
import { useAuthLoading } from '@/hooks/use-auth-loading';
import { LoadingScreen } from '@/components/ui/loading-screen';

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const { showLoading } = useLoading();
  const { executeWithLoading } = useActionLoading();
  const { isVisible: isAuthLoading, message: authMessage, setAuthLoading } = useAuthLoading();
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const isRedirectingRef = useRef(false);
  const isIOS = typeof window !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);

  // Limpar URL de parâmetros problemáticos que podem causar loops
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      const hasError = url.searchParams.has('error');
      const hasCallback = url.searchParams.has('callbackUrl');
      
      if (hasError || hasCallback) {
        console.log('🔍 Login Page - Limpando parâmetros da URL:', { hasError, hasCallback });
        // Limpar a URL sem parâmetros
        const cleanUrl = `${url.origin}${url.pathname}`;
        window.history.replaceState({}, '', cleanUrl);
      }
    }
  }, []);

  // Prevenção específica para iOS contra loops de autofill
  useEffect(() => {
    if (isIOS && typeof window !== 'undefined') {
      console.log('🍎 iOS detectado - aplicando correções de autofill');
      
      // Prevenir zoom automático no iOS quando o input é focado
      const viewport = document.querySelector('meta[name="viewport"]');
      if (viewport) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0');
      }
      
      // Limpar redirecting flag se estiver preso
      const redirectingFlag = sessionStorage.getItem('redirecting');
      if (redirectingFlag) {
        console.log('🔧 Limpando flag de redirecionamento órfão');
        sessionStorage.removeItem('redirecting');
        isRedirectingRef.current = false;
      }

      return () => {
        // Restaurar viewport ao sair
        if (viewport) {
          viewport.setAttribute('content', 'width=device-width, initial-scale=1.0');
        }
      };
    }
  }, [isIOS]);

  // Debug da sessão
  useEffect(() => {
    console.log('🔍 Login Page - Status da sessão:', status);
    console.log('🔍 Login Page - Dados da sessão:', session);
    console.log('🔍 Login Page - Is loading:', isLoading);
    console.log('🔍 Login Page - Current pathname:', window.location.pathname);
    console.log('🔍 Login Page - URL search params:', window.location.search);
  }, [session, status, isLoading]);

  useEffect(() => {
    // Verificar se chegou de um logout para fazer limpeza extra
    const isFromLogout = searchParams.get('logout') === 'true';
    
    if (isFromLogout) {
      console.log('🧹 Detectado logout - fazendo limpeza completa...');
      clearAuthSession().then(() => {
        console.log('✅ Limpeza de logout completa');
        // Limpar o parâmetro da URL após a limpeza
        const url = new URL(window.location.href);
        url.searchParams.delete('logout');
        window.history.replaceState({}, document.title, url.toString());
      });
    } else {
      // Limpeza básica apenas
      if (typeof window !== 'undefined') {
        localStorage.removeItem('CAIXINHAS_USER_ID');
        sessionStorage.removeItem('CAIXINHAS_VAULT_ID');
      }
    }
  }, [searchParams]);

  useEffect(() => {
    // Aguardar o status ser definido e só redirecionar se estiver realmente autenticado
    if (status === 'loading') return; // Aguardar carregamento da sessão
    
    // Se chegou de logout, não redirecionar automaticamente por um tempo
    const isFromLogout = searchParams.get('logout') === 'true';
    if (isFromLogout) {
      console.log('🚫 Bloqueando redirecionamento automático - usuário fez logout');
      return;
    }
    
    if (status === 'authenticated' && session?.user?.id && !isLoading && !isRedirectingRef.current) {
      console.log('✅ Usuário já autenticado, redirecionando...', session.user);
      
      // Verificar se já não está em processo de redirecionamento
      const isRedirecting = sessionStorage.getItem('redirecting');
      if (isRedirecting) return;
      
      isRedirectingRef.current = true;
      sessionStorage.setItem('redirecting', 'true');
      localStorage.setItem('CAIXINHAS_USER_ID', session.user.id);
      
      // Timeout diferente para iOS devido ao autofill
      const timeout = isIOS ? 500 : 100;
      setTimeout(() => {
        if (isRedirectingRef.current) {
          window.location.href = '/vaults';
        }
      }, timeout);
    }
  }, [session, status, router, isLoading, isIOS]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // Mostrar loading de autenticação
      setAuthLoading(true, "Entrando em sua conta...");

      // Fazer o login
      const loginPromise = signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      // Aguardar pelo menos 3 segundos
      const minimumTimePromise = new Promise(resolve => setTimeout(resolve, 3000));

      // Aguardar tanto o login quanto o tempo mínimo
      const [result] = await Promise.all([loginPromise, minimumTimePromise]);

      if (result?.error) {
        console.log('❌ Erro no login:', result.error);
        
        // Esconder loading antes de mostrar erro
        setAuthLoading(false);
        
        // Diferentes tipos de erro
        if (result.error === 'CredentialsSignin') {
          setError('Email ou senha incorretos');
        } else if (result.error === 'CallbackRouteError') {
          setError('Erro de autenticação. Tente novamente.');
        } else {
          setError('Erro ao fazer login. Tente novamente.');
        }
      } else if (result?.ok) {
        console.log('✅ Login bem-sucedido, redirecionando...');
        
        // Atualizar mensagem de loading
        setAuthLoading(true, "✅ Login realizado! Redirecionando...");
        
        // Aguardar mais um pouco antes de redirecionar
        setTimeout(() => {
          setAuthLoading(false);
          window.location.href = '/vaults';
        }, 1000);
      } else {
        console.log('⚠️ Resultado inesperado do login:', result);
        setAuthLoading(false);
        setError('Erro inesperado. Tente novamente.');
      }
    } catch (error) {
      console.error('❌ Erro no login:', error);
      setAuthLoading(false);
      setError('Erro ao fazer login. Tente novamente.');
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      // Mostrar loading de autenticação
      setAuthLoading(true, "🚀 Conectando com Google...");
      
      // Aguardar pelo menos 3 segundos antes de redirecionar
      const loginPromise = signIn('google', { callbackUrl: '/vaults' });
      const minimumTimePromise = new Promise(resolve => setTimeout(resolve, 3000));
      
      await Promise.all([loginPromise, minimumTimePromise]);
    } catch (error) {
      setAuthLoading(false);
      setError('Erro ao fazer login com Google');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Prevenir processamento se estiver redirecionando
    if (isRedirectingRef.current) return;
    
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpar erro quando usuário digita
    if (error) {
      setError('');
    }
  };

  return (
    <>
      {isAuthLoading && <LoadingScreen message={authMessage} />}
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
          <LoadingButton
            type="button"
            variant="outline"
            className="w-full border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all duration-200 hover:scale-[1.02] relative overflow-hidden group"
            onClick={handleGoogleSignIn}
            loadingText="Conectando..."
          >
            <span className="relative z-10 flex items-center">
              <FcGoogle className="mr-2 h-4 w-4" />
              Continuar com Google
            </span>
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          </LoadingButton>
          
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
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck="false"
                data-form-type="other"
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
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck="false"
                  data-form-type="other"
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
            
            <GradientButton className="w-full group relative overflow-hidden" type="submit">
              <span className="relative z-10 flex items-center justify-center">
                Entrar
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
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
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  );
}
