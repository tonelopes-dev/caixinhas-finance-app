"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const faqs = [
  {
    question:
      "Posso usar o Caixinhas se eu for solteira(o) e quiser focar nos meus próprios objetivos?",
    answer:
      "Com certeza! O Caixinhas é perfeito para quem quer organizar metas individuais, como reformar o apartamento, trocar de carro ou fazer uma viagem. Você tem total controle e privacidade sobre o seu ambiente.",
  },
  {
    question:
      "Como funciona a divisão para casais? Eu perco minha privacidade?",
    answer:
      'Não! O sistema funciona em dois níveis. Você tem o seu Cofre Pessoal — completamente privado, ninguém acessa. Se quiser colaborar com seu parceiro(a), você cria um Cofre Compartilhado. Dentro dele, cada Caixinha pode ser marcada como Compartilhada (ambos veem e contribuem) ou Privada (só você vê — perfeito para guardar a surpresa de um presente!).',
  },
  {
    question: "Como a Inteligência Artificial do app me ajuda?",
    answer:
      "Nossa IA analisa seus padrões de gastos e funciona como um conselheiro financeiro de bolso. Ela dá dicas personalizadas para você economizar e preencher suas Caixinhas mais rápido, traduzindo números frios em conselhos práticos.",
  },
  {
    question: "É seguro usar o Caixinhas? Ele acessa minha conta bancária?",
    answer:
      "Não! O Caixinhas não conecta nem acessa nenhuma conta bancária. Você registra manualmente seus valores — assim como faria em uma planilha ou no Notion, mas de forma muito mais fácil, visual e inteligente. Seus dados ficam na sua conta, protegidos por autenticação segura, e você compartilha apenas o que quiser.",
  },
  {
    question: "Consigo acessar minhas metas pelo computador?",
    answer:
      "Sim! O Caixinhas é multiplataforma. Você pode acessar sua conta pelo aplicativo no celular ou diretamente pelo navegador do seu computador para ter uma visão mais ampla das suas finanças.",
  },
]

export function FAQSection() {
  return (
    <section id="faq" className="py-32 px-4 bg-gradient-to-b from-[#fdfcf7] via-[#b8a54383] to-[#1c1917]">
      <div className="container mx-auto pb-20">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-6xl font-bold text-stone-900 text-balance leading-tight">
            Perguntas Frequentes
          </h2>
          <p className="text-xl text-stone-600 max-w-2xl mx-auto text-pretty">
            Tudo que você precisa saber antes de começar a realizar seus sonhos.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`faq-${index}`}
                className="border-2 border-stone-100 rounded-2xl px-6 bg-white/50 backdrop-blur-sm hover:border-primary/40 transition-all duration-300 data-[state=open]:border-primary/50 data-[state=open]:shadow-xl"
              >
                <AccordionTrigger className="text-left text-lg font-bold text-stone-800 hover:text-primary hover:no-underline py-6 transition-colors">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-stone-600 text-base leading-relaxed pb-6">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}
