'use client';
import { PiggyBank } from 'lucide-react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export function FullyCustomizable() {
  const featureImage = PlaceHolderImages.find(p => p.id === 'feature-highlight-phone');

  return (
    <section className="container grid items-center gap-12 py-20 md:grid-cols-2 lg:py-20">
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
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <PiggyBank className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold">Totalmente Customizável</h3>
        </div>
        <p className="text-muted-foreground">
          Personalize suas metas, categorias e a forma como você visualiza suas finanças. O Caixinhas se adapta ao seu jeito de planejar, tornando o controle financeiro uma experiência única e pessoal para o casal.
        </p>
      </div>
    </section>
  );
}
