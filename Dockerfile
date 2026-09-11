# Accept target app parameter (default: api-gateway)
ARG APP_NAME=api-gateway

# =========================================================
# Step 1: Build stage (Compiles ONLY the target microservice)
# =========================================================
FROM node:20-alpine AS builder

ARG APP_NAME

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY . .

# ⚡ Compiles ONLY target app + libs/common into dist/
RUN npx nest build ${APP_NAME}

# =========================================================
# Step 2: Production Stage (Clean & Isolated Container)
# =========================================================
FROM node:20-alpine AS runner

ARG APP_NAME

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci --only=production

# Copies dist/ (contains ONLY dist/apps/${APP_NAME} AND dist/libs/common)
COPY --from=builder /usr/src/app/dist ./dist

ENV APP_NAME=${APP_NAME}

# Starts ONLY the target microservice process
CMD node dist/apps/${APP_NAME}/main.js
