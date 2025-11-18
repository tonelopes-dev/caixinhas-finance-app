"use client"

import Image from "next/image"
import { Logo } from "../logo"

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

          <div className="relative animate-fade-in-up animation-delay-200">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-[3rem] blur-3xl animate-pulse-slow" />
            <div
              className="relative z-10 transform hover:scale-105 transition-all duration-700 hover:rotate-2 flex items-center justify-center h-full"
              style={{ transform: `translateY(${scrollY * 0.1}px)` }}
            >
              <Logo
                className="w-64 h-64 drop-shadow-2xl transition-transform duration-500 group-hover:scale-110"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
