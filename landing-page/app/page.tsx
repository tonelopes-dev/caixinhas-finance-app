"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import {
  Heart,
  Target,
  PiggyBank,
  TrendingUp,
  Users,
  Shield,
  Sparkles,
  ChevronRight,
  Check,
  Wallet,
  BarChart3,
  Lock,
  Zap,
  Star,
  ArrowRight,
  Menu,
  X,
} from "lucide-react"
import { useEffect, useState } from "react"

export default function LandingPage() {
  const [scrollY, setScrollY] = useState(0)
  const [isVisible, setIsVisible] = useState<{ [key: string]: boolean }>({})
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false) // Added mobile menu state

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)

      // Check which elements are in viewport
      const elements = document.querySelectorAll("[data-animate]")
      elements.forEach((el) => {
        const rect = el.getBoundingClientRect()
        const id = el.getAttribute("data-animate") || ""
        if (rect.top < window.innerHeight * 0.8) {
          setIsVisible((prev) => ({ ...prev, [id]: true }))
        }
      })
    }

    window.addEventListener("scroll", handleScroll)
    handleScroll() // Initial check
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleNavClick = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border transition-all duration-300">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 group cursor-pointer">
            <Image
              src="/logo-caixinhas.png"
              alt="Caixinhas Logo"
              width={40}
              height={40}
              className="w-10 h-10 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6"
            />
            <span className="text-xl md:text-2xl font-bold text-foreground">Caixinhas</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a
              href="#recursos"
              className="text-foreground/70 hover:text-foreground transition-colors text-lg relative group"
            >
              Recursos
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
            </a>
            <a
              href="#como-funciona"
              className="text-foreground/70 hover:text-foreground transition-colors text-lg relative group"
            >
              Como Funciona
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
            </a>
            <a
              href="#historia"
              className="text-foreground/70 hover:text-foreground transition-colors text-lg relative group"
            >
              História
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
            </a>
            <a
              href="#planos"
              className="text-foreground/70 hover:text-foreground transition-colors text-lg relative group"
            >
              Planos
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
            </a>
          </nav>

          {/* Desktop CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" className="text-foreground text-lg hover:bg-primary/10 transition-all">
              Entrar
            </Button>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg font-semibold hover:scale-105 transition-transform relative overflow-hidden group">
              <span className="relative z-10">Assinar Agora</span>
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 hover:bg-primary/10 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-foreground" />
            ) : (
              <Menu className="w-6 h-6 text-foreground" />
            )}
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        <div
          className={`md:hidden absolute top-16 left-0 right-0 bg-background/95 backdrop-blur-lg border-b border-border transition-all duration-300 ease-in-out ${
            isMobileMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"
          }`}
        >
          <nav className="container mx-auto px-4 py-6 flex flex-col space-y-4">
            <a
              href="#recursos"
              onClick={handleNavClick}
              className="text-foreground/70 hover:text-primary transition-colors text-lg py-2 border-b border-border/50"
            >
              Recursos
            </a>
            <a
              href="#como-funciona"
              onClick={handleNavClick}
              className="text-foreground/70 hover:text-primary transition-colors text-lg py-2 border-b border-border/50"
            >
              Como Funciona
            </a>
            <a
              href="#historia"
              onClick={handleNavClick}
              className="text-foreground/70 hover:text-primary transition-colors text-lg py-2 border-b border-border/50"
            >
              História
            </a>
            <a
              href="#planos"
              onClick={handleNavClick}
              className="text-foreground/70 hover:text-primary transition-colors text-lg py-2 border-b border-border/50"
            >
              Planos
            </a>
            <div className="flex flex-col gap-3 pt-4">
              <Button variant="ghost" className="text-foreground text-lg hover:bg-primary/10 transition-all w-full">
                Entrar
              </Button>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg font-semibold w-full">
                Assinar Agora
              </Button>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 animate-gradient-slow" />

        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-primary/20 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${5 + Math.random() * 10}s`,
              }}
            />
          ))}
        </div>

        <div className="container mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-fade-in-up">
              <Badge className="bg-primary/10 text-primary border-primary/20 text-base px-4 py-1.5 animate-fade-in">
                <Sparkles className="w-4 h-4 inline mr-2 animate-pulse" />
                Mais que um app, uma ponte para sonhos
              </Badge>

              <h1 className="text-5xl md:text-7xl font-bold text-foreground leading-tight text-balance animate-fade-in-up animation-delay-100">
                Sonhar juntos é o primeiro{" "}
                <span className="text-primary animate-gradient-text bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto]">
                  passo para conquistar
                </span>
              </h1>

              <p className="text-xl md:text-2xl text-foreground/70 leading-relaxed text-pretty animate-fade-in-up animation-delay-200">
                Caixinhas não é apenas um aplicativo de finanças. É uma ferramenta de comunicação e confiança para
                transformar sonhos individuais em conquistas conjuntas.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up animation-delay-300">
                <Button
                  size="lg"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 text-xl h-14 px-8 hover:scale-105 transition-all relative overflow-hidden group"
                >
                  <span className="relative z-10 flex items-center">
                    Começar Agora
                    <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-xl h-14 px-8 border-2 bg-transparent hover:bg-primary/5 hover:border-primary transition-all hover:scale-105"
                >
                  Ver Como Funciona
                </Button>
              </div>

              <div className="flex items-center gap-8 pt-4 animate-fade-in-up animation-delay-400">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent border-4 border-background hover:scale-110 transition-transform cursor-pointer"
                      style={{ animationDelay: `${i * 0.1}s` }}
                    />
                  ))}
                </div>
                <div>
                  <p className="text-lg font-semibold text-foreground">+10.000 casais</p>
                  <p className="text-sm text-foreground/60">realizando sonhos juntos</p>
                </div>
              </div>
            </div>

            <div className="relative animate-fade-in-up animation-delay-200">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-[3rem] blur-3xl animate-pulse-slow" />
              <div
                className="relative z-10 transform hover:scale-105 transition-all duration-700 hover:rotate-2"
                style={{ transform: `translateY(${scrollY * 0.1}px)` }}
              >
                <Image
                  src="/screenshots/main-dashboard.png"
                  alt="Dashboard Principal do Caixinhas"
                  width={600}
                  height={1200}
                  className="relative z-10 w-full drop-shadow-2xl rounded-[2rem]"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-card/50">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center space-y-6 mb-16" data-animate="problem">
            <Badge
              className={`bg-destructive/10 text-destructive border-destructive/20 text-base px-4 py-1.5 transition-all duration-700 ${isVisible.problem ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            >
              O Problema
            </Badge>
            <h2
              className={`text-4xl md:text-5xl font-bold text-foreground text-balance transition-all duration-700 delay-100 ${isVisible.problem ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            >
              O dinheiro não deveria ser um tabu entre casais
            </h2>
            <div className="grid md:grid-cols-3 gap-6 pt-8">
              {[
                { emoji: "😰", text: "Não sei como falar sobre dinheiro com meu parceiro(a)" },
                { emoji: "🤔", text: "Misturamos tudo e não sabemos para onde o dinheiro foi" },
                { emoji: "😔", text: "Nossos sonhos parecem distantes e impossíveis" },
              ].map((problem, i) => (
                <Card
                  key={i}
                  className={`border-2 border-destructive/20 hover:border-destructive/40 hover:scale-105 transition-all duration-500 cursor-pointer ${isVisible.problem ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                  style={{ transitionDelay: `${200 + i * 100}ms` }}
                >
                  <CardContent className="p-6 space-y-3">
                    <div className="text-4xl animate-bounce-slow">{problem.emoji}</div>
                    <p className="text-lg text-foreground/80 font-medium">{problem.text}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="max-w-4xl mx-auto text-center space-y-6" data-animate="solution">
            <Badge
              className={`bg-primary/10 text-primary border-primary/20 text-base px-4 py-1.5 transition-all duration-700 ${isVisible.solution ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            >
              A Solução
            </Badge>
            <h2
              className={`text-4xl md:text-5xl font-bold text-foreground text-balance transition-all duration-700 delay-100 ${isVisible.solution ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            >
              Transforme conversas difíceis em <span className="text-primary">celebrações conjuntas</span>
            </h2>
            <p
              className={`text-xl text-foreground/70 leading-relaxed text-pretty max-w-3xl mx-auto transition-all duration-700 delay-200 ${isVisible.solution ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            >
              O Caixinhas é um terreno neutro onde registrar uma despesa ou contribuir para um sonho se torna um ato de
              parceria, não de julgamento.
            </p>
          </div>
        </div>
      </section>

      <section id="recursos" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16 space-y-4" data-animate="features-header">
            <Badge
              className={`bg-primary/10 text-primary border-primary/20 text-base px-4 py-1.5 transition-all duration-700 ${isVisible["features-header"] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            >
              Recursos Poderosos
            </Badge>
            <h2
              className={`text-4xl md:text-6xl font-bold text-foreground text-balance transition-all duration-700 delay-100 ${isVisible["features-header"] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            >
              Como o Caixinhas funciona?
            </h2>
            <p
              className={`text-xl text-foreground/70 max-w-2xl mx-auto text-pretty transition-all duration-700 delay-200 ${isVisible["features-header"] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            >
              Conheça os conceitos simples e poderosos que tornam o Caixinhas único
            </p>
          </div>

          {/* Recurso 1: O Cofre */}
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-24" data-animate="feature-1">
            <div
              className={`space-y-6 transition-all duration-700 ${isVisible["feature-1"] ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-12"}`}
            >
              <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-2 hover:bg-primary/20 transition-colors">
                <Wallet className="w-5 h-5 text-primary" />
                <span className="text-primary font-bold">O Cofre</span>
              </div>
              <h3 className="text-4xl md:text-5xl font-bold text-foreground">Seu universo financeiro organizado</h3>
              <p className="text-xl text-foreground/70 leading-relaxed">
                O <strong>Cofre</strong> é o coração do Caixinhas. Você tem seu espaço pessoal privado e pode criar
                cofres compartilhados com seu parceiro(a) para organizar finanças conjuntas.
              </p>
              <ul className="space-y-4">
                {[
                  "Cofre pessoal totalmente privado",
                  "Cofres compartilhados com visibilidade total",
                  "Adicione contas bancárias e cartões",
                  "Alterne facilmente entre espaços",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 hover:translate-x-2 transition-transform">
                    <Check className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                    <span className="text-lg text-foreground/80">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div
              className={`relative transition-all duration-700 delay-200 ${isVisible["feature-1"] ? "opacity-100 translate-x-0" : "opacity-0 translate-x-12"}`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 rounded-3xl blur-2xl animate-pulse-slow" />
              <div className="relative z-10 group">
                <Image
                  src="/screenshots/workspace-selection.png"
                  alt="Seleção de Espaços de Trabalho"
                  width={400}
                  height={800}
                  className="relative z-10 mx-auto drop-shadow-2xl rounded-2xl group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
          </div>

          {/* Recurso 2: As Caixinhas */}
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-24" data-animate="feature-2">
            <div
              className={`relative order-2 lg:order-1 transition-all duration-700 ${isVisible["feature-2"] ? "opacity-100 -translate-x-0" : "opacity-0 -translate-x-12"}`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-primary/10 rounded-3xl blur-2xl animate-pulse-slow" />
              <div className="relative z-10 group">
                <Image
                  src="/screenshots/all-boxes-view.png"
                  alt="Visualização de Todas as Caixinhas"
                  width={400}
                  height={800}
                  className="relative z-10 drop-shadow-2xl rounded-2xl group-hover:scale-105 transition-transform duration-500 mx-[-2px] my-[-2px] px-[-2px] py-[-2px]"
                />
              </div>
            </div>
            <div
              className={`space-y-6 order-1 lg:order-2 transition-all duration-700 delay-200 ${isVisible["feature-2"] ? "opacity-100 translate-x-0" : "opacity-0 translate-x-12"}`}
            >
              <div className="inline-flex items-center gap-2 bg-accent/10 rounded-full px-4 py-2 hover:bg-accent/20 transition-colors">
                <PiggyBank className="w-5 h-5 text-accent" />
                <span className="text-accent font-bold">As Caixinhas</span>
              </div>
              <h3 className="text-4xl md:text-5xl font-bold text-foreground">Onde seus sonhos ganham vida</h3>
              <p className="text-xl text-foreground/70 leading-relaxed">
                A <strong>Caixinha</strong> é a representação visual de um objetivo. Dê nome, escolha um ícone, defina a
                meta e acompanhe o progresso em tempo real.
              </p>
              <ul className="space-y-4">
                {[
                  "Crie caixinhas para cada sonho do casal",
                  "Veja a barra de progresso avançar",
                  "Caixinhas compartilhadas ou privadas",
                  "Contribua e celebre cada conquista",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 hover:translate-x-2 transition-transform">
                    <Check className="w-6 h-6 text-accent mt-1 flex-shrink-0" />
                    <span className="text-lg text-foreground/80">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Recurso 3: Resumo do Patrimônio */}
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-24" data-animate="feature-3">
            <div
              className={`space-y-6 transition-all duration-700 ${isVisible["feature-3"] ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-12"}`}
            >
              <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-2 hover:bg-primary/20 transition-colors">
                <BarChart3 className="w-5 h-5 text-primary" />
                <span className="text-primary font-bold">Resumo do Patrimônio</span>
              </div>
              <h3 className="text-4xl md:text-5xl font-bold text-foreground">Veja o quadro completo, sempre</h3>
              <p className="text-xl text-foreground/70 leading-relaxed">
                Acompanhe seu patrimônio total, quanto está disponível e quanto já foi investido nos seus sonhos. Tudo
                em uma visualização clara e encorajadora.
              </p>
              <ul className="space-y-4">
                {[
                  "Patrimônio total atualizado em tempo real",
                  "Saldo líquido e investimentos separados",
                  "Transações recentes organizadas",
                  "Filtros e categorização inteligente",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 hover:translate-x-2 transition-transform">
                    <Check className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                    <span className="text-lg text-foreground/80">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div
              className={`relative transition-all duration-700 delay-200 ${isVisible["feature-3"] ? "opacity-100 translate-x-0" : "opacity-0 translate-x-12"}`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 rounded-3xl blur-2xl animate-pulse-slow" />
              <div className="relative z-10 group">
                <Image
                  src="/screenshots/personal-dashboard.png"
                  alt="Painel com Resumo do Patrimônio"
                  width={400}
                  height={800}
                  className="relative z-10 mx-auto drop-shadow-2xl rounded-2xl group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
          </div>

          {/* Recurso 4: Acompanhamento de Progresso */}
          <div className="grid lg:grid-cols-2 gap-12 items-center" data-animate="feature-4">
            <div
              className={`relative order-2 lg:order-1 transition-all duration-700 ${isVisible["feature-4"] ? "opacity-100 -translate-x-0" : "opacity-0 -translate-x-12"}`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-primary/10 rounded-3xl blur-2xl animate-pulse-slow" />
              <div className="relative z-10 group">
                <Image
                  src="/screenshots/savings-box-detail.png"
                  alt="Detalhes da Caixinha com Progresso"
                  width={400}
                  height={800}
                  className="relative z-10 mx-auto drop-shadow-2xl rounded-2xl group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
            <div
              className={`space-y-6 order-1 lg:order-2 transition-all duration-700 delay-200 ${isVisible["feature-4"] ? "opacity-100 translate-x-0" : "opacity-0 translate-x-12"}`}
            >
              <div className="inline-flex items-center gap-2 bg-accent/10 rounded-full px-4 py-2 hover:bg-accent/20 transition-colors">
                <TrendingUp className="w-5 h-5 text-accent" />
                <span className="text-accent font-bold">Progresso Visual</span>
              </div>
              <h3 className="text-4xl md:text-5xl font-bold text-foreground">Celebre cada passo da jornada</h3>
              <p className="text-xl text-foreground/70 leading-relaxed">
                Ver a barra de progresso da "Viagem com Amigos" enchendo é muito mais poderoso do que apenas ver um
                número na conta. Acompanhe o histórico de cada contribuição.
              </p>
              <ul className="space-y-4">
                {[
                  "Barra de progresso visual e motivadora",
                  "Histórico completo de atividades",
                  "Veja quem contribuiu e quando",
                  "Compartilhe conquistas com parceiros",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 hover:translate-x-2 transition-transform">
                    <Check className="w-6 h-6 text-accent mt-1 flex-shrink-0" />
                    <span className="text-lg text-foreground/80">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-primary rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${8 + Math.random() * 7}s`,
              }}
            />
          ))}
        </div>

        <div className="container mx-auto relative z-10">
          <div className="text-center mb-16 space-y-4" data-animate="pwa-header">
            <Badge
              className={`bg-primary/10 text-primary border-primary/20 text-base px-4 py-1.5 transition-all duration-700 ${isVisible["pwa-header"] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            >
              <Zap className="w-4 h-4 inline mr-2" />
              Tecnologia Progressiva
            </Badge>
            <h2
              className={`text-4xl md:text-6xl font-bold text-foreground text-balance transition-all duration-700 delay-100 ${isVisible["pwa-header"] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            >
              Acesse de <span className="text-primary">qualquer lugar</span>, em qualquer dispositivo
            </h2>
            <p
              className={`text-xl text-foreground/70 max-w-3xl mx-auto text-pretty transition-all duration-700 delay-200 ${isVisible["pwa-header"] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            >
              O Caixinhas é um PWA (Progressive Web App). Isso significa que você não precisa baixar nada de lojas de
              aplicativos. Basta acessar e instalar diretamente no seu dispositivo.
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            {/* Key Benefits Cards */}
            <div className="grid md:grid-cols-3 gap-6 mb-16">
              {[
                {
                  icon: "💻",
                  title: "Sem Downloads",
                  description: "Não precisa procurar na App Store ou Google Play. Acesse direto pelo navegador.",
                },
                {
                  icon: "⚡",
                  title: "Instalação Instantânea",
                  description: "Um clique e pronto! Aparece na tela inicial como um app nativo.",
                },
                {
                  icon: "🔄",
                  title: "Sempre Atualizado",
                  description: "Sem precisar atualizar manualmente. Sempre a versão mais recente.",
                },
              ].map((benefit, i) => (
                <Card
                  key={i}
                  className="border-2 hover:border-primary transition-all duration-300 hover:shadow-xl hover:-translate-y-2 group cursor-pointer bg-background/80 backdrop-blur-sm"
                  data-animate={`pwa-benefit-${i}`}
                >
                  <CardContent
                    className={`p-6 space-y-3 text-center transition-all duration-700 ${isVisible[`pwa-benefit-${i}`] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                    style={{ transitionDelay: `${i * 100}ms` }}
                  >
                    <div className="text-5xl mb-2 group-hover:scale-125 transition-transform duration-300">
                      {benefit.icon}
                    </div>
                    <h3 className="text-xl font-bold text-foreground">{benefit.title}</h3>
                    <p className="text-foreground/70 leading-relaxed">{benefit.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Platform Support */}
            <Card
              className="border-2 border-primary/30 shadow-xl overflow-hidden bg-background/80 backdrop-blur-sm"
              data-animate="pwa-platforms"
            >
              <CardContent
                className={`p-8 md:p-12 transition-all duration-700 ${isVisible["pwa-platforms"] ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
              >
                <div className="text-center mb-8">
                  <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
                    Funciona em todas as plataformas
                  </h3>
                  <p className="text-lg text-foreground/70">
                    Desktop, notebook, celular, tablet... o Caixinhas se adapta perfeitamente a qualquer tela
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                  {[
                    { name: "Windows", icon: "🪟" },
                    { name: "macOS", icon: "🍎" },
                    { name: "Android", icon: "🤖" },
                    { name: "iOS", icon: "📱" },
                  ].map((platform, i) => (
                    <div
                      key={i}
                      className="flex flex-col items-center gap-3 p-6 rounded-xl bg-primary/5 hover:bg-primary/10 transition-all hover:scale-110 cursor-pointer group"
                      data-animate={`platform-${i}`}
                    >
                      <div
                        className={`text-6xl group-hover:scale-125 transition-transform duration-300 ${isVisible[`platform-${i}`] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                        style={{ transitionDelay: `${300 + i * 100}ms` }}
                      >
                        {platform.icon}
                      </div>
                      <span className="text-lg font-semibold text-foreground">{platform.name}</span>
                    </div>
                  ))}
                </div>

                <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-2xl p-6 md:p-8">
                  <h4 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2 justify-center">
                    <Sparkles className="w-6 h-6 text-primary" />
                    Como instalar?
                  </h4>
                  <div className="grid md:grid-cols-3 gap-6">
                    {[
                      {
                        step: "1",
                        title: "Acesse",
                        description: "Entre no Caixinhas pelo navegador do seu dispositivo",
                      },
                      {
                        step: "2",
                        title: "Instale",
                        description: 'Clique no ícone de "Adicionar à tela inicial" ou "Instalar"',
                      },
                      {
                        step: "3",
                        title: "Pronto!",
                        description: "O Caixinhas aparecerá como um app nativo na sua tela",
                      },
                    ].map((step, i) => (
                      <div key={i} className="text-center space-y-2">
                        <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mx-auto mb-3 hover:scale-110 transition-transform">
                          {step.step}
                        </div>
                        <h5 className="font-bold text-foreground text-lg">{step.title}</h5>
                        <p className="text-foreground/70 text-sm leading-relaxed">{step.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm text-foreground/60">
                  {[
                    "✓ Funciona offline após instalação",
                    "✓ Notificações push",
                    "✓ Mesma experiência em todos os dispositivos",
                    "✓ Sincronização automática",
                  ].map((feature, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 bg-background/50 px-4 py-2 rounded-full hover:bg-primary/10 transition-colors"
                    >
                      {feature}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="text-center mt-12">
              <Button
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 text-xl h-14 px-8 hover:scale-105 transition-all relative overflow-hidden group"
              >
                <span className="relative z-10 flex items-center">
                  Experimentar Agora
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              </Button>
              <p className="text-foreground/60 mt-4">Sem cartão de crédito • Sem download • Sem complicação</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-card">
        <div className="container mx-auto">
          <div className="text-center mb-16 space-y-4" data-animate="benefits-header">
            <Badge
              className={`bg-primary/10 text-primary border-primary/20 text-base px-4 py-1.5 transition-all duration-700 ${isVisible["benefits-header"] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            >
              Por Que Caixinhas?
            </Badge>
            <h2
              className={`text-4xl md:text-6xl font-bold text-foreground text-balance transition-all duration-700 delay-100 ${isVisible["benefits-header"] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            >
              Porque o maior ativo é a <span className="text-primary">confiança</span>
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
                description: "Com clareza e foco, o caminho para realizar sonhos se torna mais curto e eficiente.",
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
                  className={`p-8 space-y-4 transition-all duration-700 ${isVisible[`benefit-${index}`] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <div
                    className={`${benefit.color} w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}
                  >
                    <benefit.icon className="w-8 h-8 text-background" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">{benefit.title}</h3>
                  <p className="text-lg text-foreground/70 leading-relaxed">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="como-funciona" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16 space-y-4" data-animate="how-it-works-header">
            <Badge
              className={`bg-primary/10 text-primary border-primary/20 text-base px-4 py-1.5 transition-all duration-700 ${isVisible["how-it-works-header"] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            >
              Processo Simples
            </Badge>
            <h2
              className={`text-4xl md:text-6xl font-bold text-foreground text-balance transition-all duration-700 delay-100 ${isVisible["how-it-works-header"] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
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
              <div key={index} className="flex gap-8 items-start group cursor-pointer" data-animate={`step-${index}`}>
                <div className="flex-shrink-0">
                  <div
                    className={`w-20 h-20 rounded-2xl bg-primary flex items-center justify-center text-3xl font-bold text-primary-foreground group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 ${isVisible[`step-${index}`] ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-12"}`}
                  >
                    {step.step}
                  </div>
                </div>
                <div
                  className={`flex-1 pt-2 transition-all duration-700 delay-100 ${isVisible[`step-${index}`] ? "opacity-100 translate-x-0" : "opacity-0 translate-x-12"}`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <step.icon className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
                    <h3 className="text-3xl font-bold text-foreground group-hover:text-primary transition-colors">
                      {step.title}
                    </h3>
                  </div>
                  <p className="text-xl text-foreground/70 leading-relaxed">{step.description}</p>
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

      <section
        id="historia"
        className="py-20 px-4 bg-gradient-to-br from-primary/5 to-accent/5 relative overflow-hidden"
      >
        <div className="absolute top-20 right-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-float animation-delay-1000" />

        <div className="container mx-auto relative z-10">
          <div className="text-center mb-16 space-y-4" data-animate="story-header">
            <Badge
              className={`bg-primary/10 text-primary border-primary/20 text-base px-4 py-1.5 transition-all duration-700 ${isVisible["story-header"] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            >
              História Real
            </Badge>
            <h2
              className={`text-4xl md:text-6xl font-bold text-foreground text-balance transition-all duration-700 delay-100 ${isVisible["story-header"] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            >
              De conversas difíceis a <span className="text-primary">sonhos realizados</span>
            </h2>
          </div>

          <div className="max-w-5xl mx-auto" data-animate="story-card">
            <Card
              className={`border-2 border-primary/20 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] ${isVisible["story-card"] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}
            >
              <CardContent className="p-8 md:p-12 space-y-8">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8">
                  <div className="flex -space-x-6 shrink-0">
                    <div className="relative group">
                      <Image
                        src="/photos/clara-perfil.png"
                        alt="Clara"
                        width={80}
                        height={80}
                        className="w-20 h-20 rounded-full border-4 border-background shadow-lg group-hover:scale-110 group-hover:-rotate-6 transition-all duration-300"
                      />
                    </div>
                    <div className="relative group">
                      <Image
                        src="/photos/joao-perfil.png"
                        alt="João"
                        width={80}
                        height={80}
                        className="w-20 h-20 rounded-full border-4 border-background shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300"
                      />
                    </div>
                  </div>
                  <div className="text-center md:text-left">
                    <h3 className="text-3xl font-bold text-foreground flex items-center gap-2 justify-center md:justify-start">
                      Clara & João
                      <Heart className="w-6 h-6 text-primary fill-primary animate-pulse" />
                    </h3>
                    <p className="text-lg text-foreground/60 mt-1">Família Ribeiro - Juntos há 7 anos</p>
                    <div className="flex gap-1 mt-2 justify-center md:justify-start">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star
                          key={i}
                          className="w-5 h-5 text-primary fill-primary hover:scale-125 transition-transform"
                          style={{ animationDelay: `${i * 50}ms` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-6 text-lg text-foreground/80 leading-relaxed">
                  <p className="text-xl font-medium text-foreground">
                    Clara e João se amavam, mas o dinheiro estava destruindo esse amor, silenciosamente.
                  </p>

                  <p>
                    Todo final de mês era a mesma angústia. "Onde você gastou tanto?", João perguntava. "E o dinheiro do
                    conserto do carro?", retrucava Clara, sentindo-se controlada e exausta.
                  </p>

                  <p className="font-semibold text-foreground text-xl">
                    Eles não eram maus com dinheiro. Eram apenas um casal sem um mapa.
                  </p>

                  <p>
                    Foi em uma noite, após mais uma discussão que terminou em lágrimas, que Clara descobriu o Caixinhas.
                    "Vamos tentar. Só por um mês", ela propôs, com a voz embargada.
                  </p>

                  <div className="bg-primary/10 border-l-4 border-primary rounded-r-xl overflow-hidden hover:bg-primary/15 transition-colors my-8">
                    <div className="grid md:grid-cols-2 gap-6 items-center">
                      <div className="p-6 md:p-8 space-y-4">
                        <p className="text-foreground italic text-xl leading-relaxed">
                          "A primeira Caixinha que criaram foi tímida: 'Jantar de Aniversário da Clara'. A meta era R$
                          300. Quando a barra de progresso chegou a 100%, algo mágico aconteceu."
                        </p>
                        <p className="text-foreground font-semibold text-lg">
                          Eles não apenas tinham o dinheiro; eles o conquistaram juntos.
                        </p>
                      </div>
                      <div className="relative h-64 md:h-full min-h-[300px]">
                        <Image
                          src="/photos/familia-joao-clara.png"
                          alt="Família Clara e João com filha"
                          fill
                          className="object-cover rounded-r-xl"
                        />
                      </div>
                    </div>
                  </div>

                  <p className="text-xl">
                    Anos se passaram. A 'Caixinha: Entrada da Casa Nova' tem uma marca de 'Concluído!' ao lado. Eles a
                    alcançaram 8 meses antes do previsto. O pequeno Leo agora corre no jardim que eles sonharam.
                  </p>

                  <div className="bg-gradient-to-r from-primary/20 to-accent/20 p-6 md:p-8 rounded-2xl border-2 border-primary/30 hover:scale-[1.02] transition-all">
                    <p className="font-bold text-2xl text-foreground leading-relaxed">
                      "O Caixinhas não salvou nosso dinheiro. Ele salvou a gente. Ele nos lembrou que somos um time."
                    </p>
                    <div className="flex items-center gap-3 mt-4">
                      <Image
                        src="/photos/joao-perfil.png"
                        alt="João"
                        width={48}
                        height={48}
                        className="w-12 h-12 rounded-full border-2 border-primary"
                      />
                      <div>
                        <p className="font-semibold text-foreground">João Ribeiro</p>
                        <p className="text-sm text-foreground/60">Pai e Planejador Financeiro</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 pt-4">
                    <Badge className="bg-primary text-primary-foreground px-4 py-2 text-base hover:scale-110 transition-transform">
                      Casa Própria Conquistada
                    </Badge>
                    <Badge className="bg-accent text-accent-foreground px-4 py-2 text-base hover:scale-110 transition-transform">
                      3 Anos Usando Caixinhas
                    </Badge>
                    <Badge className="bg-primary/20 text-primary px-4 py-2 text-base hover:scale-110 transition-transform">
                      12+ Sonhos Realizados
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="mt-8 grid md:grid-cols-2 gap-6">
              <Card className="border-2 border-accent/20 hover:border-accent hover:scale-105 transition-all duration-300">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <Image
                      src="/photos/clara-perfil.png"
                      alt="Clara"
                      width={56}
                      height={56}
                      className="w-14 h-14 rounded-full border-2 border-accent"
                    />
                    <div>
                      <p className="font-bold text-foreground">Clara Ribeiro</p>
                      <p className="text-sm text-foreground/60">Mãe e Empreendedora</p>
                    </div>
                  </div>
                  <p className="text-foreground/80 leading-relaxed italic">
                    "Antes eu tinha vergonha de falar sobre dinheiro. Hoje, planejar nosso futuro é um dos momentos mais
                    íntimos e especiais do nosso casamento."
                  </p>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="w-4 h-4 text-accent fill-accent" />
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-primary/20 hover:border-primary hover:scale-105 transition-all duration-300">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <Image
                      src="/photos/joao-perfil.png"
                      alt="João"
                      width={56}
                      height={56}
                      className="w-14 h-14 rounded-full border-2 border-primary"
                    />
                    <div>
                      <p className="font-bold text-foreground">João Ribeiro</p>
                      <p className="text-sm text-foreground/60">Pai e Planejador Financeiro</p>
                    </div>
                  </div>
                  <p className="text-foreground/80 leading-relaxed italic">
                    "Ver nossos sonhos tomando forma na tela do celular transformou completamente como enxergamos o
                    dinheiro. Agora, cada real tem um propósito."
                  </p>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="w-4 h-4 text-primary fill-primary" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section id="planos" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16 space-y-4" data-animate="pricing-header">
            <Badge
              className={`bg-primary/10 text-primary border-primary/20 text-base px-4 py-1.5 transition-all duration-700 ${isVisible["pricing-header"] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            >
              Preço Simples
            </Badge>
            <h2
              className={`text-4xl md:text-6xl font-bold text-foreground text-balance transition-all duration-700 delay-100 ${isVisible["pricing-header"] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            >
              Invista no futuro do seu relacionamento
            </h2>
            <p
              className={`text-xl text-foreground/70 max-w-2xl mx-auto transition-all duration-700 delay-200 ${isVisible["pricing-header"] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            >
              Um investimento pequeno para conquistas gigantes. Sem planos confusos, sem taxas escondidas.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="relative pb-6">
              <div className="absolute -top-0 left-1/2 -translate-x-1/2 animate-bounce-slow z-20">
                <Badge className="bg-gradient-to-r from-primary to-accent text-primary-foreground text-base px-6 py-2 shadow-lg">
                  <Star className="w-5 h-5 inline mr-2 fill-current animate-pulse" />
                  Acesso Completo
                </Badge>
              </div>

              <Card
                className="border-4 border-primary relative shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-2 overflow-hidden mt-6"
                data-animate="pricing-annual"
              >
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse-slow" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse-slow animation-delay-1000" />

                <CardContent
                  className={`p-10 md:p-14 space-y-8 relative z-10 transition-all duration-700 ${isVisible["pricing-annual"] ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
                >
                  <div className="text-center space-y-4">
                    <h3 className="text-3xl md:text-4xl font-bold text-foreground">Assinatura Anual Caixinhas</h3>
                    <div className="flex items-center justify-center gap-4 flex-wrap">
                      <div className="flex items-baseline gap-2">
                        <span className="text-6xl md:text-7xl font-bold text-foreground animate-gradient-text bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto]">
                          R$ 96
                        </span>
                        <span className="text-2xl text-foreground/60">/ano</span>
                      </div>
                    </div>
                    <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-6 py-3 hover:bg-primary/20 transition-colors">
                      <Sparkles className="w-5 h-5 text-primary" />
                      <span className="text-lg font-semibold text-primary">ou 12x de R$ 9,93</span>
                    </div>
                    <p className="text-lg text-foreground/70 max-w-xl mx-auto">
                      Menos de R$ 10 por mês para transformar a relação do casal com o dinheiro
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl p-8 space-y-4">
                    <h4 className="text-2xl font-bold text-foreground text-center mb-6">
                      Tudo que você precisa, incluído:
                    </h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      {[
                        { icon: PiggyBank, text: "Caixinhas ilimitadas para todos os seus sonhos" },
                        { icon: Users, text: "Cofres compartilhados ilimitados" },
                        { icon: Sparkles, text: "Relatórios mensais personalizados com IA" },
                        { icon: BarChart3, text: "Análise completa do patrimônio" },
                        { icon: Lock, text: "Histórico ilimitado de transações" },
                        { icon: Zap, text: "Sincronização em tempo real" },
                        { icon: Shield, text: "Segurança bancária de ponta" },
                        { icon: Target, text: "Acompanhamento visual de progresso" },
                        { icon: Heart, text: "Ferramentas de colaboração para casais" },
                        { icon: Wallet, text: "Contas e cartões ilimitados" },
                      ].map((feature, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-3 p-3 rounded-lg hover:bg-background/50 transition-all hover:translate-x-2 group"
                        >
                          <div className="shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 group-hover:scale-110 transition-all">
                            <feature.icon className="w-5 h-5 text-primary" />
                          </div>
                          <span className="text-base text-foreground/80 leading-relaxed pt-1.5">{feature.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Button className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 text-xl h-16 font-bold hover:scale-105 transition-all relative overflow-hidden group shadow-lg">
                      <span className="relative z-10 flex items-center justify-center leading-7 border-0 text-sm">
                        Começar Minha Jornada Agora<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-right ml-2 w-6 h-6 group-hover:translate-x-2 transition-transform"><path d="m9 18 6-6-6-6"></path></svg>
                        
                      </span>
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                    </Button>

                    <div className="flex items-center justify-center gap-2 text-foreground/60 text-sm py-2">
                      <Lock className="w-4 h-4" />
                      <span>Pagamento seguro processado por</span>
                      <Image
                        src="/logo-kiwify.webp"
                        alt="Kiwify"
                        width={60}
                        height={20}
                        className="h-5 w-auto opacity-70 hover:opacity-100 transition-opacity"
                      />
                    </div>

                    <div className="flex items-center justify-center gap-6 text-foreground/60 text-sm flex-wrap">
                      <div className="flex items-center gap-2 hover:text-primary transition-colors">
                        <Check className="w-5 h-5 text-primary" />
                        <span>Garantia de 7 dias</span>
                      </div>
                      <div className="flex items-center gap-2 hover:text-primary transition-colors">
                        <Check className="w-5 h-5 text-primary" />
                        <span>Cancele quando quiser</span>
                      </div>
                      <div className="flex items-center gap-2 hover:text-primary transition-colors">
                        <Check className="w-5 h-5 text-primary" />
                        <span>Suporte prioritário</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-border pt-6">
                    <div className="bg-accent/10 border-l-4 border-accent rounded-r-xl p-6 hover:bg-accent/15 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className="shrink-0 w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                          <Heart className="w-6 h-6 text-accent fill-accent animate-pulse" />
                        </div>
                        <div className="space-y-2">
                          <p className="font-bold text-foreground text-lg">💑 Perfeito para casais</p>
                          <p className="text-foreground/70 leading-relaxed">
                            Acesso total para você, colaboração ilimitada com quem você ama.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-12 text-center space-y-6">
              <div className="flex items-center justify-center gap-8 text-foreground/60 flex-wrap">
                <div className="flex items-center gap-2 hover:scale-110 transition-transform">
                  <Shield className="w-5 h-5" />
                  <span>Pagamento 100% seguro</span>
                </div>
                <div className="flex items-center gap-2 hover:scale-110 transition-transform">
                  <Lock className="w-5 h-5" />
                  <span>Dados criptografados</span>
                </div>
                <div className="flex items-center gap-2 hover:scale-110 transition-transform">
                  <Zap className="w-5 h-5" />
                  <span>Ativação instantânea</span>
                </div>
              </div>

              <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent max-w-2xl mx-auto hover:border-primary/40 transition-all">
                <CardContent className="p-8">
                  <div className="flex items-start gap-4">
                    <div className="shrink-0 text-4xl animate-bounce-slow">💰</div>
                    <div className="text-left space-y-2">
                      <p className="text-lg font-bold text-foreground">Quanto custa NÃO ter controle financeiro?</p>
                      <p className="text-foreground/70 leading-relaxed">
                        Estudos mostram que casais sem planejamento financeiro gastam em média 30% mais do que poderiam
                        economizar. Em um ano, isso pode significar milhares de reais perdidos. O Caixinhas se paga
                        sozinho.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-gradient-to-br from-primary via-primary to-accent relative overflow-hidden">
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
            Junte-se a mais de 10.000 casais que já estão transformando suas vidas financeiras com o Caixinhas
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4 animate-fade-in-up animation-delay-200">
            <Button
              size="lg"
              variant="secondary"
              className="text-xl h-14 px-8 bg-background text-foreground hover:bg-background/90 hover:scale-110 transition-all relative overflow-hidden group"
            >
              <span className="relative z-10 flex items-center">
                Assinar Agora
                <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            </Button>
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
    </div>
  )
}
