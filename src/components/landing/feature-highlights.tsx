'use client';
import Image from 'next/image';
import { CheckCircle2 } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const features = [
    {
        title: "Orçamento Inteligente",
        description: "Categorize despesas, defina limites e receba insights da nossa IA para otimizar seus gastos e aumentar sua capacidade de poupança."
    },
    {
        title: "Metas Personalizadas",
        description: "Crie 'Caixinhas' para cada sonho, seja ele grande ou pequeno. Acompanhe o progresso de forma visual e motivadora."
    },
    {
        title: "Relatórios Claros",
        description: "Entenda para onde seu dinheiro está indo com relatórios mensais simples e diretos, gerados para facilitar a conversa sobre finanças."
    }
]

export function FeatureHighlights() {
    const featureImage = PlaceHolderImages.find(p => p.id === 'feature-highlight-phone');

  return (
    <section className="container grid items-center gap-12 py-20 md:grid-cols-2 lg:py-32">
      <div className="space-y-8">
        <div className="space-y-2">
            <p className="font-bold uppercase text-primary">Vantagens</p>
            <h2 className="font-headline text-4xl font-bold">
                Tudo o que vocês precisam para prosperar
            </h2>
            <p className="text-lg text-muted-foreground">
                O Caixinhas une ferramentas poderosas a um design simples para que o planejamento financeiro seja uma jornada prazerosa, não uma tarefa.
            </p>
        </div>
        <ul className="space-y-6">
            {features.map((feature) => (
                <li key={feature.title} className="flex items-start gap-4">
                    <CheckCircle2 className="mt-1 h-6 w-6 flex-shrink-0 text-primary" />
                    <div>
                        <h3 className="font-semibold text-lg">{feature.title}</h3>
                        <p className="text-muted-foreground">{feature.description}</p>
                    </div>
                </li>
            ))}
        </ul>
      </div>
      <div className="relative mx-auto h-[550px] w-[280px]">
        {featureImage && (
            <Image
                src={featureImage.imageUrl}
                alt="Funcionalidades do App Caixinhas"
                fill
                className="object-contain"
                data-ai-hint={featureImage.imageHint}
            />
        )}
      </div>
    </section>
  );
}