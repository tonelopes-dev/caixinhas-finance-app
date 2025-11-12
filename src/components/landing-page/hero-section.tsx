"use client"

import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Sparkles, ChevronRight } from "lucide-react"

type HeroSectionProps = {
  scrollY: number
}

export function HeroSection({ scrollY }: HeroSectionProps) {
  return (
    <section className="pt-32 pb-20 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 animate-gradient-slow" />

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-primary/20 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 10}s`,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-fade-in-up">
            <Badge className="bg-primary/10 text-primary border-primary/20 text-base px-4 py-1.5 animate-fade-in">
              <Sparkles className="w-4 h-4 inline mr-2 animate-pulse" />
              Mais que um app, uma ponte para sonhos
            </Badge>

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

            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up animation-delay-300">
              <Button
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 text-xl h-14 px-8 hover:scale-105 transition-all relative overflow-hidden group"
              >
                <span className="relative z-10 flex items-center">
                  Começar Agora
                  <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-xl h-14 px-8 border-2 bg-transparent hover:bg-primary/5 hover:border-primary transition-all hover:scale-105"
              >
                Ver Como Funciona
              </Button>
            </div>

            <div className="flex items-center gap-8 pt-4 animate-fade-in-up animation-delay-400">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent border-4 border-background hover:scale-110 transition-transform cursor-pointer"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  />
                ))}
              </div>
              <div>
                <p className="text-lg font-semibold text-foreground">
                  +10.000 casais
                </p>
                <p className="text-sm text-foreground/60">
                  realizando sonhos juntos
                </p>
              </div>
            </div>
          </div>

          <div className="relative animate-fade-in-up animation-delay-200">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-[3rem] blur-3xl animate-pulse-slow" />
            <div
              className="relative z-10 transform hover:scale-105 transition-all duration-700 hover:rotate-2"
              style={{ transform: `translateY(${scrollY * 0.1}px)` }}
            >
              <Image
                src="/screenshots/main-dashboard.png"
                alt="Dashboard Principal do Caixinhas"
                width={600}
                height={1200}
                data-ai-hint="app dashboard"
                className="relative z-10 w-full drop-shadow-2xl rounded-[2rem]"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
