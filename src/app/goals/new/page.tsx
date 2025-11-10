'use client';

import { useActionState, useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import { createGoalAction, type GoalActionState } from '@/app/goals/actions';
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
import { ArrowLeft, Lock, PiggyBank, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';

const commonEmojis = [
  '✈️', '🏡', '🚗', '🎓', '💍', '👶',
  '🛠️', '🎁', '🎮', '❤️', '💼', '💰'
];

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Criando...' : 'Criar Caixinha'}
    </Button>
  );
}

export default function NewGoalPage() {
  const initialState: GoalActionState = {};
  const [state, dispatch] = useActionState(createGoalAction, initialState);
  const { toast } = useToast();
  const [visibility, setVisibility] = useState('shared');
  const [selectedEmoji, setSelectedEmoji] = useState('');

  useEffect(() => {
    if (state.message && state.errors) {
      toast({
        title: "Erro de Validação",
        description: state.message,
        variant: "destructive",
      });
    }
  }, [state, toast]);

  const handleEmojiSelect = (emoji: string) => {
    setSelectedEmoji(emoji);
    const customEmojiInput = document.getElementById('emoji-custom') as HTMLInputElement;
    if (customEmojiInput) {
      customEmojiInput.value = '';
    }
  }

  const handleCustomEmojiChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedEmoji(e.target.value);
  }

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
          <form action={dispatch}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-headline">
                <PiggyBank className="h-6 w-6 text-primary" />
                Criar Nova Caixinha
              </CardTitle>
              <CardDescription>
                Defina um novo objetivo para vocês economizarem juntos ou um objetivo pessoal.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <input type="hidden" name="emoji" value={selectedEmoji} />
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Sonho</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Ex: Viagem dos Sonhos"
                />
                {state?.errors?.name && <p className="text-sm font-medium text-destructive">{state.errors.name[0]}</p>}
              </div>

              <div className="space-y-2">
                <Label>Ícone (Emoji)</Label>
                <div className="grid grid-cols-6 gap-2">
                  {commonEmojis.map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => handleEmojiSelect(emoji)}
                      className={cn(
                        "flex h-12 w-12 items-center justify-center rounded-lg border-2 text-2xl transition-all",
                        selectedEmoji === emoji ? "border-primary bg-primary/10" : "border-border bg-muted/50"
                      )}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
                <Input
                  id="emoji-custom"
                  placeholder="Ou digite um emoji aqui"
                  maxLength={2}
                  className="mt-2 text-center"
                  onChange={handleCustomEmojiChange}
                />
                {state?.errors?.emoji && <p className="text-sm font-medium text-destructive">{state.errors.emoji[0]}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetAmount">Valor da Meta</Label>
                <Input
                  id="targetAmount"
                  name="targetAmount"
                  type="number"
                  step="0.01"
                  placeholder="R$ 20.000,00"
                />
                {state?.errors?.targetAmount && <p className="text-sm font-medium text-destructive">{state.errors.targetAmount[0]}</p>}
              </div>

               <div className="space-y-3">
                <Label>Visibilidade</Label>
                 <RadioGroup name="visibility" defaultValue="shared" className="grid grid-cols-2 gap-4" onValueChange={setVisibility}>
                    <Label className={cn("flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer", visibility === 'shared' && "border-primary")}>
                      <RadioGroupItem value="shared" id="shared" className="sr-only" />
                      <Users className="mb-3 h-6 w-6" />
                      Compartilhada
                    </Label>
                     <Label className={cn("flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer", visibility === 'private' && "border-primary")}>
                      <RadioGroupItem value="private" id="private" className="sr-only" />
                      <Lock className="mb-3 h-6 w-6" />
                      Privada
                    </Label>
                </RadioGroup>
                <p className="text-sm text-muted-foreground">
                  {visibility === 'shared' 
                    ? 'Todos os membros do cofre podem ver e contribuir.' 
                    : 'Apenas você poderá ver e gerenciar esta caixinha.'}
                </p>
                 {state?.errors?.visibility && <p className="text-sm font-medium text-destructive">{state.errors.visibility[0]}</p>}
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
