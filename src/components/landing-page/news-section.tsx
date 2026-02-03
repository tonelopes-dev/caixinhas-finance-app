"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

export function NewsSection() {
  return (
    <section className="py-20 px-4 bg-white">
      <div className="container mx-auto">
        <div className="text-center mb-16 space-y-4">
         {/*  <h2 className="text-4xl md:text-6xl font-bold text-foreground text-balance">
            O que especialistas dizem
          </h2> */}
          <p className="text-xl text-foreground/90 max-w-2xl mx-auto">
            Dados e pesquisas comprovam a importância do planejamento financeiro para casais
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card className="border-2 border-red-500/20 bg-gradient-to-br from-red-500/5 to-transparent hover:border-red-500/40 transition-all hover:shadow-lg">
            <CardContent className="p-8">
              <div className="space-y-4">
                {/* Header da CNN */}
                <div className="flex items-center gap-3 pb-3 border-b border-red-500/20">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center">
                      <span className="text-white font-bold text-sm">CNN</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <span className="font-semibold">CNN Brasil</span> • 09/06/25
                    </div>
                  </div>
                  <div className="ml-auto">
                    <Badge variant="destructive" className="text-xs">
                      RELACIONAMENTOS
                    </Badge>
                  </div>
                </div>

                {/* Conteúdo da notícia */}
                <div className="space-y-3">
                  <h3 className="text-xl font-bold text-foreground leading-tight">
                    Mais de 50% dizem que finanças são principal motivo de brigas entre casais
                  </h3>
                  <p className="text-foreground/70 leading-relaxed text-sm">
                    Pesquisa revela que discussões sobre dinheiro superam outros conflitos conjugais. 
                    Falta de planejamento financeiro conjunto pode custar milhares de reais por ano 
                    e até mesmo o relacionamento.
                  </p>
                  
                  {/* Call to action emocional */}
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                    <p className="text-sm font-semibold text-red-800">
                      💔 Não deixe que o dinheiro destrua seu relacionamento
                    </p>
                    <p className="text-xs text-red-700 mt-1">
                      O Caixinhas já ajudou mais de 10.000 casais a organizarem suas finanças juntos.
                    </p>
                  </div>

                  {/* Link da fonte */}
                  <div className="pt-2 border-t border-gray-200">
                    <a 
                      href="https://www.cnnbrasil.com.br/economia/financas/mais-de-50-dizem-que-financas-sao-principal-motivo-de-brigas-entre-casais/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-muted-foreground hover:text-red-600 transition-colors flex items-center gap-1"
                    >
                      📰 Leia a matéria completa na CNN Brasil
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}