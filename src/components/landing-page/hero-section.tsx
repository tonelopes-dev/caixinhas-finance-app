
"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Logo } from "../logo"
import Image from "next/image"
import { PlaceHolderImages } from "@/lib/placeholder-images"
import { ChevronRight } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"

const images = [
  PlaceHolderImages.find((img) => img.id === "couple-planning")?.imageUrl,
  PlaceHolderImages.find((img) => img.id === "hero-phones")?.imageUrl,
  PlaceHolderImages.find((img) => img.id === "feature-highlight-phone")
    ?.imageUrl,
  PlaceHolderImages.find((img) => img.id === "testimonial-group")?.imageUrl,
  PlaceHolderImages.find((img) => img.id === "cta-phones")?.imageUrl,
  "/photos/clara-perfil.png",
  "/photos/joao-perfil.png",
  "/screenshots/workspace-selection.png",
  "/screenshots/all-boxes-view.png",
  "/screenshots/personal-dashboard.png",
  "/screenshots/savings-box-detail.png",
]

function PhotoCarousel() {
  const allImages = [...images, ...images, ...images] // Duplicate for seamless loop

  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent z-10" />
      <div className="absolute -top-1/4 -bottom-1/4 flex flex-col justify-center gap-4">
        {[-20, 20, -20].map((rotation, rowIndex) => (
          <div
            key={rowIndex}
            className="flex animate-marquee-right-to-left items-center justify-around gap-4"
            style={{
              animationDuration: `${50 + rowIndex * 10}s`,
              transform: `rotate(${rotation}deg)`,
            }}
          >
            {allImages.map((src, i) => (
              <div
                key={i}
                className="relative h-48 w-32 shrink-0 overflow-hidden rounded-xl border-4 border-background/50 shadow-lg md:h-64 md:w-48"
                style={{
                  transform: `rotate(${i % 2 === 0 ? 2 : -2}deg)`,
                }}
              >
                {src && (
                  <Image
                    src={src}
                    alt={`Foto de demonstração ${i + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 128px, 192px"
                  />
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export function HeroSection() {
  return (
    <section className="relative flex min-h-[80svh] items-center justify-center overflow-hidden px-4 pt-32 pb-20">
      <PhotoCarousel />
      <div className="container relative z-10 mx-auto">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Coluna da Esquerda: Texto */}
          <div className="z-10 space-y-8 animate-fade-in-up">
            <div className="flex items-center gap-4">
              <h1 className="animate-fade-in-up text-balance text-5xl font-bold leading-tight text-foreground animation-delay-100 md:text-7xl">
                Sonhar juntos é o primeiro{" "}
                <span className="animate-gradient-text bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto]">
                  passo para conquistar
                </span>
              </h1>
            </div>

            <p className="animate-fade-in-up text-pretty text-xl leading-relaxed text-foreground/70 animation-delay-200 md:text-2xl">
              Caixinhas não é apenas um aplicativo de finanças. É uma ferramenta
              de comunicação e confiança para transformar sonhos individuais em
              conquistas conjuntas.
            </p>

            <div className="animate-fade-in-up animation-delay-300 space-y-8">
              <div className="flex items-center gap-4">
                <Button asChild size="lg" className="h-14 px-8 text-lg">
                  <Link href="/register">Começar Agora <ChevronRight className="ml-2 h-5 w-5" /></Link>
                </Button>
                <Button variant="ghost" size="lg" className="h-14 px-8 text-lg">
                  <Link href="#como-funciona">Ver Como Funciona</Link>
                </Button>
              </div>

               <div className="flex items-center gap-4">
                <div className="flex -space-x-4">
                  <Avatar className="h-12 w-12 border-2 border-background">
                    <AvatarImage src="https://images.unsplash.com/photo-1554151228-14d9def656e4?w=100" data-ai-hint="woman portrait" />
                    <AvatarFallback>C</AvatarFallback>
                  </Avatar>
                  <Avatar className="h-12 w-12 border-2 border-background">
                    <AvatarImage src="https://images.unsplash.com/photo-1552058544-f2b08422138a?w=100" data-ai-hint="man portrait"/>
                    <AvatarFallback>J</AvatarFallback>
                  </Avatar>
                   <Avatar className="h-12 w-12 border-2 border-background">
                    <AvatarImage src="https://images.unsplash.com/photo-1499952127939-9bbf5af6c51c?w=100" data-ai-hint="woman smiling"/>
                    <AvatarFallback>A</AvatarFallback>
                  </Avatar>
                   <Avatar className="h-12 w-12 border-2 border-background">
                    <AvatarImage src="https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=100" data-ai-hint="man glasses"/>
                    <AvatarFallback>M</AvatarFallback>
                  </Avatar>
                </div>
                <div>
                  <p className="font-bold text-foreground text-lg">+10.000 casais</p>
                  <p className="text-muted-foreground">realizando sonhos juntos</p>
                </div>
              </div>
            </div>
          </div>

          {/* Coluna da Direita: Logo */}
          <div className="flex items-center justify-center">
            <Logo className="h-96 w-96" />
          </div>
        </div>
      </div>
    </section>
  )
}
