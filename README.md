# 🌾 Brain Agriculture API

API RESTful para gestão rural — cadastro de produtores, fazendas, safras, culturas agrícolas e plantios.

---

## Índice

- [Setup](#setup)
- [Como rodar com Docker](#como-rodar-com-docker)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Endpoints da API](#endpoints-da-api)
- [Decisões técnicas](#decisões-técnicas)
- [Modelo de Plantio](#modelo-de-plantio)
- [Diagrama ER](#diagrama-er)
- [Fluxos de negócio](#fluxos-de-negócio)

---

## Setup

### Pré-requisitos

| Ferramenta | Versão mínima     |
| ---------- | ----------------- |
| Node.js    | 20.x              |
| npm        | 10.x              |
| PostgreSQL | 15.x              |
| Docker     | 24.x _(opcional)_ |

### Instalação local

```bash
# 1. Clonar o repositório
git clone <repo-url>
cd brain-agriculture

# 2. Instalar dependências
npm install

# 3. Copiar e preencher variáveis de ambiente
cp .env.example .env

# 4. Rodar as migrations (banco deve estar rodando)
npm run migration:run

# 5. (Opcional) Popular dados iniciais
npm run seed

# 6. Iniciar em modo desenvolvimento
npm run start:dev
```

A API ficará disponível em `http://localhost:3000/api/v1`.  
O Swagger estará em `http://localhost:3000/docs`.

---

## Como rodar com Docker

O `docker-compose.yml` sobe dois serviços: a **API** (Node 20) e o **PostgreSQL 15**.  
As migrations são executadas automaticamente ao iniciar o container da API.

```bash
# Subir todos os serviços (modo desenvolvimento com hot-reload)
docker compose up

# Subir em background
docker compose up -d

# Parar e remover containers
docker compose down

# Remover containers + volume do banco (reset completo)
docker compose down -v
```

A API ficará em `http://localhost:3000/api/v1` e o Swagger em `http://localhost:3000/docs`.

### Build para produção

```bash
docker compose build --target production
```

O `Dockerfile` possui três estágios:

| Estágio       | Descrição                                      |
| ------------- | ---------------------------------------------- |
| `development` | Instala todas as dependências + hot-reload     |
| `build`       | Compila o TypeScript (`npm run build`)         |
| `production`  | Copia apenas `dist/` e dependências de runtime |

---

## Variáveis de ambiente

Crie um arquivo `.env` na raiz (baseado no `.env.example`):

```dotenv
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=brain_agriculture
```

---

## Endpoints da API

Todos os endpoints têm o prefixo `/api/v1`.  
A documentação interativa completa está disponível em `GET /docs` (Swagger UI).

### Produtores — `/api/v1/producers`

| Método | Rota             | Descrição                     | Status de sucesso |
| ------ | ---------------- | ----------------------------- | ----------------- |
| POST   | `/producers`     | Cadastrar novo produtor       | `201 Created`     |
| GET    | `/producers`     | Listar todos os produtores    | `200 OK`          |
| GET    | `/producers/:id` | Buscar produtor por UUID      | `200 OK`          |
| PUT    | `/producers/:id` | Atualizar nome e/ou documento | `200 OK`          |
| DELETE | `/producers/:id` | Excluir produtor (cascade)    | `204 No Content`  |

**Exemplo — criar produtor (pessoa física):**

```json
POST /api/v1/producers
{
  "name": "João da Silva",
  "document": "123.456.789-09"
}
```

**Exemplo — criar produtor (pessoa jurídica):**

```json
POST /api/v1/producers
{
  "name": "Agropecuária São João Ltda",
  "document": "98.765.432/0001-10"
}
```

---

### Fazendas — `/api/v1/farms`

| Método | Rota         | Descrição                                 | Status de sucesso |
| ------ | ------------ | ----------------------------------------- | ----------------- |
| POST   | `/farms`     | Cadastrar fazenda vinculada a um produtor | `201 Created`     |
| GET    | `/farms`     | Listar todas as fazendas                  | `200 OK`          |
| GET    | `/farms/:id` | Buscar fazenda por UUID                   | `200 OK`          |
| PUT    | `/farms/:id` | Atualizar dados da fazenda                | `200 OK`          |
| DELETE | `/farms/:id` | Excluir fazenda (cascade nos plantios)    | `204 No Content`  |

**Exemplo — criar fazenda:**

```json
POST /api/v1/farms
{
  "name": "Fazenda Santa Fé",
  "city": "Ribeirão Preto",
  "state": "SP",
  "totalArea": 500.0,
  "arableArea": 350.0,
  "vegetationArea": 100.0,
  "producerId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
}
```

> **Regra de negócio:** `arableArea + vegetationArea ≤ totalArea`. Qualquer violação retorna `422 Unprocessable Entity`.

---

### Safras — `/api/v1/harvests`

| Método | Rota            | Descrição                                   | Status de sucesso |
| ------ | --------------- | ------------------------------------------- | ----------------- |
| POST   | `/harvests`     | Cadastrar ano agrícola                      | `201 Created`     |
| GET    | `/harvests`     | Listar todas as safras                      | `200 OK`          |
| DELETE | `/harvests/:id` | Excluir safra (bloqueado se tiver plantios) | `204 No Content`  |

**Exemplo:**

```json
POST /api/v1/harvests
{
  "year": 2025
}
```

---

### Culturas — `/api/v1/crops`

| Método | Rota         | Descrição                                     | Status de sucesso |
| ------ | ------------ | --------------------------------------------- | ----------------- |
| POST   | `/crops`     | Cadastrar cultura no catálogo                 | `201 Created`     |
| GET    | `/crops`     | Listar todas as culturas                      | `200 OK`          |
| DELETE | `/crops/:id` | Excluir cultura (bloqueado se tiver plantios) | `204 No Content`  |

**Exemplos de culturas:**

```json
POST /api/v1/crops
{ "name": "Soja" }

{ "name": "Milho" }
{ "name": "Café" }
{ "name": "Cana-de-Açúcar" }
{ "name": "Algodão" }
```

---

### Plantios — `/api/v1/plantings`

| Método | Rota             | Descrição                                     | Status de sucesso |
| ------ | ---------------- | --------------------------------------------- | ----------------- |
| POST   | `/plantings`     | Registrar plantio (fazenda + safra + cultura) | `201 Created`     |
| GET    | `/plantings`     | Listar todos os plantios                      | `200 OK`          |
| DELETE | `/plantings/:id` | Excluir registro de plantio                   | `204 No Content`  |

**Exemplo:**

```json
POST /api/v1/plantings
{
  "farmId": "d4e5f6a7-b8c9-0123-defa-456789012345",
  "harvestId": "e5f6a7b8-c9d0-1234-efab-567890123456",
  "cropId": "f6a7b8c9-d0e1-2345-fabc-678901234567"
}
```

---

## Decisões técnicas

### Arquitetura: Clean Architecture

O projeto segue os princípios da **Clean Architecture**, separando o código em quatro camadas:

```
src/
├── domain/          # Entidades, interfaces de repositório, Value Objects, erros de domínio
├── application/     # Use Cases e DTOs — orquestradores da lógica de negócio
├── infra/           # TypeORM repositories, módulos NestJS, migrations, seeds
└── presentation/    # Controllers HTTP e filtros de exceção
```

**Por que essa estrutura?**  
A regra de dependência flui para dentro: `presentation → application → domain`. A camada de domínio não conhece nada do framework ou do banco, tornando o núcleo de negócio testável e independente de infraestrutura.

---

### Framework: NestJS + TypeScript

- **NestJS** provê Dependency Injection, decorators e organização modular sem sacrificar a performance do Node.js.
- **TypeScript** garante tipagem estática em todas as camadas, reduzindo erros e facilitando refatorações.

---

### ORM: TypeORM

- Migrations versionadas para controle de schema.
- Soft delete via `DeleteDateColumn` em todas as entidades — dados excluídos são preservados no banco com `deleted_at`.
- Índices explícitos nas colunas de join (ex: `producer_id`, `farm_id`) para performance em queries relacionais.

---

### Value Object: Documento (CPF/CNPJ)

O CPF e o CNPJ são modelados como **Value Objects** (`src/domain/value-objects/tax-id.vo.ts`), não como strings simples.  
O construtor valida estrutura e **dígitos verificadores** no momento da criação — se inválido, lança `ValidationDomainError` que é automaticamente convertido em `422 Unprocessable Entity` pelo filtro global.

Isso garante que **um documento inválido nunca chegue ao banco de dados**.

---

### Validação global

- **`class-validator`** + `ValidationPipe` com `whitelist: true` e `forbidNonWhitelisted: true` — apenas propriedades declaradas nos DTOs chegam aos Use Cases.
- **`HttpExceptionFilter`** global captura exceções de domínio (`ValidationDomainError`, `BusinessRuleViolationError`) e as converte em respostas HTTP padronizadas.

---

### Banco de dados: PostgreSQL 15

- Escolhido pela robustez e suporte nativo a UUID, tipos numéricos de precisão arbitrária e constraints relacionais.
- Áreas da fazenda usam `numeric(12,4)` para evitar erros de ponto flutuante.

---

### Swagger: `@nestjs/swagger`

- Disponível em `/docs` em todos os ambientes.
- DTOs anotados com `@ApiProperty` expõem exemplos reais diretamente na UI.
- Todos os endpoints possuem `@ApiOperation`, `@ApiResponse` e `@ApiParam` documentados.

---

## Modelo de Plantio

O **Plantio** é a entidade central do modelo de dados — representa o registro de que **uma determinada cultura foi plantada em uma fazenda durante uma safra específica**.

### Por que uma entidade de junção explícita?

Uma relação many-to-many simples (Fazenda ↔ Cultura) não seria suficiente, pois o contexto **temporal** (safra/ano) é essencial para o agronegócio. O Plantio carrega essa dimensão extra:

```
Fazenda × Safra × Cultura → Plantio
```

### Regra de negócio crítica

A combinação `(farmId, harvestId, cropId)` é **única** no banco (constraint `@Unique` na entidade) e verificada também na camada de aplicação antes do INSERT:

```typescript
// create-planting.use-case.ts
const duplicate = await this.plantingRepository.findByFarmHarvestCrop(
  dto.farmId,
  dto.harvestId,
  dto.cropId,
);
if (duplicate) {
  throw new ConflictException(
    `Crop "${crop.name}" is already registered on farm "${farm.name}" for harvest ${harvest.year}.`,
  );
}
```

Isso significa que:

- ✅ A mesma cultura pode ser registrada em **diferentes fazendas** na mesma safra.
- ✅ A mesma fazenda pode plantar a mesma cultura em **safras diferentes**.
- ❌ A mesma cultura **não pode** ser registrada duas vezes na mesma fazenda e safra.

### Integridade referencial

| Relação             | Comportamento ao excluir                             |
| ------------------- | ---------------------------------------------------- |
| Produtor → Fazendas | `CASCADE` — exclui as fazendas junto                 |
| Fazenda → Plantios  | `CASCADE` — exclui os plantios junto                 |
| Safra → Plantios    | `RESTRICT` — bloqueia exclusão se existirem plantios |
| Cultura → Plantios  | `RESTRICT` — bloqueia exclusão se existirem plantios |

---

## Diagrama ER

```
┌──────────────────────┐         ┌──────────────────────────────────────────┐
│      producers       │         │                  farms                   │
├──────────────────────┤         ├──────────────────────────────────────────┤
│ id          UUID  PK │◄───┐    │ id              UUID   PK                │
│ name        VARCHAR  │    │    │ name            VARCHAR                  │
│ document    VARCHAR  │    └────│ producer_id     UUID   FK → producers.id │
│ created_at  TSTZ     │         │ city            VARCHAR                  │
│ updated_at  TSTZ     │         │ state           VARCHAR(2)               │
│ deleted_at  TSTZ     │         │ total_area      NUMERIC(12,4)            │
└──────────────────────┘         │ arable_area     NUMERIC(12,4)            │
                                 │ vegetation_area NUMERIC(12,4)            │
                                 │ created_at      TSTZ                     │
                                 │ updated_at      TSTZ                     │
                                 │ deleted_at      TSTZ                     │
                                 └──────────────┬───────────────────────────┘
                                                │
                         ┌──────────────────────┼─────────────────────┐
                         │                      │                     │
              ┌──────────▼────────┐  ┌──────────▼──────────┐  ┌──────▼──────────┐
              │     plantings     │  │      harvests       │  │      crops      │
              ├───────────────────┤  ├─────────────────────┤  ├─────────────────┤
              │ id       UUID PK  │  │ id      UUID   PK   │  │ id    UUID  PK  │
              │ farm_id  UUID FK  │◄─┤ year    INT (unique)│  │ name  VARCHAR   │
              │ harvest_id UUID FK│  │ created_at TSTZ     │  │ created_at TSTZ │
              │ crop_id  UUID FK  │  │ updated_at TSTZ     │  │ updated_at TSTZ │
              │ created_at TSTZ  │  │ deleted_at TSTZ     │  │ deleted_at TSTZ │
              │ updated_at TSTZ  │  └─────────────────────┘  └─────────────────┘
              │ deleted_at TSTZ  │           ▲                        ▲
              └───────────────────┘           │                        │
                  UNIQUE(farm_id,             └────────────────────────┘
                  harvest_id, crop_id)
```

**Cardinalidades:**

| Relação             | Cardinalidade                                      |
| ------------------- | -------------------------------------------------- |
| Produtor → Fazendas | 1 : N                                              |
| Fazenda → Plantios  | 1 : N                                              |
| Safra → Plantios    | 1 : N                                              |
| Cultura → Plantios  | 1 : N                                              |
| Fazenda ↔ Cultura   | N : M (via Plantio + Safra como dimensão temporal) |

---

## Fluxos de negócio

### Fluxo 1 — Cadastro completo de um produtor até o plantio

```
1. POST /api/v1/producers
   └─► Cria produtor (valida CPF/CNPJ via Value Object)

2. POST /api/v1/farms
   └─► Cria fazenda vinculada ao produtor
       └─► Valida: arableArea + vegetationArea ≤ totalArea

3. POST /api/v1/harvests
   └─► Cadastra o ano agrícola (ex: 2025)

4. POST /api/v1/crops
   └─► Cadastra a cultura no catálogo (ex: "Soja")

5. POST /api/v1/plantings
   └─► Registra o plantio (fazenda + safra + cultura)
       └─► Valida: fazenda, safra e cultura existem
       └─► Valida: combinação (farm, harvest, crop) ainda não cadastrada
```

---

### Fluxo 2 — Atualização de fazenda

```
PUT /api/v1/farms/:id
  ├─► Recupera fazenda existente
  ├─► Mescla campos fornecidos com os valores atuais
  └─► Revalida regra de áreas (arableArea + vegetationArea ≤ totalArea)
```

---

### Fluxo 3 — Exclusão em cascata de produtor

```
DELETE /api/v1/producers/:id
  └─► Soft-delete do produtor
      └─► CASCADE: soft-delete das fazendas
          └─► CASCADE: soft-delete dos plantios vinculados às fazendas
```

> Os registros excluídos são mantidos no banco com `deleted_at` preenchido e não aparecem em consultas normais.

---

### Fluxo 4 — Tentativa de exclusão de safra com plantios

```
DELETE /api/v1/harvests/:id
  └─► Verifica existência da safra
      └─► Se existirem plantios vinculados → RESTRICT (banco lança erro)
          └─► HttpExceptionFilter converte em 409 Conflict
```

---

## Testes

```bash
# Testes unitários
npm run test

# Testes com cobertura
npm run test:cov

# Testes e2e (necessita banco rodando)
npm run test:e2e
```

Os testes e2e cobrem os principais fluxos de `producers`, `farms` e `plantings`.

---

## Scripts disponíveis

| Script                                                                      | Descrição                               |
| --------------------------------------------------------------------------- | --------------------------------------- |
| `npm run start:dev`                                                         | Inicia com hot-reload (desenvolvimento) |
| `npm run start:prod`                                                        | Inicia o build compilado (produção)     |
| `npm run build`                                                             | Compila o TypeScript para `dist/`       |
| `npm run migration:run`                                                     | Executa migrations pendentes            |
| `npm run migration:revert`                                                  | Reverte a última migration              |
| `npm run migration:generate -- src/infra/database/migrations/NomeMigration` | Gera nova migration                     |
| `npm run seed`                                                              | Popula dados iniciais no banco          |
| `npm run test`                                                              | Roda testes unitários                   |
| `npm run test:e2e`                                                          | Roda testes end-to-end                  |
| `npm run lint`                                                              | Lint e auto-fix                         |
