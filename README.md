# 🚀 BeTalent API - Multi-Gateway Payment System (Nível 2)

Bem-vindo(a) ao repositório do backend da **BeTalent API**! Este projeto consiste na construção de uma API de pagamentos altamente escalável e tolerante a falhas (alta disponibilidade), implementando arquitetura limpa com padrão **Fallback Multi-Gateway**, desenvolvido sob o ecossistema poderoso do **AdonisJS v6**.

---

## 🏗️ Arquitetura e Escopo Resolvido

Este repositório atende aos estritos padrões de arquitetura e cobertura do **Nível 2** do Desafio BeMobile.

* **Integração Realista**: Injeção e consumo de APIs externas (Gateways de Pagamento Mocks em `localhost:3001` e `3002`).
* **Resiliência de Transações (Fallback)**: Caso o Gateway de prioridade 1 sofra instabilidade, o algoritmo `PaymentManager` intercepta silenciosamente a requisição e a processa no Gateway Segundário, garantindo a venda da companhia na porta de saída.
* **Segurança**: Valores sensíveis transitam e são criptografados através de injeção de Headers e Autenticações (Bearer/Chaves Fixas).
* **Precisão Financeira**: Operações baseadas em `centavos` e calculadas nativamente no Backend (Server-side validation) para impedir distorções de ponto flutuante via manipulação de client (Postman/FrontEnds).

---

## 🛠️ Tecnologias Utilizadas

- **[Node.js](https://nodejs.org/en/)** v20+
- **[AdonisJS](https://adonisjs.com/)** v6 (Framework Core)
- **[TypeScript](https://www.typescriptlang.org/)** (Strict Typechecking ativado)
- **[MySQL](https://www.mysql.com/)** via Docker (Banco de Dados Relacional Limpo)
- **[Japa](https://japa.dev/)** + Node Ace (Para cobertura total de Testes Funcionais / TDD)

---

## ⚙️ Pré-requisitos & Instalação

Para emular este projeto em sua máquina e atestar a qualidade de sua codificação, certifique-se de ter o [Node.js](https://nodejs.org/) (recomendo v20.x+) e o [Docker Compose](https://docs.docker.com/compose/) instalados.

### 1. Clonar o Repositório
```bash
git clone https://github.com/Sertoriel/betalent-api.git
cd betalent-api
```

### 2. Instalação das Dependências
Instale os pacotes com `npm` (garante o travamento perfeito do `package-lock.json`).

```bash
npm install
```

### 3. Configuração do Ambiente (.env)
Copie o exemplo global de credenciais gerado e construa o seu ambiente local:

```bash
cp .env.example .env
```
*(Caso utilize Windows PowerShell e o `cp` falhe, apenas duplique o arquivo e renomeie para `.env`).*

O `.env` já contém o segredo dos gateways e a configuração da `APP_KEY` do framework. A configuração de banco de dados nativa aponta para: `DB_DATABASE=betalent_api`.

### 4. Subir Containers e Mocks (Docker)
Deixamos um arquivo `docker-compose.yml` que já levanta um banco de dados MySQL virgem e a API com os dois Mocks Gateways do repositório oficial.

```bash
docker-compose up -d
```
> Os logs mostrarão o MySQL subindo na porta `3306`, Mock 1 na `3001` e Mock 2 na `3002`.

### 5. Injetar a Arquitetura no Banco 
Este comando via CLI do Adonis gera as tabelas perfeitamente otimizadas do novo ciclo de vida do nosso sistema financeiro:

```bash
node ace migration:fresh
```

---

## 🏁 Como Executar e Testar

### Ambiente de Desenvolvimento (Dev)
Abra a aplicação com watch interativo com:
```bash
npm run dev
# ou
node ace serve --watch
```

*(O servidor deverá responder na porta `3333` padrão).*

### 🧪 Executando os Testes Automatizados
O repositório é entregue com uma suíte construída sob **TDD**, cobrindo todas as rotas de Auth, CRUDs ocultos, lógicas implacáveis de Checkout e Reembolsos mockados no Node.

```bash
node ace test
```
> **Expectativa**: Todos os testes Funcionais e de Exceção deverão retornar verdinhos sem falhas de banco ou promises perdidas.

---

## 📦 Como Avaliar com o Postman (Essencial!)

Toda validação real feita sob APIs transacionais e pagamentos com Mock merece uma simulação gráfica imaculada.

Dentro da pasta **`/Docs`**, você encontrará dois artefatos espetaculares deixados para você:

1. **📄 `Docs/walkthrough.md`**: Um mini-artigo/tutorial onde explico minuciosamente como a base de dados do Nível 2 suporta as decisões, como testar o sistema de prioridade offline na unha, e como o Postman te mostrará o Gateway vencedor da transação.
   
2. **🔌 `Docs/BeTalent_Nivel2_Postman.json`**: Nossa formatação especial da collection do desafio. Importe isso no seu Postman! 
   * **Spoiler:** Criei scripts nela para interceptar seus retornos de Login e embutir o Token Global em todas as rotas privadas sem que você gaste tempo com Control+C/Control+V!

---

### 🔥 Qualidade de Código (Linting Garantido)
Este projeto obedeceu às mais estritas regras convencionais do ESLint em conjunto com compilador oficial do TSC Node. Use a vontade para testar a base via:

```bash
npm run typecheck && npm run lint
```

Boa revisão! O Projeto foi escrito visando código limpo, de manutenção rasa e escala astronômica. Qualquer pulo do gato necessário foi comentado intrinsecamente nos métodos vitais!
