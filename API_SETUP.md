# API Configuration Guide

This application supports two modes for API communication:

## Local Development Mode (Default)
- Frontend connects directly to backend at `http://localhost:8000`
- No nginx proxy needed
- Best for development and debugging

### Setup:
1. Start backend: `cd backend && uv run main.py`
2. Start frontend: `pnpm run dev`
3. The API service will automatically use `http://localhost:8000`

## Production Mode (Docker)
- Frontend connects through nginx proxy at `http://localhost/api`
- Nginx routes `/api/*` requests to backend container
- Best for production-like testing

### Setup:
1. Run with Docker Compose: `docker-compose up`
2. The application will be available at `http://localhost`
3. Nginx will proxy API calls to the backend container

## Configuration

### Environment Variables:
- `VITE_PRODUCTION_MODE`: Set to `"true"` for Docker/nginx mode, `"false"` for local development
- `VITE_API_BASE_URL`: Override the default API base URL

### For Local Development:
Create a `.env.local` file:
```env
VITE_PRODUCTION_MODE=false
```

### For Docker/Production:
The docker-compose.yml already sets:
```env
VITE_PRODUCTION_MODE=true
VITE_API_BASE_URL=http://localhost/api
```

## Troubleshooting

### Connection Refused Error:
1. **Local Mode**: Make sure backend is running on port 8000
2. **Docker Mode**: Make sure all containers are running (`docker-compose up`)
3. Check the browser console for API configuration logs

### Network Error:
- Verify the correct mode is enabled
- Check if backend health endpoint responds:
  - Local: `http://localhost:8000/health`
  - Docker: `http://localhost/api/health` 