#!/bin/bash
# Build Next.js static export and sync to Capacitor Android
set -e

echo "==> Building static export for Capacitor..."
CAPACITOR_BUILD=true NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL:-http://10.0.2.2:8000} npm run build

echo "==> Syncing to Android..."
npx cap sync android

echo "==> Done! Run 'npx cap open android' to open in Android Studio."
