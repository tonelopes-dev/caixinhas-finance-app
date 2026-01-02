import Link from 'next/link';
import { ArrowLeft, Shield, Eye, Lock, Database, UserCheck, FileText, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header Section */}
        <div className="flex items-center gap-4 mb-8">
          <Button asChild variant="ghost" size="sm" className="hover:bg-primary/10">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Link>
          </Button>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Shield className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent mb-4">
            Política de Privacidade
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Seu direito à privacidade e proteção de dados é nossa prioridade
          </p>
          <Badge variant="outline" className="mt-4">
            <FileText className="w-3 h-3 mr-1" />
            Atualizado em 2 de Janeiro de 2025
          </Badge>
        </div>

        {/* Quick Summary Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="border-primary/20 hover:border-primary/40 transition-colors">
            <CardContent className="p-6 text-center">
              <Lock className="h-8 w-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Segurança de Dados</h3>
              <p className="text-sm text-muted-foreground">
                Criptografia de ponta a ponta e armazenamento seguro
              </p>
            </CardContent>
          </Card>
          <Card className="border-primary/20 hover:border-primary/40 transition-colors">
            <CardContent className="p-6 text-center">
              <Eye className="h-8 w-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Transparência Total</h3>
              <p className="text-sm text-muted-foreground">
                Você sempre sabe o que fazemos com seus dados
              </p>
            </CardContent>
          </Card>
          <Card className="border-primary/20 hover:border-primary/40 transition-colors">
            <CardContent className="p-6 text-center">
              <UserCheck className="h-8 w-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Seus Direitos LGPD</h3>
              <p className="text-sm text-muted-foreground">
                Controle total sobre seus dados pessoais
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card className="border-primary/20">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Shield className="h-6 w-6 text-primary" />
              Política de Privacidade Completa
            </CardTitle>
            <CardDescription className="text-base">
              Como coletamos, usamos e protegemos suas informações
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="max-h-[600px] overflow-y-auto space-y-8 text-base leading-relaxed">
              {/* Introduction */}
                <div className="bg-gradient-to-r from-primary/5 to-accent/5 p-6 rounded-lg border border-primary/20">
                  <h2 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Introdução
                  </h2>
                  <p className="text-foreground mb-3">
                    A presente Política de Privacidade se aplica ao uso da plataforma <strong>Caixinhas</strong>, 
                    um aplicativo de gestão financeira pessoal e compartilhada. Estamos comprometidos com a 
                    proteção de seus dados pessoais em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018) 
                    e demais regulamentações aplicáveis.
                  </p>
                  <p className="text-foreground">
                    Ao utilizar nossos serviços, você consente com a coleta, uso e armazenamento de suas 
                    informações conforme descrito nesta política.
                  </p>
                </div>

                {/* Section 1 */}
                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Database className="h-5 w-5 text-primary" />
                    1. Dados que Coletamos
                  </h2>
                  
                  <div className="space-y-4 pl-4">
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">1.1 Dados de Cadastro</h3>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        <li>Nome completo</li>
                        <li>Endereço de e-mail</li>
                        <li>Senha (armazenada de forma criptografada)</li>
                        <li>Foto de perfil (opcional)</li>
                        <li>Informações de autenticação via Google OAuth (quando aplicável)</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-semibold text-foreground mb-2">1.2 Dados Financeiros</h3>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        <li>Transações financeiras (receitas e despesas)</li>
                        <li>Categorias e descrições de transações</li>
                        <li>Metas e objetivos financeiros</li>
                        <li>Contas bancárias cadastradas (nome e saldo, sem dados de acesso)</li>
                        <li>Cofres financeiros e suas configurações</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-semibold text-foreground mb-2">1.3 Dados de Uso</h3>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        <li>Endereço IP</li>
                        <li>Tipo de navegador e dispositivo</li>
                        <li>Sistema operacional</li>
                        <li>Páginas visitadas e tempo de navegação</li>
                        <li>Logs de acesso e ações realizadas</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-semibold text-foreground mb-2">1.4 Dados de Comunicação</h3>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        <li>E-mails trocados com nosso suporte</li>
                        <li>Mensagens enviadas através do sistema</li>
                        <li>Notificações e preferências de comunicação</li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* Section 2 */}
                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Eye className="h-5 w-5 text-primary" />
                    2. Como Usamos Seus Dados
                  </h2>
                  
                  <div className="space-y-3 pl-4">
                    <p className="text-muted-foreground">
                      <strong className="text-foreground">2.1 Prestação de Serviços:</strong> Para fornecer, 
                      manter e melhorar as funcionalidades do aplicativo, incluindo gestão de transações, 
                      relatórios e insights financeiros.
                    </p>
                    
                    <p className="text-muted-foreground">
                      <strong className="text-foreground">2.2 Autenticação e Segurança:</strong> Para verificar 
                      sua identidade, proteger sua conta contra acessos não autorizados e prevenir fraudes.
                    </p>
                    
                    <p className="text-muted-foreground">
                      <strong className="text-foreground">2.3 Comunicação:</strong> Para enviar notificações 
                      importantes sobre sua conta, atualizações de serviço, convites de cofres compartilhados 
                      e responder às suas solicitações de suporte.
                    </p>
                    
                    <p className="text-muted-foreground">
                      <strong className="text-foreground">2.4 Análise e Melhoria:</strong> Para analisar 
                      padrões de uso, identificar problemas técnicos e melhorar a experiência do usuário.
                    </p>
                    
                    <p className="text-muted-foreground">
                      <strong className="text-foreground">2.5 Cumprimento Legal:</strong> Para cumprir 
                      obrigações legais, regulatórias ou ordens judiciais.
                    </p>
                  </div>
                </section>

                {/* Section 3 */}
                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Lock className="h-5 w-5 text-primary" />
                    3. Compartilhamento de Dados
                  </h2>
                  
                  <div className="space-y-3 pl-4">
                    <p className="text-muted-foreground">
                      <strong className="text-foreground">3.1 Cofres Compartilhados:</strong> Quando você 
                      criar ou participar de um cofre compartilhado, as informações financeiras desse cofre 
                      serão visíveis para todos os membros autorizados.
                    </p>
                    
                    <p className="text-muted-foreground">
                      <strong className="text-foreground">3.2 Provedores de Serviços:</strong> Compartilhamos 
                      dados com prestadores de serviços terceirizados que nos auxiliam na operação da plataforma:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground pl-4">
                      <li><strong>Neon PostgreSQL (AWS):</strong> Armazenamento de banco de dados</li>
                      <li><strong>Amazon S3:</strong> Armazenamento de imagens e arquivos</li>
                      <li><strong>SendGrid:</strong> Envio de e-mails transacionais</li>
                      <li><strong>Google OAuth:</strong> Autenticação de usuários</li>
                      <li><strong>Google Gemini AI:</strong> Processamento de insights financeiros</li>
                    </ul>
                    
                    <p className="text-muted-foreground">
                      <strong className="text-foreground">3.3 Requisitos Legais:</strong> Podemos divulgar 
                      suas informações se exigido por lei ou para proteger nossos direitos legais.
                    </p>
                    
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 mt-4">
                      <p className="text-foreground flex items-start gap-2">
                        <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                        <span>
                          <strong>Importante:</strong> Nunca vendemos, alugamos ou comercializamos seus dados 
                          pessoais para terceiros para fins de marketing.
                        </span>
                      </p>
                    </div>
                  </div>
                </section>

                {/* Section 4 */}
                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    4. Segurança dos Dados
                  </h2>
                  
                  <div className="space-y-3 pl-4">
                    <p className="text-muted-foreground">
                      Implementamos medidas técnicas e organizacionais adequadas para proteger seus dados:
                    </p>
                    
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                      <li><strong className="text-foreground">Criptografia:</strong> Todas as senhas são criptografadas usando bcrypt</li>
                      <li><strong className="text-foreground">HTTPS:</strong> Comunicação segura via SSL/TLS em todas as transmissões</li>
                      <li><strong className="text-foreground">Autenticação Segura:</strong> NextAuth.js com tokens JWT</li>
                      <li><strong className="text-foreground">Controle de Acesso:</strong> Sistema robusto de permissões e roles</li>
                      <li><strong className="text-foreground">Backup Regular:</strong> Cópias de segurança automáticas</li>
                      <li><strong className="text-foreground">Monitoramento:</strong> Logs de segurança e detecção de anomalias</li>
                    </ul>
                    
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mt-4">
                      <p className="text-muted-foreground">
                        <strong className="text-foreground">Nota:</strong> Embora implementemos as melhores 
                        práticas de segurança, nenhum sistema é 100% seguro. Recomendamos usar senhas fortes 
                        e únicas para sua conta.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Section 5 */}
                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                    <UserCheck className="h-5 w-5 text-primary" />
                    5. Seus Direitos (LGPD)
                  </h2>
                  
                  <div className="space-y-3 pl-4">
                    <p className="text-muted-foreground mb-3">
                      De acordo com a LGPD, você possui os seguintes direitos sobre seus dados pessoais:
                    </p>
                    
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                      <li><strong className="text-foreground">Confirmação e Acesso:</strong> Confirmar a existência de tratamento e acessar seus dados</li>
                      <li><strong className="text-foreground">Correção:</strong> Solicitar correção de dados incompletos, inexatos ou desatualizados</li>
                      <li><strong className="text-foreground">Anonimização ou Bloqueio:</strong> Requerer anonimização ou bloqueio de dados desnecessários</li>
                      <li><strong className="text-foreground">Eliminação:</strong> Solicitar eliminação de dados tratados com seu consentimento</li>
                      <li><strong className="text-foreground">Portabilidade:</strong> Requisitar portabilidade de seus dados a outro fornecedor</li>
                      <li><strong className="text-foreground">Informação:</strong> Obter informações sobre entidades com as quais compartilhamos dados</li>
                      <li><strong className="text-foreground">Revogação:</strong> Revogar seu consentimento a qualquer momento</li>
                      <li><strong className="text-foreground">Oposição:</strong> Se opor ao tratamento realizado com base em dispensa de consentimento</li>
                    </ul>
                    
                    <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mt-4">
                      <p className="text-foreground">
                        <strong>Para exercer seus direitos, entre em contato através do e-mail:</strong>
                        <br />
                        <a href="mailto:suporte@caixinhas.app" className="text-primary hover:underline">
                          suporte@caixinhas.app
                        </a>
                      </p>
                    </div>
                  </div>
                </section>

                {/* Section 6 */}
                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-4">
                    6. Cookies e Tecnologias Similares
                  </h2>
                  
                  <div className="space-y-3 pl-4">
                    <p className="text-muted-foreground">
                      Utilizamos cookies e tecnologias similares para:
                    </p>
                    
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Manter você autenticado em sua conta</li>
                      <li>Lembrar suas preferências e configurações</li>
                      <li>Analisar o desempenho da plataforma</li>
                      <li>Melhorar a experiência do usuário</li>
                    </ul>
                    
                    <p className="text-muted-foreground mt-3">
                      Você pode gerenciar cookies através das configurações do seu navegador, mas isso pode 
                      afetar algumas funcionalidades do aplicativo.
                    </p>
                  </div>
                </section>

                {/* Section 7 */}
                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-4">
                    7. Retenção de Dados
                  </h2>
                  
                  <div className="space-y-3 pl-4">
                    <p className="text-muted-foreground">
                      Mantemos seus dados pessoais pelo tempo necessário para:
                    </p>
                    
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Fornecer nossos serviços</li>
                      <li>Cumprir obrigações legais e regulatórias</li>
                      <li>Resolver disputas e fazer cumprir acordos</li>
                    </ul>
                    
                    <p className="text-muted-foreground mt-3">
                      Quando você solicitar a exclusão de sua conta, seus dados pessoais serão removidos 
                      de nossos sistemas ativos dentro de 30 dias, exceto quando exigido legalmente manter 
                      cópias por período maior.
                    </p>
                  </div>
                </section>

                {/* Section 8 */}
                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-4">
                    8. Menores de Idade
                  </h2>
                  
                  <div className="space-y-3 pl-4">
                    <p className="text-muted-foreground">
                      Nossos serviços são destinados a pessoas com 18 anos ou mais. Não coletamos 
                      intencionalmente dados de menores de 18 anos. Se tomarmos conhecimento de que 
                      coletamos dados de um menor, tomaremos medidas para excluir essas informações.
                    </p>
                  </div>
                </section>

                {/* Section 9 */}
                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-4">
                    9. Transferência Internacional de Dados
                  </h2>
                  
                  <div className="space-y-3 pl-4">
                    <p className="text-muted-foreground">
                      Seus dados podem ser armazenados e processados em servidores localizados fora do Brasil, 
                      especificamente na região AWS us-east-1 (Estados Unidos) e sa-east-1 (São Paulo). 
                      Garantimos que essas transferências atendam aos requisitos da LGPD e que os provedores 
                      mantenham níveis adequados de proteção de dados.
                    </p>
                  </div>
                </section>

                {/* Section 10 */}
                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-4">
                    10. Alterações na Política de Privacidade
                  </h2>
                  
                  <div className="space-y-3 pl-4">
                    <p className="text-muted-foreground">
                      Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos você 
                      sobre alterações significativas através de:
                    </p>
                    
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>E-mail para o endereço cadastrado</li>
                      <li>Notificação dentro do aplicativo</li>
                      <li>Aviso em nossa página inicial</li>
                    </ul>
                    
                    <p className="text-muted-foreground mt-3">
                      A data da última atualização será sempre indicada no topo desta página.
                    </p>
                  </div>
                </section>

                {/* Section 11 */}
                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-4">
                    11. Contato
                  </h2>
                  
                  <div className="space-y-3 pl-4">
                    <p className="text-muted-foreground mb-3">
                      Para questões sobre esta Política de Privacidade ou sobre o tratamento de seus dados:
                    </p>
                    
                    <div className="bg-gradient-to-r from-primary/5 to-accent/5 p-4 rounded-lg border border-primary/20">
                      <p className="text-foreground font-semibold mb-2">Caixinhas - Gestão Financeira</p>
                      <p className="text-muted-foreground">
                        <strong>E-mail:</strong> <a href="mailto:suporte@caixinhas.app" className="text-primary hover:underline">suporte@caixinhas.app</a>
                      </p>
                      <p className="text-muted-foreground">
                        <strong>Website:</strong> <a href="https://caixinhas.app" className="text-primary hover:underline">https://caixinhas.app</a>
                      </p>
                    </div>
                  </div>
                </section>

                {/* Final Notice */}
                <div className="bg-gradient-to-r from-primary/5 to-accent/5 p-6 rounded-lg border border-primary/20 mt-8">
                  <p className="text-foreground text-center">
                    <strong>Ao utilizar o Caixinhas, você declara ter lido e concordado com esta Política de Privacidade.</strong>
                  </p>
                  <p className="text-muted-foreground text-center text-sm mt-2">
                    Última atualização: 2 de Janeiro de 2025
                  </p>
                </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
            <Link href="/register">
              Criar Conta
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/terms">
              Ver Termos de Serviço
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
