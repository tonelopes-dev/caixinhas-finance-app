'use client';

import { useEffect, useState } from 'react';
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

// Mock authentication function
const fakeAuth = (email: string, pass: string): string | null => {
    if (email === 'email01@conta.com' && pass === 'conta@teste') {
        return 'user1';
    }
    if (email === 'email02@conta.com' && pass === 'conta@teste') {
        return 'user2';
    }
    return null;
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate network delay
    setTimeout(() => {
      const userId = fakeAuth(email, password);
      if (userId) {
        // Set a persistent identifier on the client. 
        localStorage.setItem('CAIXINHAS_USER_ID', userId);
        
        // Also set a cookie for the middleware to read.
        document.cookie = `CAIXINHAS_USER_ID=${userId}; path=/; max-age=86400`; // Expires in 1 day

        // Redirect using window.location to ensure a full page refresh that the middleware can intercept
        window.location.href = '/vaults';

      } else {
        setError('E-mail ou senha inválidos.');
        setIsLoading(false);
      }
    }, 500); // 0.5 second delay
  };

  useEffect(() => {
    // Clear user identifiers on login page load to ensure a clean state.
    localStorage.removeItem('CAIXINHAS_USER_ID');
    sessionStorage.removeItem('CAIXINHAS_VAULT_ID');
    document.cookie = 'CAIXINHAS_USER_ID=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  }, []);

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm">
        <form onSubmit={handleLogin}>
            <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex items-center justify-center">
                <Logo className="h-16 w-16" />
            </div>
            <CardTitle className="text-2xl font-headline">Bem-vindo(a) de volta!</CardTitle>
            <CardDescription>
                Use uma das contas de teste para entrar.
            </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input id="email" type="email" placeholder="email01@conta.com" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isLoading} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="password">Senha</Label>
                    <Input id="password" type="password" placeholder="conta@teste" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={isLoading} />
                </div>
                 {error && <p className="text-sm font-medium text-destructive">{error}</p>}
                <Button className="w-full" disabled={isLoading}>
                    {isLoading ? (
                        <>
                            <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                            Entrando...
                        </>
                    ) : (
                        'Entrar'
                    )}
                </Button>
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
