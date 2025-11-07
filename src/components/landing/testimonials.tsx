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

const testimonials = [
  {
    name: 'Juliana & Marcos',
    avatar: '/avatars/01.png',
    title: 'Finalmente organizados!',
    description:
      '"O Caixinhas mudou o jogo pra gente. Antes, falar de dinheiro era um estresse. Agora, planejamos nossa viagem dos sonhos e estamos economizando sem brigar. É incrível ver nosso progresso juntos!"',
  },
  {
    name: 'Ana & Pedro',
    avatar: '/avatars/02.png',
    title: 'A melhor ferramenta para casais',
    description:
      '"Usamos o app para juntar dinheiro para o nosso casamento. As "Caixinhas" deixam tudo tão claro e motivador. Recomendo para todos os casais que querem construir um futuro juntos."',
  },
];

export function Testimonials() {
  const testimonialImage = PlaceHolderImages.find(p => p.id === 'testimonial-group');

  return (
    <section id="testimonials" className="container py-20 sm:py-32">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="space-y-2 text-center lg:text-left">
            <p className="font-bold uppercase text-primary">Depoimentos</p>
            <h2 className="font-headline text-4xl font-bold">
              O que nossos casais dizem
            </h2>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>{testimonials[0].title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-lg">
                {testimonials[0].description}
              </CardDescription>
              <div className="mt-4 flex items-center gap-2">
                <Avatar>
                  <AvatarImage src="https://images.unsplash.com/photo-1544005313-94ddf0286df2" alt="Juliana & Marcos" data-ai-hint="couple portrait"/>
                  <AvatarFallback>JM</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{testimonials[0].name}</p>
                </div>
              </div>
            </CardContent>
          </Card>
           <Card>
            <CardHeader>
              <CardTitle>{testimonials[1].title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-lg">
                {testimonials[1].description}
              </CardDescription>
              <div className="mt-4 flex items-center gap-2">
                <Avatar>
                  <AvatarImage src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d" alt="Ana & Pedro" data-ai-hint="couple portrait"/>
                  <AvatarFallback>AP</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{testimonials[1].name}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="relative hidden items-center justify-center lg:flex">
          {testimonialImage && (
            <Image
                src={testimonialImage.imageUrl}
                alt="Depoimentos de usuários"
                width={500}
                height={500}
                className="object-contain"
                data-ai-hint={testimonialImage.imageHint}
            />
          )}
        </div>
      </div>
    </section>
  );
}