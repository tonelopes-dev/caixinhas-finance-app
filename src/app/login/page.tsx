'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
import Link from 'next/link';
import { useActionState } from 'react';
import { loginAction, type LoginState } from './actions';
import { useFormStatus } from 'react-dom';

function SubmitButton() {
  const { pending } = useFormStatus();
  
  return (
    <Button className="w-full" type="submit" disabled={pending}>
      {pending ? (
        <>
          <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
          Entrando...
        </>
      ) : (
        'Entrar'
      )}
    </Button>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const initialState: LoginState = {};
  const [state, dispatch] = useActionState(loginAction, initialState);

  useEffect(() => {
    // Limpar dados de sessão ao carregar a página de login
    if (typeof window !== 'undefined') {
      localStorage.removeItem('CAIXINHAS_USER_ID');
      sessionStorage.removeItem('CAIXINHAS_VAULT_ID');
    }
  }, []);

  useEffect(() => {
    // Redirecionar após login bem-sucedido
    if (state.user) {
      // Guardar userId no localStorage para compatibilidade com código existente
      localStorage.setItem('CAIXINHAS_USER_ID', state.user.id);
      router.push('/vaults');
    }
  }, [state.user, router]);

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm">
        <form action={dispatch}>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex items-center justify-center">
              <Logo className="h-16 w-16" />
            </div>
            <CardTitle className="text-2xl font-headline">Bem-vindo(a) de volta!</CardTitle>
            <CardDescription>
              Entre com seu e-mail e senha para acessar sua conta.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="seu@email.com"
                required
                autoComplete="email"
              />
              {state?.errors?.email && (
                <p className="text-sm font-medium text-destructive">{state.errors.email[0]}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
              {state?.errors?.password && (
                <p className="text-sm font-medium text-destructive">{state.errors.password[0]}</p>
              )}
            </div>
            {state?.message && !state.user && (
              <p className="text-sm font-medium text-destructive">{state.message}</p>
            )}
            <SubmitButton />
          </CardContent>
          <CardFooter className="flex-col items-center justify-center text-sm">
            <p>
              Não tem uma conta?{' '}
              <Link href="/register" className="font-semibold text-primary underline-offset-4 hover:underline">
                Cadastre-se
              </Link>
            </p>
            <p className="mt-2">
              <Link href="/terms" className="text-xs text-muted-foreground hover:underline">
                Termos de Serviço
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
