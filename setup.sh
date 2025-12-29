#!/bin/bash

# BeyondChats Assignment - Quick Setup Script

echo "🚀 BeyondChats Assignment - Quick Setup"
echo "========================================"
echo ""

# Check Node.js
echo "Checking Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo "✅ Node.js $NODE_VERSION installed"
else
    echo "❌ Node.js not found. Please install Node.js 20+"
    exit 1
fi

# Check npm
echo "Checking npm..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    echo "✅ npm $NPM_VERSION installed"
else
    echo "❌ npm not found"
    exit 1
fi

# Check Docker
echo "Checking Docker..."
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker -v)
    echo "✅ Docker installed: $DOCKER_VERSION"
else
    echo "⚠️  Docker not found. Install Docker for containerized deployment"
fi

# Check Docker Compose
echo "Checking Docker Compose..."
if command -v docker-compose &> /dev/null; then
    COMPOSE_VERSION=$(docker-compose -v)
    echo "✅ Docker Compose installed: $COMPOSE_VERSION"
else
    echo "⚠️  Docker Compose not found"
fi

echo ""
echo "📦 Installing dependencies..."
echo ""

# Install backend dependencies
echo "Installing backend dependencies..."
npm install

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd client && npm install && cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Copy .env.example to .env and add your OPENAI_API_KEY"
echo "2. Run 'make dev' for development mode"
echo "3. Or run 'make up' for Docker deployment"
echo ""
echo "📚 Documentation:"
echo "   - README.md - Complete setup guide"
echo "   - ARCHITECTURE.md - Technical details"
echo "   - Walkthrough.md - Implementation details"
echo ""
