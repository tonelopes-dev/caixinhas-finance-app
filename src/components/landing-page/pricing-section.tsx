"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { config } from "@/lib/config"
import { motion } from "framer-motion"
import {
    BarChart3,
    Check,
    Heart,
    Lock,
    PiggyBank,
    Shield,
    Sparkles,
    Star,
    Target,
    Users,
    Wallet,
    Zap,
} from "lucide-react"
import Image from "next/image"

type PricingSectionProps = {
  isVisible: { [key: string]: boolean }
}

export function PricingSection({ isVisible }: PricingSectionProps) {
  return (
    <section id="planos" className="py-24 px-4 relative overflow-hidden bg-[#fdfcf7]">
      {/* Background Criativo - Sophisticated Premium Grid & Lights */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Grid de Dashboard Sutil */}
        <div 
          className="absolute inset-0 opacity-[0.05]" 
          style={{ 
            backgroundImage: `
              linear-gradient(to right, #D4A15E 1px, transparent 1px),
              linear-gradient(to bottom, #D4A15E 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px'
          }} 
        />

        {/* Orbes de Brilho */}
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[100px] animation-delay-3000" />

        {/* Feixes de Luz Passando (Moving Light Beams) */}
        <motion.div
          initial={{ x: "-100%", y: "-100%", opacity: 0 }}
          animate={{ x: "200%", y: "200%", opacity: [0, 0.3, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear", delay: 1 }}
          className="absolute top-0 left-0 w-[1000px] h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent -rotate-45 blur-sm"
        />
        <motion.div
          initial={{ x: "-100%", y: "-100%", opacity: 0 }}
          animate={{ x: "200%", y: "200%", opacity: [0, 0.2, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear", delay: 5 }}
          className="absolute top-0 left-0 w-[1200px] h-[1px] bg-gradient-to-r from-transparent via-accent/30 to-transparent -rotate-45 blur-sm"
        />
      </div>

      <div className="container mx-auto relative z-10">
        <div
          className="text-center mb-16 space-y-4"
          data-animate="pricing-header"
        >
          
          <h2
            className={`text-4xl md:text-6xl font-bold text-stone-900 text-balance transition-all duration-700 delay-100 ${
              isVisible["pricing-header"]
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            Invista no seu futuro (e nas suas conquistas)
          </h2>
          <p
            className={`text-xl text-stone-900/70 max-w-2xl mx-auto transition-all duration-700 delay-200 ${
              isVisible["pricing-header"]
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            Um investimento pequeno para conquistas gigantes. Sem planos
            confusos, sem taxas escondidas.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="relative pb-6">
            <div className="absolute -top-5 left-[90px] md:left-[265px] lg:left-[275px] -translate-x-1/2 animate-bounce-slow z-20">
              <Badge className="bg-gradient-to-r from-primary to-accent text-white hover:text-yellow-400 text-base px-6 py-2 shadow-lg">
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
                className={`p-10 md:p-14 space-y-8 relative z-10 transition-all duration-700 ${
                  isVisible["pricing-annual"]
                    ? "opacity-100 scale-100"
                    : "opacity-0 scale-95"
                }`}
              >
                <div className="text-center space-y-4">
                  <h3 className="text-2xl md:text-4xl font-bold text-stone-900">
                    Assinatura Caixinhas
                  </h3>
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl text-stone-900/40 line-through decoration-primary/40">
                        De R$ 97,00
                      </span>
                      <Badge variant="secondary" className="bg-primary/10 text-primary border-none font-bold">
                        -72% OFF
                      </Badge>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="md:text-7xl text-5xl   font-bold text-stone-900 animate-gradient-text bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto]">
                        R$ 27,00
                      </span>
                      <span className="text-2xl text-stone-900/60">/anual</span>
                    </div>
                    <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-6 py-2 hover:bg-primary/20 transition-colors mt-2">
                      <span className="text-lg font-semibold text-primary">
                        ou 6x de R$ 5,07
                      </span>
                    </div>
                  </div>
                  <p className="text-lg text-stone-900/70 max-w-xl mx-auto">
                    Aproveite nossa oferta por tempo limitado!
                  </p>
                </div>

                <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl py-8 px-4 space-y-4">
                  <h4 className="text-2xl font-bold text-stone-900 text-center mb-6">
                    Tudo que você precisa, incluído:
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      {
                        icon: PiggyBank,
                        text: "Caixinhas ilimitadas para todos os seus sonhos",
                      },
                      { icon: Users, text: "Cofres compartilhados ilimitados" },
                      {
                        icon: Sparkles,
                        text: "Relatórios mensais personalizados com IA",
                      },
                      {
                        icon: BarChart3,
                        text: "Análise completa do patrimônio",
                      },
                      {
                        icon: Lock,
                        text: "Histórico ilimitado de transações",
                      },
                      { icon: Zap, text: "Sincronização em tempo real" },
                      { icon: Shield, text: "Segurança bancária de ponta" },
                      {
                        icon: Target,
                        text: "Acompanhamento visual de progresso",
                      },
                      {
                        icon: Heart,
                        text: "Ferramentas de colaboração para casais",
                      },
                      { icon: Wallet, text: "Contas e cartões ilimitados" },
                    ].map((feature, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-background/50 transition-all hover:translate-x-2 group"
                      >
                        <div className="shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 group-hover:scale-110 transition-all">
                          <feature.icon className="w-5 h-5 text-primary" />
                        </div>
                        <span className="text-base text-stone-900/80 leading-relaxed pt-1.5">
                          {feature.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <Button asChild className="w-full bg-gradient-to-r from-primary to-accent text-white hover:opacity-90 text-xl h-16 font-bold hover:scale-105 transition-all relative overflow-hidden group shadow-lg">
                    <a href={config.checkoutUrl} target="_blank" rel="noopener noreferrer">
                      <span className="relative z-10 flex items-center justify-center leading-7 border-0 text-sm">
                        Começar Minha Jornada Agora
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="lucide lucide-chevron-right ml-2 w-6 h-6 group-hover:translate-x-2 transition-transform"
                        >
                          <path d="m9 18 6-6-6-6"></path>
                        </svg>
                      </span>
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                    </a>
                  </Button>

                  

                  <div className="flex items-center justify-center pt-6 gap-6 text-stone-900/60 text-sm flex-wrap">
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

                <div className="border-t border-border py-4 flex justify-center items-center">
                    <div className="flex justify-center items-center w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl">
                    <div className="flex sm:flex-row flex-col items-center justify-center gap-2 text-stone-900/60 text-sm py-2">
                    <div className="flex items-center gap-2"><Lock className="w-4 h-4" />
                    <span>Pagamento processado por</span></div>
                    <Image
                      priority
                      src="/logo-kiwify.webp"
                      alt="Kiwify"
                      width={60}
                      height={20}
                      quality={100}
                      data-ai-hint="logo company"
                      className="h-5 w-auto opacity-70 hover:opacity-100 transition-opacity"
                    />
                  </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-12 text-center space-y-6">
            <div className="flex items-center justify-center gap-8 text-stone-900/60 flex-wrap">
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
          </div>
        </div>
      </div>
    </section>
  )
}
