# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Also contains the VIT Sports Intelligence Network — a FastAPI + React football prediction platform.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5 (Node) / FastAPI (Python)
- **Database**: PostgreSQL + Drizzle ORM (Node); SQLite + SQLAlchemy (Python)
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Python version**: 3.11

## VIT Sports Intelligence Network

Located in `vit-sports-intelligence/`. A full-stack football prediction platform.

### Structure

- `vit-sports-intelligence/main.py` — FastAPI entry point
- `vit-sports-intelligence/app/` — Application code (routes, models, services, schemas)
- `vit-sports-intelligence/frontend/` — React + Vite frontend
- `vit-sports-intelligence/alembic/` — Database migrations
- `vit-sports-intelligence/services/` — ML service layer
- `vit-sports-intelligence/.env` — Environment config (from `.env.example`)
- `vit-sports-intelligence/vit.db` — SQLite database

### Running

- **Backend**: `cd vit-sports-intelligence && python -m uvicorn main:app --host 0.0.0.0 --port 8000`
- **Frontend**: `cd vit-sports-intelligence/frontend && npm install && npm run dev`
- Backend workflow: "VIT Backend" (port 8000)
- Frontend workflow: "Start application" (port 5000, webview)

### Model Weights

- Uploaded/trained model weights live in `vit-sports-intelligence/models/` as 12 `.pkl` files.
- `vit_models.zip` was extracted into the model directory; `training_metrics.json` is stored in `vit-sports-intelligence/data/`.
- Runtime scikit-learn is pinned to `1.6.1` to match the uploaded trained model files.
- Bootstrap training dataset stats count uploaded `.pkl` training samples as historical training priors when `historical_matches.json` is not present.
- Match-level AI agent insights can be uploaded as JSON and are stored under `vit-sports-intelligence/data/insights/`; cached JSON is used before Gemini/Claude/Grok API calls.
- The frontend exposes manual insight upload both in the Admin panel by match ID and directly inside each Match Detail AI Agent Insights section.

### Key Python Dependencies

fastapi, uvicorn, SQLAlchemy, aiosqlite, alembic, pydantic, scikit-learn, pandas, numpy, httpx

## Key Commands (Node/pnpm workspace)

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
