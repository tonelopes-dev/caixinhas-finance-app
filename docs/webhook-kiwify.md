# Integração de Webhook com Kiwify

Este documento detalha o funcionamento e a implementação de um webhook para processar eventos da plataforma Kiwify, automatizando a gestão de usuários e o envio de e-mails transacionais.

## 1. Visão Geral

O objetivo deste webhook é ouvir as notificações enviadas pela Kiwify sobre eventos de compra e assinatura. Com base nesses eventos, o sistema realiza ações como:

-   Criar um novo usuário quando uma compra é aprovada.
-   Atualizar o plano e o status de assinatura de um usuário existente.
-   Enviar e-mails transacionais para cada etapa do processo (bem-vindo, pagamento recusado, assinatura cancelada, etc.).

## 2. Pré-requisitos

Antes de começar, você precisará das seguintes contas e chaves de API:

-   **Conta na Kiwify:** Para vender seus produtos e configurar o webhook.
-   **Conta na Clerk:** Para gerenciamento de autenticação e usuários.
-   **Conta na SendGrid:** Para o envio de e-mails transacionais.

**Chaves de API e Variáveis de Ambiente (.env):**

Você precisará configurar as seguintes variáveis no seu ambiente (arquivo `.env.local` em projetos Next.js):

```
# Clerk API Keys
CLERK_SECRET_KEY=sk_test_...

# SendGrid API Key
SENDGRID_API_KEY=SG....

# URL do seu app (para links em e-mails)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 3. Pacotes e Bibliotecas Necessárias

Certifique-se de que seu projeto tenha as seguintes dependências instaladas:

```bash
npm install next @clerk/nextjs @sendgrid/mail generate-password
```

-   `next`: O framework web.
-   `@clerk/nextjs`: SDK da Clerk para Next.js.
-   `@sendgrid/mail`: SDK da SendGrid para envio de e-mails.
-   `generate-password`: Para criar senhas seguras para novos usuários.

## 4. Estrutura do Código

O código principal do webhook está localizado em `app/api/webhooks/kiwify/route.ts`.

### Funções e Componentes Principais:

#### a. `POST(request: Request)`

-   Esta é a função principal que a Next.js expõe como uma API Route. Ela recebe a requisição `POST` da Kiwify.
-   Extrai o `body` da requisição (`data = await request.json()`).
-   Chama a função `isValidWebhookData(data)` para validar a estrutura dos dados.
-   Se os dados forem válidos, chama `processWebhook(data)` para executar a lógica principal.
-   Possui tratamento de erros para capturar e logar qualquer falha durante o processamento.

#### b. `isValidWebhookData(data: unknown)`

-   Uma função de validação (type guard) para garantir que os dados recebidos da Kiwify tenham a estrutura e os campos obrigatórios esperados (`order_id`, `order_status`, `Customer.email`, etc.).
-   Isso previne erros e adiciona uma camada de segurança, garantindo que o sistema processe apenas dados íntegros.

#### c. `processWebhook(data: WebhookData)`

-   O coração do webhook.
-   Utiliza um `switch` no campo `webhook_event_type` para determinar qual evento ocorreu.
-   **Eventos Tratados:**
    -   `order_approved`: Aprovação de compra.
    -   `order_rejected`: Pagamento recusado.
    -   `subscription_canceled`: Assinatura cancelada.
    -   E outros como `subscription_updated`, `payment_failed`, `subscription_renewed`, `order_refunded`.

## 5. Fluxo Detalhado: `order_approved` (Evento de Compra Aprovada)

Este é o fluxo mais complexo e crucial.

1.  **Verificar Usuário Existente:**
    -   O sistema usa o e-mail do cliente (`Customer.email`) para buscar um usuário no Clerk: `clerkClient().users.getUserList({ emailAddress: [emailCustomer] })`.

2.  **Cenário 1: Novo Usuário**
    -   Se `users.data.length === 0`, o cliente é novo.
    -   **Gerar Senha:** Uma senha segura e aleatória é criada com `generatePassword.generate()`.
    -   **Criar Usuário no Clerk:** Um novo usuário é criado com `clerkClient().users.createUser()`. Os dados incluem e-mail, nome, senha e metadados públicos (`publicMetadata`).
    -   **Metadados:** É crucial salvar o status da assinatura nos metadados do Clerk. Ex: `{ subscriptionPlan: "essential", subscriptionStatus: "active" }`. Isso permite que seu aplicativo verifique facilmente o status do usuário sem precisar consultar a Kiwify a todo momento.
    -   **Enviar E-mail de Boas-Vindas:** Um e-mail é enviado via SendGrid (`sendEmail`) contendo o e-mail de login e a senha gerada, instruindo o usuário a trocá-la no primeiro acesso.

3.  **Cenário 2: Usuário Existente**
    -   Se o usuário já existe, o sistema simplesmente atualiza seus metadados no Clerk.
    -   **Atualizar Metadados:** `clerkClient().users.updateUser(userId, { publicMetadata: { ... } })` é chamado para garantir que o `subscriptionStatus` seja "active".
    -   **Enviar E-mail de Renovação/Reativação:** Um e-mail informando que a assinatura foi ativada ou renovada é enviado.

## 6. Envio de E-mails com SendGrid

-   **Função `sendEmail`:** O projeto possui uma função helper em `lib/sendgrid.ts` que abstrai a configuração e o envio de e-mails. Ela recebe `to`, `subject`, `html`, e `text`.
-   **Templates de E-mail:**
    -   Os templates HTML para os e-mails estão localizados em `app/_templates/emails/`.
    -   São funções que recebem dados (como nome do cliente) e retornam uma string HTML. Ex: `createUserTemplate(name, email, password)`.
    -   Isso mantém o código do webhook limpo e facilita a manutenção do visual dos e-mails.

## 7. Como Implementar em Outro Projeto (Passo a Passo)

1.  **Configurar Contas:** Crie suas contas na Kiwify, Clerk e SendGrid.
2.  **Obter API Keys:** Colete as chaves de API secretas e configure-as como variáveis de ambiente no seu projeto.
3.  **Instalar Pacotes:** `npm install @clerk/nextjs @sendgrid/mail generate-password`.
4.  **Criar API Route:** Crie o arquivo `app/api/webhooks/kiwify/route.ts` (ou o equivalente em seu framework).
5.  **Copiar a Lógica:**
    -   Copie a estrutura do `POST` handler, a validação `isValidWebhookData` e a função `processWebhook`.
    -   Copie as interfaces `WebhookData`, `Customer`, etc., para garantir a tipagem correta.
6.  **Criar Helpers:**
    -   Crie o arquivo `lib/sendgrid.ts` para sua função de envio de e-mail. Não se esqueça de inicializar o client da SendGrid com sua API Key.
7.  **Criar Templates de E-mail:**
    -   Crie a pasta `app/_templates/emails/` e adicione seus templates de e-mail como funções que retornam HTML.
8.  **Adaptar a Lógica de Negócio:**
    -   **Clerk `publicMetadata`:** Adapte os metadados que você salva no Clerk de acordo com as necessidades do seu aplicativo (nomes de planos, permissões, etc.).
    -   **E-mails:** Personalize o conteúdo e o design dos e-mails para a sua marca.
9.  **Configurar Webhook na Kiwify:**
    -   Vá ao painel da Kiwify, na seção "Aplicativos" > "Webhooks".
    -   Crie um novo webhook.
    -   No campo "URL", insira a URL pública da sua API Route (Ex: `https://meu-app.com/api/webhooks/kiwify`).
    -   Selecione os eventos que você deseja receber (ex: "Compra Aprovada", "Assinatura Cancelada").
10. **Testar:** Realize uma compra de teste na Kiwify para verificar se o webhook é acionado, se o usuário é criado/atualizado no Clerk e se o e-mail correto é enviado. Verifique os logs do seu servidor para depurar qualquer problema.

---

Seguindo este guia, você será capaz de replicar a funcionalidade de automação de pós-compra em qualquer projeto que utilize Kiwify como plataforma de pagamento.
