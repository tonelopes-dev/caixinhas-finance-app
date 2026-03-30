"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  Wallet,
  PiggyBank,
  BarChart3,
  TrendingUp,
  ChevronRight,
} from "lucide-react";
import { Logo } from "../logo";
import { Button } from "@/components/ui/button";
import { config } from "@/lib/config";
import { LazyVideo } from "./lazy-video";

type FeaturesSectionProps = {
  isVisible: { [key: string]: boolean };
};

export function FeaturesSection({ isVisible }: FeaturesSectionProps) {
  return (
    <section
      id="recursos"
      className="py-24 px-4 relative overflow-hidden bg-[#fdfcf7]"
    >
      {/* Background Criativo - Sophisticated Premium / Dashboard Grid */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Orbes de Brilho - Cores da Marca (Suaves) */}
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] animation-delay-3000" />
        <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[80px]" />

        {/* Grid de Dashboard Dourado Sutil */}
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: `
              linear-gradient(to right, #D4A15E 1px, transparent 1px),
              linear-gradient(to bottom, #D4A15E 1px, transparent 1px)
            `,
            backgroundSize: "80px 80px",
          }}
        />
      </div>

      <div className="container mx-auto relative z-10">
        <div
          className="text-center mb-24 space-y-4"
          data-animate="features-header"
        >
          <h2
            className={`text-4xl md:text-6xl font-bold text-stone-900 text-balance transition-all duration-700 delay-100 ${
              isVisible["features-header"]
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            Como o Caixinhas funciona?
          </h2>
          <p
            className={`text-xl text-stone-600 max-w-2xl mx-auto text-pretty transition-all duration-700 delay-200 ${
              isVisible["features-header"]
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            Conheça os conceitos simples e poderosos que tornam o Caixinhas
            único e transformam sua relação com o dinheiro.
          </p>
        </div>

        {/* Recurso 1: O Cofre */}
        <div
          className="grid lg:grid-cols-2 gap-16 items-center mb-32"
          data-animate="feature-1"
        >
          <div
            className={`space-y-8 transition-all duration-700 ${
              isVisible["feature-1"]
                ? "opacity-100 translate-x-0"
                : "opacity-0 -translate-x-12"
            }`}
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 rounded-xl px-4 py-2 border border-primary/20">
              <Wallet className="w-5 h-5 text-primary" />
              <span className="text-primary font-bold uppercase tracking-wide text-sm">
                O Cofre
              </span>
            </div>
            <h3 className="text-4xl md:text-5xl font-bold text-stone-900 leading-tight">
              O seu espaço financeiro{" "}
              <span className="text-primary">inteligente</span>
            </h3>
            <p className="text-xl text-stone-600 leading-relaxed">
              Seu ambiente privado para organizar todas as suas contas e
              cartões. Compartilhe apenas as <strong>Caixinhas</strong> que
              quiser, com quem quiser — sem abrir mão da sua privacidade.
            </p>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                "Cofre pessoal privado",
                "Metas compartilhadas",
                "Contas e cartões",
                "Fácil alternância",
              ].map((item, i) => (
                <li
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white border border-stone-200 hover:border-primary/50 transition-all group shadow-sm"
                >
                  <Check className="w-5 h-5 text-primary flex-shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="text-stone-700 font-medium">{item}</span>
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
            <div className="absolute inset-0 bg-primary/10 rounded-3xl blur-[80px] opacity-40" />
            <div className="relative z-10 mx-auto w-full max-w-[320px] sm:max-w-[340px] group bg-white/60 p-3 sm:p-4 rounded-3xl border border-white shadow-xl backdrop-blur-md overflow-hidden">
              <LazyVideo
                src="/landing/videos/caixinhas-cofres-video-landing-lage/caixinhas-cofres-video-landing-lage-480px.mp4"
                poster="/landing/videos/caixinhas-cofres-video-landing-lage/caixinhas-cofres-video-landing-lage-480px.webp"
                alt="Seleção de Espaços de Trabalho"
                className="relative z-10 mx-auto aspect-[400/800] w-full drop-shadow-2xl rounded-2xl group-hover:scale-[1.02] transition-transform duration-500 bg-transparent"
              />
            </div>
          </div>
        </div>

        {/* Recurso 2: As Caixinhas */}
        <div
          className="grid lg:grid-cols-2 gap-16 items-center mb-32"
          data-animate="feature-2"
        >
          <div
            className={`relative order-2 lg:order-1 transition-all duration-700 ${
              isVisible["feature-2"]
                ? "opacity-100 -translate-x-0"
                : "opacity-0 -translate-x-12"
            }`}
          >
            <div className="absolute inset-0 bg-accent/10 rounded-3xl blur-[80px] opacity-40" />
            <div className="relative z-10 mx-auto w-full max-w-[320px] sm:max-w-[340px] group bg-white/60 p-3 sm:p-4 rounded-3xl border border-white shadow-xl backdrop-blur-md overflow-hidden">
              <LazyVideo
                src="/landing/videos/lista-de-caixinhas-landing-page/lista-caixinhas-landing-page.mp4"
                poster="/landing/videos/lista-de-caixinhas-landing-page/lista-caixinhas-landing-page.webp"
                alt="Visualização de Todas as Caixinhas"
                className="relative z-10 mx-auto aspect-[400/800] w-full drop-shadow-2xl rounded-2xl group-hover:scale-[1.02] transition-transform duration-500 bg-transparent"
              />
            </div>
          </div>
          <div
            className={`space-y-8 order-1 lg:order-2 transition-all duration-700 delay-200 ${
              isVisible["feature-2"]
                ? "opacity-100 translate-x-0"
                : "opacity-0 translate-x-12"
            }`}
          >
            <div className="inline-flex items-center gap-2 bg-accent/10 rounded-xl px-4 py-2 border border-accent/20">
              <Logo w={24} h={24} />
              <span className="text-accent font-bold uppercase tracking-wide text-sm">
                As Caixinhas
              </span>
            </div>
            <h3 className="text-4xl md:text-5xl font-bold text-stone-900 leading-tight">
              Seus sonhos no <span className="text-accent">centro</span> de tudo
            </h3>
            <p className="text-xl text-stone-600 leading-relaxed">
              A <strong>Caixinha</strong> é a representação visual de um
              objetivo. Dê nome, escolha um ícone, defina a meta e acompanhe o
              progresso em tempo real.
            </p>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                "Metas personalizadas",
                "Progresso visual",
                "Caixinhas em grupo",
                "Foco no objetivo",
              ].map((item, i) => (
                <li
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white border border-stone-200 hover:border-accent/50 transition-all group shadow-sm"
                >
                  <Check className="w-5 h-5 text-accent flex-shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="text-stone-700 font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Recurso 3: Resumo do Patrimônio */}
        <div
          className="grid lg:grid-cols-2 gap-16 items-center mb-32"
          data-animate="feature-3"
        >
          <div
            className={`space-y-8 transition-all duration-700 ${
              isVisible["feature-3"]
                ? "opacity-100 translate-x-0"
                : "opacity-0 -translate-x-12"
            }`}
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 rounded-xl px-4 py-2 border border-primary/20">
              <BarChart3 className="w-5 h-5 text-primary" />
              <span className="text-primary font-bold uppercase tracking-wide text-sm">
                Patrimônio
              </span>
            </div>
            <h3 className="text-4xl md:text-5xl font-bold text-stone-900 leading-tight">
              Veja o quadro completo com{" "}
              <span className="text-primary">clareza</span>
            </h3>
            <p className="text-xl text-stone-600 leading-relaxed">
              Acompanhe seu patrimônio total, quanto está disponível e quanto já
              foi investido nos seus sonhos. Tudo em uma visualização clara e
              encorajadora.
            </p>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                "Saldo em tempo real",
                "Líquido vs Investido",
                "Histórico inteligente",
                "Filtros avançados",
              ].map((item, i) => (
                <li
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white border border-stone-200 hover:border-primary/50 transition-all group shadow-sm"
                >
                  <Check className="w-5 h-5 text-primary flex-shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="text-stone-700 font-medium">{item}</span>
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
            <div className="absolute inset-0 bg-primary/10 rounded-3xl blur-[80px] opacity-40" />
            <div className="relative z-10 mx-auto w-full max-w-[320px] sm:max-w-[340px] group bg-white/60 p-3 sm:p-4 rounded-3xl border border-white shadow-xl backdrop-blur-md overflow-hidden">
              <LazyVideo
                src="/landing/videos/dashboard-caixinhas-landing-page/dashboard-caixinhas-landing-page.mp4"
                poster="/landing/videos/dashboard-caixinhas-landing-page/dashboard-caixinhas-landing-page.webp"
                alt="Painel com Resumo do Patrimônio"
                className="relative z-10 mx-auto aspect-[400/800] w-full drop-shadow-2xl rounded-2xl group-hover:scale-[1.02] transition-transform duration-500 bg-transparent"
              />
            </div>
          </div>
        </div>

        {/* Recurso 4: Acompanhamento de Progresso */}
        <div
          className="grid lg:grid-cols-2 gap-16 items-center"
          data-animate="feature-4"
        >
          <div
            className={`relative order-2 lg:order-1 transition-all duration-700 ${
              isVisible["feature-4"]
                ? "opacity-100 -translate-x-0"
                : "opacity-0 -translate-x-12"
            }`}
          >
            <div className="absolute inset-0 bg-accent/10 rounded-3xl blur-[80px] opacity-40" />
            <div className="relative z-10 mx-auto w-full max-w-[320px] sm:max-w-[340px] group bg-white/60 p-3 sm:p-4 rounded-3xl border border-white shadow-xl backdrop-blur-md overflow-hidden">
              <LazyVideo
                src="/landing/videos/detalhes-caixinhas-landing-page/detalhes-caixinhas-landing-page.mp4"
                poster="/landing/videos/detalhes-caixinhas-landing-page/detalhes-caixinhas-landing-page.webp"
                alt="Detalhes da Caixinha com Progresso"
                className="relative z-10 mx-auto aspect-[400/800] w-full drop-shadow-2xl rounded-2xl group-hover:scale-[1.02] transition-transform duration-500 bg-transparent"
              />
            </div>
          </div>
          <div
            className={`space-y-8 order-1 lg:order-2 transition-all duration-700 delay-200 ${
              isVisible["feature-4"]
                ? "opacity-100 translate-x-0"
                : "opacity-0 translate-x-12"
            }`}
          >
            <div className="inline-flex items-center gap-2 bg-accent/10 rounded-xl px-4 py-2 border border-accent/20">
              <TrendingUp className="w-5 h-5 text-accent" />
              <span className="text-accent font-bold uppercase tracking-wide text-sm">
                Privacidade & União
              </span>
            </div>
            <h3 className="text-4xl md:text-5xl font-bold text-stone-900 leading-tight">
              Independência e <span className="text-accent">Colaboração</span>
            </h3>
            <p className="text-xl text-stone-600 leading-relaxed">
              Gerencie sua vida financeira só ou convide quem você ama para
              colaborar em metas em comum, sem perder a sua privacidade.
            </p>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                "Histórico detalhado",
                "Gestão de acessos",
                "Conquistas em equipe",
                "Feedback motivador",
              ].map((item, i) => (
                <li
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white border border-stone-200 hover:border-accent/50 transition-all group shadow-sm"
                >
                  <Check className="w-5 h-5 text-accent flex-shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="text-stone-700 font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* CTA Final da Seção */}
        <div
          className={`mt-24 flex justify-center transition-all duration-1000 delay-300 ${
            isVisible["feature-4"]
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-12"
          }`}
        >
          <Button
            asChild
            className="h-16 px-12 text-xl font-bold bg-gradient-to-r from-primary to-accent text-white shadow-2xl shadow-primary/20 hover:scale-110 transition-all border-none rounded-2xl"
          >
            <a
              href={config.checkoutUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center no-underline"
            >
              Criar meu Cofre agora <ChevronRight className="ml-2 h-6 w-6" />
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
