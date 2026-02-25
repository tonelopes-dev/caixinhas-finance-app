"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Heart, Star, Quote } from "lucide-react";
import {
  motion,
  useAnimationControls,
  useMotionValue,
  useAnimationFrame,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { wrap } from "framer-motion";
import { testimonials } from "@/lib/testimonials";

type StorySectionProps = {
  isVisible: { [key: string]: boolean };
};

export function StorySection({ isVisible }: StorySectionProps) {
  return (
    <section
      id="historia"
      className="py-24 px-4 bg-gradient-to-b from-[#fdfcf7] to-primary/10 relative overflow-hidden"
    >
      <div className="absolute top-20 right-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-float animation-delay-1000" />

      <div className="container mx-auto relative z-10">
        <div
          className="text-center mb-16 space-y-4"
          data-animate="story-header"
        >
          <h2
            className={`text-4xl md:text-6xl font-bold text-foreground text-balance transition-all duration-700 delay-100 ${
              isVisible["story-header"]
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            De conversas difíceis a{" "}
            <span className="text-primary">sonhos realizados</span>
          </h2>
        </div>

        <div className="max-w-5xl mx-auto" data-animate="story-card">
          <Card
            className={`border-2 border-primary/20 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.01] ${
              isVisible["story-card"]
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-12"
            }`}
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
                      quality={100}
                      data-ai-hint="woman portrait"
                      className="w-20 h-20 rounded-full border-4 border-background shadow-lg group-hover:scale-110 group-hover:-rotate-6 transition-all duration-300"
                    />
                  </div>
                  <div className="relative group">
                    <Image
                      src="/photos/joao-perfil.png"
                      alt="João"
                      width={80}
                      height={80}
                      quality={100}
                      data-ai-hint="man portrait"
                      className="w-20 h-20 rounded-full border-4 border-background shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300"
                    />
                  </div>
                </div>
                <div className="text-center md:text-left">
                  <h3 className="text-3xl font-bold text-foreground flex items-center gap-2 justify-center md:justify-start">
                    Clara & João
                    <Heart className="w-6 h-6 text-primary fill-primary animate-pulse" />
                  </h3>
                  <p className="text-lg text-foreground/60 mt-1">
                    Família Ribeiro - Juntos há 7 anos
                  </p>
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
                  Clara e João se amavam, mas o dinheiro estava destruindo esse
                  amor, silenciosamente.
                </p>

                <p>
                  Todo final de mês era a mesma angústia. "Onde você gastou
                  tanto?", João perguntava. "E o dinheiro do conserto do
                  carro?", retrucava Clara, sentindo-se controlada e exausta.
                </p>

                <p className="font-semibold text-foreground text-xl">
                  Eles não eram maus com dinheiro. Eram apenas um casal sem um
                  mapa.
                </p>

                <p>
                  Foi em uma noite, após mais uma discussão que terminou em
                  lágrimas, que Clara descobriu o Caixinhas. "Vamos tentar. Só
                  por um mês", ela propôs, com a voz embargada.
                </p>

                <div className="bg-primary/10 border-l-4 border-primary rounded-r-xl overflow-hidden hover:bg-primary/15 transition-colors my-8">
                  <div className="grid md:grid-cols-2 gap-6 items-center">
                    <div className="p-6 md:p-8 space-y-4">
                      <p className="text-foreground italic text-xl leading-relaxed">
                        "A primeira Caixinha que criaram foi tímida: 'Jantar de
                        Aniversário da Clara'. A meta era R$ 300. Quando a barra
                        de progresso chegou a 100%, algo mágico aconteceu."
                      </p>
                      <p className="text-foreground font-semibold text-lg">
                        Eles não apenas tinham o dinheiro; eles o conquistaram
                        juntos.
                      </p>
                    </div>
                    <div className="relative h-64 md:h-full min-h-[300px]">
                      <Image
                        src="/photos/familia-joao-clara.png"
                        alt="Família Clara e João com filha"
                        fill
                        quality={100}
                        className="object-cover rounded-r-xl"
                        data-ai-hint="family smiling"
                      />
                    </div>
                  </div>
                </div>

                <p className="text-xl">
                  Anos se passaram. A 'Caixinha: Entrada da Casa Nova' tem uma
                  marca de 'Concluído!' ao lado. Eles a alcançaram 8 meses antes
                  do previsto. O pequeno Leo agora corre no jardim que eles
                  sonharam.
                </p>

                <div className="bg-gradient-to-r from-primary/20 to-accent/20 p-6 md:p-8 rounded-2xl border-2 border-primary/30 hover:scale-[1.02] transition-all">
                  <p className="font-bold text-2xl text-foreground leading-relaxed">
                    "O Caixinhas não salvou nosso dinheiro. Ele salvou a gente.
                    Ele nos lembrou que somos um time."
                  </p>
                  <div className="flex items-center gap-3 mt-4">
                    <Image
                      src="/photos/joao-perfil.png"
                      alt="João"
                      width={48}
                      height={48}
                      quality={100}
                      data-ai-hint="man portrait"
                      className="w-12 h-12 rounded-full border-2 border-primary"
                    />
                    <div>
                      <p className="font-semibold text-foreground">
                        João Ribeiro
                      </p>
                      <p className="text-sm text-foreground/60">
                        Pai e Planejador Financeiro
                      </p>
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
                  <Badge className="bg-primary/20 hover:bg-primary/30 text-primary px-4 py-2 text-base hover:scale-110 transition-transform">
                    12+ Sonhos Realizados
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Marquee de Depoimentos */}
      <div className="mt-24 relative">
        <div className="absolute inset-y-0 left-0 w-8 sm:w-32 bg-gradient-to-r from-background to-transparent z-10" />
        <div className="absolute inset-y-0 right-0 w-8 sm:w-32 bg-gradient-to-l from-background to-transparent z-10" />

        <div className="flex flex-col gap-8 py-10 overflow-hidden">
          <TestimonialMarquee testimonials={testimonials} speed={35} />
        </div>
      </div>
    </section>
  );
}

function TestimonialMarquee({
  testimonials,
  speed = 50,
  reverse = false,
}: {
  testimonials: typeof import("@/lib/testimonials").testimonials;
  speed?: number;
  reverse?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [contentWidth, setContentWidth] = useState(0);
  const x = useMotionValue(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (containerRef.current) {
      // O conteúdo real é metade do scrollWidth porque duplicamos os itens
      setContentWidth(containerRef.current.scrollWidth / 2);
    }
  }, [testimonials]);

  useAnimationFrame((t, delta) => {
    if (contentWidth === 0 || isPaused) return;

    // Calcula o movimento baseado no tempo e velocidade
    const moveBy = (delta / 1000) * speed;
    const currentX = x.get();
    let newX = reverse ? currentX + moveBy : currentX - moveBy;

    // Aplica o wrapping para manter o valor dentro de [0, -contentWidth]
    // O wrap do Framer Motion funciona como um modulo inteligente
    x.set(wrap(-contentWidth, 0, newX));
  });

  return (
    <div className="overflow-hidden">
      <motion.div
        className="flex gap-6 cursor-grab active:cursor-grabbing"
        style={{ x }}
        drag="x"
        onDragStart={() => setIsPaused(true)}
        onDragEnd={() => setIsPaused(false)}
        // O drag deve atualizar o motion value diretamente
        onDrag={(event, info) => {
          const currentX = x.get();
          x.set(wrap(-contentWidth, 0, currentX + info.delta.x));
        }}
      >
        <div ref={containerRef} className="flex gap-6">
          {/* Triplicamos para garantir cobertura total durante o drag rápido */}
          {[...testimonials, ...testimonials, ...testimonials].map(
            (testimonial, index) => (
              <TestimonialCard
                key={`${testimonial.name}-${index}`}
                testimonial={testimonial}
                index={index}
              />
            ),
          )}
        </div>
      </motion.div>
    </div>
  );
}

function TestimonialCard({
  testimonial,
  index,
}: {
  testimonial: (typeof import("@/lib/testimonials").testimonials)[0];
  index: number;
}) {
  const isCouple =
    testimonial.name.includes("&") || testimonial.name.includes(" e ");

  return (
    <Card
      className={`min-w-[350px] md:min-w-[400px] max-w-[400px] border border-gray-100/50 bg-white shadow-lg hover:shadow-xl transition-all duration-300 group ${index % 3 === 0 ? "border-l-4 border-l-yellow-500" : ""}`}
    >
      <CardContent className="p-6 space-y-4">
        <Quote className="w-8 h-8 text-primary/20 group-hover:text-primary/40 transition-colors" />

        <p className="text-slate-600 leading-relaxed italic text-lg relative z-10">
          &ldquo;{testimonial.text}&rdquo;
        </p>

        <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
          <Avatar
            className={`w-12 h-12 border-2 ${isCouple ? "border-accent" : "border-primary"}`}
          >
            <AvatarFallback
              className={`${isCouple ? "bg-accent/10 text-accent" : "bg-primary/10 text-primary"} font-bold`}
            >
              {testimonial.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-slate-800 font-bold group-hover:text-primary transition-colors">
              {testimonial.name}
            </p>
            <p className="text-slate-500 text-sm">{testimonial.role}</p>
          </div>

          <div className="ml-auto flex gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                className="w-3 h-3 text-yellow-500"
                fill="currentColor"
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
