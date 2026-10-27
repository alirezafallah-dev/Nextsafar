#!/bin/bash
# Start API in Docker Mode (Production-like)

cd /var/www/Nextsafar

echo "🛑 Stopping Host API..."
sudo lsof -ti:3000 | xargs sudo kill -9 2>/dev/null || true
sudo pkill -9 -f "pnpm start:dev" 2>/dev/null || true
sudo pkill -9 -f "nest" 2>/dev/null || true
sleep 2

echo "🐳 Building Docker image (multi-stage)..."
sudo docker rmi nextsafar-api:latest 2>/dev/null || true
sudo docker build -t nextsafar-api:latest -f apps/api/Dockerfile .

if [ $? -ne 0 ]; then
  echo "❌ Docker build failed"
  exit 1
fi

echo ""
echo "🚀 Starting all services..."
sudo docker compose -f infra/docker/docker-compose.yml down 2>/dev/null || true
sudo docker compose -f infra/docker/docker-compose.yml up -d

echo ""
echo "⏳ Waiting 45 seconds..."
sleep 45

echo ""
echo "📊 Container status:"
sudo docker compose -f infra/docker/docker-compose.yml ps

echo ""
echo "📋 API Logs (last 30 lines):"
sudo docker logs nextsafar_api 2>&1 | tail -30

echo ""
echo "🧪 Quick test:"
curl -s -o /dev/null -w "GET /hotels -> %{http_code}\n" http://localhost:3000/api/v1/hotels

echo ""
echo "✅ Docker Mode Active!"
