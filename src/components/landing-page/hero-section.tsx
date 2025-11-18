"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Logo } from "../logo"

export function HeroSection() {

  return (
    <section className="pt-32 pb-20 px-4 relative overflow-hidden flex items-center justify-center min-h-[80svh]">
      <div className="container mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Coluna da Esquerda: Texto */}
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
          
          {/* Coluna da Direita: Logo */}
          <div className="flex items-center justify-center">
             <Logo className="w-96 h-96" />
          </div>

        </div>
      </div>
    </section>
  )
}
