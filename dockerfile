# Use Node.js LTS image as base
FROM node:18-slim

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy project files
COPY . .

# Expose port 5173 (Vite's default dev port)
EXPOSE 5173

# Start development server with host set to allow external access
CMD ["npm", "run", "dev", "--", "--host"]
