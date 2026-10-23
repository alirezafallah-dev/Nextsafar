FROM node:20-bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 make g++ libssl-dev ca-certificates curl \
    && rm -rf /var/lib/apt/lists/*

RUN npm install -g pnpm@9.15.0 tsx@4.19.0

WORKDIR /app

# کپی فایل‌ها به عنوان root
COPY pnpm-workspace.yaml package.json turbo.json pnpm-lock.yaml ./
COPY apps/api ./apps/api
COPY packages ./packages

# نصب dependencies به عنوان root (بدون USER switch)
RUN pnpm install

# Generate Prisma Client
WORKDIR /app/packages/db
RUN pnpm exec prisma generate

# حالا user را ایجاد و owner را تغییر بده
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs && \
    chown -R nestjs:nodejs /app

USER nestjs
WORKDIR /app/apps/api

HEALTHCHECK --interval=30s --timeout=10s --start-period=120s --retries=5 \
  CMD curl -f http://localhost:3000/api/v1/hotels || exit 1

EXPOSE 3000
CMD ["tsx", "src/main.ts"]
