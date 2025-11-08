#!/bin/bash
set -euo pipefail
cd /home/isaco/inventory-app

# Kill any existing processes on port 8082
lsof -ti:8082 | xargs kill -9 2>/dev/null || true
sleep 1

export EXPO_PUBLIC_API_URL=${EXPO_PUBLIC_API_URL:-http://192.168.1.151:3000}
export CI=1
export EXPO_NO_TELEMETRY=1

# Install dependencies if needed
bun install --frozen-lockfile || bun install

# Start Expo with proper flags (CI=1 makes it non-interactive)
# --clear flag clears the Metro bundler cache
exec bunx expo start --web --port 8082 --host lan --clear
