#!/bin/bash
cd /var/www/Nextsafar

echo "🧹 Cleaning lockfile..."
rm -f pnpm-lock.yaml
rm -rf node_modules apps/*/node_modules packages/*/node_modules

echo "📦 Reinstalling dependencies (fresh lockfile)..."
pnpm install

echo "🐳 Building with host network (bypasses DNS issues)..."
sudo docker build \
  --network=host \
  --no-cache \
  -t nextsafar-api:latest \
  -f apps/api/Dockerfile .

if [ $? -eq 0 ]; then
  echo "✅ Build successful!"
  sudo docker compose -f infra/docker/docker-compose.yml up -d
  sleep 45
  sudo docker compose -f infra/docker/docker-compose.yml ps
else
  echo "❌ Build failed"
fi
