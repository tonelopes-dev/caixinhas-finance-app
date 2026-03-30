"use client"

import { Card, CardContent } from "@/components/ui/card"

type ProblemSolutionSectionProps = {
  isVisible: { [key: string]: boolean }
}

export function ProblemSolutionSection({
  isVisible,
}: ProblemSolutionSectionProps) {
  return (
    <section className="py-24 px-4 bg-[#f7f8fd] relative overflow-hidden">
      {/* Background Criativo - Transição do Caos para a Organização */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
        {/* Lado do Problema: Formas orgânicas e "caóticas" no topo */}
        <div className="absolute top-0 left-0 w-full h-1/2 overflow-hidden">
          <div className="absolute -top-20 -left-20 w-[600px] h-[600px] bg-destructive/5 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute top-40 right-10 w-96 h-96 bg-accent/5 rounded-full blur-[100px] animation-delay-2000" />
          
          {/* Elementos de "Ruído" sutil para representar desorganização */}
          <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')]" />
        </div>

        {/* Lado da Solução: Geometria e clareza na base */}
        <div className="absolute bottom-0 left-0 w-full h-1/2">
          {/* Gradiente de clareza */}
          <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent" />
          
          {/* Grid sutil representando organização */}
          <div 
            className="absolute inset-0 opacity-[0.05]" 
            style={{ 
              backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)',
              backgroundSize: '40px 40px'
            }} 
          />
          
          <div className="absolute -bottom-40 -right-20 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[150px]" />
          <div className="absolute bottom-20 -left-20 w-64 h-64 bg-accent/10 rounded-full blur-[80px]" />
        </div>
      </div>

      <div className="container mx-auto relative z-10">
        <div
          className="max-w-4xl mx-auto text-center space-y-6 mb-24"
          data-animate="problem"
        >
          <h2
            className={`text-4xl md:text-5xl font-bold text-foreground text-balance transition-all duration-700 delay-100 ${
              isVisible.problem
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            O dinheiro não precisa ser o vilão dos seus sonhos (nem da sua paz).
          </h2>
          <div className="grid md:grid-cols-3 gap-8 pt-8">
            {[
              {
                emoji: "😰",
                image: "/images/photos/porquinho-nao-fala-sobre-dinheiro.jpeg",
                text: "Sei que tenho sonhos, mas não sei por onde começar a economizar",
              },
              {
                emoji: "🤔",
                image: "/images/photos/bagunca-entre-dinheiro-contas-cartoes.jpeg",
                text: "O dinheiro some e meus objetivos ficam cada vez mais distantes",
              },
              {
                emoji: "😔",
                image: "/images/photos/porquinho-olhando-para-uma-estrela-distante.jpeg",
                text: "Quero conquistar minha independência financeira, mas parece impossível",
              },
            ].map((problem, i) => (
              <Card
                key={i}
                className={`border-2 border-destructive/10 bg-white/60 backdrop-blur-sm hover:border-destructive/40 hover:scale-105 transition-all duration-500 cursor-pointer shadow-sm hover:shadow-xl ${
                  isVisible.problem
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${200 + i * 100}ms` }}
              >
                <CardContent className="p-6 space-y-4">
                  <div className="overflow-hidden rounded-xl">
                    {problem.image ? (
                      <img
                        src={problem.image}
                        alt={problem.text}
                        className="w-full h-48 object-cover transition-transform duration-700 hover:scale-110"
                      />
                    ) : (
                      <div className="text-6xl py-10">{problem.emoji}</div>
                    )}
                  </div>
                  <p className="text-lg text-slate-700 font-medium leading-tight">
                    {problem.text}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div
          className="max-w-4xl mx-auto text-center space-y-8 relative"
          data-animate="solution"
        >
          {/* Elemento flutuante de "conquista" */}
          <div className="absolute -top-10 -right-10 w-20 h-20 bg-primary/20 rounded-full blur-xl animate-bounce" />

          <h2
            className={`text-4xl md:text-6xl font-bold text-foreground text-balance transition-all duration-700 delay-100 ${
              isVisible.solution
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            Transforme seus objetivos em{" "}
            <span className="text-primary relative inline-block">
              conquistas reais
              <div className="absolute -bottom-2 left-0 w-full h-2 bg-primary/20 rounded-full" />
            </span>
          </h2>
          <p
            className={`text-xl md:text-2xl text-slate-600 leading-relaxed text-pretty max-w-3xl mx-auto transition-all duration-700 delay-200 ${
              isVisible.solution
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            O Caixinhas é o seu espaço para organizar metas, acompanhar
            progresso e celebrar cada conquista — seja realizando sonhos solo
            ou com quem você ama.
          </p>

          <div className={`flex justify-center gap-4 pt-10 transition-all duration-1000 delay-500 ${
            isVisible.solution ? "opacity-100 scale-100" : "opacity-0 scale-95"
          }`}>
            <div className="w-3 h-3 rounded-full bg-primary" />
            <div className="w-3 h-3 rounded-full bg-primary/60" />
            <div className="w-3 h-3 rounded-full bg-primary/30" />
          </div>
        </div>
      </div>
    </section>
  )
}
