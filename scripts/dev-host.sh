#!/bin/bash
# Start API in Host Mode (Development)

cd /var/www/Nextsafar

echo "🛑 Stopping Docker API container..."
sudo docker compose -f infra/docker/docker-compose.yml stop api 2>/dev/null || true

echo "🛑 Killing any process on port 3000..."
sudo lsof -ti:3000 | xargs sudo kill -9 2>/dev/null || true
sudo pkill -9 -f "pnpm start:dev" 2>/dev/null || true
sudo pkill -9 -f "nest" 2>/dev/null || true
sleep 2

echo "📝 Using Host Mode configuration..."
cp apps/api/.env.host apps/api/.env

# تأیید env درست
echo "📋 Verifying environment:"
grep "DATABASE_URL" apps/api/.env
grep "REDIS_HOST" apps/api/.env

echo "🚀 Starting API in Host Mode..."
cd apps/api
nohup pnpm start:dev > /tmp/nest-host.log 2>&1 &
SERVER_PID=$!
echo "Server PID: $SERVER_PID"
echo "Log: tail -f /tmp/nest-host.log"

echo ""
echo "⏳ Waiting 15 seconds..."
sleep 15

echo ""
echo "📋 Checking logs..."
tail -30 /tmp/nest-host.log | grep -E "(Starting Nest|Application is running|error|Error)" | head -10

echo ""
echo "🧪 Quick test:"
curl -s -o /dev/null -w "GET /hotels -> %{http_code}\n" http://localhost:3000/api/v1/hotels

echo ""
echo "✅ Host Mode Active!"
