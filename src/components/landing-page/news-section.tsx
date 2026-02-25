"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  motion,
  useAnimationControls,
  useMotionValue,
  useAnimationFrame,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { wrap } from "framer-motion";
import { ExternalLink, Heart, Key, LineChart, Home } from "lucide-react";

// Dados das notícias englobando os dois públicos
const newsArticles = [
  {
    source: "CNN",
    sourceName: "CNN Brasil",
    date: "09/06/25",
    tag: "RELACIONAMENTOS",
    tagColor: "bg-red-500",
    badgeVariant: "destructive" as const,
    title:
      "Mais de 50% dizem que finanças são principal motivo de brigas entre casais",
    description:
      "Pesquisa revela que discussões sobre dinheiro superam outros conflitos conjugais. Falta de planejamento conjunto pode custar o relacionamento.",
    ctaIcon: <Heart className="w-4 h-4" />,
    ctaTitle: "Não deixe que o dinheiro destrua seu relacionamento",
    ctaText:
      "O Caixinhas já ajudou mais de 10.000 casais a organizarem suas finanças juntos.",
    link: "https://www.cnnbrasil.com.br",
  },
  {
    source: "FRB",
    sourceName: "Forbes Brasil",
    date: "14/08/25",
    tag: "INDEPENDÊNCIA",
    tagColor: "bg-blue-600",
    badgeVariant: "default" as const,
    title: "Mulheres já representam 40% dos compradores de imóveis no Brasil",
    description:
      "Cresce o número de mulheres que não esperam casar para investir no primeiro apartamento e lideram o planejamento de suas próprias reformas.",
    ctaIcon: <Key className="w-4 h-4" />,
    ctaTitle: "O seu império no seu tempo",
    ctaText:
      "Organize as caixinhas da sua reforma e dos móveis planejados sem perder o controle.",
    link: "https://forbes.com.br",
  },
  {
    source: "EXM",
    sourceName: "Exame",
    date: "22/10/25",
    tag: "FINANÇAS",
    tagColor: "bg-emerald-600",
    badgeVariant: "secondary" as const,
    title: "Casais que planejam juntos enriquecem mais rápido, aponta estudo",
    description:
      "A transparência financeira e metas conjuntas aceleram a construção de patrimônio em até 30% nos primeiros 5 anos de convivência.",
    ctaIcon: <LineChart className="w-4 h-4" />,
    ctaTitle: "Multiplique suas conquistas",
    ctaText:
      "Crie metas conjuntas e veja o patrimônio do casal crescer com transparência.",
    link: "https://exame.com",
  },
  {
    source: "EST",
    sourceName: "Estadão",
    date: "05/11/25",
    tag: "MERCADO",
    tagColor: "bg-orange-500",
    badgeVariant: "outline" as const,
    title: "O boom dos apês compactos: planejamento é chave para mobiliar 35m²",
    description:
      "Morar bem em espaços menores exige marcenaria inteligente, o que eleva os custos e exige organização financeira prévia dos proprietários.",
    ctaIcon: <Home className="w-4 h-4" />,
    ctaTitle: "Faça caber no espaço e no bolso",
    ctaText:
      "Divida o projeto em caixinhas e pague sua marcenaria à vista com desconto.",
    link: "https://estadao.com.br",
  },
  {
    source: "VLR",
    sourceName: "Valor Econômico",
    date: "12/09/25",
    tag: "COMPORTAMENTO",
    tagColor: "bg-teal-600",
    badgeVariant: "default" as const,
    title:
      "Conta conjunta ou separada? Especialistas indicam o modelo 'híbrido'",
    description:
      "A tendência atual é manter a individualidade das contas pessoais, mas compartilhar uma conta ou 'cofre' específico para as despesas da casa.",
    ctaIcon: <Heart className="w-4 h-4" />,
    ctaTitle: "O modelo perfeito já existe",
    ctaText:
      "No Caixinhas, você tem seu Cofre Pessoal e compartilha apenas o que decidir.",
    link: "https://valor.globo.com",
  },
  {
    source: "GLM",
    sourceName: "Revista Glamour",
    date: "03/12/25",
    tag: "LIFESTYLE",
    tagColor: "bg-pink-500",
    badgeVariant: "secondary" as const,
    title: "Como mulheres estão bancando sozinhas a reforma dos sonhos",
    description:
      "A organização em metas de curto e médio prazo tem sido o segredo de jovens adultas para pagar projetos arquitetônicos sem se endividar.",
    ctaIcon: <Key className="w-4 h-4" />,
    ctaTitle: "O Pinterest da vida real",
    ctaText:
      "Transforme as pastas de inspiração em metas reais dentro do aplicativo.",
    link: "https://revistaglamour.globo.com",
  },
  {
    source: "G1",
    sourceName: "G1 Economia",
    date: "18/01/26",
    tag: "ALERTA",
    tagColor: "bg-red-600",
    badgeVariant: "destructive" as const,
    title: "Falta de organização financeira eleva custo de obras em até 40%",
    description:
      "Erros de cálculo, compras por impulso e falta de caixa para imprevistos transformam o sonho da casa nova em pesadelo financeiro.",
    ctaIcon: <LineChart className="w-4 h-4" />,
    ctaTitle: "Fuja das estatísticas ruins",
    ctaText:
      "Tenha sempre uma caixinha de 'Imprevistos da Obra' rendendo para te salvar.",
    link: "https://g1.globo.com",
  },
  {
    source: "INF",
    sourceName: "InfoMoney",
    date: "28/01/26",
    tag: "INVESTIMENTOS",
    tagColor: "bg-indigo-600",
    badgeVariant: "default" as const,
    title:
      "A nova era da amortização: como jovens estão quitando imóveis em 10 anos",
    description:
      "O uso inteligente do FGTS e aportes extras frequentes têm feito uma nova geração bater recordes na quitação de financiamentos habitacionais.",
    ctaIcon: <Home className="w-4 h-4" />,
    ctaTitle: "Derrube os juros",
    ctaText:
      "Acompanhe seu progresso de amortização visualmente e quite seu apê mais rápido.",
    link: "https://infomoney.com.br",
  },
  {
    source: "UOL",
    sourceName: "UOL Economia",
    date: "05/02/26",
    tag: "TENDÊNCIA",
    tagColor: "bg-yellow-500",
    badgeVariant: "outline" as const,
    title:
      "Gasto com decoração cresce entre solteiros que buscam o 'refúgio perfeito'",
    description:
      "O foco no bem-estar fez disparar os investimentos em conforto domiciliar, priorizando ambientes de paz em vez de gastos com saídas e festas.",
    ctaIcon: <Key className="w-4 h-4" />,
    ctaTitle: "O seu refúgio merece",
    ctaText: "Planeje os móveis e eletrodomésticos sem comprometer sua rotina.",
    link: "https://economia.uol.com.br",
  },
  {
    source: "PEGN",
    sourceName: "Pequenas Empresas",
    date: "10/02/26",
    tag: "TECNOLOGIA",
    tagColor: "bg-violet-600",
    badgeVariant: "default" as const,
    title:
      "De planilhas a IA: a revolução na forma de organizar as contas de casa",
    description:
      "Aplicativos que leem transações e oferecem conselhos customizados via Inteligência Artificial substituem o velho caderno de anotações dos casais.",
    ctaIcon: <LineChart className="w-4 h-4" />,
    ctaTitle: "Sua inteligência financeira",
    ctaText:
      "Deixe nossa IA analisar seus gastos e mostrar o caminho mais rápido para a meta.",
    link: "https://revistapegn.globo.com",
  },
];

