'use client';
import { BrainCircuit, PiggyBank, Users } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const features = [
  {
    title: 'Caixinhas de Sonhos',
    description:
      'Crie metas compartilhadas ou pessoais. Economizar para a viagem dos sonhos, a entrada da casa ou um novo carro nunca foi tão fácil e visual.',
    icon: <PiggyBank className="h-8 w-8" />,
  },
  {
    title: 'Visão Unificada e Privada',
    description:
      'Gerenciem contas conjuntas em um "Cofre" e mantenham suas contas pessoais separadas. Total transparência para o casal, total privacidade para o indivíduo.',
    icon: <Users className="h-8 w-8" />,
  },
  {
    title: 'Relatórios com IA',
    description:
      'Receba análises mensais inteligentes que mostram para onde o dinheiro está indo, identificam padrões e oferecem dicas para otimizar suas finanças.',
    icon: <BrainCircuit className="h-8 w-8" />,
  },
];

export function Features() {
  return (
    <section id="features" className="container space-y-8 py-20 lg:py-32">
      <div className="text-center">
        <p className="font-bold uppercase text-primary">Funcionalidades</p>
        <h2 className="mt-2 font-headline text-4xl font-bold">
          Por que escolher o Caixinhas?
        </h2>
      </div>
      <div className="grid gap-8 md:grid-cols-3">
        {features.map(({ title, description, icon }) => (
          <Card key={title} className="flex flex-col items-center text-center">
            <CardHeader>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border bg-primary/10 text-primary">
                {icon}
              </div>
              <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>{description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}