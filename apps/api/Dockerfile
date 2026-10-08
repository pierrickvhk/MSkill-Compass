FROM python:3.12-slim-bookworm AS base
COPY --from=ghcr.io/astral-sh/uv:0.12.23 /uv /uvx /bin/
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 UV_COMPILE_BYTECODE=1
WORKDIR /app/apps/api
COPY apps/api/pyproject.toml apps/api/uv.lock ./

FROM base AS development
RUN uv sync --frozen
COPY apps/api/ ./
COPY content/ /app/content/
EXPOSE 8000
CMD ["uv", "run", "--frozen", "uvicorn", "mskill_api.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]

FROM base AS production
RUN uv sync --frozen --no-dev && useradd --create-home appuser
COPY apps/api/mskill_api/ ./mskill_api/
COPY content/ /app/content/
USER appuser
EXPOSE 8000
CMD [".venv/bin/uvicorn", "mskill_api.main:app", "--host", "0.0.0.0", "--port", "8000"]