export function NewsSection() {
  return (
    <section className="py-24 px-4 bg-white relative overflow-hidden">
      <div className="container mx-auto">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground text-balance">
            O que dizem os especialistas
          </h2>
          <p className="text-lg md:text-xl text-foreground/70 max-w-2xl mx-auto">
            Dados reais comprovam que organizar as finanças (seja só ou a dois)
            é o caminho mais curto entre o sonho e as chaves na mão.
          </p>
        </div>
      </div>

      {/* Marquee de Notícias */}
      <div className="relative mt-8">
        <div className="absolute inset-y-0 left-0 w-8 md:w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-8 md:w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

        <div className="flex flex-col gap-8 py-4 overflow-hidden">
          <NewsMarquee articles={newsArticles} speed={40} />
        </div>
      </div>
    </section>
  );
}

function NewsMarquee({
  articles,
  speed = 50,
  reverse = false,
}: {
  articles: typeof newsArticles;
  speed?: number;
  reverse?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [contentWidth, setContentWidth] = useState(0);
  const x = useMotionValue(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (containerRef.current) {
      setContentWidth(containerRef.current.scrollWidth / 2);
    }
  }, [articles]);

  useAnimationFrame((t, delta) => {
    if (contentWidth === 0 || isPaused) return;

    const moveBy = (delta / 1000) * speed;
    const currentX = x.get();
    let newX = reverse ? currentX + moveBy : currentX - moveBy;

    x.set(wrap(-contentWidth, 0, newX));
  });

  return (
    <div className="overflow-hidden py-4">
      <motion.div
        className="flex gap-6 cursor-grab active:cursor-grabbing"
        style={{ x }}
        drag="x"
        onDragStart={() => setIsPaused(true)}
        onDragEnd={() => setIsPaused(false)}
        onDrag={(event, info) => {
          const currentX = x.get();
          x.set(wrap(-contentWidth, 0, currentX + info.delta.x));
        }}
      >
        <div ref={containerRef} className="flex gap-6 px-6">
          {[...articles, ...articles].map((article, index) => (
            <NewsCard key={`${article.source}-${index}`} article={article} />
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function NewsCard({ article }: { article: (typeof newsArticles)[0] }) {
  // Cores dinâmicas para o box do CTA baseado na cor da tag
  const isRed = article.tagColor.includes("red");
  const isBlue =
    article.tagColor.includes("blue") ||
    article.tagColor.includes("indigo") ||
    article.tagColor.includes("violet");
  const isGreen =
    article.tagColor.includes("emerald") || article.tagColor.includes("teal");

  const ctaBg = isRed
    ? "bg-red-50 border-red-500 text-red-800"
    : isBlue
      ? "bg-blue-50 border-blue-500 text-blue-800"
      : isGreen
        ? "bg-emerald-50 border-emerald-500 text-emerald-800"
        : "bg-orange-50 border-orange-500 text-orange-800";

  const ctaTextCol = isRed
    ? "text-red-700"
    : isBlue
      ? "text-blue-700"
      : isGreen
        ? "text-emerald-700"
        : "text-orange-700";

  return (
    <Card className="min-w-[320px] md:min-w-[450px] max-w-[450px] border border-gray-100 hover:border-gray-200 shadow-md hover:shadow-xl transition-all duration-300">
      <CardContent className="p-6 flex flex-col h-full">
        <div className="space-y-4 flex-grow">
          {/* Header */}
          <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 ${article.tagColor} rounded flex items-center justify-center`}
              >
                <span className="text-white font-bold text-[10px] tracking-wider">
                  {article.source}
                </span>
              </div>
              <div className="text-xs text-slate-500">
                <span className="font-semibold text-slate-700">
                  {article.sourceName}
                </span>{" "}
                • {article.date}
              </div>
            </div>
            <div className="ml-auto">
              <Badge
                variant={article.badgeVariant}
                className="text-[10px] font-semibold"
              >
                {article.tag}
              </Badge>
            </div>
          </div>

          {/* Conteúdo da notícia */}
          <div className="space-y-3">
            <h3 className="text-lg md:text-xl font-bold text-slate-800 leading-tight line-clamp-2">
              {article.title}
            </h3>
            <p className="text-slate-600 leading-relaxed text-sm line-clamp-3">
              {article.description}
            </p>
          </div>
        </div>

        {/* Call to action emocional */}
        <div className={`mt-6 border-l-4 p-4 rounded-r-lg ${ctaBg}`}>
          <div className="flex items-center gap-2 text-sm font-semibold mb-1">
            {article.ctaIcon}
            <p>{article.ctaTitle}</p>
          </div>
          <p className={`text-xs ${ctaTextCol}`}>{article.ctaText}</p>
        </div>

        {/* Link da fonte */}
        <div className="pt-4 mt-4 border-t border-gray-100">
          <a
            href={article.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-slate-500 hover:text-primary transition-colors flex items-center gap-1 group w-fit"
          >
            Leia a matéria completa
            <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
