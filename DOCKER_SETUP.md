# Docker Setup Guide

This project uses Docker Compose with nginx as a reverse proxy to orchestrate the frontend (React/Vite) and backend (FastAPI) services.

## Architecture

```
nginx (port 80) 
├── / → frontend (React/Vite on port 5173)
└── /api → backend (FastAPI on port 8000)
```

## Prerequisites

1. **Docker** and **Docker Compose** installed
2. **Google Gemini API Key** - Get it from [Google AI Studio](https://makersuite.google.com/app/apikey)

## Quick Start

1. **Set up environment variables:**
   ```bash
   # Create .env file in the root directory
   echo "GEMINI_API_KEY=your_actual_api_key_here" > .env
   ```

2. **Build and run the services:**
   ```bash
   docker-compose up --build
   ```

3. **Access the application:**
   - Frontend: http://localhost
   - Backend API: http://localhost/api
   - Backend health check: http://localhost/health

## Services

### Frontend Service
- **Technology**: React + Vite + TypeScript
- **Container Port**: 5173
- **Features**: Hot module replacement (HMR) enabled
- **API Base URL**: Automatically configured to use nginx proxy (`/api`)

### Backend Service  
- **Technology**: FastAPI + Python 3.12
- **Container Port**: 8000
- **Dependency Management**: uv (ultra-fast Python package installer)
- **API Endpoints**:
  - `GET /` - Health check
  - `POST /generate-roadmap` - Generate learning roadmap from text

### Nginx Reverse Proxy
- **Port**: 80 (main entry point)
- **Features**: 
  - Routes frontend requests to React dev server
  - Routes `/api/*` requests to FastAPI backend
  - WebSocket support for Vite HMR
  - Load balancing ready

## Development Workflow

### Making Changes

**Frontend Changes:**
- Edit files in `src/` directory
- Changes are hot-reloaded automatically via Vite HMR

**Backend Changes:**
- Edit files in `backend/` directory  
- Container will restart automatically due to volume mounting

### Adding Dependencies

**Frontend:**
```bash
# Enter the frontend container
docker-compose exec frontend sh
pnpm add package-name
```

**Backend:**
```bash
# Enter the backend container  
docker-compose exec backend sh
uv add package-name
```

### Logs and Debugging

```bash
# View all service logs
docker-compose logs

# View specific service logs
docker-compose logs frontend
docker-compose logs backend
docker-compose logs nginx

# Follow logs in real-time
docker-compose logs -f
```

## API Integration

The frontend automatically uses the nginx proxy for API calls:

- **Development (local)**: `http://localhost:8000/generate-roadmap`
- **Docker Compose**: `http://localhost/api/generate-roadmap`

The API service in `src/services/api.ts` is configured to work with both environments.

## Environment Variables

Create a `.env` file in the root directory:

```env
# Required for backend
GEMINI_API_KEY=your_gemini_api_key_here
```

## Troubleshooting

### Container Issues
```bash
# Rebuild containers from scratch
docker-compose down
docker-compose up --build --force-recreate

# Remove all containers and volumes
docker-compose down -v
```

### Network Issues
```bash
# Check container networking
docker-compose ps
docker network ls
docker network inspect pdfjs-5331-dist_app-network
```

### Backend API Issues
```bash
# Test backend directly
curl http://localhost/health
curl -X POST http://localhost/api/generate-roadmap \
  -H "Content-Type: application/json" \
  -d '{"text": "Learn Python programming"}'
```

## Production Deployment

For production deployment:

1. **Build production images:**
   ```bash
   docker-compose -f docker-compose.prod.yml up --build
   ```

2. **Environment variables:**
   - Set `NODE_ENV=production`
   - Configure proper CORS origins in backend
   - Use environment-specific API URLs

3. **Security considerations:**
   - Use HTTPS in production
   - Configure proper nginx security headers
   - Secure API key management
   - Enable rate limiting

## File Structure

```
├── docker-compose.yml          # Main orchestration file
├── nginx.conf                  # Nginx proxy configuration
├── dockerfile                  # Frontend container
├── backend/
│   ├── Dockerfile             # Backend container
│   ├── main.py                # FastAPI application
│   ├── pyproject.toml         # Python dependencies (uv)
│   └── uv.lock               # Locked dependencies
└── src/
    └── services/
        └── api.ts             # Frontend API service
``` 