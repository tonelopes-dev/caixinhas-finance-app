"use client"

import { Button } from "@/components/ui/button"
import { GradientButton } from "@/components/ui/gradient-button"
import { Check, ChevronRight } from "lucide-react"

export function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-br from-primary via-primary to-accent relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 border-4 border-primary-foreground rounded-full animate-ping-slow" />
        <div className="absolute bottom-10 right-10 w-48 h-48 border-4 border-primary-foreground rounded-full animate-ping-slow animation-delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-4 border-primary-foreground rounded-full animate-ping-slow animation-delay-500" />
      </div>

      <div className="container mx-auto relative text-center space-y-8">
        <h2 className="text-4xl md:text-6xl font-bold text-primary-foreground text-balance animate-fade-in-up">
          Pronto para realizar seus sonhos juntos?
        </h2>
        <p className="text-xl md:text-2xl text-primary-foreground/90 max-w-2xl mx-auto text-pretty animate-fade-in-up animation-delay-100">
          Junte-se a mais de 10.000 casais que já estão transformando suas
          vidas financeiras com o Caixinhas
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4 animate-fade-in-up animation-delay-200">
          <GradientButton
            variant="variant"
            className="text-xl h-14 px-8 hover:scale-110 transition-all group"
          >
            <span className="flex items-center">
              Começar Agora
              <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </span>
          </GradientButton>
        </div>

        <div className="flex items-center justify-center gap-8 pt-8 text-primary-foreground/80 animate-fade-in-up animation-delay-300 flex-wrap">
          <div className="flex items-center gap-2 hover:scale-110 transition-transform">
            <Check className="w-5 h-5" />
            <span>Sem cartão de crédito</span>
          </div>
          <div className="flex items-center gap-2 hover:scale-110 transition-transform">
            <Check className="w-5 h-5" />
            <span>Cancele quando quiser</span>
          </div>
          <div className="flex items-center gap-2 hover:scale-110 transition-transform">
            <Check className="w-5 h-5" />
            <span>100% seguro</span>
          </div>
        </div>
      </div>
    </section>
  )
}
