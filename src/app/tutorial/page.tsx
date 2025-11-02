
import Link from 'next/link';
import { ArrowLeft, PiggyBank, PlusCircle, UserPlus, FileText, Paintbrush, Edit, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const tutorialSteps = [
    {
      trigger: "O que é uma 'Caixinha'?",
      content: "Imagine um cofrinho para cada sonho! Você cria uma 'Caixinha' para juntar dinheiro para uma viagem, um presente ou qualquer outra coisa que queira muito. É como dar um nome e um rosto para a sua economia!",
      icon: PiggyBank
    },
    {
      trigger: "Como coloco dinheiro na minha caixinha?",
      content: "É fácil! Na tela inicial, clique em 'Adicionar' na parte de transações. Diga quanto dinheiro entrou ou saiu e de onde. Se o dinheiro foi para uma caixinha, ela vai crescer!",
      icon: PlusCircle
    },
    {
      trigger: "Posso chamar alguém para sonhar comigo?",
      content: "Sim! Clique em 'Convidar' para chamar seu parceiro(a) ou amigos para o seu cofre. Assim, vocês podem juntar dinheiro e ver o progresso dos sonhos em conjunto.",
      icon: UserPlus
    },
    {
      trigger: "Como vejo o resumo dos meus gastos?",
      content: "Vá para a página de 'Relatórios'. Lá, nossa mágica acontece e transformamos seus números em um resumo fácil de entender, mostrando para onde seu dinheiro foi no mês.",
      icon: FileText
    },
    {
      trigger: "Posso deixar o app com a minha cor favorita?",
      content: "Claro! Clique na sua foto de perfil para abrir o menu e procure por 'Tema'. Você pode escolher a cor de fundo e a cor de destaque que mais gostar.",
      icon: Paintbrush
    },
    {
      trigger: "Onde arrumo minhas contas e categorias?",
      content: "No seu 'Perfil' (clicando na sua foto), você pode organizar suas contas do banco e também criar ou mudar os nomes das suas categorias de gastos, como 'Comida' ou 'Passeio'.",
      icon: Edit,
    },
  ];

export default function TutorialPage() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-background p-4">
      <div className="w-full max-w-2xl">
        <Button asChild variant="ghost" className="mb-4">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para o Painel
          </Link>
        </Button>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-2xl">
              Como o DreamVault funciona?
            </CardTitle>
            <CardDescription>
              Tudo o que você precisa saber para começar a realizar seus sonhos, explicado do jeito mais fácil!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
                {tutorialSteps.map((step, index) => (
                    <AccordionItem value={`item-${index + 1}`} key={index}>
                        <AccordionTrigger>
                            <div className='flex items-center gap-3'>
                                <step.icon className="h-5 w-5 text-primary" />
                                <span className='text-left'>{step.trigger}</span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className='pl-11 text-base'>
                        {step.content}
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
