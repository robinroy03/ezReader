# Use Node.js LTS image as base
FROM node:18-slim

# Set working directory
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package*.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install

# Copy project files
COPY . .

# Expose port 5173 (Vite's default dev port)
EXPOSE 5173

# Start development server with host set to allow external access
CMD ["pnpm", "run", "dev", "--", "--host"]
