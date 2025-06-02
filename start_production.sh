```bash
#!/bin/bash

echo "🚀 Starting Claude Engineer Enhanced (Production Mode)"

# Set environment variables
export ANDROID_HOME=/opt/android-sdk
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools
export PATH="/opt/miniforge3/bin:$PATH"

# Create project directories
mkdir -p android_projects web_projects python_projects

# Start backend server
echo "🖥️ Starting enhanced backend server..."
cd enhanced_backend
python simple_main.py &
BACKEND_PID=$!

# Wait for backend to start
sleep 5

# Start frontend development server (for development)
echo "🌐 Starting React frontend..."
cd ../enhanced_frontend
PORT=3001 yarn start &
FRONTEND_PID=$!

# Wait for services to start
sleep 10

echo "✅ Claude Engineer Enhanced is ready!"
echo "🌐 Frontend: http://localhost:3001"
echo "🔧 Backend API: http://localhost:8002"
echo "🤖 Claude AI: Ready (API key configured)"
echo ""
echo "Press Ctrl+C to stop all services"

# Keep script running and handle shutdown
cleanup() {
    echo "🛑 Shutting down services..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

# Wait for processes
wait
```

**Make sure to make this file executable after creating it:**
```bash
chmod +x start_production.sh
```
