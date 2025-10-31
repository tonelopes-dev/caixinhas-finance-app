import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Mail, Send } from 'lucide-react';

export default function InvitePage() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <Button asChild variant="ghost" className="mb-4">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para o Painel
          </Link>
        </Button>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline">
              <Mail className="h-6 w-6 text-primary" />
              Convidar Parceiro(a)
            </CardTitle>
            <CardDescription>
              Envie um convite para que vocês possam planejar seus sonhos juntos.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail do Parceiro(a)</Label>
              <Input
                id="email"
                type="email"
                placeholder="nome@example.com"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button>
              <Send className="mr-2 h-4 w-4" />
              Enviar Convite
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
