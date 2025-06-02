#!/bin/bash

# Claude Engineer Enhanced - Setup Script
# This script sets up the development environment

set -e  # Exit on any error

echo "🚀 Setting up Claude Engineer Enhanced..."

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file from template..."
    cp .env.template .env
    echo "⚠️  Please edit .env file and add your ANTHROPIC_API_KEY before continuing!"
    echo "   You can get your API key from: https://console.anthropic.com/"
    echo ""
    read -p "Press Enter after you've added your API key to .env file..."
fi

# Check if API key is set
if grep -q "your_anthropic_api_key_here" .env; then
    echo "❌ Please replace 'your_anthropic_api_key_here' with your actual API key in .env file"
    exit 1
fi

echo "✅ Environment configuration ready!"

# Create project directories
echo "📁 Creating project directories..."
mkdir -p android_projects web_projects python_projects

# Check if Docker is available
if command -v docker &> /dev/null && command -v docker-compose &> /dev/null; then
    echo "🐳 Docker detected! You can use Docker deployment."
    echo ""
    echo "Choose deployment method:"
    echo "1) Docker (Recommended)"
    echo "2) Local development"
    echo ""
    read -p "Enter your choice (1 or 2): " choice
    
    if [ "$choice" = "1" ]; then
        echo "🐳 Starting with Docker..."
        docker-compose up --build
        exit 0
    fi
fi

echo "💻 Setting up local development environment..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not installed."
    echo "Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed."
    echo "Please install Python 3.11+ from https://python.org/"
    exit 1
fi

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd enhanced_backend
pip3 install -r requirements.txt
cd ..

# Install frontend dependencies  
echo "📦 Installing frontend dependencies..."
cd enhanced_frontend
if command -v yarn &> /dev/null; then
    yarn install
else
    npm install
fi
cd ..

echo "✅ Dependencies installed successfully!"

# Start services
echo "🚀 Starting Claude Engineer Enhanced..."
chmod +x start_production.sh
./start_production.sh
