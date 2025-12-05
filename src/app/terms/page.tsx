import Link from 'next/link';
import { ArrowLeft, Shield, FileText, Scale, Users, Lock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header Section */}
        <div className="flex items-center gap-4 mb-8">
          <Button asChild variant="ghost" size="sm" className="hover:bg-primary/10">
            <Link href="/register">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para o Cadastro
            </Link>
          </Button>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Scale className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent mb-4">
            Termos de Serviço
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Transparência e segurança jurídica para sua experiência no Caixinhas
          </p>
          <Badge variant="outline" className="mt-4">
            <FileText className="w-3 h-3 mr-1" />
            Atualizado em 5 de Dezembro de 2025
          </Badge>
        </div>

        {/* Quick Summary Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="border-primary/20 hover:border-primary/40 transition-colors">
            <CardContent className="p-6 text-center">
              <Shield className="h-8 w-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Proteção de Dados</h3>
              <p className="text-sm text-muted-foreground">
                Suas informações financeiras são protegidas com criptografia de nível bancário
              </p>
            </CardContent>
          </Card>
          <Card className="border-primary/20 hover:border-primary/40 transition-colors">
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Uso Responsável</h3>
              <p className="text-sm text-muted-foreground">
                Ferramenta projetada para fortalecer relacionamentos através da transparência financeira
              </p>
            </CardContent>
          </Card>
          <Card className="border-primary/20 hover:border-primary/40 transition-colors">
            <CardContent className="p-6 text-center">
              <AlertCircle className="h-8 w-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Transparência Total</h3>
              <p className="text-sm text-muted-foreground">
                Termos claros e diretos, sem letras miúdas ou armadilhas contratuais
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card className="border-primary/20">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <FileText className="h-6 w-6 text-primary" />
              Termos de Serviço Completos
            </CardTitle>
            <CardDescription className="text-base">
              Leia com atenção os termos que regem o uso da plataforma Caixinhas
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[600px] px-6 py-4">
              <div className="space-y-8 text-base leading-relaxed">
                {/* Introduction */}
                <div className="bg-gradient-to-r from-primary/5 to-accent/5 p-6 rounded-lg border border-primary/20">
                  <h2 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Bem-vindo ao Caixinhas
                  </h2>
                  <p className="text-foreground">
                    Estes Termos de Serviço estabelecem as regras para uso da plataforma Caixinhas, 
                    uma solução inovadora para gestão financeira compartilhada entre casais. 
                    Ao utilizar nossos serviços, você concorda com todos os termos aqui estabelecidos.
                  </p>
                </div>

                <Separator className="my-6" />

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">1</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        Aceitação e Validade dos Termos
                      </h3>
                      <p className="text-muted-foreground">
                        Ao criar uma conta, acessar ou utilizar qualquer funcionalidade do Caixinhas, 
                        você declara ter lido, compreendido e aceito integralmente estes termos. 
                        Caso não concorde com algum item, recomendamos que não utilize a plataforma.
                      </p>
                      <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <p className="text-sm text-amber-800">
                          <strong>Importante:</strong> Estes termos constituem um acordo legal vinculante 
                          entre você e a Caixinhas Tecnologia Ltda.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">2</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        Finalidade e Uso Adequado da Plataforma
                      </h3>
                      <p className="text-muted-foreground mb-3">
                        O Caixinhas foi desenvolvido especificamente para auxiliar casais na gestão 
                        financeira compartilhada, oferecendo ferramentas para:
                      </p>
                      <ul className="space-y-2 text-muted-foreground ml-4">
                        <li className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                          Organização e categorização de despesas conjuntas
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                          Planejamento e acompanhamento de metas financeiras
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                          Criação de "cofrinhos" virtuais para objetivos específicos
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                          Relatórios e análises de gastos compartilhados
                        </li>
                      </ul>
                      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800">
                          <strong>Compromisso:</strong> Você se compromete a utilizar a plataforma 
                          apenas para fins legítimos e em conformidade com a legislação brasileira.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">3</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        Cadastro e Responsabilidades da Conta
                      </h3>
                      <p className="text-muted-foreground mb-3">
                        Para acessar os recursos completos do Caixinhas, é necessário criar uma conta 
                        fornecendo informações verdadeiras e atualizadas. Suas responsabilidades incluem:
                      </p>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="p-4 border border-primary/20 rounded-lg">
                          <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
                            <Lock className="h-4 w-4 text-primary" />
                            Segurança da Conta
                          </h4>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            <li>• Manter senha segura e confidencial</li>
                            <li>• Notificar imediatamente sobre uso não autorizado</li>
                            <li>• Fazer logout em dispositivos compartilhados</li>
                          </ul>
                        </div>
                        <div className="p-4 border border-primary/20 rounded-lg">
                          <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
                            <Users className="h-4 w-4 text-primary" />
                            Informações Precisas
                          </h4>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            <li>• Fornecer dados verdadeiros e atuais</li>
                            <li>• Manter informações de contato válidas</li>
                            <li>• Atualizar dados quando necessário</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Separator className="my-6" />

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">4</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        Proteção de Dados e Privacidade
                      </h3>
                      <p className="text-muted-foreground mb-3">
                        Levamos sua privacidade muito a sério. Todos os dados financeiros são protegidos 
                        com criptografia de nível bancário e armazenados em conformidade com a LGPD.
                      </p>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h4 className="font-medium text-green-800 mb-2">🔒 Garantias de Segurança:</h4>
                        <ul className="text-sm text-green-700 space-y-1">
                          <li>• Criptografia AES-256 para dados sensíveis</li>
                          <li>• Servidores certificados e auditados regularmente</li>
                          <li>• Acesso restrito por autenticação de dois fatores</li>
                          <li>• Conformidade total com LGPD e normas do Banco Central</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">5</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        Planos e Política de Cancelamento
                      </h3>
                      <p className="text-muted-foreground mb-3">
                        Oferecemos total flexibilidade em nossos planos de assinatura:
                      </p>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="p-4 border border-primary/20 rounded-lg">
                          <h4 className="font-medium text-foreground mb-2">💎 Plano Premium</h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            Acesso completo a todos os recursos avançados
                          </p>
                          <p className="text-sm text-green-600 font-medium">
                            Cancele a qualquer momento sem taxas
                          </p>
                        </div>
                        <div className="p-4 border border-primary/20 rounded-lg">
                          <h4 className="font-medium text-foreground mb-2">🆓 Plano Gratuito</h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            Recursos essenciais para começar
                          </p>
                          <p className="text-sm text-blue-600 font-medium">
                            Sempre disponível, sem compromissos
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">6</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        Limitações e Responsabilidades
                      </h3>
                      <p className="text-muted-foreground mb-3">
                        Embora nos esforcemos para fornecer um serviço de excelência, 
                        é importante esclarecer as limitações de responsabilidade:
                      </p>
                      <div className="p-4 border border-orange-200 bg-orange-50 rounded-lg">
                        <h4 className="font-medium text-orange-800 mb-2">⚠️ Importante Saber:</h4>
                        <ul className="text-sm text-orange-700 space-y-1">
                          <li>• O Caixinhas é uma ferramenta de organização, não consultoria financeira</li>
                          <li>• Decisões de investimento são de sua total responsabilidade</li>
                          <li>• Recomendamos sempre consultar profissionais qualificados</li>
                          <li>• Mantemos backups, mas incentivamos que você também faça os seus</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">7</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        Atualizações dos Termos
                      </h3>
                      <p className="text-muted-foreground mb-3">
                        Estes termos podem ser atualizados para refletir melhorias no serviço 
                        ou mudanças na legislação. Quando isso acontecer:
                      </p>
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <ul className="text-sm text-blue-700 space-y-1">
                          <li>• ✉️ Notificaremos por e-mail sobre mudanças significativas</li>
                          <li>• 📱 Exibiremos um aviso na plataforma</li>
                          <li>• 📅 Você terá 30 dias para revisar as alterações</li>
                          <li>• 🚪 Se não concordar, poderá cancelar sua conta sem penalidades</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">8</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        Suporte e Contato
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        Nossa equipe está sempre disponível para esclarecer dúvidas sobre estes termos 
                        ou ajudar com qualquer questão relacionada ao uso da plataforma.
                      </p>
                      
                      <div className="grid md:grid-cols-1 gap-4">
                      {/*   <Card className="p-4">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-primary/10 rounded-lg">
                              <FileText className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <h4 className="font-medium">Dúvidas Jurídicas</h4>
                              <p className="text-sm text-muted-foreground">Sobre termos e condições</p>
                            </div>
                          </div>
                          <Button asChild variant="outline" size="sm" className="w-full">
                            <Link href="mailto:juridico@caixinhas.app">
                              juridico@caixinhas.app
                            </Link>
                          </Button>
                        </Card> */}
                        
                        <Card className="p-4 ">
                          <div className="flex justify-evenly py-4"> <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-primary/10 rounded-lg">
                              <Users className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <h4 className="font-medium">Suporte Técnico</h4>
                              <p className="text-sm text-muted-foreground">Ajuda com a plataforma</p>
                            </div>
                          </div>
                           <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-primary/10 rounded-lg">
                              <FileText className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <h4 className="font-medium">Dúvidas Jurídicas</h4>
                              <p className="text-sm text-muted-foreground">Sobre termos e condições</p>
                            </div>
                          </div></div>
                         
                          <Button asChild variant="outline" size="sm" className="w-full">
                            <Link href="mailto:suporte@caixinhas.app">
                              suporte@caixinhas.app
                            </Link>
                          </Button>
                        </Card>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-12 p-6 bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg border border-primary/20">
                  <div className="text-center">
                    <h4 className="font-semibold text-foreground mb-2">
                      Caixinhas Tecnologia Ltda.
                    </h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      CNPJ: 00.000.000/0001-00 | Desenvolvido com ❤️ no Brasil
                    </p>
                    <div className="flex justify-center gap-4 text-sm">
                      <Badge variant="outline">LGPD Compliant</Badge>
                      <Badge variant="outline">ISO 27001</Badge>
                      <Badge variant="outline">SSL Certificate</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
        
        {/* Bottom Actions */}
        <div className="flex justify-center mt-8">
          <Button asChild className="px-8">
            <Link href="/register">
              Aceitar Termos e Continuar Cadastro
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
