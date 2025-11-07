'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Download, PlayCircle } from 'lucide-react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export function Cta() {
  const ctaImage = PlaceHolderImages.find(p => p.id === 'cta-phones');

  return (
    <section className="relative overflow-hidden bg-foreground py-20 text-background">
      <div className="container relative z-10 grid grid-cols-1 items-center gap-12 md:grid-cols-2">
        <div>
          <h2 className="font-headline text-4xl font-bold md:text-5xl">
            Prontos para Começar?
          </h2>
          <p className="mt-4 max-w-lg text-lg text-muted-foreground">
            Transforme seu futuro financeiro hoje. Crie sua conta gratuita e comece a planejar seus sonhos em conjunto com o Caixinhas.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row">
            <Button asChild size="lg" className="w-full bg-background text-foreground hover:bg-background/90 sm:w-auto">
              <Link href="/register">
                Criar Conta Gratuita
                <Download className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
        <div className="relative -mb-40 hidden h-96 md:block">
            {ctaImage && (
                <Image
                    src={ctaImage.imageUrl}
                    alt="App Caixinhas em celulares"
                    fill
                    className="object-contain"
                    data-ai-hint={ctaImage.imageHint}
                />
            )}
        </div>
      </div>
    </section>
  );
}