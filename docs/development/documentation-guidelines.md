# 📝 Guia de Documentação do Projeto

Este documento define as boas práticas para manter a documentação do Caixinhas organizada e útil tanto para humanos quanto para agentes de IA.

---

## Estrutura de Pastas

```
docs/
├── index.md          # Índice central (entry point)
├── guide/            # Visão do produto, marca e estratégia
├── architecture/     # Stack técnica, rotas, banco de dados
├── features/         # Documentação por funcionalidade
├── development/      # Setup, workflow, testes, guidelines
└── performance/      # Benchmarks e otimizações
```

## Regras para Novos Documentos

### 1. Onde colocar?

| Tipo de conteúdo                                     | Pasta           |
| ---------------------------------------------------- | --------------- |
| Sobre o produto, marca, público-alvo                 | `guide/`        |
| Stack, arquitetura, autenticação, banco              | `architecture/` |
| Funcionalidade específica (ex: convites, IA, emails) | `features/`     |
| Como configurar, testar, fazer deploy                | `development/`  |
| Benchmarks, métricas, otimizações                    | `performance/`  |

### 2. Formato do arquivo

- Use **kebab-case** para nomes: `vault-invitation-system.md` ✅
- Comece com um **título H1** descritivo.
- Inclua uma breve descrição no início (1-2 linhas) explicando o propósito do documento.

### 3. Atualize o `index.md`

Sempre que criar ou mover um documento, adicione-o ao [`docs/index.md`](./index.md) com:

- Link relativo para o arquivo
- Descrição de 1 linha

### 4. Mantenha atualizado

- Se uma feature mudar significativamente, atualize a documentação correspondente.
- Se um documento ficar obsoleto, mova para uma pasta `_archive/` ou delete.

## Dicas para AI-Readability

- Use headings hierárquicos (H1 > H2 > H3)
- Seja explícito com nomes de arquivos e caminhos
- Use listas e tabelas ao invés de parágrafos longos
- Inclua exemplos de código quando relevante
- Evite abreviações sem explicação
