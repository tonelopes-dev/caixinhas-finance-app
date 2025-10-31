'use client';

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
import { useActionState, useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { sendPartnerInvite, type GenericState } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';


function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button disabled={pending}>
            <Send className="mr-2 h-4 w-4" />
            {pending ? 'Enviando...' : 'Enviar Convite'}
        </Button>
    )
}

export default function InvitePage() {
  const initialState: GenericState = {};
  const [state, dispatch] = useActionState(sendPartnerInvite, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if(state.message && !state.errors) {
        toast({ title: "Sucesso!", description: state.message });
        formRef.current?.reset();
    } else if (state.message && state.errors) {
        toast({ title: "Erro de Validação", description: state.message, variant: 'destructive' });
    }
  }, [state, toast]);

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
            <form action={dispatch} ref={formRef}>
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
                        name="email"
                        type="email"
                        placeholder="nome@example.com"
                    />
                    {state?.errors?.email && <p className="text-sm font-medium text-destructive">{state.errors.email[0]}</p>}
                    </div>
                </CardContent>
                <CardFooter>
                    <SubmitButton />
                </CardFooter>
            </form>
        </Card>
      </div>
    </div>
  );
}
