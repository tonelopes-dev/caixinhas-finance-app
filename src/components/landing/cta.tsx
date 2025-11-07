'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Apple } from 'lucide-react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export function Cta() {
  const ctaImage = PlaceHolderImages.find(p => p.id === 'cta-phones');

  return (
    <section className="relative overflow-hidden bg-foreground py-20 text-background">
      <div className="container relative z-10">
        <div className="mx-auto max-w-4xl rounded-lg bg-black p-8 md:p-12">
            <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
                 <div>
                    <h2 className="font-headline text-4xl font-bold text-white md:text-5xl">
                        Prontos para Começar?
                    </h2>
                    <p className="mt-4 max-w-lg text-lg text-white/70">
                        Transforme seu futuro financeiro hoje. Crie sua conta gratuita e comece a planejar seus sonhos em conjunto com o Caixinhas.
                    </p>
                    <Button asChild size="lg" className="mt-8 w-full bg-white text-black hover:bg-white/90 sm:w-auto">
                        <Link href="/register">
                            Download App
                            <Apple className="ml-2 h-5 w-5" />
                        </Link>
                    </Button>
                </div>
                <div className="relative -mb-20 hidden h-80 md:block">
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
        </div>
      </div>
    </section>
  );
}
