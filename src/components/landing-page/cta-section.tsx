"use client";

import { Button } from "@/components/ui/button";
import { GradientButton } from "@/components/ui/gradient-button";
import { config } from "@/lib/config";
import { Check, ChevronRight } from "lucide-react";

export function CTASection() {
  return (
    <section className="py-24 px-4 bg-stone-900 relative overflow-hidden">
      {/* Background Criativo - Sophisticated Dark/Gold */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[100px] animation-delay-3000" />

        {/* Grid Sutil Dark */}
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: `
              linear-gradient(to right, #D4A15E 1px, transparent 1px),
              linear-gradient(to bottom, #D4A15E 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="container mx-auto relative z-10 text-center space-y-10">
        <h2 className="text-4xl md:text-7xl font-bold text-white text-balance leading-tight">
          Sua jornada para a{" "}
          <span className="text-primary italic">liberdade financeira</span>{" "}
          começa aqui.
        </h2>
        <p className="text-xl md:text-2xl text-stone-400 max-w-2xl mx-auto text-pretty">
          Junte-se a milhares de pessoas que já transformaram seus sonhos em
          metas reais com o Caixinhas.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8 animate-fade-in-up animation-delay-200">
          <Button
            asChild
            className="bg-gradient-to-r from-primary to-accent text-primary-foreground text-xl h-16 px-12 rounded-2xl hover:scale-110 transition-all group font-bold shadow-2xl shadow-primary/20"
          >
            <a
              href={config.checkoutUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="flex items-center text-white">
                Começar Agora
                <ChevronRight className="ml-2 w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </span>
            </a>
          </Button>
        </div>

        <div className="flex items-center justify-center gap-10 pt-10 text-stone-400 animate-fade-in-up animation-delay-300 flex-wrap">
          <div className="flex items-center gap-3 hover:text-white transition-colors cursor-default">
            <Check className="w-5 h-5 text-primary" />
            <span className="font-medium">Garantia de 7 dias</span>
          </div>
          <div className="flex items-center gap-3 hover:text-white transition-colors cursor-default">
            <Check className="w-5 h-5 text-primary" />
            <span className="font-medium">Cancele quando quiser</span>
          </div>
          <div className="flex items-center gap-3 hover:text-white transition-colors cursor-default">
            <Check className="w-5 h-5 text-primary" />
            <span className="font-medium">100% seguro</span>
          </div>
        </div>
      </div>
    </section>
  );
}
