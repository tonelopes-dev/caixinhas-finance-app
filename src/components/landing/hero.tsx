'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Download, PlayCircle } from 'lucide-react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export function Hero() {
  const heroImage = PlaceHolderImages.find(p => p.id === 'hero-phones');

  return (
    <section id="hero" className="container grid items-center gap-12 py-20 lg:grid-cols-2 lg:py-32">
      <div className="space-y-6 text-center lg:text-left">
        <h1 className="font-headline text-4xl font-bold leading-tight md:text-6xl">
          Tome as Melhores <span className="text-primary">Decisões Financeiras</span> em Casal
        </h1>
        <p className="text-lg text-muted-foreground">
          Transforme a gestão do dinheiro em uma jornada colaborativa. Com o Caixinhas, vocês organizam despesas, criam metas e realizam sonhos, juntos.
        </p>
        <div className="flex flex-col items-center gap-4 lg:flex-row">
            <Button asChild size="lg">
                <Link href="/register">
                    Começar Agora
                    <Download className="ml-2 h-5 w-5" />
                </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
                <Link href="#">
                    <PlayCircle className="mr-2 h-5 w-5" />
                    Veja como funciona
                </Link>
            </Button>
        </div>
      </div>
      <div className="relative h-[500px] w-full lg:h-[600px]">
        {heroImage && (
            <Image
                src={heroImage.imageUrl}
                alt="App Caixinhas em múltiplos celulares"
                fill
                className="object-contain"
                priority
                data-ai-hint={heroImage.imageHint}
            />
        )}
      </div>
    </section>
  );
}