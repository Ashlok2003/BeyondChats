# BeyondChats Full Stack Assignment

![BeyondChats](https://img.shields.io/badge/BeyondChats-Assignment-blue)
![Node.js](https://img.shields.io/badge/Node.js-20-green)
![React](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Docker](https://img.shields.io/badge/Docker-Ready-blue)

A full-stack web application that scrapes articles from BeyondChats blog, enhances them using AI (OpenAI GPT-4), and displays them in a beautiful, responsive UI.

## 🌟 Features

### Phase 1: Backend & Web Scraping
- ✅ Web scraper for BeyondChats blog (fetches 5 oldest articles)
- ✅ PostgreSQL database with Prisma ORM
- ✅ RESTful CRUD APIs for article management
- ✅ Swagger/OpenAPI documentation
- ✅ Comprehensive error handling and logging

### Phase 2: Google Search & LLM Integration
- ✅ Google Search scraping for article titles
- ✅ Content extraction from top-ranking articles
- ✅ OpenAI GPT-4 integration for article rewriting
- ✅ Automatic citation of reference articles
- ✅ Smart content enhancement based on top-performing content

### Phase 3: React Frontend
- ✅ Modern, responsive UI with premium design
- ✅ Article listing with filtering (All, AI Enhanced, Original)
- ✅ Detailed article view with tabbed comparison
- ✅ Glassmorphism effects and smooth animations
- ✅ Mobile-first responsive design

## 🏗️ Architecture

```mermaid
graph TB
    subgraph "Frontend"
        A[React App<br/>TypeScript + Vite]
        B[TailwindCSS<br/>Premium UI]
    end

    subgraph "Backend"
        C[Express Server<br/>TypeScript]
        D[Prisma ORM]
        E[Swagger Docs]
    end

    subgraph "Services"
        F[Web Scraper<br/>Puppeteer]
        G[Google Search<br/>Scraper]
        H[Content Extractor]
        I[LLM Service<br/>OpenAI GPT-4]
    end

    subgraph "Database"
        J[(PostgreSQL)]
    end

    subgraph "External"
        K[BeyondChats Blog]
        L[Google Search]
        M[OpenAI API]
    end

    A -->|API Calls| C
    C --> D
    D --> J
    C --> E
    C --> F
    C --> G
    C --> H
    C --> I
    F -->|Scrapes| K
    G -->|Searches| L
    I -->|Enhances| M
```

## 📊 Data Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant Database
    participant Scraper
    participant Google
    participant LLM

    Note over User,LLM: Phase 1: Initial Scraping
    User->>Backend: Run scraper
    Backend->>Scraper: Scrape BeyondChats
    Scraper->>Database: Save articles

    Note over User,LLM: Phase 2: AI Enhancement
    User->>Backend: Run updater
    Backend->>Database: Fetch articles
    Backend->>Google: Search article title
    Google-->>Backend: Top 5 results
    Backend->>Scraper: Extract content
    Backend->>LLM: Rewrite article
    LLM-->>Backend: Enhanced content
    Backend->>Database: Update article

    Note over User,LLM: Phase 3: Display
    User->>Frontend: View articles
    Frontend->>Backend: GET /api/articles
    Backend->>Database: Query articles
    Database-->>Backend: Return data
    Backend-->>Frontend: JSON response
    Frontend-->>User: Render UI
```

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ and npm
- Docker and Docker Compose
- OpenAI API key OR Google Gemini API Key (for Phase 2)

### Option 1: Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone https://github.com/Ashlok2003/BeyondChats.git
   cd BeyondChats
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env and add your OPENAI_API_KEY or GEMINI_API_KEY
   ```

3. **Start all services**
   ```bash
   make build
   make up
   ```

4. **Run the scraper**
   ```bash
   docker exec beyondchats-backend npm run scrape
   ```

5. **Run the AI updater**
   ```bash
   docker exec beyondchats-backend npm run update
   ```

6. **Access the application**
   - Frontend: http://localhost
   - Backend API: http://localhost:3000
   - API Documentation: http://localhost:3000/api-docs

### Option 2: Local Development

1. **Install dependencies**
   ```bash
   make install
   ```

2. **Set up database**
   ```bash
   # Start PostgreSQL (or use Docker)
   docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres:16-alpine

   # Push database schema
   make db-push
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start development servers**
   ```bash
   make dev
   ```
   This starts:
   - Backend: http://localhost:3000
   - Frontend: http://localhost:5173
   - API Docs: http://localhost:3000/api-docs

5. **Run the scraper**
   ```bash
   make scrape
   ```

6. **Run the AI updater**
   ```bash
   make update
   ```

## 📖 API Documentation

### Endpoints

#### Articles

- `GET /api/articles` - Get all articles
  - Query params: `updated` (boolean) - Filter by update status
- `GET /api/articles/:id` - Get single article
- `POST /api/articles` - Create new article
- `PUT /api/articles/:id` - Update article
- `DELETE /api/articles/:id` - Delete article

### Interactive Documentation

Visit http://localhost:3000/api-docs for interactive Swagger documentation where you can test all endpoints.

## 🛠️ Available Commands

```bash
make help          # Show all available commands
make setup         # Initial project setup
make install       # Install dependencies
make dev           # Start development servers
make build         # Build Docker images
make up            # Start all services
make down          # Stop all services
make logs          # View logs
make clean         # Clean up containers and volumes
make scrape        # Run article scraper
make update        # Run AI updater
make db-push       # Push database schema
make db-studio     # Open Prisma Studio
```

## 🎨 UI Features

- **Modern Design**: Glassmorphism, gradients, and smooth animations
- **Responsive**: Mobile-first design that works on all devices
- **Dark Theme**: Eye-friendly dark mode with vibrant accents
- **Interactive**: Hover effects, loading states, and smooth transitions
- **Accessible**: Semantic HTML and proper ARIA labels

## 🔧 Technology Stack

### Backend
- **Runtime**: Node.js 20
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Web Scraping**: Puppeteer + Cheerio
- **LLM**: OpenAI GPT-4
- **Documentation**: Swagger/OpenAPI
- **Logging**: Winston

### Frontend
- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **Routing**: React Router
- **HTTP Client**: Axios
- **Markdown**: React Markdown

### DevOps
- **Containerization**: Docker
- **Orchestration**: Docker Compose
- **Web Server**: Nginx (for frontend)
- **Build Tool**: Make

## 🌐 Live Demo

🔗 **Live Link**: [Your deployed URL here]

> Note: Add your deployment URL after deploying to Vercel, Railway, Render, or any other platform.

## 📝 Environment Variables

### Backend (.env)

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/beyondchats?schema=public
OPENAI_API_KEY=your_openai_api_key_here
FRONTEND_URL=http://localhost:5173
BEYONDCHATS_BLOG_URL=https://beyondchats.com/blogs/
ARTICLES_TO_SCRAPE=5
```

### Frontend (client/.env)

```env
VITE_API_URL=http://localhost:3000/api
```

## 🧪 Testing

```bash
# Lint backend
npm run lint

# Lint frontend
cd client && npm run lint

# Run all tests
make test
```

## 📈 Performance Optimizations

- Multi-stage Docker builds for smaller images
- Nginx compression and caching
- Lazy loading and code splitting
- Optimized database queries with Prisma
- Connection pooling for database
- Rate limiting for API endpoints

## 🔒 Security Features

- Input validation with express-validator
- SQL injection prevention with Prisma
- XSS protection headers
- CORS configuration
- Environment variable management
- Secure password handling (if auth added)

## 🤝 Contributing

This is an assignment project, but suggestions are welcome!

## 📄 License

MIT License - feel free to use this code for learning purposes.

## 👨‍💻 Author

Created as part of the BeyondChats Full Stack Web Developer Internship assignment.

---

**Note**: Make sure to add your OpenAI or Gemini API key to the `.env` file before running the AI updater (Phase 2).
