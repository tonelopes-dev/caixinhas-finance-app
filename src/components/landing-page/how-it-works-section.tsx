"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Users,
  Wallet,
  Target,
  TrendingUp,
  Sparkles,
  ArrowRight,
} from "lucide-react"
import { config } from "@/lib/config"

type HowItWorksSectionProps = {
  isVisible: { [key: string]: boolean }
}

export function HowItWorksSection({ isVisible }: HowItWorksSectionProps) {
  return (
    <section id="como-funciona" className="py-24 px-4 relative overflow-hidden bg-[#fdf7fd]">
      {/* Background Criativo - A Jornada/Caminho */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Linha de Conexão (Path) */}
        <svg 
          className="absolute top-40 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[800px] opacity-[0.05] hidden md:block"
          viewBox="0 0 400 800"
          fill="none"
        >
          <path 
            d="M200 0C200 100 0 150 0 250C0 350 400 450 400 550C400 650 200 700 200 800" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeDasharray="12 12"
            className="text-accent/20"
          />
        </svg>

        {/* Orbes de Cor (Warm Pink Palette) */}
        <div className="absolute top-20 -left-20 w-[500px] h-[500px] bg-[#ff6b7b]/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-40 -right-20 w-[600px] h-[600px] bg-[#f79fb2]/5 rounded-full blur-[120px]" />
        
        {/* Padrão de Pontos Sutil */}
        <div 
          className="absolute inset-0 opacity-[0.03]" 
          style={{ 
            backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)',
            backgroundSize: '32px 32px'
          }} 
        />
      </div>

      <div className="container mx-auto relative z-10">
        <div
          className="text-center mb-24 space-y-4"
          data-animate="how-it-works-header"
        >
          <h2
            className={`text-4xl md:text-6xl font-bold text-stone-900 text-balance transition-all duration-700 delay-100 ${
              isVisible["how-it-works-header"]
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            Comece em 5 passos simples
          </h2>
          <p className="text-xl text-stone-600 max-w-2xl mx-auto">
            Organizar suas finanças não precisa ser um quebra-cabeça. 
            Siga o caminho e conquiste sua liberdade.
          </p>
        </div>

        <div className="max-w-5xl mx-auto space-y-16 relative">
          {/* Conectores verticais para mobile/desktop stack */}
          <div className="absolute left-[39px] top-10 bottom-10 w-0.5 bg-gradient-to-b from-[#ff6b7b]/20 via-[#fa8292]/20 to-[#f79fb2]/20 hidden md:block" />

          {[
            {
              step: "01",
              title: "Ative seus Cofres",
              description: "Comece com seu Cofre Pessoal privado e crie Cofres Compartilhados para metas a dois. Privacidade e colaboração no mesmo lugar.",
              // icon: Users,
              color: "#fa8292",
            },
            {
              step: "02",
              title: "Organize seus Saldos",
              description: "Adicione suas contas e cartões manualmente. Sem conexões bancárias, você mantém o controle total e a segurança dos seus dados.",
              icon: Wallet,
              color: "#fa8292",
            },
            {
              step: "03",
              title: "Crie suas Caixinhas",
              description: "Dê nome aos seus sonhos. Crie caixinhas específicas para cada objetivo e defina o valor que deseja alcançar em cada uma delas.",
              icon: Target,
              color: "#fa8292",
            },
            {
              step: "04",
              title: "Lance com Facilidade",
              description: "Registre suas movimentações diárias de forma simples e rápida. Transforme a gestão financeira em um hábito leve e prazeroso.",
              icon: TrendingUp,
              color: "#fa8292",
            },
            {
              step: "05",
              title: "Conquiste suas Metas",
              description: "Acompanhe o progresso visual de cada caixinha. Veja seu dinheiro crescendo e saiba exatamente quando seus sonhos serão realizados.",
              icon: Sparkles,
              color: "#fa8292",
            },
          ].map((step, index) => (
            <div
              key={index}
              className="flex gap-8 items-start group relative"
              data-animate={`step-${index}`}
            >
              <div className="flex-shrink-0 relative z-10">
                <div
                  className={`w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold text-white shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 ${
                    isVisible[`step-${index}`]
                      ? "opacity-100 translate-x-0"
                      : "opacity-0 -translate-x-12"
                  }`}
                  style={{ backgroundColor: step.color }}
                >
                  {step.step}
                </div>
              </div>
              <div
                className={`flex-1 pt-2 transition-all duration-700 delay-100 ${
                  isVisible[`step-${index}`]
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
                }`}
              >
                <div className="flex items-center gap-3 mb-4">
                 {/*  <div 
                    className="p-2.5 rounded-xl bg-white shadow-sm border border-stone-100 transition-colors"
                    style={{ color: step.color }}
                  >
                    <step.icon className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  </div> */}
                  <h3 
                    className="text-3xl font-bold text-stone-900 transition-colors group-hover:opacity-80"
                    style={{ color: 'inherit' }} // Fallback
                  >
                    {step.title}
                  </h3>
                </div>
                <p className="text-xl text-stone-600 leading-relaxed max-w-3xl">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-24">
          <Button
            asChild
            size="lg"
            className="bg-gradient-to-r from-[#ff6b7b] to-[#fa8292] text-white hover:opacity-90 text-xl h-16 px-12 rounded-2xl hover:scale-105 transition-all relative overflow-hidden group shadow-xl shadow-[#ff6b7b]/20 font-bold"
          >
            <a href={config.checkoutUrl} target="_blank" rel="noopener noreferrer">
              <span className="relative z-10 flex items-center text-sm md:text-xl">
                Começar Minha Jornada Agora
                <ArrowRight className="ml-2 w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            </a>
          </Button>
        </div>
      </div>
    </section>
  )
}
