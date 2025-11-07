'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, PlayCircle, Star } from 'lucide-react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export function Hero() {
  const heroImage = PlaceHolderImages.find(p => p.id === 'hero-phones');

  return (
    <section id="hero" className="container flex flex-col lg:flex-row items-center justify-center gap-10 py-20 md:py-32">
      <div className="text-center lg:text-start space-y-6 lg:w-1/2">
          <h1 className="font-sans text-5xl font-bold leading-tight tracking-tighter md:text-6xl lg:text-7xl">
            Tome as Melhores <span className="text-primary relative">Decisões<Image src="/gradient-underline.svg" alt="underline" width={300} height={30} className='absolute bottom-0 left-0 w-full' /></span> Financeiras
          </h1>
          <p className="mx-auto max-w-xl text-lg text-muted-foreground lg:mx-0">
            Transforme a gestão do dinheiro em uma jornada colaborativa. Com o Caixinhas, vocês organizam despesas, criam metas e realizam sonhos, juntos.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 lg:flex-row lg:justify-start">
              <Button asChild size="lg">
                  <Link href="/register">
                      Começar Agora
                      <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
              </Button>
              <Button asChild variant="ghost" size="lg">
                  <Link href="#">
                      <PlayCircle className="mr-2 h-5 w-5" />
                      Veja como funciona
                  </Link>
              </Button>
          </div>
          <div className='flex items-center justify-center gap-4 lg:justify-start pt-4'>
              <div className='flex -space-x-2'>
                  <Image src="https://randomuser.me/api/portraits/men/32.jpg" alt="User 1" width={40} height={40} className="rounded-full border-2 border-background" />
                  <Image src="https://randomuser.me/api/portraits/women/32.jpg" alt="User 2" width={40} height={40} className="rounded-full border-2 border-background" />
                  <Image src="https://randomuser.me/api/portraits/men/33.jpg" alt="User 3" width={40} height={40} className="rounded-full border-2 border-background" />
              </div>
              <div>
                  <div className='flex text-yellow-500'>
                      <Star className='w-5 h-5 fill-current' />
                      <Star className='w-5 h-5 fill-current' />
                      <Star className='w-5 h-5 fill-current' />
                      <Star className='w-5 h-5 fill-current' />
                      <Star className='w-5 h-5 fill-current' />
                  </div>
                  <p className='text-sm text-muted-foreground'>Baseado em 3.000+ avaliações</p>
              </div>
          </div>
        </div>
        <div className="relative h-[400px] w-full max-w-md lg:h-[500px] lg:flex-1">
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
