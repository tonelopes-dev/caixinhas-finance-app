import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function TermsOfServicePage() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-background p-4">
      <div className="w-full max-w-3xl">
        <Button asChild variant="ghost" className="mb-4">
          <Link href="/register">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para o Cadastro
          </Link>
        </Button>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-2xl">
              Termos de Serviço do Caixinhas
            </CardTitle>
            <CardDescription>
              Última atualização: 11 de Novembro de 2025
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96 pr-6">
              <div className="space-y-6 text-sm text-muted-foreground">
                <p>
                  Bem-vindo ao Caixinhas! Estes Termos de Serviço ("Termos")
                  regem seu acesso e uso de nosso aplicativo e serviços
                  ("Serviço"). Ao acessar ou usar o Serviço, você concorda em
                  cumprir estes Termos.
                </p>

                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground">
                    1. Aceitação dos Termos
                  </h3>
                  <p>
                    Ao criar uma conta ou usar nosso Serviço, você confirma que
                    leu, entendeu e concorda em ficar vinculado por estes Termos.
                    Se você não concordar com estes Termos, não use o Serviço.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground">
                    2. Uso do Serviço
                  </h3>
                  <p>
                    O Caixinhas é uma plataforma projetada para ajudar casais a
                    gerenciar suas finanças e planejar objetivos compartilhados.
                    Você concorda em usar o Serviço apenas para fins lícitos e
                    de acordo com estes Termos. Você é responsável por todas as
                    atividades que ocorrem em sua conta.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground">
                    3. Contas de Usuário
                  </h3>
                  <p>
                    Para usar a maioria dos recursos do Serviço, você deve se
                    registrar e criar uma conta. Você concorda em fornecer
                    informações precisas, atuais e completas durante o processo
                    de registro. Você é responsável por proteger sua senha e por
                    qualquer uso de sua conta, autorizado ou não.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground">
                    4. Privacidade
                  </h3>
                  <p>
                    Sua privacidade é importante para nós. Nossa Política de
                    Privacidade (que deve ser criada separadamente) descreve como
                    coletamos, usamos e protegemos suas informações pessoais. Ao
                    usar nosso Serviço, você concorda com a coleta e uso de
                    informações de acordo com nossa Política de Privacidade.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground">
                    5. Rescisão
                  </h3>
                  <p>
                    Podemos suspender ou encerrar seu acesso ao Serviço a
                    qualquer momento, com ou sem justa causa, e com ou sem
                    aviso prévio. Você também pode encerrar sua conta a qualquer
                    momento, entrando em contato conosco ou através das
                    configurações da conta, se disponível.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground">
                    6. Limitação de Responsabilidade
                  </h3>
                  <p>
                    O Serviço é fornecido "como está", sem garantias de qualquer
                    tipo. Em nenhuma circunstância o Caixinhas será responsável
                    por quaisquer danos indiretos, incidentais, especiais,
                    consequenciais ou punitivos resultantes do seu acesso ou uso
                    do Serviço.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground">
                    7. Alterações nos Termos
                  </h3>
                  <p>
                    Reservamo-nos o direito de modificar estes Termos a qualquer
                    momento. Se fizermos alterações, iremos notificá-lo,
                    revisando a data no topo dos Termos. Seu uso continuado do
                    Serviço após qualquer modificação constitui sua aceitação
                    dos novos Termos.
                  </p>
                </div>
                
                 <div className="space-y-2">
                  <h3 className="font-semibold text-foreground">
                    8. Contato
                  </h3>
                  <p>
                    Se você tiver alguma dúvida sobre estes Termos, entre em
                    contato conosco em{' '}
                    <a
                      href="mailto:suporte@caixinhas.com"
                      className="text-primary underline"
                    >
                      suporte@Caixinhas.com
                    </a>
                    .
                  </p>
                </div>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
