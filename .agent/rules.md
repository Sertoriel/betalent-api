# Project Rules: BeTalent API (Nível 2)

Este documento contém as regras, diretrizes e convenções rigorosas para o projeto `betalent-api`.
A inteligência artificial **deve obrigatoriamente** consultar e seguir estas regras, além de ler os links de documentação fornecidos antes de propor ou alterar qualquer código.

## 1. Documentação e Referências Obrigatórias

Antes de implementar qualquer funcionalidade, consulte as documentações oficiais e as especificações do desafio abaixo:

- **Desafio BeTalent (Repo):** https://github.com/BeMobile/teste-pratico-backend/tree/main
- **Desafio BeTalent (JSON Postman):** https://github.com/BeMobile/teste-pratico-backend/blob/main/multigateways_payment_api.json
- **AdonisJS v6 - Introdução:** https://docs.adonisjs.com/introduction
- **AdonisJS v6 - Roteamento:** https://docs.adonisjs.com/guides/basics/routing
- **AdonisJS v6 - Referência de Aplicação:** https://docs.adonisjs.com/reference/application
- **AdonisJS v6 - Lucid ORM:** https://docs.adonisjs.com/guides/database/lucid
- **Docker Manuals:** https://docs.docker.com/manuals/
- **Node.js API:** https://nodejs.org/docs/latest/api/

## 2. Tecnologias & Arquitetura

- **Stack Principal:** Node.js, TypeScript, AdonisJS v6, MySQL, Docker.
- **Arquitetura Modular:** Separação clara de responsabilidades (Controllers para HTTP, Services para regras de negócio/integrações externas).
- **Padrão Multi-Gateway:** Implementado via `PaymentManager` (Strategy/Chain of Responsibility). Se o Gateway 1 (Prioridade 1) falhar, tenta silenciosamente o Gateway 2.

## 3. Estado Atual do Projeto (Contexto)

- **O que JÁ ESTÁ FEITO:** O banco de dados MySQL está modelado e operante via Lucid. O Fallback de Gateways (`PaymentManager`), a rota pública de Checkout (para 1 produto) e o cálculo seguro de backend estão 100% funcionais.
- **O que FALTA FAZER:**
  1. Salvar o `product_id` e a `quantity` diretamente na tabela `transactions` após o checkout (requisito exclusivo do Nível 2, dispensando a tabela pivot `transaction_products`).
  2. Criar rotas privadas protegidas por Autenticação básica (API Tokens simples, sem regras complexas de Roles).
  3. Criar CRUDs básicos de Usuários, Produtos e Clientes, além das rotas de listar/detalhar transações.
  4. Lógica de Reembolso (Chargeback) conectada aos Mocks.
  5. Testes básicos no Japa para garantir que as rotas funcionam (atendendo ao requisito obrigatório de TDD).

## 4. Padrões de Código (Coding Standards)

- **AdonisJS v6 Nativo:** Uso estrito de ESM modules, imports com `#` (ex: `#models/user`), e injeção de dependências (`@inject`).
- **Validação:** Requisições de entrada devem ser validadas usando `VineJS`.
- **Respostas:** A API deve retornar exclusivamente JSON.
- **Tipagem:** TypeScript rigoroso. É proibido o uso de `any` sem justificativa arquitetural.
- **Semântica de Banco de Dados:** Nas tabelas e models, `value` SEMPRE representa dinheiro (preço), e `amount` ou `quantity` SEMPRE representam estoque ou unidades físicas.

## 5. Regras Gerais de Execução da IA

- **Código Autoexplicativo (Clean Code):** O código deve ser legível por si só. Variáveis em inglês (camelCase) e Classes/Models (PascalCase).
- **Restrição de Comentários:** Comentários dentro do código restritos APENAS a marcações de blocos (ex: `// Inicia fallback de gateways`). Nenhuma explicação didática existirá dentro dos blocos de código.
- **Passo a Passo Atômico:** Não gere múltiplos arquivos complexos de uma vez. Trabalhe em etapas lógicas sequenciais. Garanta que um passo funcione e seja validado pelo usuário antes de ir para o próximo.

## 6. Restrições e Regras de Negócio (Crítico)

- **Escopo do Nível 2:** O checkout processa apenas UM tipo de produto por vez. Não crie lógicas para arrays de produtos ou carrinhos de compra complexos. O `product_id` e `quantity` devem ir direto para a tabela `transactions`.
- **Rotas Privadas:** Utilize apenas o middleware `auth` padrão do Adonis. Não implemente sistemas de Roles (Bouncer, ACL), pois isso é escopo do Nível 3.
- **Segurança Financeira:** Valores financeiros manipulados apenas em centavos (inteiros). O valor de uma compra é sempre calculado no backend (`product.value * quantity`). NUNCA confie em valores monetários enviados pelo cliente.
- **Autenticação dos Gateways (Mocks):** - _Gateway 1:_ Exige `POST /login` para obter Bearer Token antes de processar/reembolsar.
  - _Gateway 2:_ Exige chaves fixas nos headers (`Gateway-Auth-Token` e `Gateway-Auth-Secret`).
- **Reembolso (Refund):** A operação de reembolso deve consultar a tabela `transactions`, identificar qual `gateway_id` processou a compra originalmente, e enviar a requisição de estorno para o mock do respectivo gateway.
