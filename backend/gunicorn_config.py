# FastAPI is ASGI, so gunicorn needs uvicorn workers.
# Usage (from backend/): gunicorn -c gunicorn_config.py app:app
bind = "127.0.0.1:8000"
workers = 4
worker_class = "uvicorn.workers.UvicornWorker"
loglevel = "info"
timeout = 120
