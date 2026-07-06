FROM python:3.12-slim

WORKDIR /app

COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev

COPY . .

# Playwright'in PDF servisi için Chromium'u indir (Faz 5'te kullanılacak)
RUN uv run playwright install --with-deps chromium

RUN chmod +x docker-entrypoint.sh

EXPOSE 8000

# Konteyner başlarken migration'ları otomatik uygular, sonra uvicorn'u başlatır
# (bkz. docker-entrypoint.sh). WEB_CONCURRENCY ile worker sayısı ayarlanabilir.
CMD ["./docker-entrypoint.sh"]
