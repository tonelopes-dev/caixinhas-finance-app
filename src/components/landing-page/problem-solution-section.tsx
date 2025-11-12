"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

type ProblemSolutionSectionProps = {
  isVisible: { [key: string]: boolean }
}

export function ProblemSolutionSection({
  isVisible,
}: ProblemSolutionSectionProps) {
  return (
    <section className="py-20 px-4 bg-card/50">
      <div className="container mx-auto">
        <div
          className="max-w-4xl mx-auto text-center space-y-6 mb-16"
          data-animate="problem"
        >
          <Badge
            className={`bg-destructive/10 text-destructive border-destructive/20 text-base px-4 py-1.5 transition-all duration-700 ${
              isVisible.problem
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            O Problema
          </Badge>
          <h2
            className={`text-4xl md:text-5xl font-bold text-foreground text-balance transition-all duration-700 delay-100 ${
              isVisible.problem
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            O dinheiro não deveria ser um tabu entre casais
          </h2>
          <div className="grid md:grid-cols-3 gap-6 pt-8">
            {[
              {
                emoji: "😰",
                text: "Não sei como falar sobre dinheiro com meu parceiro(a)",
              },
              {
                emoji: "🤔",
                text: "Misturamos tudo e não sabemos para onde o dinheiro foi",
              },
              {
                emoji: "😔",
                text: "Nossos sonhos parecem distantes e impossíveis",
              },
            ].map((problem, i) => (
              <Card
                key={i}
                className={`border-2 border-destructive/20 hover:border-destructive/40 hover:scale-105 transition-all duration-500 cursor-pointer ${
                  isVisible.problem
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${200 + i * 100}ms` }}
              >
                <CardContent className="p-6 space-y-3">
                  <div className="text-4xl animate-bounce-slow">
                    {problem.emoji}
                  </div>
                  <p className="text-lg text-foreground/80 font-medium">
                    {problem.text}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div
          className="max-w-4xl mx-auto text-center space-y-6"
          data-animate="solution"
        >
          <Badge
            className={`bg-primary/10 text-primary border-primary/20 text-base px-4 py-1.5 transition-all duration-700 ${
              isVisible.solution
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            A Solução
          </Badge>
          <h2
            className={`text-4xl md:text-5xl font-bold text-foreground text-balance transition-all duration-700 delay-100 ${
              isVisible.solution
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            Transforme conversas difíceis em{" "}
            <span className="text-primary">celebrações conjuntas</span>
          </h2>
          <p
            className={`text-xl text-foreground/70 leading-relaxed text-pretty max-w-3xl mx-auto transition-all duration-700 delay-200 ${
              isVisible.solution
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            O Caixinhas é um terreno neutro onde registrar uma despesa ou
            contribuir para um sonho se torna um ato de parceria, não de
            julgamento.
          </p>
        </div>
      </div>
    </section>
  )
}
