# Use Python 3.12 slim image
FROM python:3.12-slim

# Install uv
RUN pip install uv

# Set working directory
WORKDIR /app

# Copy uv files first for better caching
COPY pyproject.toml uv.lock ./

# Install dependencies using uv
RUN uv sync --frozen

# Copy the application code
COPY . .

# Expose port 8000
EXPOSE 8000

CMD ["uv", "run", "main.py"]