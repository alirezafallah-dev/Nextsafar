# ============================================
# Stage 1: Base
# ============================================
FROM node:20-bookworm-slim AS base
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 make g++ libssl-dev ca-certificates curl \
    && rm -rf /var/lib/apt/lists/*
RUN npm install -g pnpm@9.15.0
WORKDIR /app

# ============================================
# Stage 2: Dependencies
# ============================================
FROM base AS dependencies
COPY pnpm-workspace.yaml package.json turbo.json pnpm-lock.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/db/package.json ./packages/db/
COPY packages/shared-types/package.json ./packages/shared-types/
COPY packages/shared-schemas/package.json ./packages/shared-schemas/
COPY packages/logger/package.json ./packages/logger/
COPY packages/config/package.json ./packages/config/

# بدون --frozen-lockfile چون lockfile ممکن است تغییر کند
RUN pnpm install

COPY packages/db/prisma ./packages/db/prisma
RUN cd packages/db && pnpm exec prisma generate

# ============================================
# Stage 3: Build
# ============================================
FROM dependencies AS build
COPY apps/api ./apps/api
COPY packages ./packages
WORKDIR /app/apps/api

# حذف "type": "module" از package.json
RUN sed -i '/"type":\s*"module"/d' package.json

# Build
RUN pnpm build

# ============================================
# Stage 4: Production
# ============================================
FROM node:20-bookworm-slim AS production
RUN apt-get update && apt-get install -y --no-install-recommends \
    libssl-dev ca-certificates curl \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

# کپی node_modules از dependencies
COPY --from=dependencies --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=dependencies --chown=nestjs:nodejs /app/packages/db ./packages/db

# کپی dist از build
COPY --from=build --chown=nestjs:nodejs /app/apps/api/dist ./dist
COPY --from=build --chown=nestjs:nodejs /app/apps/api/package.json ./package.json

# حذف "type": "module" از package.json نهایی
RUN sed -i '/"type":\s*"module"/d' package.json

USER nestjs

HEALTHCHECK --interval=30s --timeout=10s --start-period=120s --retries=5 \
  CMD curl -f http://localhost:3000/api/v1/hotels || exit 1

EXPOSE 3000
CMD ["node", "dist/main.js"]
