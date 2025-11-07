'use client';
import { BrainCircuit, PiggyBank, Users, BellRing, Star } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const features = [
  {
    title: 'Notificações Inteligentes',
    description:
      'Receba alertas sobre seus gastos, progresso de metas e dicas para nunca perder o controle.',
    icon: <BellRing className="h-6 w-6" />,
  },
];

export function Features() {
  const featureImage = PlaceHolderImages.find(p => p.id === 'feature-highlight-phone');

  return (
    <section id="features" className="container grid items-center gap-12 py-20 md:grid-cols-2 lg:py-20">
      <div className="space-y-8">
        <div className="space-y-2">
            <p className="font-bold uppercase text-primary">Funcionalidades</p>
            <h2 className="font-sans text-4xl font-bold tracking-tighter">
                Uifry Premium
            </h2>
        </div>
        <ul className="space-y-6">
            {features.map((feature) => (
                <li key={feature.title} className="flex items-start gap-4">
                    <div className='flex items-center justify-center text-primary rounded-full h-8 w-8 flex-shrink-0'>
                        {feature.icon}
                    </div>
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
