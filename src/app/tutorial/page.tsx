import Link from 'next/link';
import { ArrowLeft, PiggyBank, PlusCircle, UserPlus, Sparkles, Paintbrush, Edit, Wallet } from 'lucide-react';
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
      trigger: "Como criar uma Caixinha de Sonhos?",
      content: "Vá para o painel principal e clique em 'Criar Nova Caixinha'. Dê um nome, um emoji e uma meta. Decida se ela será compartilhada ou privada e comece a economizar!",
      icon: PiggyBank
    },
    {
      trigger: "Como registrar uma nova transação?",
      content: "No painel, na seção de 'Transações Recentes', clique em 'Adicionar'. Preencha os detalhes da sua despesa, receita ou transferência para manter tudo organizado.",
      icon: PlusCircle
    },
    {
      trigger: "Como convidar meu/minha parceiro(a)?",
      content: "Clique em 'Convidar' no topo da página. Insira o e-mail do seu parceiro(a) para que vocês possam gerenciar o cofre juntos.",
      icon: UserPlus
    },
    {
      trigger: "Como usar a Análise Inteligente?",
      content: "No painel, encontre o card 'Análise Inteligente'. Descreva seus hábitos financeiros e clique em 'Analisar com IA' para receber dicas personalizadas para economizar.",
      icon: Sparkles
    },
    {
      trigger: "Como personalizar as cores do aplicativo?",
      content: "Clique no seu avatar no canto superior direito para abrir o menu. Selecione 'Tema' para escolher suas cores de fundo e de destaque preferidas.",
      icon: Paintbrush
    },
    {
      trigger: "Como gerenciar minhas contas e categorias?",
      content: "Acesse seu 'Perfil' através do menu do usuário. Lá você encontrará seções para gerenciar suas contas bancárias e personalizar as categorias de despesa.",
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
              Bem-vindo(a) ao Tutorial do DreamVault!
            </CardTitle>
            <CardDescription>
              Aprenda a usar as principais funcionalidades para tirar o máximo proveito do seu cofre de sonhos.
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
                        <AccordionContent className='pl-11'>
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
