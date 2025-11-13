
import Link from 'next/link';
import { ArrowLeft, PiggyBank, PlusCircle, UserPlus, FileText, Paintbrush, Edit, Wallet, Building2, User, HelpCircle } from 'lucide-react';
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
      trigger: "Qual a diferença entre 'Minha Conta' e um 'Cofre'?",
      content: "Pense assim: 'Minha Conta Pessoal' é a sua carteira, só sua! Já um 'Cofre' é um cofrinho compartilhado, como o 'Família DevNutri'. Quando você convida alguém, vocês criam um cofre para juntar dinheiro para sonhos em comum, como uma reforma ou uma viagem. As coisas no cofre são de vocês, e as coisas na sua conta pessoal são só suas.",
      icon: HelpCircle
    },
    {
      trigger: "O que é uma 'Caixinha' e como funciona?",
      content: "Uma 'Caixinha' é um potinho de dinheiro para cada sonho. Quer comprar um videogame? Crie a 'Caixinha do Videogame'. Querem viajar? Criem a 'Caixinha da Viagem'. Ela te ajuda a ver o quão perto você está de cada objetivo! Você pode criar uma caixinha 'Privada' (só você vê) ou 'Compartilhada' (todos no cofre veem e podem ajudar).",
      icon: PiggyBank
    },
    {
      trigger: "Como faço o dinheiro 'entrar' na minha caixinha?",
      content: "É como mover dinheiro de um bolso para o outro! Clique em 'Adicionar' e escolha 'Transferência'. No campo 'Origem', escolha de onde o dinheiro está saindo (ex: sua conta do banco). No campo 'Destino', escolha a sua caixinha. Pronto! O dinheiro 'entrou' no seu sonho.",
      icon: PlusCircle
    },
     {
      trigger: "Para que servem os tipos 'Entrada' e 'Saída'?",
      content: "Use 'Entrada' para registrar todo dinheiro que chega (como seu salário ou um presente). Use 'Saída' para registrar tudo o que você gasta (como um lanche ou a conta de luz). Manter isso organizado é o segredo para os relatórios mágicos da nossa IA!",
      icon: Wallet
    },
    {
      trigger: "Como chamo meu parceiro(a) para o aplicativo?",
      content: "É muito fácil! No painel principal, clique em 'Convidar'. Digite o e-mail da pessoa e ela receberá um convite especial. Depois que ela aceitar, vocês podem criar um 'Cofre Compartilhado' para planejar e conquistar juntos.",
      icon: UserPlus
    },
    {
      trigger: "Como os Relatórios de IA me ajudam?",
      content: "Você nos diz para onde o dinheiro foi, e a nossa IA te conta a história! Na página de 'Relatórios', escolha um mês e um ano e clique em 'Gerar'. A IA vai analisar tudo e te entregar um resumo super fácil de ler, com dicas para economizar mais e realizar seus sonhos mais rápido.",
      icon: FileText
    },
     {
      trigger: "Onde eu configuro minhas contas e cartões?",
      content: "Deixar tudo organizado é o primeiro passo. Vá em 'Perfil' (clicando na sua foto) e procure por 'Contas e Cartões'. Lá você pode adicionar suas contas do banco e cartões de crédito. Isso ajuda na hora de registrar de onde o dinheiro saiu ou para onde ele foi.",
      icon: Building2
    },
    {
      trigger: "Posso criar minhas próprias categorias de gastos?",
      content: "Com certeza! Se você não encontrar uma categoria que combine com seu gasto, vá em 'Perfil' e depois em 'Categorias de Despesa'. Lá você pode criar, editar ou apagar as categorias para que o aplicativo fique com a sua cara.",
      icon: Edit
    },
  ];

export default function TutorialPage() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-background p-4">
      <div className="w-full max-w-2xl">
        <Button asChild variant="ghost" className="mb-4">
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para o Painel
          </Link>
        </Button>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-2xl">
              Como o Caixinhas funciona?
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
