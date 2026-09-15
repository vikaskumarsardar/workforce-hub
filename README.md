# 🚀 NestJS Microservices Monorepo Masterclass & Command Reference

Welcome to the complete documentation for the **NestJS Microservices Monorepo** project located in `/home/user/Desktop/NestJS`.

This guide serves as your permanent revision manual, covering **commands (full & short versions)**, **architecture diagrams**, **core package explanations**, and **step-by-step CLI workflows**.

---

## 📐 1. Architecture Overview

```
                                  ┌───────────────────────────┐
                                  │   NEXT.JS WEB DASHBOARD   │
                                  │    (apps/web - Vercel)    │
                                  └─────────────┬─────────────┘
                                                │ HTTP REST (Port 3000)
                                                ▼
                                  ┌───────────────────────────┐
                                  │        API GATEWAY        │
                                  │   (@gateway/* App Layer)  │
                                  └─────┬───────┬───────┬─────┘
                                        │       │       │
                ┌───────────────────────┘       │       └───────────────────────┐
                ▼                               ▼                               ▼
  ┌───────────────────────────┐   ┌───────────────────────────┐   ┌───────────────────────────┐
  │     AUTH MICROSERVICE     │   │     LEAVE MICROSERVICE    │   │    PAYROLL MICROSERVICE   │
  │     (Port 3001 - TCP)     │   │     (Port 3003 - TCP)     │   │     (Port 3004 - TCP)     │
  └───────────────────────────┘   └───────────────────────────┘   └───────────────────────────┘
                │                               │                               │
                └───────────────────────┬───────┴───────────────────────────────┘
                                        │ Redis Pub/Sub / TCP
                                        ▼
                          ┌───────────────────────────┐
                          │  NOTIFICATION SERVICE     │
                          │     (Port 3005 - TCP)     │
                          └───────────────────────────┘
                                        ▲
                                        │ `@app/common/*`
                                        │ (Shared Library)
                          ┌─────────────┴─────────────┐
                          │       COMMON LIBRARY      │
                          │  DB, DTOs, Enums, Filters │
                          └───────────────────────────┘
```

---

## 💼 1.1 Next.js Enterprise Frontend (`apps/web`)

The project includes **WorkforcePulse**, a modern Next.js 16 Enterprise SaaS web dashboard.

🌐 **Vercel Live Deployment**: [https://vercel.com/vikaskumarsardars-projects/workforce-hub](https://vercel.com/vikaskumarsardars-projects/workforce-hub)  
📁 **Frontend Documentation**: [apps/web/README.md](file:///home/user/Desktop/NestJS/apps/web/README.md)

### Features:
- **Employee Directory**: Searchable, multi-facet filterable table & grid view with detailed slide-over inspector.
- **Leave Approval Studio**: 4-stage Kanban workflow state machine (`Submitted` ➔ `Manager Approved` ➔ `HR Verified` ➔ `Payroll Locked`).
- **Automated Payroll Engine**: Gross-to-Net calculator with Redis Distributed Lock protection indicator.
- **Light & Dark Theme Engine**: Complete WCAG AA contrast compliant theme switcher + Role perspective switcher.

---

## ⚡ 2. Quick Command Reference

### 🏃 Running Services (3 Separate Terminals)

Navigate to `/home/user/Desktop/NestJS` and run:

```bash
# Terminal 1: Auth Microservice (TCP Port 3001)
npm run start:dev:auth

# Terminal 2: Orders Microservice (TCP Port 3002)
npm run start:dev:orders

# Terminal 3: API Gateway (HTTP Port 3000)
npm run start:dev:gateway
```

### 🔨 Building the Monorepo

```bash
npm run build
```

---

### 🧪 Endpoint Testing Cheatsheet (`curl`)

```bash
# 1. Register a New User (HTTP POST ➔ TCP Auth Service)
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "alice@example.com", "password": "securepassword", "name": "Alice Smith"}'

# 2. Login User (HTTP POST ➔ TCP Auth Service)
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "alice@example.com", "password": "securepassword"}'

# 3. Test DTO Validation Failure (Expect HTTP 400 Bad Request)
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "invalid-email", "password": "123"}'

# 4. Place New Order (HTTP POST ➔ TCP Orders Service + Pub/Sub Event)
curl -X POST http://localhost:3000/orders \
  -H "Content-Type: application/json" \
  -d '{"productName": "MacBook Pro M3", "quantity": 1, "price": 1999.00, "userId": "usr_100"}'

# 5. Get All Orders
curl -X GET http://localhost:3000/orders

# 6. Test RPC Exception Filter (Expect HTTP 404 Not Found)
curl -X GET http://localhost:3000/orders/ord_missing
```

---

## 🛠️ 3. Building a Monorepo from Scratch (Full & Short Commands)

### 🔹 Full Commands Version
```bash
# Step 1: Create Root Application
npx @nestjs/cli new my-monorepo --package-manager npm
cd my-monorepo

# Step 2: Generate Microservice Apps (Converts to Monorepo Mode)
npx nest generate app auth-service
npx nest generate app orders-service

# Step 3: Generate Shared Common Library (@app/common)
npx nest generate library common

# Step 4: Install Required Microservice & Validation Packages
npm install @nestjs/microservices @nestjs/config class-validator class-transformer
```

### ⚡ Short Version (CLI Shortcuts & Aliases)

```bash
# Step 1: Create Root Application
npx nest n my-monorepo -p npm
cd my-monorepo

# Step 2: Generate Sub-Apps (Short: 'g app')
npx nest g app auth-service
npx nest g app orders-service

# Step 3: Generate Shared Library (Short: 'g lib')
npx nest g lib common

# Step 4: Watch Mode Execution (Short: '-w')
npx nest start auth-service -w
npx nest start orders-service -w
npx nest start api-gateway -w
```

---

## ✂️ Nest CLI Generators Shortcuts Cheatsheet

| Full Command | Short Alias | Description |
| :--- | :--- | :--- |
| `nest generate app <name>` | `nest g app <name>` | Generate sub-application |
| `nest generate library <name>` | `nest g lib <name>` | Generate shared library package |
| `nest generate module <name>` | `nest g mo <name>` | Generate NestJS module |
| `nest generate controller <name>` | `nest g co <name>` | Generate controller file |
| `nest generate service <name>` | `nest g s <name>` | Generate service file |
| `nest generate guard <name>` | `nest g gu <name>` | Generate auth guard |
| `nest generate filter <name>` | `nest g f <name>` | Generate exception filter |
| `nest generate pipe <name>` | `nest g pi <name>` | Generate custom pipe |
| `nest generate interceptor <name>` | `nest g in <name>` | Generate interceptor |
| `nest start <name> --watch` | `nest start <name> -w` | Start app in dev watch mode |

---

## 📦 4. Core Package Breakdown

| Package Name | Primary Role | Usage Example |
| :--- | :--- | :--- |
| **`@nestjs/common`** | Core NestJS decorators, pipes, logger & HTTP helpers | `@Module()`, `@Controller()`, `@Injectable()`, `@Body()`, `ValidationPipe` |
| **`@nestjs/microservices`** | Microservice transport layer, RPC messaging, and ClientProxy | `NestFactory.createMicroservice()`, `ClientsModule`, `@MessagePattern()`, `@EventPattern()`, `RpcException` |
| **`@nestjs/config`** | `.env` file management & dynamic configuration | `ConfigModule.forRoot()`, `ConfigService.get('HTTP_PORT')`, `registerAsync()` |
| **`class-validator`** | Decorator-based input validation inside DTOs | `@IsEmail()`, `@MinLength(6)`, `@IsNotEmpty()` |
| **`class-transformer`** | Plain-to-class instance payload transformation | Required by `ValidationPipe({ transform: true })` |

---

## 🧠 5. Essential Microservice Concepts

### A. Request-Response (`@MessagePattern`) vs Event-Driven (`@EventPattern`)
- **`@MessagePattern()`**: Synchronous RPC (Command pattern). Caller sends data via `this.client.send()` and awaits a return value.
- **`@EventPattern()`**: Asynchronous Pub/Sub (Event pattern). Caller broadcasts an event via `this.client.emit()` fire-and-forget style.

### B. Exception Handling (`RpcToHttpExceptionFilter`)
- Backend microservices throw `new RpcException({ statusCode: 404, message: '...' })`.
- [rpc-exception.filter.ts](file:///home/user/Desktop/NestJS/libs/common/src/filters/rpc-exception.filter.ts) intercepts these RPC errors on the API Gateway and translates them cleanly into standard HTTP response codes (`400`, `401`, `404`, `409`).

### C. Clean Architecture Standards
- **Zero Hardcoded Values**: Ports, hosts, routes, error messages, and statuses are defined in [ConfigKeys](file:///home/user/Desktop/NestJS/libs/common/src/config/config.keys.ts), [ROUTES](file:///home/user/Desktop/NestJS/libs/common/src/constants/routes.ts), and [MESSAGES](file:///home/user/Desktop/NestJS/libs/common/src/constants/messages.ts).
- **Strongly Typed Contracts**: [OrderStatus Enum](file:///home/user/Desktop/NestJS/libs/common/src/enums/order-status.enum.ts), [IOrder Interface](file:///home/user/Desktop/NestJS/libs/common/src/interfaces/order.interface.ts), and [IUser Interface](file:///home/user/Desktop/NestJS/libs/common/src/interfaces/user.interface.ts) exported from `@app/common`.
- **Path Mapping**: `@app/common/*`, `@gateway/*`, `@auth/*`, `@orders/*` configured in `tsconfig.json`.

---

## 🗂️ 6. File Structure Map

```
/home/user/Desktop/NestJS/
├── apps/
│   ├── api-gateway/            # REST API Gateway & Routing (HTTP Port 3000)
│   │   └── src/
│   │       ├── auth/           # Auth REST endpoints
│   │       ├── employees/      # Staff directory REST endpoints
│   │       ├── leaves/         # Leave requests REST endpoints
│   │       ├── payroll/        # Payroll engine REST endpoints
│   │       ├── api-gateway.module.ts
│   │       └── main.ts
│   ├── auth-service/           # Authentication Microservice (TCP Port 3001)
│   │   └── src/
│   │       ├── auth-service.controller.ts
│   │       ├── auth-service.service.ts
│   │       ├── auth-service.module.ts
│   │       └── main.ts
│   ├── leave-service/          # Leave Approval Engine Microservice (TCP Port 3003)
│   │   └── src/
│   │       ├── leave-service.controller.ts
│   │       ├── leave-service.service.ts
│   │       ├── leave-service.module.ts
│   │       └── main.ts
│   ├── notification-service/   # Email & Event Notification Service (TCP Port 3005)
│   │   └── src/
│   │       ├── notification-service.controller.ts
│   │       ├── notification-service.service.ts
│   │       ├── notification-service.module.ts
│   │       └── main.ts
│   ├── payroll-service/        # Tax & Salary Calculation Engine (TCP Port 3004)
│   │   └── src/
│   │       ├── payroll-service.controller.ts
│   │       ├── payroll-service.service.ts
│   │       ├── payroll-service.module.ts
│   │       └── main.ts
│   └── web/                    # Next.js 16 Enterprise SaaS Web App
│       ├── src/
│       │   ├── app/
│       │   │   ├── (dashboard)/
│       │   │   │   ├── dashboard/  # Analytics KPI overview
│       │   │   │   ├── employees/  # Directory (Table & Grid views)
│       │   │   │   ├── leaves/     # 4-stage Kanban state machine
│       │   │   │   └── payroll/    # Gross-to-Net calculator & Payslips
│       │   │   ├── login/
│       │   │   ├── register-tenant/
│       │   │   ├── globals.css     # CSS Custom Properties & Design Tokens
│       │   │   └── layout.tsx
│       │   ├── components/
│       │   │   ├── employees/  # OnboardingModal, EmployeeDrawer
│       │   │   ├── layout/     # Sidebar, Header, ThemeToggle
│       │   │   ├── leaves/     # LeaveBalanceMeter, ApprovalDecisionModal
│       │   │   ├── payroll/    # PayslipModal, RedisLockIndicator
│       │   │   └── ui/         # Button, Card, DataTable, Badge, StatCard
│       │   ├── lib/            # Utility helpers & constants
│       │   ├── store/          # Zustand stores (useAuthStore, useThemeStore)
│       │   └── types/          # TypeScript Domain Interfaces
│       ├── vercel.json
│       └── package.json
├── libs/
│   └── common/                 # Shared Monorepo Package (@app/common)
│       └── src/
│           ├── config/         # Environment & Config Keys
│           ├── constants/      # Microservice Ports, Routes, Messages
│           ├── database/       # TypeORM / Prisma DB Managers
│           ├── decorators/     # Custom NestJS Decorators
│           ├── dtos/           # Shared DTO Contracts
│           ├── enums/          # Domain Enums (Roles, LeaveStatus, PayrollStatus)
│           ├── filters/        # RpcToHttpExceptionFilter
│           ├── guards/         # Auth & Role RBAC Guards
│           ├── interfaces/     # Shared Interfaces
│           ├── logging/        # Pino / Structured Logger Setup
│           ├── metrics/        # Prometheus Metrics Exporters
│           ├── outbox/         # Transactional Outbox Pattern
│           ├── redis/          # Distributed Lock & Caching Client
│           ├── security/       # JWT Tokens & Hashing
│           ├── tracing/        # OpenTelemetry & Tempo Tracing
│           └── index.ts
├── docker-compose.yml          # Local PostgreSQL, Redis, Prometheus, Tempo
├── Dockerfile                  # Multi-Stage Production Build Definition
├── prometheus.yml              # Prometheus Scrape Configuration
├── tempo.yaml                  # OpenTelemetry Trace Exporter Config
├── render.yaml                 # Render.com IaC Blueprint Definition
├── vercel.json                 # Vercel Monorepo Frontend Config
├── nest-cli.json               # NestJS Monorepo CLI Configuration
├── package.json
└── tsconfig.json
```
