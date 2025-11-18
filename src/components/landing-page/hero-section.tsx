"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { Logo } from "../logo"
import { PlaceHolderImages } from "@/lib/placeholder-images"

type HeroSectionProps = {
  scrollY: number
}

export function HeroSection({ scrollY }: HeroSectionProps) {
  const marqueeImages = PlaceHolderImages.filter((img) =>
    img.id.startsWith("feature")
  ).map((img) => img.imageUrl)
  const duplicatedImages = [...marqueeImages, ...marqueeImages]

  return (
    <section className="pt-32 px-4 relative overflow-hidden h-[800px] flex items-center justify-center">
      {/* Animated Image Marquee Background */}
      <div className="absolute inset-0 w-full h-full overflow-hidden opacity-10 [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)]">
        <motion.div
          className="flex gap-8"
          animate={{
            x: ["0%", "-100%"],
            transition: {
              ease: "linear",
              duration: 80,
              repeat: Infinity,
            },
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
              />
            </div>
          ))}
        </motion.div>
        <motion.div
          className="flex gap-8 mt-8"
          animate={{
            x: ["-100%", "0%"],
            transition: {
              ease: "linear",
              duration: 90,
              repeat: Infinity,
              delay: 2,
            },
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
              />
            </div>
          ))}
        </motion.div>
      </div>

      <div className="container mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-fade-in-up">
            <h1 className="text-5xl md:text-7xl font-bold text-foreground leading-tight text-balance animate-fade-in-up animation-delay-100">
              Sonhar juntos é o primeiro{" "}
              <span className="text-primary animate-gradient-text bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto]">
                passo para conquistar
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-foreground/70 leading-relaxed text-pretty animate-fade-in-up animation-delay-200">
              Caixinhas não é apenas um aplicativo de finanças. É uma ferramenta
              de comunicação e confiança para transformar sonhos individuais em
              conquistas conjuntas.
            </p>
          </div>

          <div className="relative animate-fade-in-up animation-delay-200 mb-[-345px]">
            <div
              className="relative z-10 transform hover:scale-105 transition-all duration-700 hover:rotate-2 flex items-center justify-center h-full"
              style={{ transform: `translateY(${scrollY * 0.1}px)` }}
            >
              <Logo
                className="w-[1024px] h-[1024px] drop-shadow-2xl transition-transform duration-500 group-hover:scale-110"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
