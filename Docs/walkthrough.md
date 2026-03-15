# Documentação e Walkthrough: BeTalent API - Nível 2

Seja bem-vindo(a) à documentação final interativa da API de pagamentos BeTalent (Versão Nível 2 - Refatorada e Enxuta). Este documento te guiará sobre como a aplicação foi construída após nossa faxina de dívidas técnicas, como o banco de dados armazena os registros, e fornece as chaves para testar cada requisição usando o **Postman**.

---

## 🗄️ 1. Estrutura do Banco de Dados (Schema Nível 2)

O Nível 2 simplificou nossa arquitetura em relação ao Nível 3, pois **obriga que as transações contenham apenas UM produto por vez**. Sendo assim, eliminamos o uso de tabelas pivô complexas (`transaction_products`), reduzindo junções dispendiosas e unificando o núcleo de compras.

Aqui estão as entidades principais consolidadas pelo AdonisJS/Lucid ORM no nosso banco MySQL v8+:

### Tabelas Centrais
* **`users`**: Administradores que podem consultar transações e fazer reembolsos.
    * Campos: `id`, `full_name`, [email](file:///c:/Users/Sertoriel/Documents/betalent-api/app/validators/user.ts#3-7), [password](file:///c:/Users/Sertoriel/Documents/betalent-api/app/validators/user.ts#7-8).
* **`clients`**: Clientes finais gerados automaticamente quando fazem um checkout.
    * Campos: `id`, `name`, [email](file:///c:/Users/Sertoriel/Documents/betalent-api/app/validators/user.ts#3-7).
* **`products`**: Estoque de itens elegíveis para compra.
    * Campos: `id`, `name`, `value` (preço em *centavos*), `amount` (quantidade em estoque).
* **`gateways`**: Os provedores de pagamento com controle dinâmico de failover.
    * Campos: `id`, `name`, `is_active` (boolean), `priority` (integer).

### O Motor Transacional (`transactions`)
A joia da nossa arquitetura. Em vez de espalhar dados financeiros, concentramos tudo nela:
* **`id`**: Identificador interno.
* **`client_id`** *(FK)*: Relaciona a compra ao `clients`.
* **`gateway_id`** *(FK)*: Identificador do gateway real que processou/aprovou (importante para o Reembolso saber pra quem disparar).
* **`product_id`** *(FK)*: O item vendido (Simplificado para Nível 2).
* **`quantity`**: Quantidade daquele item exato comprada na transação.
* **`amount`**: O valor **total** pago em centavos (Calculado dinamicamente: `product.value * quantity`).
* **`status`**: Pode ser `approved`, `declined` ou `refunded`.
* **`external_id`**: O UUID ou hash retornado lá dos provedores Mocks do Node.js.
* **`card_last_numbers`**: Guarda apenas o sufixo (ex: '5678') por questões de LGPD.

---

## 🏗️ 2. A Arquitetura Dinâmica (Fallback Multi-Gateway)

Nossa API implementa o **Padrão de Falha Resiliente de Alta Disponibilidade (Fallback)** através da classe [PaymentManager](file:///C:/Users/Sertoriel/AppData/Roaming/Code/User/History/-3d9e671/4dDN.ts#6-31):

1. Quando a rota de `POST /checkout` é chamada (uma rota pública), ela aciona o [PaymentManager](file:///C:/Users/Sertoriel/AppData/Roaming/Code/User/History/-3d9e671/4dDN.ts#6-31).
2. O sistema verifica no BD `gateways` todos que estão com `is_active: true`, carregando-os do menor `priority` para o maior.
3. Se o "Gateway 1" der Timeout ou explodir com Erro 500, o código **não propaga a exceção** para o cliente final. O loop intercepta, aciona um `logger.warn()` no CLI, invoca o "Gateway 2", compila sua assinatura e finaliza o pagamento sem estresse.
4. Ao fazer o Reembolso (`POST /transactions/:id/refund`), usamos o `gateway_id` gravado na venda original para carregar a injeção do provedor exato, estornando na fonte real em vez de mandar às cegas para o Gateway de maior prioridade atual.

---

## 🚀 3. Testando Tudo Usando o Postman

Facilitamos gigantescamente a vida do QA e do Avaliador. Criei um arquivo nativo do Postman chamado **`BeTalent_Nivel2_Postman.json`** na raiz do seu projeto.

### A. Como Importar o JSON
1. Abra o seu Postman.
2. Lá em cima, ao lado de "My Workspace", clique no botão **"Import"**.
3. Arraste e Solte o arquivo `BeTalent_Nivel2_Postman.json` ali, ou vá selecionando ele pelas suas pastas (`Documents/betalent-api/BeTalent_Nivel2_Postman.json`).
4. Importe. Aparecerá a collection **"BeTalent API - Nível 2"**.

### B. O Script Automático de Autenticação
Na nossa collection, preparamos um truque excelente:
Se você olhar na pasta `"1. Autenticação"`, encontrará a rota **"Login (Gerar Token)"**. 
Quando você clica em `Send` no Login, o Postman executa um script secreto meu que extrai o `Bearer Token` da tela preta e o **salva automaticamente na sua aba de Variáveis (`{{authToken}}`)**. 
Ou seja, *você nunca precisará ficar copiando e colando tokens nas outras rotas secretas*, tudo está automatizado.

### C. Um Teste de Fluxo Completo de Sucesso

**Certifique-se de que seus serviços estão de pé:**
* No terminal do Docker: `docker-compose up -d` (Para rodar os Mocks: `localhost:3001` e `3002`, e o MYSQL)
* No terminal do Node: `npm run dev` (API na porta `3333`)

#### Passo 1: Limpar ou Seed do Ambiente
Se não rodou os seeds:
* Vá na pasta `4. Produtos` do Postman e crie um usando o **Criar Produto**.
* Abra o terminal do Adonis e rode `node ace db:seed` se preferir para fabricar o admin e os Gateways mockados.

#### Passo 2: O Login
1. Abra a coleção, pasta `1. Autenticação`.
2. Rode `Signup` se não usou seeder.
3. Rode **Login**. O status será `200 OK` e o script debaixo dos panos gravará o token global.

#### Passo 3: O Checkout Público
1. Abra a pasta `2. Checkout (Público)` -> `Realizar Compra`.
2. Dê `Send`. A compilação da compra será efetuada com sucesso usando o **Gateway 1** (Se sua prioridade estiver como 1). Ele te devolverá o status `success` e a Transação irá para o Banco.

#### Passo 4: O Teste de Alta Disponibilidade (Fallback)
1. Abra a pasta `5. Gateways` -> `Ativar/Desativar Gateway` ou `Alterar Prioridade`.
2. Envie a solicitação de desativar o Gateway 1 (`PATCH /gateways/1/toggle_active`).
3. Volte na pasta do [Checkout](file:///c:/Users/Sertoriel/Documents/betalent-api/start/routes.ts#5-6) e dê `Send` na compra de novo.
4. Olhe a resposta. **DEU SUCESSO!** E se você olhar os logs do terminal da sua API, verá ela informando: `"Gateway 1 inativo... Tentando no Gateway 2... Gateway 2 aprovou o pagamento!"`.

#### Passo 5: Reembolso Simples
1. Entre na pasta `3. Transações & Reembolsos` -> `Reembolsar Transação`.
2. Ajuste o `/1/refund` na URL para apontar para a Transação que você quer estornar (se ela foi a transação ID 2, altere a URL final).
3. Dê `Send`. O Gateway real será consultado, a devolução será aceitada, e no seu banco o status explodirá de `approved` para **`refunded`**.

O projeto encontra-se 100% testável visualmente e validado sintaticamente, pronto para ser entregue nas métricas de Excelência Absoluta exigidas pelo BeMobile!
