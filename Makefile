.PHONY: help setup install dev build up down logs clean scrape update test db-push db-studio

# Default target
help:
	@echo "BeyondChats Assignment - Available Commands"
	@echo "==========================================="
	@echo "setup          - Initial project setup (install dependencies)"
	@echo "install        - Install all dependencies (backend + frontend)"
	@echo "dev            - Start development servers"
	@echo "build          - Build Docker images"
	@echo "up             - Start all services with Docker Compose"
	@echo "down           - Stop all services"
	@echo "logs           - View logs from all services"
	@echo "clean          - Clean up containers and volumes"
	@echo "scrape         - Run article scraper (Phase 1)"
	@echo "update         - Run article updater with LLM (Phase 2)"
	@echo "db-push        - Push database schema"
	@echo "db-studio      - Open Prisma Studio"
	@echo "test           - Run tests"

# Initial setup
setup: install db-push
	@echo "✅ Setup complete! Run 'make dev' to start development"

# Install dependencies
install:
	@echo "📦 Installing backend dependencies..."
	npm install
	@echo "📦 Installing frontend dependencies..."
	cd client && npm install
	@echo "✅ Dependencies installed"

# Development mode
dev:
	@echo "🚀 Starting development servers..."
	@echo "Backend will run on http://localhost:3000"
	@echo "Frontend will run on http://localhost:5173"
	@echo "API Docs: http://localhost:3000/api-docs"
	@make -j2 dev-backend dev-frontend

dev-backend:
	npm run dev

dev-frontend:
	cd client && npm run dev

# Build Docker images
build:
	@echo "🏗️  Building Docker images..."
	docker-compose build
	@echo "✅ Build complete"

# Start services with Docker Compose
up:
	@echo "🚀 Starting services..."
	docker-compose up -d
	@echo "✅ Services started"
	@echo "Frontend: http://localhost"
	@echo "Backend API: http://localhost:3000"
	@echo "API Docs: http://localhost:3000/api-docs"

# Stop services
down:
	@echo "🛑 Stopping services..."
	docker-compose down
	@echo "✅ Services stopped"

# View logs
logs:
	docker-compose logs -f

# Clean up
clean:
	@echo "🧹 Cleaning up..."
	docker-compose down -v
	rm -rf node_modules client/node_modules
	rm -rf dist client/dist
	@echo "✅ Cleanup complete"

# Run scraper (Phase 1)
scrape:
	@echo "🕷️  Running article scraper..."
	npm run scrape

# Run updater (Phase 2)
update:
	@echo "🤖 Running article updater with LLM..."
	npm run update

# Database commands
db-push:
	@echo "📊 Pushing database schema..."
	npx prisma db push
	npx prisma generate

db-studio:
	@echo "🎨 Opening Prisma Studio..."
	npx prisma studio

# Test
test:
	@echo "🧪 Running tests..."
	@echo "Backend tests..."
	npm run lint
	@echo "Frontend tests..."
	cd client && npm run lint
	@echo "✅ Tests complete"
