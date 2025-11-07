'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Star } from 'lucide-react';

const testimonials = [
  {
    name: 'Juliana & Marcos',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2',
    title: 'A melhor ferramenta de contabilidade financeira!',
    description:
      '"O Caixinhas mudou o jogo pra gente. Antes, falar de dinheiro era um estresse. Agora, planejamos nossa viagem dos sonhos e estamos economizando sem brigar. É incrível ver nosso progresso juntos!"',
  },
  {
    name: 'Ana & Pedro',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d',
    title: 'A melhor ferramenta para casais',
    description:
      '"Usamos o app para juntar dinheiro para o nosso casamento. As "Caixinhas" deixam tudo tão claro e motivador. Recomendo para todos os casais que querem construir um futuro juntos."',
  },
];

export function Testimonials() {
  const testimonialImage = PlaceHolderImages.find(p => p.id === 'testimonial-group');

  return (
    <section id="testimonials" className="container py-20 sm:py-32 text-center">
        <div className="space-y-2">
            <p className="font-bold uppercase text-sm">Depoimentos</p>
            <h2 className="font-sans text-4xl font-bold tracking-tighter">
                O Que Nossos Usuários Dizem?
            </h2>
        </div>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 items-center mt-12">
            <div className="relative hidden items-center justify-center lg:flex h-96">
                <div className='absolute h-40 w-40 bg-primary/20 rounded-full blur-3xl animate-blob' />
                <div className='absolute top-10 left-20 h-40 w-40 bg-red-500/20 rounded-full blur-3xl animate-blob animation-delay-2000' />
                <div className='absolute bottom-10 right-20 h-40 w-40 bg-yellow-500/20 rounded-full blur-3xl animate-blob animation-delay-4000' />
                
                {testimonialImage && (
                    <Image
                        src={testimonialImage.imageUrl}
                        alt="Depoimentos de usuários"
                        width={400}
                        height={400}
                        className="object-contain"
                        data-ai-hint={testimonialImage.imageHint}
                    />
                )}
                <Avatar className='absolute h-20 w-20 top-10 left-10'>
                     <AvatarImage src="https://images.unsplash.com/photo-1544005313-94ddf0286df2" alt="Juliana" data-ai-hint="couple portrait"/>
                     <AvatarFallback>J</AvatarFallback>
                </Avatar>
                 <Avatar className='absolute h-16 w-16 bottom-16 right-5'>
                     <AvatarImage src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d" alt="Pedro" data-ai-hint="couple portrait"/>
                     <AvatarFallback>P</AvatarFallback>
                </Avatar>
                 <Avatar className='absolute h-14 w-14 top-20 right-10'>
                     <AvatarImage src="https://randomuser.me/api/portraits/women/32.jpg" alt="User 2" />
                     <AvatarFallback>A</AvatarFallback>
                </Avatar>
                 <Avatar className='absolute h-12 w-12 bottom-10 left-20'>
                     <AvatarImage src="https://randomuser.me/api/portraits/men/33.jpg" alt="User 3" />
                     <AvatarFallback>M</AvatarFallback>
                </Avatar>
            </div>
            <div className="space-y-6 text-left">
                <h3 className='font-semibold text-2xl'>{testimonials[0].title}</h3>
                <p className="text-muted-foreground">
                    {testimonials[0].description}
                </p>
                <div className="flex items-center gap-2">
                    <div className='flex -space-x-2'>
                        <Avatar>
                        <AvatarImage src="https://images.unsplash.com/photo-1544005313-94ddf0286df2" alt="Juliana & Marcos" data-ai-hint="couple portrait"/>
                        <AvatarFallback>JM</AvatarFallback>
                        </Avatar>
                        <Avatar>
                        <AvatarImage src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d" alt="Ana & Pedro" data-ai-hint="couple portrait"/>
                        <AvatarFallback>AP</AvatarFallback>
                        </Avatar>
                        <Avatar>
                            <AvatarImage src="https://randomuser.me/api/portraits/men/34.jpg" alt="User 3" />
                            <AvatarFallback>L</AvatarFallback>
                        </Avatar>
                    </div>
                    <p className="font-semibold">{testimonials[0].name}</p>
                </div>
            </div>
        </div>
    </section>
  );
}
