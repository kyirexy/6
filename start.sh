#!/bin/bash
# VideoCapsule 本地启动脚本 (macOS/Linux)
# 同时启动后端 (FastAPI) 和前端 (Next.js)

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo ""
echo "  ========================================"
echo "   🫒 收藏夹榨汁机 VideoCapsule"
echo "  ========================================"
echo ""

# Check dependencies
command -v python3 >/dev/null 2>&1 || { echo "[ERROR] Python3 not found"; exit 1; }
command -v node >/dev/null 2>&1 || { echo "[ERROR] Node.js not found"; exit 1; }
command -v ffmpeg >/dev/null 2>&1 || echo "[WARN] FFmpeg not found. Install it for video processing."

echo "[1/3] Installing backend dependencies..."
cd "$SCRIPT_DIR/backend"
pip install -r requirements.txt -q 2>/dev/null || pip3 install -r requirements.txt -q

echo "[2/3] Installing frontend dependencies..."
cd "$SCRIPT_DIR/frontend"
npm install --silent

echo "[3/3] Starting services..."
echo ""
echo "  Backend:  http://localhost:8000"
echo "  Frontend: http://localhost:3000"
echo "  API Docs: http://localhost:8000/docs"
echo ""

# Start backend
cd "$SCRIPT_DIR/backend"
python run.py &
BACKEND_PID=$!

# Wait for backend
sleep 3

# Start frontend
cd "$SCRIPT_DIR/frontend"
npm run dev &
FRONTEND_PID=$!

echo "  Both services started! Press Ctrl+C to stop."
echo ""

# Trap to cleanup on exit
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo 'Services stopped.'" EXIT

wait
