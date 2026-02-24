"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { 
  ArrowRight, 
  Sparkles, 
  Zap, 
  Laptop, 
  Monitor, 
  Smartphone, 
  RefreshCw, 
  DownloadCloud,
  CheckCircle2,
  Apple,
  MousePointer2
} from "lucide-react"
import { motion } from "framer-motion"
import { config } from "@/lib/config"

type PWASectionProps = {
  isVisible: { [key: string]: boolean }
}

type FloatingDot = {
  left: number
  top: number
  delay: number
  duration: number
}

export function PWASection({ isVisible }: PWASectionProps) {
  const [floatingDots, setFloatingDots] = useState<FloatingDot[]>([])

  useEffect(() => {
    setFloatingDots(
      [...Array(15)].map(() => ({
        left: Math.random() * 100,
        top: Math.random() * 100,
        delay: Math.random() * 5,
        duration: 8 + Math.random() * 7,
      }))
    )
  }, [])

  return (
    <section className="py-24 px-4 relative overflow-hidden bg-[#fafcf6]">
      {/* Background Decorativo - Sophisticated Premium Grid & Effects */}
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
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[120px]" />

        {/* Floating Dots Refinados */}
        <div className="absolute inset-0 opacity-20">
          {floatingDots.map((dot, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.2, 0.5, 0.2], y: [0, -20, 0] }}
              transition={{ duration: dot.duration, repeat: Infinity, delay: dot.delay }}
              className="absolute w-1.5 h-1.5 bg-primary rounded-full blur-[1px]"
              style={{
                left: `${dot.left}%`,
                top: `${dot.top}%`,
              }}
            />
          ))}
        </div>

        {/* Feixe de Luz (Motion Beam) */}
        <motion.div
          initial={{ x: "-100%", y: "-100%", opacity: 0 }}
          animate={{ x: "200%", y: "200%", opacity: [0, 0.2, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute top-0 left-0 w-[1200px] h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent -rotate-45 blur-md"
        />
      </div>

      <div className="container mx-auto relative z-10">
        <div
          className="text-center mb-20 space-y-4"
          data-animate="pwa-header"
        >
          <h2
            className={`text-4xl md:text-6xl font-bold text-stone-900 text-balance transition-all duration-700 delay-100 ${
              isVisible["pwa-header"]
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            Leve o Caixinhas no <span className="text-primary italic">bolso</span>
          </h2>
          <p
            className={`text-xl text-stone-600 max-w-2xl mx-auto transition-all duration-700 delay-200 ${
              isVisible["pwa-header"]
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            Nossa plataforma utiliza tecnologia **PWA**, oferecendo a experiência 
            de um app nativo sem a necessidade de downloads pesados em lojas.
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          {/* Key Benefits - Glassmorphism Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {[
              {
                icon: DownloadCloud,
                title: "Sem Lojas",
                description: "Esqueça App Store ou Google Play. Instale direto pelo navegador com um clique.",
                color: "text-primary",
                bg: "bg-primary/10"
              },
              {
                icon: Zap,
                title: "Alta Performance",
                description: "Acesso instantâneo e carregamento ultra-rápido, mesmo em conexões lentas.",
                color: "text-accent",
                bg: "bg-accent/10"
              },
              {
                icon: RefreshCw,
                title: "Sempre Atual",
                description: "Novas funcionalidades aparecem na hora. Zero atualizações manuais necessárias.",
                color: "text-primary",
                bg: "bg-primary/10"
              },
            ].map((benefit, i) => (
              <Card
                key={i}
                className={`border border-white bg-white/50 backdrop-blur-xl shadow-xl shadow-stone-200/50 hover:shadow-2xl hover:scale-[1.02] transition-all duration-500 group cursor-pointer ${
                  isVisible[`pwa-benefit-${i}`] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${i * 100}ms` }}
                data-animate={`pwa-benefit-${i}`}
              >
                <CardContent className="p-8 space-y-4 text-center">
                  <div className={`w-16 h-16 rounded-2xl ${benefit.bg} ${benefit.color} flex items-center justify-center mx-auto mb-2 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500`}>
                    <benefit.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-stone-900 leading-tight">
                    {benefit.title}
                  </h3>
                  <p className="text-stone-600 leading-relaxed text-sm">
                    {benefit.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Platform & Installation Guide */}
          <Card
            className={`border border-white shadow-2xl overflow-hidden bg-white/60 backdrop-blur-xl rounded-[2.5rem] transition-all duration-700 ${
              isVisible["pwa-platforms"] ? "opacity-100 scale-100" : "opacity-0 scale-95"
            }`}
            data-animate="pwa-platforms"
          >
            <CardContent className="p-8 md:p-14">
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                {/* Left: Platform List */}
                <div className="space-y-8">
                  <div className="space-y-4">
                    <h3 className="text-3xl font-bold text-stone-900 leading-tight">
                      Onipresença Digital
                    </h3>
                    <p className="text-stone-600 text-lg">
                      O Caixinhas se adapta com maestria a qualquer dispositivo que você utilize.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { name: "iPhone / iOS", icon: Apple },
                      { name: "Android / Google", icon: Smartphone },
                      { name: "Windows / PC", icon: Monitor },
                      { name: "MacOS / MacBook", icon: Laptop },
                    ].map((platform, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-4 p-4 rounded-2xl bg-stone-50 border border-stone-100 group hover:border-primary/30 transition-all hover:bg-white hover:shadow-lg"
                      >
                        <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-stone-400 group-hover:text-primary transition-colors">
                          <platform.icon className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-bold text-stone-700 group-hover:text-stone-900">
                          {platform.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: Installation Guide */}
                <div className="bg-stone-700 rounded-[2rem] p-10 text-white relative overflow-hidden group">
                  {/* Grid de Dashboard Interno Sutil */}
                  <div 
                    className="absolute inset-0 opacity-[0.03]" 
                    style={{ 
                      backgroundImage: `
                        linear-gradient(to right, #ffffff 1px, transparent 1px),
                        linear-gradient(to bottom, #ffffff 1px, transparent 1px)
                      `,
                      backgroundSize: '30px 30px'
                    }} 
                  />
                  
                  {/* Decorative background for the dark card */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-[60px] group-hover:scale-150 transition-transform duration-1000" />
                  
                  <h4 className="text-2xl font-bold mb-8 flex items-center gap-3">
                    Como instalar?
                  </h4>
                  
                  <div className="space-y-8">
                    {[
                      { step: 1, title: "Acesse", desc: "Entre no app pelo seu navegador" },
                      { step: 2, title: "Opções", desc: 'Toque em "Adicionar à tela inicial"' },
                      { step: 3, title: "Instale", desc: "Confirme a instalação e pronto!" },
                    ].map((step, i) => (
                      <div key={i} className="flex gap-6 relative">
                        {i < 2 && <div className="absolute top-10 left-5 w-[1px] h-10 bg-stone-700" />}
                        <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 text-primary flex items-center justify-center font-bold shrink-0">
                          {step.step}
                        </div>
                        <div className="space-y-1">
                          <h5 className="font-bold text-lg">{step.title}</h5>
                          <p className="text-stone-400 text-sm leading-relaxed">{step.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-10 pt-8 border-t border-stone-800 grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-[11px] text-stone-500 uppercase tracking-widest font-bold">
                       <CheckCircle2 className="w-4 h-4 text-primary" />
                       Offline Mode
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-stone-500 uppercase tracking-widest font-bold">
                       <CheckCircle2 className="w-4 h-4 text-primary" />
                       Native Push
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bottom CTA */}
          <div className="text-center mt-16">
            <Button
              asChild
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg h-16 px-12 rounded-2xl hover:scale-105 transition-all shadow-xl shadow-primary/20 group relative overflow-hidden font-bold"
            >
              <a href={config.checkoutUrl} target="_blank" rel="noopener noreferrer">
                <span className="relative z-10 flex items-center gap-3 text-white">
                  Acessar Agora
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              </a>
            </Button>
            <div className="mt-6 flex justify-center items-center gap-6 text-stone-400 text-sm">
              <span className="flex items-center gap-2 italic">Sem burocracia</span>
              <div className="w-1 h-1 rounded-full bg-stone-200" />
              <span className="flex items-center gap-2 italic">Sem download de App Stores</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
