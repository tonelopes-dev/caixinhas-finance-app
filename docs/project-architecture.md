# Arquitetura de Rotas e Controle de Acesso

Este documento descreve a arquitetura de roteamento do projeto, baseada no App Router do Next.js, e como ela é organizada para separar claramente as áreas públicas e privadas da aplicação, garantindo o controle de acesso.

## 1. Visão Geral da Estrutura

O projeto utiliza uma funcionalidade poderosa do Next.js chamada **Route Groups** (Grupos de Rotas) para organizar o código sem afetar a estrutura da URL. Isso é feito criando pastas com nomes entre parênteses, como `(public)` e `(private)`.

Essa abordagem permite:

-   Separar logicamente as seções da aplicação.
-   Aplicar layouts diferentes para cada grupo de rotas.
-   Implementar regras de autenticação específicas para determinados grupos.

### Estrutura de Pastas Principal (`app/`)

```
app/
├── (private)/         # Rotas que exigem autenticação
│   ├── dashboard/
│   ├── subscription/
│   ├── transactions/
│   └── layout.tsx       # Layout para a área logada
│
├── (public)/          # Rotas abertas a todos os usuários
│   ├── blog/
│   ├── landing-page/
│   ├── login/
│   └── layout.tsx       # Layout para a área pública
│
├── api/               # API Routes (ex: webhooks)
└── layout.tsx         # Layout raiz, compartilhado por toda a aplicação
```

## 2. Rotas Públicas `(public)`

-   **Localização:** `app/(public)/`
-   **Propósito:** Contém todas as páginas que podem ser acessadas por qualquer visitante, autenticado ou não.
-   **Exemplos:**
    -   `landing-page`: A página inicial de marketing.
    -   `blog`: Artigos e conteúdo informativo.
    -   `login`: Página para os usuários iniciarem sessão.
    -   `privacy-policy`: Página de política de privacidade.
-   **Layout (`app/(public)/layout.tsx`):** Este arquivo define a estrutura visual compartilhada por todas as páginas públicas, como o cabeçalho de marketing, o menu de navegação principal e o rodapé.

## 3. Rotas Privadas `(private)`

-   **Localização:** `app/(private)/`
-   **Propósito:** Contém todas as páginas e funcionalidades que são exclusivas para usuários autenticados. O acesso a estas rotas é protegido.
-   **Exemplos:**
    -   `dashboard`: O painel principal do usuário após o login.
    -   `transactions`: Onde o usuário gerencia suas transações financeiras.
    -   `subscription`: Página para o usuário gerenciar sua assinatura.
-   **Layout (`app/(private)/layout.tsx`):** Define a estrutura da área logada, que geralmente inclui uma barra lateral de navegação, um cabeçalho com informações do perfil do usuário e outros componentes específicos da aplicação.

## 4. O Mecanismo de Proteção: `middleware.ts`

O controle de acesso que impede que usuários não autenticados acessem as rotas em `(private)` é implementado no arquivo `middleware.ts`, localizado na raiz do projeto.

-   **O que é Middleware?** É um código que é executado antes de uma requisição ser completada. Com base na requisição, você pode reescrever, redirecionar, modificar headers ou responder diretamente.

-   **Como Funciona:**
    1.  **Integração com Clerk:** O middleware utiliza o helper `authMiddleware` da biblioteca `@clerk/nextjs`.
    2.  **Definição de Rotas Públicas:** Dentro da configuração do `authMiddleware`, especificamos quais rotas são consideradas públicas. Todas as outras rotas são privadas por padrão.
        ```typescript
        // Exemplo de middleware.ts
        import { authMiddleware } from "@clerk/nextjs";

        export default authMiddleware({
          publicRoutes: ["/", "/landing-page", "/blog/:path*", "/api/webhooks/kiwify"],
        });
        ```
    3.  **Execução:** Antes de renderizar uma página, o middleware intercepta a requisição. Ele verifica se o usuário está tentando acessar uma rota privada e se ele possui uma sessão de autenticação ativa (verificada pelo Clerk).
    4.  **Redirecionamento:** Se um usuário não autenticado tenta acessar uma rota privada (ex: `/dashboard`), o middleware o redireciona automaticamente para a página de login (`/login`).

## 5. Como Replicar esta Arquitetura

1.  **Use o App Router:** Certifique-se de que seu projeto Next.js está usando o App Router (padrão em versões recentes).
2.  **Crie os Grupos de Rotas:** Dentro da pasta `app`, crie as pastas `(public)` and `(private)`.
3.  **Distribua suas Páginas:** Mova as páginas do seu projeto para dentro das respectivas pastas de grupo.
4.  **Crie Layouts Específicos:** Adicione um arquivo `layout.tsx` dentro de cada grupo para definir a UI base para aquela seção.
5.  **Implemente o Middleware:**
    -   Instale e configure o Clerk (`@clerk/nextjs`).
    -   Crie o arquivo `middleware.ts` na raiz do seu projeto.
    -   Utilize o `authMiddleware` do Clerk para definir suas rotas públicas. Qualquer rota não listada será automaticamente protegida.

Essa arquitetura oferece uma organização de código limpa e escalável, além de um método de proteção de rotas robusto e fácil de gerenciar.
