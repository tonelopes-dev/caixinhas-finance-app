'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    question: 'O Caixinhas é gratuito?',
    answer:
      'Sim! O Caixinhas oferece um plano gratuito completo para você e seu parceiro(a) começarem a planejar suas finanças e criar suas primeiras metas compartilhadas. Ofereceremos planos premium no futuro com funcionalidades avançadas.',
  },
  {
    question: 'Meus dados financeiros estão seguros?',
    answer:
      'A segurança é nossa maior prioridade. Seus dados são criptografados e armazenados com segurança. Não temos acesso às suas credenciais bancárias e seguimos as melhores práticas de segurança do mercado.',
  },
  {
    question: 'Posso usar o Caixinhas para finanças pessoais?',
    answer:
      'Com certeza! Além dos "Cofres" compartilhados, você tem sua "Conta Pessoal", um espaço totalmente privado para gerenciar suas próprias contas, despesas e "Caixinhas" individuais. A visibilidade é você quem controla.',
  },
  {
    question: 'Como a IA me ajuda a economizar?',
    answer:
      'Nossa Inteligência Artificial analisa suas receitas e despesas (de forma anônima) e gera relatórios mensais. Ela identifica seus maiores gastos, aponta oportunidades de economia e te dá dicas personalizadas para alcançar suas metas mais rápido.',
  },
  {
    question: 'Preciso conectar minha conta bancária?',
    answer:
      'Não é obrigatório. Você pode adicionar todas as suas transações manualmente para ter controle total. A conexão bancária é uma funcionalidade opcional que planejamos oferecer no futuro para automatizar o processo.',
  },
  {
    question: 'O que acontece se eu terminar meu relacionamento?',
    answer:
      'Finanças podem ser complicadas. No Caixinhas, você tem controle. O proprietário do "Cofre" pode remover membros ou transferir a propriedade. As contas e caixinhas dentro de um cofre podem ser gerenciadas de acordo com o que o casal decidir, e suas finanças pessoais permanecem sempre privadas.',
  },
];

export function Faq() {
  return (
    <section id="faq" className="container py-20 sm:py-32">
      <div className="mx-auto max-w-4xl">
        <div className="text-center">
          <p className="font-bold uppercase text-primary">Suporte</p>
          <h2 className="mt-2 font-headline text-4xl font-bold">
            Perguntas Frequentes
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Tire suas dúvidas sobre como o Caixinhas pode transformar a vida
            financeira do casal.
          </p>
        </div>

        <Accordion type="single" collapsible className="mt-12 w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index + 1}`}>
              <AccordionTrigger className="text-left text-lg hover:no-underline">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-base text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}