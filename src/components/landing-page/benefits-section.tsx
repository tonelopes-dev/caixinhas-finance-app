"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Shield,
  Heart,
  Target,
  Sparkles,
  Lock,
  Zap,
} from "lucide-react"

type BenefitsSectionProps = {
  isVisible: { [key: string]: boolean }
}

export function BenefitsSection({ isVisible }: BenefitsSectionProps) {
  return (
    <section className="py-20 bg-card px-4">
      <div className="container mx-auto">
        <div
          className="text-center mb-16 space-y-4"
          data-animate="benefits-header"
        >
          {/* <Badge
            className={`bg-primary/10 text-primary border-primary/20 text-base px-4 py-1.5 transition-all duration-700 ${
              isVisible["benefits-header"]
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            Por Que Caixinhas?
          </Badge> */}
          <h2
            className={`text-4xl md:text-6xl font-bold text-foreground text-balance transition-all duration-700 delay-100 ${
              isVisible["benefits-header"]
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            {/* Porque */} O Maior Ativo é a{" "}
            <span className="text-primary">Confiança</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: Shield,
              title: "Reduzam o Estresse",
              description:
                "Menos brigas sobre dinheiro, mais conversas sobre o futuro. Um terreno neutro para decisões financeiras.",
              color: "bg-primary",
            },
            {
              icon: Heart,
              title: "Aumentem a Cumplicidade",
              description:
                "Celebrar cada meta alcançada, por menor que seja, fortalece o vínculo e a parceria do casal.",
              color: "bg-accent",
            },
            {
              icon: Target,
              title: "Alcancem Objetivos Mais Rápido",
              description:
                "Com clareza e foco, o caminho para realizar sonhos se torna mais curto e eficiente.",
              color: "bg-primary",
            },
            {
              icon: Sparkles,
              title: "Insights com IA",
              description:
                "Relatórios mensais com linguagem humana, pontos de atenção e dicas práticas e encorajadoras.",
              color: "bg-accent",
            },
            {
              icon: Lock,
              title: "Privacidade Garantida",
              description:
                "Mantenha suas contas pessoais privadas enquanto compartilha apenas o que deseja com seu parceiro(a).",
              color: "bg-primary",
            },
            {
              icon: Zap,
              title: "Construam um Legado",
              description:
                "Não apenas patrimônio, mas uma história de vida compartilhada, cheia de conquistas e memórias.",
              color: "bg-accent",
            },
          ].map((benefit, index) => (
            <Card
              key={index}
              className="border-2 hover:border-primary transition-all duration-300 hover:shadow-xl hover:-translate-y-2 group cursor-pointer"
              data-animate={`benefit-${index}`}
            >
              <CardContent
                className={`p-8 space-y-4 transition-all duration-700 ${
                  isVisible[`benefit-${index}`]
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div
                  className={`${benefit.color} w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}
                >
                  <benefit.icon className="w-8 h-8 text-background" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">
                  {benefit.title}
                </h3>
                <p className="text-lg text-foreground/70 leading-relaxed">
                  {benefit.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
