# ==========================================
# STAGE 1: Builder
# ==========================================
FROM python:3.10-slim AS builder

WORKDIR /build

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

# Install dependencies into wheels folder
RUN pip install --no-cache-dir --user -r requirements.txt

# ==========================================
# STAGE 2: Final Production Image
# ==========================================
FROM python:3.10-slim

# Enforce security and performance best practices
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    FLASK_ENV=production \
    PORT=5000

WORKDIR /app

# Install runtime dependencies (like libpq for PostgreSQL connection) and curl for health check
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy installed Python packages from builder stage
COPY --from=builder /root/.local /root/.local
ENV PATH=/root/.local/bin:$PATH

# Copy backend folder into container at /app/backend
COPY backend/ /app/backend/

# Create reports and upload directories, ensuring proper permissions
RUN mkdir -p /app/backend/static/uploads /app/backend/utils/reports && \
    chmod -R 755 /app/backend/static/uploads /app/backend/utils/reports

# Add non-root system user for security isolation
RUN useradd -u 10001 -U -d /app -s /bin/bash appuser && \
    chown -R appuser:appuser /app

USER appuser

# Expose backend port
EXPOSE 5000

# Docker Healthcheck targeting the Flask application endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:5000/api/health || exit 1

# Launch using memory-optimized Gunicorn config
CMD ["gunicorn", "--config", "backend/gunicorn.conf.py", "backend.app:app"]
