# 🚀 NestJS Microservices Monorepo Masterclass & Command Reference

Welcome to the complete documentation for the **NestJS Microservices Monorepo** project located in `/home/user/Desktop/NestJS`.

This guide serves as your permanent revision manual, covering **commands (full & short versions)**, **architecture diagrams**, **core package explanations**, and **step-by-step CLI workflows**.

---

## 📐 1. Architecture Overview

```
                                  ┌───────────────────────────┐
                                  │      CLIENT / POSTMAN     │
                                  └─────────────┬─────────────┘
                                                │ HTTP REST (Port 3000)
                                                ▼
                                  ┌───────────────────────────┐
                                  │        API GATEWAY        │
                                  │   (@gateway/* App Layer)  │
                                  └─────┬───────────────┬─────┘
                                        │               │
                     TCP Port 3001      │               │      TCP Port 3002
              ┌─────────────────────────┘               └─────────────────────────┐
              ▼                                                                   ▼
┌───────────────────────────┐                                       ┌───────────────────────────┐
│     AUTH MICROSERVICE     │                                       │    ORDERS MICROSERVICE    │
│    (@auth/* App Layer)    │                                       │   (@orders/* App Layer)   │
└───────────────────────────┘                                       └───────────────────────────┘
                                                ▲
                                                │ `@app/common/*`
                                                │ (Shared Library)
                                  ┌─────────────┴─────────────┐
                                  │       COMMON LIBRARY      │
                                  │    DTOs, Enums, Filters   │
                                  └───────────────────────────┘
```

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
│   ├── api-gateway/
│   │   └── src/
│   │       ├── auth/auth.controller.ts
│   │       ├── orders/orders.controller.ts
│   │       ├── api-gateway.module.ts
│   │       └── main.ts
│   ├── auth-service/
│   │   └── src/
│   │       ├── auth-service.controller.ts
│   │       ├── auth-service.service.ts
│   │       ├── auth-service.module.ts
│   │       └── main.ts
│   └── orders-service/
│       └── src/
│           ├── orders-service.controller.ts
│           ├── orders-service.service.ts
│           ├── orders-service.module.ts
│           └── main.ts
├── libs/
│   └── common/
│       └── src/
│           ├── config/config.keys.ts
│           ├── constants/services.ts
│           ├── constants/routes.ts
│           ├── constants/messages.ts
│           ├── dtos/create-user.dto.ts
│           ├── dtos/login-user.dto.ts
│           ├── dtos/create-order.dto.ts
│           ├── enums/order-status.enum.ts
│           ├── filters/rpc-exception.filter.ts
│           ├── interfaces/user.interface.ts
│           ├── interfaces/order.interface.ts
│           └── index.ts
├── .env
├── nest-cli.json
├── package.json
└── tsconfig.json
```
