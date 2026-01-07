
import { PiggyBank, PlusCircle, UserPlus, FileText, Paintbrush, Edit, Wallet, Building2, User, HelpCircle } from 'lucide-react';
import { BackToDashboard } from '@/components/ui/back-to-dashboard';
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
      trigger: "O que é o Caixinhas?",
      content: "O Caixinhas é como um cofrinho mágico que te ajuda a guardar dinheiro para realizar seus sonhos! Quer comprar algo especial? Fazer uma viagem? Juntar dinheiro com seu amor? O Caixinhas organiza tudo de um jeito super fácil de entender.",
      icon: HelpCircle
    },
    {
      trigger: "O que é um 'Cofre'?",
      content: "Imagine um cofre de verdade onde você guarda seu dinheiro. Aqui é a mesma coisa! Você tem sua 'Conta Pessoal' (seu cofre privado) e pode criar 'Cofres Compartilhados' com outras pessoas (como seu namorado, namorada ou família) para juntar dinheiro juntos. Cada cofre tem seu próprio nome e foto!",
      icon: Wallet
    },
    {
      trigger: "O que é uma 'Caixinha'?",
      content: "Uma Caixinha é um potinho especial dentro do seu cofre. Cada potinho é para um sonho diferente! Por exemplo: 'Caixinha da Viagem' 🏖️, 'Caixinha do Celular Novo' 📱, 'Caixinha da Festa' 🎉. Você coloca um emoji, diz quanto precisa guardar, e o app mostra quanto falta para conseguir!",
      icon: PiggyBank
    },
    {
      trigger: "Como criar minha primeira Caixinha?",
      content: "Fácil! Vá na página 'Caixinhas' e clique no botão verde 'Criar Caixinha'. Escolha um nome legal (tipo 'Meu Videogame Novo'), coloque um emoji divertido 🎮, diga quanto dinheiro você precisa, e pronto! Sua primeira caixinha está criada!",
      icon: PlusCircle
    },
    {
      trigger: "Como colocar dinheiro na Caixinha?",
      content: "Quando você tem dinheiro para guardar, é só clicar na sua caixinha e no botão 'Adicionar Dinheiro'. Digite quanto você quer colocar (tipo R$ 50) e confirma. O app vai mostrar uma barrinha de progresso crescendo! Quando a barra encher, você conseguiu seu objetivo! 🎯",
      icon: PlusCircle
    },
    {
      trigger: "Posso ter Caixinhas privadas e compartilhadas?",
      content: "Sim! Quando você cria uma caixinha, pode escolher: 'Privada' significa que só você vê (tipo seu desejo de aniversário secreto 🎁). 'Compartilhada' significa que todo mundo do cofre pode ver e ajudar a juntar dinheiro (tipo a viagem da família ✈️).",
      icon: User
    },
    {
      trigger: "Como convidar alguém para o app?",
      content: "Quer juntar dinheiro com alguém? Vai no painel principal e clica em 'Convidar'. Escreve o email da pessoa (tipo: maria@email.com) e ela vai receber um convite no email dela. Quando ela aceitar, vocês podem criar um cofre juntos e fazer caixinhas compartilhadas!",
      icon: UserPlus
    },
    {
      trigger: "O que fazer primeiro no Caixinhas?",
      content: "Comece assim: 1️⃣ Configure suas contas de banco no seu Perfil (clica na sua foto). 2️⃣ Crie sua primeira Caixinha com um sonho que você tem. 3️⃣ Comece a registrar quando você gasta ou guarda dinheiro. 4️⃣ Veja a mágica acontecer quando a barra de progresso crescer!",
      icon: Building2
    },
    {
      trigger: "O que são os Relatórios de IA?",
      content: "A nossa Inteligência Artificial é como um assistente super inteligente! Ela olha todo o dinheiro que você gastou e guardou, e te conta uma história fácil de entender: 'Você gastou muito com comida esse mês' ou 'Você está guardando super bem para sua viagem!'. Vai em 'Relatórios' e clica em 'Gerar Relatório' para ver a mágica!",
      icon: FileText
    },
    {
      trigger: "Posso personalizar minhas categorias de gastos?",
      content: "Claro! Todo mundo gasta dinheiro com coisas diferentes. Vai no seu 'Perfil', depois em 'Categorias de Despesa', e cria as categorias que fazem sentido pra você. Tipo: 'Videogames', 'Doces', 'Cinema', ou o que você quiser!",
      icon: Edit
    },
    {
      trigger: "Como favoritar uma Caixinha?",
      content: "Tem uma caixinha super importante pra você? Clica no coraçãozinho ❤️ nela! As caixinhas favoritas aparecem em destaque no seu painel principal, assim você sempre vê como está seu sonho mais importante!",
      icon: PiggyBank
    },
    {
      trigger: "O que é a diferença entre Entrada e Saída?",
      content: "'Entrada' é dinheiro que CHEGA para você (seu mesadinha, um presente, seu salário). 'Saída' é dinheiro que SAI do seu bolso (quando você compra algo, paga uma conta). Registrar tudo isso ajuda você a entender para onde seu dinheiro está indo!",
      icon: Wallet
    },
  ];

export default function TutorialPage() {
  return (
    <div className="flex min-h-[calc(100vh-theme(spacing.16))] flex-1 flex-col gap-4 p-4 md:gap-8 md:p-10">
      <div className="mx-auto w-full max-w-2xl">
        <BackToDashboard className="mb-4" />
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-2xl">
              Como usar o Caixinhas? 🎯
            </CardTitle>
            <CardDescription>
              Tudo explicado de um jeito super fácil! Se você tem dúvidas, é só clicar nas perguntas abaixo.
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
