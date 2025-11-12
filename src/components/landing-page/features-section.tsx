"use client"

import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Check, Wallet, PiggyBank, BarChart3, TrendingUp } from "lucide-react"

type FeaturesSectionProps = {
  isVisible: { [key: string]: boolean }
}

export function FeaturesSection({ isVisible }: FeaturesSectionProps) {
  return (
    <section id="recursos" className="py-20 px-4">
      <div className="container mx-auto">
        <div
          className="text-center mb-16 space-y-4"
          data-animate="features-header"
        >
          <Badge
            className={`bg-primary/10 text-primary border-primary/20 text-base px-4 py-1.5 transition-all duration-700 ${
              isVisible["features-header"]
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            Recursos Poderosos
          </Badge>
          <h2
            className={`text-4xl md:text-6xl font-bold text-foreground text-balance transition-all duration-700 delay-100 ${
              isVisible["features-header"]
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            Como o Caixinhas funciona?
          </h2>
          <p
            className={`text-xl text-foreground/70 max-w-2xl mx-auto text-pretty transition-all duration-700 delay-200 ${
              isVisible["features-header"]
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            Conheça os conceitos simples e poderosos que tornam o Caixinhas
            único
          </p>
        </div>

        {/* Recurso 1: O Cofre */}
        <div
          className="grid lg:grid-cols-2 gap-12 items-center mb-24"
          data-animate="feature-1"
        >
          <div
            className={`space-y-6 transition-all duration-700 ${
              isVisible["feature-1"]
                ? "opacity-100 translate-x-0"
                : "opacity-0 -translate-x-12"
            }`}
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-2 hover:bg-primary/20 transition-colors">
              <Wallet className="w-5 h-5 text-primary" />
              <span className="text-primary font-bold">O Cofre</span>
            </div>
            <h3 className="text-4xl md:text-5xl font-bold text-foreground">
              Seu universo financeiro organizado
            </h3>
            <p className="text-xl text-foreground/70 leading-relaxed">
              O <strong>Cofre</strong> é o coração do Caixinhas. Você tem seu
              espaço pessoal privado e pode criar cofres compartilhados com seu
              parceiro(a) para organizar finanças conjuntas.
            </p>
            <ul className="space-y-4">
              {[
                "Cofre pessoal totalmente privado",
                "Cofres compartilhados com visibilidade total",
                "Adicione contas bancárias e cartões",
                "Alterne facilmente entre espaços",
              ].map((item, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 hover:translate-x-2 transition-transform"
                >
                  <Check className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                  <span className="text-lg text-foreground/80">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div
            className={`relative transition-all duration-700 delay-200 ${
              isVisible["feature-1"]
                ? "opacity-100 translate-x-0"
                : "opacity-0 translate-x-12"
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 rounded-3xl blur-2xl animate-pulse-slow" />
            <div className="relative z-10 group">
              <Image
                src="/screenshots/workspace-selection.png"
                alt="Seleção de Espaços de Trabalho"
                width={400}
                height={800}
                data-ai-hint="app workspace"
                className="relative z-10 mx-auto drop-shadow-2xl rounded-2xl group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>
        </div>

        {/* Recurso 2: As Caixinhas */}
        <div
          className="grid lg:grid-cols-2 gap-12 items-center mb-24"
          data-animate="feature-2"
        >
          <div
            className={`relative order-2 lg:order-1 transition-all duration-700 ${
              isVisible["feature-2"]
                ? "opacity-100 -translate-x-0"
                : "opacity-0 -translate-x-12"
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-primary/10 rounded-3xl blur-2xl animate-pulse-slow" />
            <div className="relative z-10 group">
              <Image
                src="/screenshots/all-boxes-view.png"
                alt="Visualização de Todas as Caixinhas"
                width={400}
                height={800}
                data-ai-hint="app goals"
                className="relative z-10 drop-shadow-2xl rounded-2xl group-hover:scale-105 transition-transform duration-500 mx-[-2px] my-[-2px] px-[-2px] py-[-2px]"
              />
            </div>
          </div>
          <div
            className={`space-y-6 order-1 lg:order-2 transition-all duration-700 delay-200 ${
              isVisible["feature-2"]
                ? "opacity-100 translate-x-0"
                : "opacity-0 translate-x-12"
            }`}
          >
            <div className="inline-flex items-center gap-2 bg-accent/10 rounded-full px-4 py-2 hover:bg-accent/20 transition-colors">
              <PiggyBank className="w-5 h-5 text-accent" />
              <span className="text-accent font-bold">As Caixinhas</span>
            </div>
            <h3 className="text-4xl md:text-5xl font-bold text-foreground">
              Onde seus sonhos ganham vida
            </h3>
            <p className="text-xl text-foreground/70 leading-relaxed">
              A <strong>Caixinha</strong> é a representação visual de um
              objetivo. Dê nome, escolha um ícone, defina a meta e acompanhe o
              progresso em tempo real.
            </p>
            <ul className="space-y-4">
              {[
                "Crie caixinhas para cada sonho do casal",
                "Veja a barra de progresso avançar",
                "Caixinhas compartilhadas ou privadas",
                "Contribua e celebre cada conquista",
              ].map((item, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 hover:translate-x-2 transition-transform"
                >
                  <Check className="w-6 h-6 text-accent mt-1 flex-shrink-0" />
                  <span className="text-lg text-foreground/80">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Recurso 3: Resumo do Patrimônio */}
        <div
          className="grid lg:grid-cols-2 gap-12 items-center mb-24"
          data-animate="feature-3"
        >
          <div
            className={`space-y-6 transition-all duration-700 ${
              isVisible["feature-3"]
                ? "opacity-100 translate-x-0"
                : "opacity-0 -translate-x-12"
            }`}
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-2 hover:bg-primary/20 transition-colors">
              <BarChart3 className="w-5 h-5 text-primary" />
              <span className="text-primary font-bold">
                Resumo do Patrimônio
              </span>
            </div>
            <h3 className="text-4xl md:text-5xl font-bold text-foreground">
              Veja o quadro completo, sempre
            </h3>
            <p className="text-xl text-foreground/70 leading-relaxed">
              Acompanhe seu patrimônio total, quanto está disponível e quanto
              já foi investido nos seus sonhos. Tudo em uma visualização clara
              e encorajadora.
            </p>
            <ul className="space-y-4">
              {[
                "Patrimônio total atualizado em tempo real",
                "Saldo líquido e investimentos separados",
                "Transações recentes organizadas",
                "Filtros e categorização inteligente",
              ].map((item, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 hover:translate-x-2 transition-transform"
                >
                  <Check className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                  <span className="text-lg text-foreground/80">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div
            className={`relative transition-all duration-700 delay-200 ${
              isVisible["feature-3"]
                ? "opacity-100 translate-x-0"
                : "opacity-0 translate-x-12"
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 rounded-3xl blur-2xl animate-pulse-slow" />
            <div className="relative z-10 group">
              <Image
                src="/screenshots/personal-dashboard.png"
                alt="Painel com Resumo do Patrimônio"
                width={400}
                height={800}
                data-ai-hint="app dashboard"
                className="relative z-10 mx-auto drop-shadow-2xl rounded-2xl group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>
        </div>

        {/* Recurso 4: Acompanhamento de Progresso */}
        <div
          className="grid lg:grid-cols-2 gap-12 items-center"
          data-animate="feature-4"
        >
          <div
            className={`relative order-2 lg:order-1 transition-all duration-700 ${
              isVisible["feature-4"]
                ? "opacity-100 -translate-x-0"
                : "opacity-0 -translate-x-12"
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-primary/10 rounded-3xl blur-2xl animate-pulse-slow" />
            <div className="relative z-10 group">
              <Image
                src="/screenshots/savings-box-detail.png"
                alt="Detalhes da Caixinha com Progresso"
                width={400}
                height={800}
                data-ai-hint="app goal"
                className="relative z-10 mx-auto drop-shadow-2xl rounded-2xl group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>
          <div
            className={`space-y-6 order-1 lg:order-2 transition-all duration-700 delay-200 ${
              isVisible["feature-4"]
                ? "opacity-100 translate-x-0"
                : "opacity-0 translate-x-12"
            }`}
          >
            <div className="inline-flex items-center gap-2 bg-accent/10 rounded-full px-4 py-2 hover:bg-accent/20 transition-colors">
              <TrendingUp className="w-5 h-5 text-accent" />
              <span className="text-accent font-bold">Progresso Visual</span>
            </div>
            <h3 className="text-4xl md:text-5xl font-bold text-foreground">
              Celebre cada passo da jornada
            </h3>
            <p className="text-xl text-foreground/70 leading-relaxed">
              Ver a barra de progresso da "Viagem com Amigos" enchendo é muito
              mais poderoso do que apenas ver um número na conta. Acompanhe o
              histórico de cada contribuição.
            </p>
            <ul className="space-y-4">
              {[
                "Barra de progresso visual e motivadora",
                "Histórico completo de atividades",
                "Veja quem contribuiu e quando",
                "Compartilhe conquistas com parceiros",
              ].map((item, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 hover:translate-x-2 transition-transform"
                >
                  <Check className="w-6 h-6 text-accent mt-1 flex-shrink-0" />
                  <span className="text-lg text-foreground/80">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
