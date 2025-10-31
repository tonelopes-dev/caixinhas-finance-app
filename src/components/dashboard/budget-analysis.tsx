"use client";

import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { analyzeBudget, type AnalysisState } from '@/app/actions';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Sparkles, Lightbulb, CheckCircle } from 'lucide-react';
import type { Goal } from '@/lib/definitions';
import { useToast } from '@/hooks/use-toast';

type BudgetAnalysisProps = {
  income: number;
  expenses: Record<string, number>;
  goals: Goal[];
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Analisando...' : 'Analisar Orçamento com IA'}
      <Sparkles className="ml-2 h-4 w-4" />
    </Button>
  );
}

export default function BudgetAnalysis({ income, expenses, goals }: BudgetAnalysisProps) {
  const initialState: AnalysisState = {};
  const [state, dispatch] = useActionState(analyzeBudget, initialState);
  const { toast } = useToast();

  useEffect(() => {
    // This effect handles toasts for successful analysis or critical server errors.
    // Validation errors are handled inline, so we don't show a toast for them.
    if (state.message) {
      if (state.analysis) {
        // Success case
        toast({
          title: "Análise Pronta!",
          description: "Sua análise de orçamento personalizada está pronta.",
        });
      } else if (!state.errors) {
        // Critical error case (but not a validation error)
        toast({
          title: "Erro na Análise",
          description: state.message,
          variant: "destructive",
        });
      }
    }
  }, [state, toast]);


  return (
    <Card>
      <form action={dispatch}>
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            Análise Inteligente
            <Sparkles className="h-5 w-5 text-primary" />
          </CardTitle>
          <CardDescription>
            Recebam dicas personalizadas da nossa IA para otimizar suas finanças.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid w-full items-center gap-2">
            <Label htmlFor="financialHabits">Como são seus hábitos financeiros em casal?</Label>
            <Textarea
              id="financialHabits"
              name="financialHabits"
              placeholder="Ex: Gostamos de sair para jantar nos fins de semana, mas tentamos economizar durante a semana. Um de nós é mais gastador, o outro mais poupador..."
              required
              className="min-h-[100px]"
            />
            {state?.errors?.financialHabits && (
              <p className="text-sm font-medium text-destructive">{state.errors.financialHabits[0]}</p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <SubmitButton />
        </CardFooter>
      </form>

      {state?.analysis && (
        <CardContent className="border-t pt-6 mt-6">
            <h3 className="text-lg font-headline font-semibold flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Análise do Orçamento
            </h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{state.analysis}</p>
            
            <h3 className="text-lg font-headline font-semibold flex items-center gap-2 mt-6 mb-2">
                <Lightbulb className="h-5 w-5 text-yellow-500" />
                Sugestões para Otimizar
            </h3>
            <ul className="space-y-2">
                {state.suggestions?.map((suggestion, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="mt-1 text-primary">◆</span>
                        <span>{suggestion}</span>
                    </li>
                ))}
            </ul>
        </CardContent>
      )}
    </Card>
  );
}
