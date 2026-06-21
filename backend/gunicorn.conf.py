import os
import multiprocessing

# Bind address and port
bind = f"0.0.0.0:{os.getenv('PORT', '5000')}"

# ==========================================
# Resource & Concurrency Optimization
# ==========================================
# Crucial for 1GB RAM VM to avoid Out-Of-Memory (OOM) errors.
# We limit workers strictly to 2 to minimize memory usage, 
# while adding 2 threads per worker to handle basic concurrent traffic.
workers = 2
threads = 2
worker_class = 'gthread'

# Process management parameters
timeout = 120
keepalive = 5

# Memory leak protection: periodically restart workers after handling requests
max_requests = 500
max_requests_jitter = 50

# ==========================================
# Logging Config
# ==========================================
# Send access and error logs to stdout/stderr for Docker log capture
accesslog = '-'
errorlog = '-'
loglevel = os.getenv('LOG_LEVEL', 'info')

# Standardized JSON access log format (optional but helpful for monitoring)
access_log_format = '%(h)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s "%(f)s" "%(a)s"'
