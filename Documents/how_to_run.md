# 🚀 How to Run — Enterprise Knowledge Assistant (EKA)

> The app runs as **5 Docker containers** managed by Docker Compose:
> `eka_postgres` · `eka_redis` · `eka_qdrant` · `eka_backend` · `eka_frontend`

---

## ✅ Prerequisites

| Tool | Required Version | Check |
|------|-----------------|-------|
| **Docker Desktop** | Latest | `docker --version` |
| **Docker Compose** | v2+ (bundled with Desktop) | `docker compose version` |

> **That's it.** Python, Node.js, and databases are all inside Docker — nothing needs to be installed locally.

---

## 📁 Step 1 — Verify `.env` File

The [.env](file:///e:/AIEnterprise%20Knowledge/.env) file at the root already exists with your credentials:```

> [!IMPORTANT]
> The Gemini API key is already set. No changes needed unless you want to use a different key.

---

## 🐳 Step 2 — Start All Services

Open a terminal in the project root (`e:\AIEnterprise Knowledge`) and run:

```powershell
docker compose up -d --build
```

This will:
1. **Build** the FastAPI backend image
2. **Build** the React/Vite frontend image
3. **Pull** PostgreSQL 15, Redis 7, and Qdrant v1.7.4 images
4. **Start** all 5 containers in detached mode

> First build takes **3–5 minutes**. Subsequent starts take ~10 seconds.

---

## 🗄️ Step 3 — First-Time Database Setup (Run Once Only)

After containers start, apply migrations and seed departments:

```powershell
# Apply the DB schema (creates all tables)
docker exec eka_backend alembic upgrade head

# Seed default departments (Finance, HR, Engineering, Marketing, etc.)
docker exec eka_backend python -m scripts.seed_db
```

> [!NOTE]
> Skip this step on subsequent runs — your data persists via Docker volumes.

---

## 🌐 Step 4 — Access the Application

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend UI** | http://localhost:5173 | Main React app |
| **Backend API Docs** | http://localhost:8000/docs | Swagger / OpenAPI UI |
| **Backend Health** | http://localhost:8000/health | Raw health check |
| **Qdrant Dashboard** | http://localhost:6333/dashboard | Vector DB UI |

---

## 📄 Step 5 — (Optional) Upload Test Dataset

To pre-populate the knowledge base with sample PDFs:

```powershell
# Run from the backend directory
docker exec eka_backend python -m scripts.upload_dataset
```

This uploads all PDFs from the `backend/test_dataset/` directory to the knowledge base.

---

## 🔄 Day-to-Day Commands

```powershell
# Start all containers (after first setup)
docker compose up -d

# Stop all containers (data is preserved)
docker compose down

# View live logs from all services
docker compose logs -f

# View logs for a specific service
docker compose logs -f backend
docker compose logs -f frontend

# Rebuild after code changes
docker compose up -d --build backend
docker compose up -d --build frontend

# Restart a single service
docker compose restart backend
```

---

## 🩺 Check Container Health

```powershell
# See status of all containers
docker compose ps

# Check backend is healthy
curl http://localhost:8000/health
```

Expected response:
```json
{ "status": "ok" }
```

---

## 🧹 Full Reset (Wipe All Data)

```powershell
# Stop containers AND remove all volumes (deletes all DB data!)
docker compose down -v

# Then re-run Step 2 and Step 3
docker compose up -d --build
docker exec eka_backend alembic upgrade head
docker exec eka_backend python -m scripts.seed_db
```

> [!CAUTION]
> `docker compose down -v` permanently deletes all your PostgreSQL, Redis, and Qdrant data.

---

## ⚠️ Troubleshooting

| Problem | Solution |
|---------|----------|
| **Port 5173 already in use** | Stop other dev servers: `npx kill-port 5173` |
| **Port 8000 already in use** | Change backend port in [docker-compose.yml](file:///e:/AIEnterprise%20Knowledge/docker-compose.yml) |
| **Migrations fail** | Wait 10s for postgres to be fully ready, then retry |
| **Gemini API errors** | Verify `EKA_GEMINI_API_KEY` in `.env` is valid |
| **Backend keeps restarting** | Check logs: `docker compose logs backend` |
| **Frontend blank screen** | Check: `docker compose logs frontend` for build errors |
| **Qdrant connection refused** | Ensure qdrant container is running: `docker compose ps` |
