"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, Sparkles, Zap } from "lucide-react"
import { config } from "@/lib/config"

type PWASectionProps = {
  isVisible: { [key: string]: boolean }
}

export function PWASection({ isVisible }: PWASectionProps) {
  return (
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
        <div
          className="text-center mb-16 space-y-4"
          data-animate="pwa-header"
        >
          
          <h2
            className={`text-4xl md:text-6xl font-bold text-foreground text-balance transition-all duration-700 delay-100 ${
              isVisible["pwa-header"]
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            Acesse de <span className="text-primary">qualquer lugar</span>, em
            qualquer dispositivo
          </h2>
          <p
            className={`text-xl text-foreground/70 max-w-3xl mx-auto text-pretty transition-all duration-700 delay-200 ${
              isVisible["pwa-header"]
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            O Caixinhas é um PWA (Progressive Web App). Isso significa que você
            não precisa baixar nada de lojas de aplicativos. Basta acessar e
            instalar diretamente no seu dispositivo.
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          {/* Key Benefits Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {[
              {
                icon: "💻",
                title: "Sem Downloads",
                description:
                  "Não precisa procurar na App Store ou Google Play. Acesse direto pelo navegador.",
              },
              {
                icon: "⚡",
                title: "Instalação Instantânea",
                description:
                  "Um clique e pronto! Aparece na tela inicial como um app nativo.",
              },
              {
                icon: "🔄",
                title: "Sempre Atualizado",
                description:
                  "Sem precisar atualizar manually. Sempre a versão mais recente.",
              },
            ].map((benefit, i) => (
              <Card
                key={i}
                className="border-2 hover:border-primary transition-all duration-300 hover:shadow-xl hover:-translate-y-2 group cursor-pointer bg-background/80 backdrop-blur-sm"
                data-animate={`pwa-benefit-${i}`}
              >
                <CardContent
                  className={`p-6 space-y-3 text-center transition-all duration-700 ${
                    isVisible[`pwa-benefit-${i}`]
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-8"
                  }`}
                  style={{ transitionDelay: `${i * 100}ms` }}
                >
                  <div className="text-5xl mb-2 group-hover:scale-125 transition-transform duration-300">
                    {benefit.icon}
                  </div>
                  <h3 className="text-xl font-bold text-foreground">
                    {benefit.title}
                  </h3>
                  <p className="text-foreground/70 leading-relaxed">
                    {benefit.description}
                  </p>
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
              className={`p-8 md:p-12 transition-all duration-700 ${
                isVisible["pwa-platforms"]
                  ? "opacity-100 scale-100"
                  : "opacity-0 scale-95"
              }`}
            >
              <div className="text-center mb-8">
                <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
                  Funciona em todas as plataformas
                </h3>
                <p className="text-lg text-foreground/70">
                  Desktop, notebook, celular, tablet... o Caixinhas se adapta
                  perfeitamente a qualquer tela
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
                      className={`text-6xl group-hover:scale-125 transition-transform duration-300 ${
                        isVisible[`platform-${i}`]
                          ? "opacity-100 translate-y-0"
                          : "opacity-0 translate-y-4"
                      }`}
                      style={{ transitionDelay: `${300 + i * 100}ms` }}
                    >
                      {platform.icon}
                    </div>
                    <span className="text-lg font-semibold text-foreground">
                      {platform.name}
                    </span>
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
                      description:
                        "Entre no Caixinhas pelo navegador do seu dispositivo",
                    },
                    {
                      step: "2",
                      title: "Instale",
                      description:
                        'Clique no ícone de "Adicionar à tela inicial" ou "Instalar"',
                    },
                    {
                      step: "3",
                      title: "Pronto!",
                      description:
                        "O Caixinhas aparecerá como um app nativo na sua tela",
                    },
                  ].map((step, i) => (
                    <div key={i} className="text-center space-y-2">
                      <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mx-auto mb-3 hover:scale-110 transition-transform">
                        {step.step}
                      </div>
                      <h5 className="font-bold text-foreground text-lg">
                        {step.title}
                      </h5>
                      <p className="text-foreground/70 text-sm leading-relaxed">
                        {step.description}
                      </p>
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
              asChild
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 text-xl h-14 px-8 hover:scale-105 transition-all relative overflow-hidden group"
            >
              <a href={config.checkoutUrl} target="_blank" rel="noopener noreferrer">
                <span className="relative z-10 flex items-center">
                  Experimentar Agora
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              </a>
            </Button>
          {/*   <p className="text-foreground/60 mt-4">
              Sem cartão de crédito • Sem download • Sem complicação
            </p> */}
          </div>
        </div>
      </div>
    </section>
  )
}
