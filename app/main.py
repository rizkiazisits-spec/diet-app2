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

# CORS — izinkan frontend (akan dikonfigurasi nanti)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Ganti dengan domain spesifik di production
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
