
'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, PlayCircle } from 'lucide-react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Logo } from '../logo';

const DEMO_IMAGES = [
    "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=900&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=900&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=900&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=900&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=900&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1618220179428-22790b461013?w=900&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=900&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=900&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1497436072909-60f360e1d4b0?w=900&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1522770179533-24471fcdba45?w=900&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=900&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=900&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=900&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=900&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1520085601670-ee14aa5fa3e8?w=900&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1481437156560-3205f6a55735?w=900&auto=format&fit=crop&q=60",
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
      
       {/* Gradient Overlays */}
       <div aria-hidden="true" className="absolute inset-0 z-[1] left-0 w-1/2 bg-background" />
       <div aria-hidden="true" className="absolute inset-0 z-[1] left-1/2 w-1/2 bg-gradient-to-r from-background to-transparent" />


      {/* Content */}
      <div className="relative z-10 grid lg:grid-cols-2 gap-10 items-center w-full">
        <div className="relative text-center lg:text-start space-y-6">
            <h1 className="font-sans text-5xl font-bold leading-tight tracking-tighter md:text-6xl lg:text-7xl">
                Tome as Melhores Decisões Financeiras
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
                    <Image src={DEMO_IMAGES[3]} alt="User 1" width={40} height={40} className="rounded-full border-2 border-background" data-ai-hint="man portrait"/>
                    <Image src={DEMO_IMAGES[2]} alt="User 2" width={40} height={40} className="rounded-full border-2 border-background" data-ai-hint="woman portrait" />
                    <Image src={DEMO_IMAGES[1]} alt="User 3" width={40} height={40} className="rounded-full border-2 border-background" data-ai-hint="man face" />
                    <Image src={DEMO_IMAGES[0]} alt="User 4" width={40} height={40} className="rounded-full border-2 border-background" data-ai-hint="woman face" />
                </div>
                <div>
                    <p className='font-semibold text-foreground'>+10.000 casais</p>
                    <p className='text-sm text-muted-foreground'>realizando sonhos juntos</p>
                </div>
            </div>
        </div>
        <div className="relative h-[500px] w-full max-w-lg lg:h-full lg:min-h-[600px] lg:flex-1">
            <Logo className="w-full h-full drop-shadow-2xl" />
        </div>
      </div>
    </section>
  );
}

