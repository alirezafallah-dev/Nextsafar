FROM node:20-bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 make g++ ca-certificates curl \
    && rm -rf /var/lib/apt/lists/*

RUN npm install -g pnpm@9.15.0 tsx@4.19.0

WORKDIR /app

COPY pnpm-workspace.yaml package.json turbo.json pnpm-lock.yaml ./
COPY apps/search ./apps/search
COPY packages ./packages

# نصب به عنوان root
RUN pnpm install

WORKDIR /app/packages/db
RUN pnpm exec prisma generate

# ایجاد user و تغییر owner
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 fastify && \
    chown -R fastify:nodejs /app

USER fastify
WORKDIR /app/apps/search

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

EXPOSE 3001
CMD ["tsx", "src/main.ts"]
