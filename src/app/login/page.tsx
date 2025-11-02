'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Logo } from '@/components/logo';
import Link from 'next/link';


export default function LoginPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <Logo className="h-12 w-12" />
          </div>
          <CardTitle className="text-2xl font-headline">Bem-vindo(a)!</CardTitle>
          <CardDescription>
            Estamos em desenvolvimento. Use o botão abaixo para acessar o painel.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Button asChild>
            <Link href="/">Acessar o Painel</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
