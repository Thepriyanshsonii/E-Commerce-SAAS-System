# ============================================================
# E-Commerce Backend - Dockerfile
# Used for QA (Combat Cloud) and PROD (Oracle Cloud) deployments.
# DEV runs locally with `flask run` or `python -m backend.app`.
# ============================================================

FROM python:3.11-slim

# Set environment defaults (overridden by docker-compose or cloud env vars)
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=5000

WORKDIR /app

# Install system dependencies for psycopg2-binary and other compiled packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy the full project (backend + any shared utilities)
COPY . .

# Expose the application port
EXPOSE $PORT

# Use Gunicorn as the production WSGI server.
# Workers = (2 * CPU) + 1 is a common rule of thumb.
# QA machine: 2 CPUs → 5 workers. Override via GUNICORN_WORKERS env var.
CMD gunicorn \
    --workers ${GUNICORN_WORKERS:-5} \
    --bind 0.0.0.0:${PORT} \
    --timeout 120 \
    --access-logfile - \
    --error-logfile - \
    backend.app:app
