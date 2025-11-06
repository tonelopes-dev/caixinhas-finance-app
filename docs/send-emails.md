# Sistema de Envio de E-mails com SendGrid e Templates Dinâmicos

Este documento descreve a arquitetura e o funcionamento do sistema de envio de e-mails transacionais do projeto, utilizando SendGrid como provedor e um sistema de templates dinâmicos para a geração do conteúdo.

## 1. Visão Geral

O objetivo é ter um sistema robusto, desacoplado e de fácil manutenção para enviar e-mails em resposta a eventos importantes da aplicação, como:

-   Criação de conta de usuário.
-   Atualização de assinatura.
-   Cancelamento de assinatura.
-   Recuperação de senha.
-   E outras notificações transacionais.

Para isso, a arquitetura foi dividida em duas partes principais: o **serviço de envio** e os **templates de e-mail**.

## 2. Tecnologias Utilizadas

-   **SendGrid:** Um serviço de e-mail na nuvem que oferece alta entregabilidade e uma API robusta para o envio de e-mails transacionais e de marketing.
-   **@sendgrid/mail:** A biblioteca oficial da SendGrid para Node.js, usada para interagir com a API.

## 3. Pré-requisitos

-   **Conta na SendGrid:** Você precisará de uma conta para obter uma chave de API.
-   **API Key:** A chave de API deve ser configurada como uma variável de ambiente.

**Variável de Ambiente:**

Adicione a seguinte linha ao seu arquivo `.env.local`:

```
SENDGRID_API_KEY=SG.sua_chave_de_api_aqui
```

## 4. Estrutura e Implementação

O sistema é composto por um serviço centralizado e um diretório de templates.

### a. Serviço de E-mail (`lib/sendgrid.ts`)

Este é o coração do sistema. É um arquivo helper que encapsula toda a lógica de comunicação com a API da SendGrid.

-   **Inicialização:** O serviço importa a biblioteca `@sendgrid/mail` e a configura com a chave de API obtida das variáveis de ambiente (`process.env.SENDGRID_API_KEY`).

-   **Função `sendEmail`:**
    -   É uma função assíncrona que serve como a única interface para o resto da aplicação enviar e-mails.
    -   Ela recebe um objeto com os seguintes parâmetros: `to`, `subject`, `html` (o corpo do e-mail em HTML) e `text` (uma versão em texto puro como fallback).
    -   A função monta o objeto `msg` no formato esperado pela SendGrid e chama `sgMail.send(msg)` para despachar o e-mail.

**Exemplo do código em `lib/sendgrid.ts`:**

```typescript
import sgMail from "@sendgrid/mail";

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export const sendEmail = async ({ to, subject, html, text }: SendEmailParams) => {
  const msg = {
    to,
    from: "seu-email-verificado@seudominio.com", // E-mail verificado na SendGrid
    subject,
    text,
    html,
  };

  try {
    await sgMail.send(msg);
    console.log(`E-mail enviado para ${to}`);
  } catch (error) {
    console.error("Erro ao enviar e-mail:", error);
  }
};
```

### b. Templates de E-mail (`app/_templates/emails/`)

Para manter o código organizado e facilitar a edição do conteúdo dos e-mails, o HTML de cada tipo de e-mail é isolado em seu próprio arquivo dentro deste diretório.

-   **Estrutura:** Cada arquivo neste diretório (ex: `createUserTemplate.ts`, `planUpdatedTemplate.ts`) exporta uma função.
-   **Funcionamento:** Essa função geralmente recebe dados dinâmicos (como nome do usuário, nome do plano, etc.) e retorna uma string formatada contendo o HTML completo do e-mail.

**Exemplo de um template (`createUserTemplate.ts`):**

```typescript
const createUserTemplate = (
  userName: string,
  userEmail: string,
  tempPass: string
): string => {
  return `
    <!DOCTYPE html>
    <html>
      <body>
        <h1>Bem-vindo, ${userName}!</h1>
        <p>Sua conta no Graninha App foi criada com sucesso.</p>
        <p>Use os seguintes dados para fazer login:</p>
        <p><strong>E-mail:</strong> ${userEmail}</p>
        <p><strong>Senha Temporária:</strong> ${tempPass}</p>
        <p>Recomendamos que você altere sua senha após o primeiro login.</p>
      </body>
    </html>
  `;
};

export default createUserTemplate;
```

## 5. Como Usar e Integrar

Juntar o serviço de envio com os templates é simples. Em qualquer parte do código onde um e-mail precisa ser enviado (como no webhook da Kiwify), você importa a função `sendEmail` e o template desejado.

**Exemplo de uso no webhook:**

```typescript
// Dentro de app/api/webhooks/kiwify/route.ts

import { sendEmail } from "@/lib/sendgrid";
import createUserTemplate from "@/app/_templates/emails/create-user";

// ... dentro da lógica de criação de usuário ...

const password = generatePassword.generate(...);
const newUser = await clerkClient().users.createUser(...);

// Enviar e-mail de boas-vindas
await sendEmail({
  to: emailCustomer,
  subject: "Bem-vindo ao Graninha App!",
  html: createUserTemplate(Customer.full_name, emailCustomer, password),
  text: `Olá ${Customer.full_name}, sua conta foi criada. Sua senha temporária é: ${password}`,
});
```

## 6. Passo a Passo para Replicar

1.  **Criar Conta e API Key:** Crie uma conta na SendGrid e gere uma API Key.
2.  **Verificar Remetente:** Na SendGrid, adicione e verifique um "Single Sender" ou um domínio para ser o remetente (`from`) dos seus e-mails.
3.  **Configurar Variável de Ambiente:** Adicione a `SENDGRID_API_KEY` ao seu arquivo `.env.local`.
4.  **Instalar a Biblioteca:** `npm install @sendgrid/mail`.
5.  **Criar o Serviço:** Crie o arquivo `lib/sendgrid.ts` e cole o código do serviço de e-mail, ajustando o e-mail remetente (`from`).
6.  **Criar o Diretório de Templates:** Crie a pasta `app/_templates/emails/`.
7.  **Desenvolver os Templates:** Crie arquivos para cada template de e-mail. Cada arquivo deve exportar uma função que recebe dados e retorna uma string HTML.
8.  **Integrar:** Nos locais apropriados da sua aplicação, importe `sendEmail` e o template desejado, chame a função do template com os dados corretos e passe o resultado para a função `sendEmail`.

Este sistema modular não só organiza o código, mas também permite que designers ou outros desenvolvedores modifiquem os e-mails facilmente sem precisar tocar na lógica de negócio principal.
