# 🌾 Brain Agriculture API

RESTful API for rural management — registration of producers, farms, harvests, crops, and plantings.

---

## Table of Contents

- [Setup](#setup)
- [Running with Docker](#running-with-docker)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Technical Decisions](#technical-decisions)
- [Planting Model](#planting-model)
- [ER Diagram](#er-diagram)
- [Business Flows](#business-flows)

---

## Setup

### Prerequisites

| Tool       | Minimum Version   |
| ---------- | ----------------- |
| Node.js    | 20.x              |
| npm        | 10.x              |
| PostgreSQL | 15.x              |
| Docker     | 24.x _(optional)_ |

### Local Installation

```bash
# 1. Clone the repository
git clone <repo-url>
cd brain-agriculture

# 2. Install dependencies
npm install

# 3. Copy and fill in environment variables
cp .env.example .env

# 4. Run migrations (database must be running)
npm run migration:run

# 5. (Optional) Seed initial data
npm run seed

# 6. Start in development mode
npm run start:dev
```

The API will be available at `http://localhost:3000/api/v1`.  
Swagger will be available at `http://localhost:3000/docs`.

---

## Running with Docker

The `docker-compose.yml` starts two services: the **API** (Node 20) and **PostgreSQL 15**.  
Migrations run automatically when the API container starts.

```bash
# Start all services (development mode with hot-reload)
docker compose up

# Start in background
docker compose up -d

# Stop and remove containers
docker compose down

# Remove containers + database volume (full reset)
docker compose down -v
```

The API will be at `http://localhost:3000/api/v1` and Swagger at `http://localhost:3000/docs`.

### Production Build

```bash
docker compose build --target production
```

The `Dockerfile` has three stages:

| Stage         | Description                                  |
| ------------- | -------------------------------------------- |
| `development` | Installs all dependencies + hot-reload       |
| `build`       | Compiles TypeScript (`npm run build`)        |
| `production`  | Copies only `dist/` and runtime dependencies |

---

## Environment Variables

Create a `.env` file at the project root (based on `.env.example`):

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

## API Endpoints

All endpoints are prefixed with `/api/v1`.  
The full interactive documentation is available at `GET /docs` (Swagger UI).

### Producers — `/api/v1/producers`

| Method | Route            | Description                 | Success Status   |
| ------ | ---------------- | --------------------------- | ---------------- |
| POST   | `/producers`     | Register a new producer     | `201 Created`    |
| GET    | `/producers`     | List all producers          | `200 OK`         |
| GET    | `/producers/:id` | Find producer by UUID       | `200 OK`         |
| PUT    | `/producers/:id` | Update name and/or document | `200 OK`         |
| DELETE | `/producers/:id` | Delete producer (cascade)   | `204 No Content` |

**Example — create individual producer:**

```json
POST /api/v1/producers
{
  "name": "João da Silva",
  "document": "123.456.789-09"
}
```

**Example — create corporate producer:**

```json
POST /api/v1/producers
{
  "name": "Agropecuária São João Ltda",
  "document": "98.765.432/0001-10"
}
```

---

### Farms — `/api/v1/farms`

| Method | Route        | Description                          | Success Status   |
| ------ | ------------ | ------------------------------------ | ---------------- |
| POST   | `/farms`     | Register a farm linked to a producer | `201 Created`    |
| GET    | `/farms`     | List all farms                       | `200 OK`         |
| GET    | `/farms/:id` | Find farm by UUID                    | `200 OK`         |
| PUT    | `/farms/:id` | Update farm data                     | `200 OK`         |
| DELETE | `/farms/:id` | Delete farm (cascade on plantings)   | `204 No Content` |

**Example — create farm:**

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

> **Business rule:** `arableArea + vegetationArea ≤ totalArea`. Any violation returns `422 Unprocessable Entity`.

---

### Harvests — `/api/v1/harvests`

| Method | Route           | Description                                 | Success Status   |
| ------ | --------------- | ------------------------------------------- | ---------------- |
| POST   | `/harvests`     | Register an agricultural year               | `201 Created`    |
| GET    | `/harvests`     | List all harvests                           | `200 OK`         |
| DELETE | `/harvests/:id` | Delete harvest (blocked if plantings exist) | `204 No Content` |

**Example:**

```json
POST /api/v1/harvests
{
  "year": 2025
}
```

---

### Crops — `/api/v1/crops`

| Method | Route        | Description                              | Success Status   |
| ------ | ------------ | ---------------------------------------- | ---------------- |
| POST   | `/crops`     | Register a crop in the catalog           | `201 Created`    |
| GET    | `/crops`     | List all crops                           | `200 OK`         |
| DELETE | `/crops/:id` | Delete crop (blocked if plantings exist) | `204 No Content` |

**Crop examples:**

```json
POST /api/v1/crops
{ "name": "Soybean" }

{ "name": "Corn" }
{ "name": "Coffee" }
{ "name": "Sugarcane" }
{ "name": "Cotton" }
```

---

### Plantings — `/api/v1/plantings`

| Method | Route            | Description                                 | Success Status   |
| ------ | ---------------- | ------------------------------------------- | ---------------- |
| POST   | `/plantings`     | Register a planting (farm + harvest + crop) | `201 Created`    |
| GET    | `/plantings`     | List all plantings                          | `200 OK`         |
| DELETE | `/plantings/:id` | Delete a planting record                    | `204 No Content` |

**Example:**

```json
POST /api/v1/plantings
{
  "farmId": "d4e5f6a7-b8c9-0123-defa-456789012345",
  "harvestId": "e5f6a7b8-c9d0-1234-efab-567890123456",
  "cropId": "f6a7b8c9-d0e1-2345-fabc-678901234567"
}
```

---

## Technical Decisions

### Architecture: Clean Architecture

The project follows **Clean Architecture** principles, separating code into four layers:

```
src/
├── domain/          # Entities, repository interfaces, Value Objects, domain errors
├── application/     # Use Cases and DTOs — business logic orchestrators
├── infra/           # TypeORM repositories, NestJS modules, migrations, seeds
└── presentation/    # HTTP controllers and exception filters
```

**Why this structure?**  
The dependency rule flows inward: `presentation → application → domain`. The domain layer has no knowledge of the framework or database, making the business core testable and infrastructure-independent.

---

### Framework: NestJS + TypeScript

- **NestJS** provides Dependency Injection, decorators, and modular organization without sacrificing Node.js performance.
- **TypeScript** enforces static typing across all layers, reducing bugs and easing refactoring.

---

### ORM: TypeORM

- Versioned migrations for schema control.
- Soft delete via `DeleteDateColumn` on all entities — deleted records are preserved in the database with a `deleted_at` timestamp.
- Explicit indexes on join columns (e.g. `producer_id`, `farm_id`) for relational query performance.

---

### Value Object: Document (CPF/CNPJ)

CPF and CNPJ are modeled as **Value Objects** (`src/domain/value-objects/tax-id.vo.ts`), not as plain strings.  
The constructor validates structure and **check digits** at creation time — if invalid, it throws a `ValidationDomainError` that is automatically converted to `422 Unprocessable Entity` by the global filter.

This guarantees that **an invalid document never reaches the database**.

---

### Global Validation

- **`class-validator`** + `ValidationPipe` with `whitelist: true` and `forbidNonWhitelisted: true` — only properties declared in the DTOs reach the Use Cases.
- **`HttpExceptionFilter`** globally catches domain exceptions (`ValidationDomainError`, `BusinessRuleViolationError`) and converts them into standardized HTTP responses.

---

### Database: PostgreSQL 15

- Chosen for its robustness and native support for UUIDs, arbitrary-precision numeric types, and relational constraints.
- Farm areas use `numeric(12,4)` to avoid floating-point errors.

---

### Swagger: `@nestjs/swagger`

- Available at `/docs` in all environments.
- DTOs annotated with `@ApiProperty` expose real examples directly in the UI.
- All endpoints have documented `@ApiOperation`, `@ApiResponse`, and `@ApiParam`.

---

## Planting Model

The **Planting** is the central entity in the data model — it represents the record that **a specific crop was planted on a farm during a specific harvest season**.

### Why an explicit junction entity?

A simple many-to-many relationship (Farm ↔ Crop) would not be sufficient, because the **temporal context** (harvest/year) is essential in agribusiness. The Planting carries this extra dimension:

```
Farm × Harvest × Crop → Planting
```

### Critical Business Rule

The combination `(farmId, harvestId, cropId)` is **unique** in the database (`@Unique` constraint on the entity) and also verified at the application layer before INSERT:

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

This means:

- ✅ The same crop can be registered on **different farms** in the same harvest.
- ✅ The same farm can plant the same crop in **different harvests**.
- ❌ The same crop **cannot** be registered twice on the same farm in the same harvest.

### Referential Integrity

| Relationship        | Behavior on delete                                |
| ------------------- | ------------------------------------------------- |
| Producer → Farms    | `CASCADE` — deletes farms along with the producer |
| Farm → Plantings    | `CASCADE` — deletes plantings linked to the farm  |
| Harvest → Plantings | `RESTRICT` — blocks deletion if plantings exist   |
| Crop → Plantings    | `RESTRICT` — blocks deletion if plantings exist   |

---

## ER Diagram

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

**Cardinalities:**

| Relationship        | Cardinality                                          |
| ------------------- | ---------------------------------------------------- |
| Producer → Farms    | 1 : N                                                |
| Farm → Plantings    | 1 : N                                                |
| Harvest → Plantings | 1 : N                                                |
| Crop → Plantings    | 1 : N                                                |
| Farm ↔ Crop         | N : M (via Planting + Harvest as temporal dimension) |

---

## Business Flows

### Flow 1 — Full registration from producer to planting

```
1. POST /api/v1/producers
   └─► Creates producer (validates CPF/CNPJ via Value Object)

2. POST /api/v1/farms
   └─► Creates farm linked to the producer
       └─► Validates: arableArea + vegetationArea ≤ totalArea

3. POST /api/v1/harvests
   └─► Registers the agricultural year (e.g. 2025)

4. POST /api/v1/crops
   └─► Registers the crop in the catalog (e.g. "Soybean")

5. POST /api/v1/plantings
   └─► Records the planting (farm + harvest + crop)
       └─► Validates: farm, harvest, and crop exist
       └─► Validates: combination (farm, harvest, crop) not already registered
```

---

### Flow 2 — Farm update

```
PUT /api/v1/farms/:id
  ├─► Retrieves existing farm
  ├─► Merges provided fields with current values
  └─► Re-validates area rule (arableArea + vegetationArea ≤ totalArea)
```

---

### Flow 3 — Cascade deletion of producer

```
DELETE /api/v1/producers/:id
  └─► Soft-delete producer
      └─► CASCADE: soft-delete farms
          └─► CASCADE: soft-delete plantings linked to those farms
```

> Deleted records are kept in the database with `deleted_at` filled in and do not appear in normal queries.

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
