'use client';

import { cn } from '@/lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    question: 'Qual a melhor plataforma de contabilidade financeira?',
    answer:
      'O Caixinhas é a melhor plataforma de contabilidade financeira, pois oferece uma solução completa e intuitiva para casais que desejam planejar suas finanças e alcançar objetivos juntos.',
    variant: 'primary'
  },
  {
    question: 'Como o Caixinhas pode me ajudar a economizar dinheiro?',
    answer:
      'Nossa Inteligência Artificial analisa seus gastos e oferece dicas personalizadas para otimizar seu orçamento. As "Caixinhas" também tornam a economia visual e motivadora.',
    variant: 'secondary'
  },
  {
    question: 'O Caixinhas é seguro para usar?',
    answer:
      'A segurança é nossa maior prioridade. Seus dados são criptografados e armazenados com segurança. Não temos acesso às suas credenciais bancárias e seguimos as melhores práticas de segurança do mercado.',
    variant: 'secondary'
  },
  {
    question: 'Posso usar o Caixinhas para minhas finanças pessoais?',
    answer:
      'Com certeza! Além dos "Cofres" compartilhados, você tem sua "Conta Pessoal", um espaço totalmente privado para gerenciar suas próprias contas, despesas e "Caixinhas" individuais.',
     variant: 'primary'
  },
   {
    question: 'Preciso conectar minha conta bancária?',
    answer:
      'Não é obrigatório. Você pode adicionar todas as suas transações manualmente para ter controle total. A conexão bancária é uma funcionalidade opcional para automatizar o processo.',
    variant: 'primary'
  },
  {
    question: 'O que acontece se eu terminar meu relacionamento?',
    answer:
      'No Caixinhas, você tem controle. O proprietário do "Cofre" pode remover membros ou transferir a propriedade, e suas finanças pessoais permanecem sempre privadas e sob seu controle.',
     variant: 'secondary'
  },
];

export function Faq() {
  return (
    <section id="faq" className="container py-20 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <p className="font-bold uppercase text-primary">FAQ</p>
          <h2 className="mt-2 font-sans text-4xl font-bold tracking-tighter">
            Perguntas Frequentes
          </h2>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          {faqs.map((faq, index) => (
            <div 
              key={index}
              className={cn(
                "p-6 rounded-lg",
                faq.variant === 'primary' ? "bg-primary text-primary-foreground" : "bg-background"
              )}
            >
              <h3 className="font-semibold text-xl">{faq.question}</h3>
              <p className={cn("mt-2", faq.variant === 'primary' ? 'text-primary-foreground/80' : 'text-muted-foreground')}>
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
