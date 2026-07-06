#!/bin/sh
set -e

echo "Veritabanı migration'ları uygulanıyor..."
uv run alembic upgrade head

echo "Uvicorn başlatılıyor (port=${PORT:-8000}, workers=${WEB_CONCURRENCY:-2})..."
# Railway/Render gibi platformlar dinlenecek portu $PORT ile enjekte eder;
# PORT tanımlı değilse (ör. docker-compose.prod.yml + Caddy) 8000'e düşer.
exec uv run uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}" --workers "${WEB_CONCURRENCY:-2}"
