'use client';

import { DashboardBackground } from '@/components/dashboard/dashboard-background';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { StandardBackButton } from '@/components/ui/standard-back-button';
import { motion } from 'framer-motion';
import { Building2, Edit, FileText, HelpCircle, PiggyBank, PlusCircle, User, UserPlus, Wallet } from 'lucide-react';

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
    <DashboardBackground>
      <div className="container max-w-4xl mx-auto py-12 px-6">
        <div className="mb-12">
          <StandardBackButton href="/vaults" label="Voltar para Início" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-12"
        >
          {/* Header Section */}
          <div className="text-center space-y-4">
            <h1 className="text-5xl md:text-7xl font-headline font-bold text-[#2D241E] italic tracking-tight leading-tight">
              Como usar o <span className="text-[#ff6b7b]">Caixinhas?</span> 🎯
            </h1>
            <p className="text-xl md:text-2xl text-[#2D241E]/60 font-medium italic max-w-2xl mx-auto">
              Tudo explicado de um jeito super fácil! Se você tem dúvidas, é só clicar nas perguntas abaixo.
            </p>
          </div>

          {/* FAQ Section */}
          <div className="bg-white/40 backdrop-blur-3xl rounded-[40px] border border-white/40 shadow-2xl p-8 md:p-12">
            <Accordion type="single" collapsible className="w-full space-y-4">
                {tutorialSteps.map((step, index) => (
                    <AccordionItem 
                      value={`item-${index + 1}`} 
                      key={index}
                      className="border-b border-[#2D241E]/5 last:border-0"
                    >
                        <AccordionTrigger className="hover:no-underline group">
                            <div className='flex items-center gap-5 text-left transition-transform group-data-[state=open]:scale-[1.02]'>
                                <div className="p-3 rounded-2xl bg-white/60 shadow-sm border border-white group-data-[state=open]:bg-[#ff6b7b] group-data-[state=open]:text-white transition-colors duration-300">
                                  <step.icon className="h-6 w-6" />
                                </div>
                                <span className='text-xl md:text-2xl font-headline font-bold text-[#2D241E] italic group-hover:text-[#ff6b7b] transition-colors'>
                                  {step.trigger}
                                </span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className='pl-20 text-lg md:text-xl text-[#2D241E]/70 font-medium italic leading-relaxed pb-8'>
                          {step.content}
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
          </div>
        </motion.div>
      </div>
    </DashboardBackground>
  );
}
