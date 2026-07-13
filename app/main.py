"""
Entry point aplikasi FastAPI — Diet Kalori App.

- Mendaftarkan semua router
- Menjalankan migrasi tabel saat startup
- CORS middleware untuk frontend nanti
"""

from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import create_tables
from app.routers import auth, chat, history


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """
    Lifecycle hook: dijalankan saat aplikasi startup dan shutdown.

    Startup:
        - Membuat tabel database jika belum ada.
    """
    # Startup
    await create_tables()
    yield
    # Shutdown (cleanup jika diperlukan)


app = FastAPI(
    title="Diet Kalori API",
    description=(
        "API backend untuk aplikasi diet kalori. "
        "Fitur: autentikasi via Supabase, pencatatan makanan & olahraga, "
        "dan rekomendasi diet berbasis AI (DeepSeek)."
    ),
    version="0.1.0",
    lifespan=lifespan,
)

# CORS — izinkan frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://diet-app2.vercel.app",
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ──────────────────────────────────────────────
# Register Routers
# ──────────────────────────────────────────────

app.include_router(auth.router)
app.include_router(chat.router)
app.include_router(history.router)


# ──────────────────────────────────────────────
# Health Check
# ──────────────────────────────────────────────


@app.get(
    "/",
    tags=["Health"],
    summary="Health check",
)
async def health_check() -> dict[str, str]:
    """Endpoint untuk memastikan API berjalan."""
    return {"status": "ok", "message": "Diet Kalori API is running 🚀"}
