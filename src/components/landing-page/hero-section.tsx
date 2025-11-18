
"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { PlaceHolderImages } from "@/lib/placeholder-images"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Logo } from "../logo"

export function HeroSection() {
  const marqueeImages = PlaceHolderImages.filter((img) =>
    img.id.startsWith("feature")
  ).map((img) => img.imageUrl)
  
  const allImages = [...marqueeImages, ...marqueeImages, ...marqueeImages, ...marqueeImages];

  const firstRow = allImages.slice(0, 8)
  const secondRow = allImages.slice(8, 16)
  const thirdRow = allImages.slice(4, 12)

  return (
    <section className="pt-32 pb-20 px-4 relative overflow-hidden flex items-center justify-center min-h-[80svh]">
      <div className="container mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-fade-in-up z-10">
             <div className="flex items-center gap-4">
              <h1 className="text-5xl md:text-7xl font-bold text-foreground leading-tight text-balance animate-fade-in-up animation-delay-100">
                Sonhar juntos é o primeiro{" "}
                <span className="text-primary animate-gradient-text bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto]">
                  passo para conquistar
                </span>
              </h1>
            </div>

            <p className="text-xl md:text-2xl text-foreground/70 leading-relaxed text-pretty animate-fade-in-up animation-delay-200">
              Caixinhas não é apenas um aplicativo de finanças. É uma ferramenta
              de comunicação e confiança para transformar sonhos individuais em
              conquistas conjuntas.
            </p>

            <div className="animate-fade-in-up animation-delay-300">
              <Button asChild size="lg" className="text-lg h-14 px-8">
                <Link href="/register">Criar Conta Gratuita</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute top-0 right-0 h-full w-full lg:w-1/2 [mask-image:linear-gradient(to_right,transparent,black_20%,black_100%)] lg:[mask-image:linear-gradient(to_right,transparent_20%,black_80%)]">
        {/* Carrossel de Imagens */}
        <div className="absolute inset-0 flex flex-col gap-8 justify-center overflow-hidden">
          <motion.div
            className="flex gap-8"
            animate={{
              x: ["0%", "-100%"],
              transition: {
                ease: "linear",
                duration: 60,
                repeat: Infinity,
              },
            }}
          >
            {firstRow.map((src, index) => (
              <div
                key={`row1-${index}`}
                className="relative aspect-[4/3] h-40 flex-shrink-0"
                style={{ rotate: `${(index % 2 === 0 ? -3 : 5)}deg` }}
              >
                <Image
                  src={src}
                  alt={`Showcase image ${index + 1}`}
                  fill
                  className="w-full h-full object-cover rounded-2xl shadow-md"
                />
              </div>
            ))}
          </motion.div>
          <motion.div
            className="flex gap-8"
            animate={{
              x: ["-100%", "0%"],
              transition: {
                ease: "linear",
                duration: 75,
                repeat: Infinity,
              },
            }}
          >
            {secondRow.map((src, index) => (
              <div
                key={`row2-${index}`}
                className="relative aspect-[3/4] h-56 flex-shrink-0"
                style={{ rotate: `${(index % 2 === 0 ? 4 : -2)}deg` }}
              >
                <Image
                  src={src}
                  alt={`Showcase image ${index + 1}`}
                  fill
                  className="w-full h-full object-cover rounded-2xl shadow-lg"
                />
              </div>
            ))}
          </motion.div>
          <motion.div
            className="flex gap-8"
            animate={{
              x: ["0%", "-100%"],
              transition: {
                ease: "linear",
                duration: 55,
                repeat: Infinity,
              },
            }}
          >
            {thirdRow.map((src, index) => (
              <div
                key={`row3-${index}`}
                className="relative aspect-[16/9] h-32 flex-shrink-0"
                style={{ rotate: `${(index % 2 === 0 ? 2 : -4)}deg` }}
              >
                <Image
                  src={src}
                  alt={`Showcase image ${index + 1}`}
                  fill
                  className="w-full h-full object-cover rounded-xl shadow-sm"
                />
              </div>
            ))}
          </motion.div>
        </div>
      </div>
      
      {/* Camada do Logo, agora sem posicionamento absoluto */}
      <div className="flex items-center justify-center pointer-events-none">
        <Logo className="w-96 h-96" />
      </div>
    </section>
  )
}
