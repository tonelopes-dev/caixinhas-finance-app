'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, PlayCircle, Star } from 'lucide-react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { motion } from 'framer-motion';
import { Logo } from '../logo';

const DEMO_IMAGES = [
  "https://images.unsplash.com/photo-1756312148347-611b60723c7a?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwzN3x8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1757865579201-693dd2080c73?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHw2MXx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1756786605218-28f7dd95a493?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwxMzh8fHxlbnwwfHx8fHw%3D",
  "https://images.unsplash.com/photo-1757519740947-eef07a74c4ab?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwxNDh8fHxlbnwwfHx8fHw%3D",
  "https://images.unsplash.com/photo-1757263005786-43d955f07fb1?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwxNzB8fHxlbnwwfHx8fHw%3D",
  "https://images.unsplash.com/photo-1757207445614-d1e12b8f753e?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwxODZ8fHxlbnwwfHx8fHw%3D",
  "https://images.unsplash.com/photo-1757269746970-dc477517268f?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwyMjN8fHxlbnwwfHx8fHw%3D",
  "https://images.unsplash.com/photo-1755119902709-a53513bcbedc?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwyNDF8fHxlbnwwfHx8fHw%3D",
  "https://images.unsplash.com/photo-1756312148347-611b60723c7a?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwzN3x8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1757865579201-693dd2080c73?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHw2MXx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1756786605218-28f7dd95a493?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwxMzh8fHxlbnwwfHx8fHw%3D",
  "https://images.unsplash.com/photo-1757519740947-eef07a74c4ab?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwxNDh8fHxlbnwwfHx8fHw%3D",
  "https://images.unsplash.com/photo-1757263005786-43d955f07fb1?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwxNzB8fHxlbnwwfHx8fHw%3D",
  "https://images.unsplash.com/photo-1757207445614-d1e12b8f753e?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwxODZ8fHxlbnwwfHx8fHw%3D",
  "https://images.unsplash.com/photo-1757269746970-dc477517268f?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwyMjN8fHxlbnwwfHx8fHw%3D",
  "https://images.unsplash.com/photo-1755119902709-a53513bcbedc?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwyNDF8fHxlbnwwfHx8fHw%3D",
];


export function Hero() {
  const duplicatedImages = [...DEMO_IMAGES, ...DEMO_IMAGES];

  return (
    <section id="hero" className="container relative flex flex-col lg:flex-row items-center justify-center gap-10 py-20 md:py-32 h-screen overflow-hidden">
      
       {/* Animated Image Marquee Background */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <motion.div
        className="flex gap-8"
        animate={{
            x: ["0%", "-100%"],
        }}
        transition={{
            ease: "linear",
            duration: 80,
            repeat: Infinity,
        }}
        >
        {duplicatedImages.map((src, index) => (
            <div
            key={`marquee-1-${index}`}
            className="relative aspect-[4/3] h-48 flex-shrink-0"
            style={{ rotate: `${(index % 2 === 0 ? -4 : 4)}deg` }}
            >
            <Image
                src={src}
                alt={`Showcase image ${index + 1}`}
                fill
                className="w-full h-full object-cover rounded-2xl shadow-md"
              data-ai-hint="couple travel"
            />
            </div>
        ))}
        </motion.div>
        <motion.div
        className="flex gap-8 mt-8"
        animate={{
            x: ["-100%", "0%"],
        }}
        transition={{
            ease: "linear",
            duration: 90,
            repeat: Infinity,
            delay: 2,
        }}
        >
        {duplicatedImages.map((src, index) => (
            <div
            key={`marquee-2-${index}`}
            className="relative aspect-[4/3] h-64 flex-shrink-0"
            style={{ rotate: `${(index % 2 === 0 ? 5 : -3)}deg` }}
            >
            <Image
                src={src}
                alt={`Showcase image ${index + 1}`}
                fill
                className="w-full h-full object-cover rounded-2xl shadow-md"
                data-ai-hint="couple smiling"
            />
            </div>
        ))}
        </motion.div>
      </div>
      
       {/* Gradient Overlay */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'linear-gradient(to right, hsl(var(--background)) 40%, hsla(var(--background), 0) 70%)'
        }}
      />

      <div className="relative z-10 grid lg:grid-cols-2 gap-10 items-center w-full">
        <div className="relative text-center lg:text-start space-y-6">
            <h1 className="font-sans text-5xl font-bold leading-tight tracking-tighter md:text-6xl lg:text-7xl">
                Tome as Melhores <span className="text-primary relative">Decisões<Image src="/gradient-underline.svg" alt="underline" width={300} height={30} className='absolute bottom-0 left-0 w-full' data-ai-hint="abstract illustration" /></span> Financeiras
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
                    <Image src="https://randomuser.me/api/portraits/men/32.jpg" alt="User 1" width={40} height={40} className="rounded-full border-2 border-background" data-ai-hint="man portrait"/>
                    <Image src="https://randomuser.me/api/portraits/women/32.jpg" alt="User 2" width={40} height={40} className="rounded-full border-2 border-background" data-ai-hint="woman portrait" />
                    <Image src="https://randomuser.me/api/portraits/men/33.jpg" alt="User 3" width={40} height={40} className="rounded-full border-2 border-background" data-ai-hint="man face" />
                    <Image src="https://randomuser.me/api/portraits/women/33.jpg" alt="User 4" width={40} height={40} className="rounded-full border-2 border-background" data-ai-hint="woman face" />
                </div>
                <div>
                    <p className='font-semibold text-foreground'>+10.000 casais</p>
                    <p className='text-sm text-muted-foreground'>realizando sonhos juntos</p>
                </div>
            </div>
        </div>
        <div className="relative h-[500px] w-full max-w-lg lg:h-[600px] lg:flex-1">
            <Logo className="w-full h-full drop-shadow-2xl" />
        </div>
      </div>
    </section>
  );
}
