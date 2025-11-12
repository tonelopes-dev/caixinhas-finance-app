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

type HowItWorksSectionProps = {
  isVisible: { [key: string]: boolean }
}

export function HowItWorksSection({ isVisible }: HowItWorksSectionProps) {
  return (
    <section id="como-funciona" className="py-20 px-4">
      <div className="container mx-auto">
        <div
          className="text-center mb-16 space-y-4"
          data-animate="how-it-works-header"
        >
          <Badge
            className={`bg-primary/10 text-primary border-primary/20 text-base px-4 py-1.5 transition-all duration-700 ${
              isVisible["how-it-works-header"]
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            Processo Simples
          </Badge>
          <h2
            className={`text-4xl md:text-6xl font-bold text-foreground text-balance transition-all duration-700 delay-100 ${
              isVisible["how-it-works-header"]
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            Comece em 5 passos simples
          </h2>
        </div>

        <div className="max-w-5xl mx-auto space-y-12">
          {[
            {
              step: "01",
              title: "Crie seus Espaços",
              description:
                "Cada usuário tem sua conta pessoal. A partir dela, você pode criar ou ser convidado para um Cofre Compartilhado com seu parceiro(a).",
              icon: Users,
            },
            {
              step: "02",
              title: "Organize seu Dinheiro",
              description:
                "Adicione suas contas bancárias e cartões (sejam pessoais ou conjuntos) dentro dos espaços apropriados.",
              icon: Wallet,
            },
            {
              step: "03",
              title: "Defina seus Sonhos",
              description:
                "Crie Caixinhas para cada objetivo, desde 'Trocar de carro' até 'Viagem para a Toscana'. Dê nome, ícone e valor-alvo.",
              icon: Target,
            },
            {
              step: "04",
              title: "Registre e Acompanhe",
              description:
                "Anote suas despesas e receitas do dia a dia. Veja seu patrimônio crescer e o progresso de cada caixinha aumentar.",
              icon: TrendingUp,
            },
            {
              step: "05",
              title: "Receba Insights",
              description:
                "Use nossos relatórios gerados por IA para entender seus hábitos financeiros e receber dicas personalizadas para alcançar seus sonhos mais rápido.",
              icon: Sparkles,
            },
          ].map((step, index) => (
            <div
              key={index}
              className="flex gap-8 items-start group cursor-pointer"
              data-animate={`step-${index}`}
            >
              <div className="flex-shrink-0">
                <div
                  className={`w-20 h-20 rounded-2xl bg-primary flex items-center justify-center text-3xl font-bold text-primary-foreground group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 ${
                    isVisible[`step-${index}`]
                      ? "opacity-100 translate-x-0"
                      : "opacity-0 -translate-x-12"
                  }`}
                >
                  {step.step}
                </div>
              </div>
              <div
                className={`flex-1 pt-2 transition-all duration-700 delay-100 ${
                  isVisible[`step-${index}`]
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 translate-x-12"
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <step.icon className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
                  <h3 className="text-3xl font-bold text-foreground group-hover:text-primary transition-colors">
                    {step.title}
                  </h3>
                </div>
                <p className="text-xl text-foreground/70 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-16">
          <Button
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-primary/90 text-xl h-14 px-8 hover:scale-105 transition-all relative overflow-hidden group"
          >
            <span className="relative z-10 flex items-center">
              Começar Minha Jornada
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </span>
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          </Button>
        </div>
      </div>
    </section>
  )
}
