"use client";

import { Button } from "@/components/ui/button";
import { config } from "@/lib/config";
import {
    ChevronRight,
    Heart,
    Lock,
    Shield,
    Sparkles,
    Target,
    Zap,
} from "lucide-react";

type BenefitsSectionProps = {
  isVisible: { [key: string]: boolean };
};

export function BenefitsSection({ isVisible }: BenefitsSectionProps) {
  const benefits = [
    {
      icon: Shield,
      title: "Clareza Mental",
      description:
        "Elimine o estresse da incerteza financeira. Tenha um panorama completo e terreno seguro para decisões inteligentes.",
      color: "bg-primary",
      delay: 100,
    },
    {
      icon: Sparkles,
      title: "Insights Reais",
      description:
        "Relatórios inteligentes que traduzem números em conselhos práticos para acelerar a conquista de cada meta.",
      color: "bg-accent",
      delay: 200,
    },
    {
      icon: Heart,
      title: "Realização",
      description:
        "Celebrar cada meta alcançada fortalece o foco e torna a jornada financeira muito mais gratificante.",
      color: "bg-accent",
      delay: 300,
    },
    {
      icon: Lock,
      title: "Privacidade Total",
      description:
        "Seus Cofres Pessoais são 100% privados. Você decide exatamente o que e quando compartilhar.",
      color: "bg-primary",
      delay: 400,
    },
    {
      icon: Target,
      title: "Metas Visuais",
      description:
        "Transforme números frios em objetivos reais. Visualize seu progresso e mantenha o foco no que importa.",
      color: "bg-primary",
      delay: 500,
    },
    {
      icon: Zap,
      title: "Futuro Sólido",
      description:
        "Construa uma história de vida cheia de conquistas memoráveis e total controle sobre seu patrimônio.",
      color: "bg-accent",
      delay: 600,
    },
  ];

  return (
    <section className="py-24 px-4 relative overflow-hidden bg-[#fdfcf7]">
      {/* Background Decorativo - Sophisticated Aura & Texture */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute -top-24 -left-24 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px]" />
        <div className="absolute -bottom-24 -right-24 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[120px]" />

        {/* Padrão de Pontos Dourados Sutil */}
        <div
          className="absolute inset-0 opacity-[0.1]"
          style={{
            backgroundImage: "radial-gradient(#D4A15E 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Textura de Grão sutil */}
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]" />
      </div>

      <div className="container mx-auto relative z-10">
        <div
          className="text-center mb-20 space-y-4"
          data-animate="benefits-header"
        >
          <h2
            className={`text-4xl md:text-6xl font-bold text-stone-900 text-balance transition-all duration-700 delay-100 ${
              isVisible["benefits-header"]
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            O maior ativo do projeto é a{" "}
            <span className="text-primary italic">Confiança</span>
          </h2>
          <p className="text-xl text-stone-600 max-w-2xl mx-auto text-pretty">
            Desenhamos uma experiência que vai além de números, focada na
            harmonia e no sucesso da sua jornada financeira.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className={`group relative rounded-3xl overflow-hidden border border-white bg-white/50 backdrop-blur-xl shadow-xl shadow-stone-200/50 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 hover:-translate-y-2 ${
                isVisible[`benefit-${index}`]
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-12"
              }`}
              style={{ transitionDelay: `${benefit.delay}ms` }}
              data-animate={`benefit-${index}`}
            >
              {/* Overlay de gradiente interno sutil */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="p-8 space-y-6 relative z-10">
                <div
                  className={`${benefit.color} w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg shadow-black/5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}
                >
                  <benefit.icon className="w-8 h-8 text-white" />
                </div>

                <div className="space-y-3">
                  <h3 className="text-2xl font-bold text-stone-900 leading-tight">
                    {benefit.title}
                  </h3>
                  <p className="text-[17px] text-stone-600 leading-relaxed group-hover:text-stone-800 transition-colors">
                    {benefit.description}
                  </p>
                </div>
              </div>

              {/* Detalhe Decorativo de Fundo no Card */}
              <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
            </div>
          ))}
        </div>

        {/* CTA Final da Seção de Benefícios */}
        <div
          className={`mt-16 mx-8 flex justify-center transition-all duration-1000 delay-500 ${
            isVisible["benefits-header"]
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-12"
          }`}
        >
          <Button
            asChild
            className="h-16 sm:px-14 px-4 text-xl font-bold bg-gradient-to-r from-primary to-accent text-white hover:opacity-90 shadow-2xl shadow-primary/20 hover:scale-110 transition-all border-none rounded-2xl"
          >
            <a
              href={config.checkoutUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center no-underline"
            >
              Começar minha transformação{" "}
              <ChevronRight className="ml-2 h-6 w-6" />
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
