
'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { motion } from 'framer-motion';

// Lista de imagens para o fundo sutil
const BG_IMAGES = [
  "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=900&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=900&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=900&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=900&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=900&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1618220179428-22790b461013?w=900&auto=format&fit=crop&q=60",
];
const duplicatedImages = [...BG_IMAGES, ...BG_IMAGES];


export function Hero() {
  return (
    <section id="hero" className="relative h-screen overflow-hidden">
      {/* Camada de Fundo: Carrossel Sutil */}
      <div className="absolute inset-0 z-0 opacity-10 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)]">
        <motion.div
          className="flex gap-8"
          animate={{ x: ["0%", "-100%"] }}
          transition={{ ease: "linear", duration: 120, repeat: Infinity }}
        >
          {duplicatedImages.map((src, index) => (
            <div
              key={`marquee-bg-${index}`}
              className="relative aspect-[4/3] h-64 flex-shrink-0"
              style={{ rotate: `${(index % 2 === 0 ? -3 : 3)}deg` }}
            >
              <Image
                src={src}
                alt={`Background image ${index + 1}`}
                fill
                className="w-full h-full object-cover rounded-2xl shadow-md"
                data-ai-hint="couple travel"
              />
            </div>
          ))}
        </motion.div>
      </div>

      {/* Container Principal */}
      <div className="relative z-10 mx-auto max-w-5xl px-6 flex items-center h-full">

        <div className="grid lg:grid-cols-2 gap-10 items-center w-full">
          {/* Lado Esquerdo: Texto */}
          <div className="text-center lg:text-start space-y-6">
            <h1 className="font-headline text-5xl font-bold leading-tight tracking-tighter md:text-6xl lg:text-7xl">
                Sonhar juntos é <br /> o primeiro <span className="text-primary">passo</span> <br /> para <span className="text-primary">conquistar</span>
            </h1>
            <p className="mx-auto max-w-xl text-lg text-muted-foreground lg:mx-0">
                Caixinhas não é apenas um aplicativo de finanças. É uma ferramenta de comunicação e confiança para transformar sonhos individuais em conquistas conjuntas.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 lg:flex-row lg:justify-start">
                <Button asChild size="lg">
                    <Link href="/register">
                        Assinar Agora
                        <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                </Button>
            </div>
          </div>

          {/* Lado Direito: Ilustração */}
          <div className="relative h-full w-full min-h-[400px] flex-1 hidden lg:flex items-center justify-center">
            <Image 
                src="/screenshots/gift-illustration.png" 
                alt="Ilustração de um presente simbolizando um sonho"
                width={500}
                height={500}
                className="object-contain drop-shadow-2xl animate-float"
                data-ai-hint="gift box illustration"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
