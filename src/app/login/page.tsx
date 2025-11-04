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
const fakeAuth = (email: string, pass: string) => {
    if (email === 'email01@conta.com' && pass === 'conta@teste') {
        // Set cookie instead of localStorage for middleware compatibility
        document.cookie = `DREAMVAULT_USER_ID=user1; path=/; max-age=86400`; // Expires in 1 day
        return true;
    }
    if (email === 'email02@conta.com' && pass === 'conta@teste') {
        document.cookie = `DREAMVAULT_USER_ID=user2; path=/; max-age=86400`; // Expires in 1 day
        return true;
    }
    return false;
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (fakeAuth(email, password)) {
      // Redirect to vaults after successful login. The middleware will handle private routes.
      router.push('/vaults');
      router.refresh(); // Refresh to ensure middleware re-evaluates
    } else {
      setError('E-mail ou senha inválidos.');
    }
  };

  useEffect(() => {
    // Clear user cookie on login page load
    document.cookie = 'DREAMVAULT_USER_ID=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  }, []);

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm">
        <form onSubmit={handleLogin}>
            <CardHeader className="text-center">
            <div className="mx-auto mb-4">
                <Logo className="h-12 w-12" />
            </div>
            <CardTitle className="text-2xl font-headline">Bem-vindo(a) de volta!</CardTitle>
            <CardDescription>
                Use uma das contas de teste para entrar.
            </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input id="email" type="email" placeholder="email01@conta.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="password">Senha</Label>
                    <Input id="password" type="password" placeholder="conta@teste" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                 {error && <p className="text-sm font-medium text-destructive">{error}</p>}
                <Button className="w-full">Entrar</Button>
            </CardContent>
            <CardFooter className="flex-col items-center justify-center text-sm">
                <p>
                    Não tem uma conta?{' '}
                    <Link href="/register" className="font-semibold text-primary underline-offset-4 hover:underline">
                        Cadastre-se
                    </Link>
                </p>
            </CardFooter>
        </form>
      </Card>
    </div>
  );
}
