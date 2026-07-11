"""
Modul autentikasi menggunakan Supabase Auth SDK.

- Inisialisasi Supabase client (lazy)
- Dependency untuk memverifikasi JWT token via Supabase SDK
- Sinkronisasi user Supabase → tabel users lokal
"""

import uuid
from functools import lru_cache

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from supabase import Client, create_client

from app.config import settings
from app.database import get_db
from app.models import User

# ──────────────────────────────────────────────
# Supabase Client (lazy initialization)
# ──────────────────────────────────────────────


@lru_cache()
def get_supabase_client() -> Client:
    """
    Membuat Supabase client secara lazy (hanya saat dipanggil pertama kali).

    Returns:
        Client: Supabase client yang sudah terkoneksi.

    Raises:
        RuntimeError: Jika SUPABASE_URL atau SUPABASE_KEY belum dikonfigurasi.
    """
    if not settings.supabase_url or "your-project" in settings.supabase_url:
        raise RuntimeError(
            "SUPABASE_URL belum dikonfigurasi. "
            "Isi file .env dengan kredensial Supabase yang benar."
        )
    if not settings.supabase_key or settings.supabase_key == "your-supabase-anon-key":
        raise RuntimeError(
            "SUPABASE_KEY belum dikonfigurasi. "
            "Isi file .env dengan kredensial Supabase yang benar."
        )
    return create_client(
        supabase_url=settings.supabase_url,
        supabase_key=settings.supabase_key,
    )


# ──────────────────────────────────────────────
# Security Scheme
# ──────────────────────────────────────────────

bearer_scheme = HTTPBearer(
    description="Masukkan JWT access token dari Supabase Auth",
)


# ──────────────────────────────────────────────
# Dependencies
# ──────────────────────────────────────────────


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    """
    Dependency untuk mendapatkan user yang sedang login.

    Verifikasi token dilakukan via Supabase SDK (bukan PyJWT).
    Jika user belum ada di tabel lokal, otomatis dibuat.

    Args:
        credentials: Bearer token dari header Authorization.
        db: Session database async.

    Returns:
        User: Object user dari database lokal.

    Raises:
        HTTPException: 401 jika token tidak valid.
    """
    token = credentials.credentials

    try:
        supabase = get_supabase_client()
        # Verifikasi token menggunakan Supabase SDK
        user_response = supabase.auth.get_user(token)
        supabase_user = user_response.user

        if supabase_user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token tidak valid atau sudah expired",
                headers={"WWW-Authenticate": "Bearer"},
            )
    except RuntimeError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(e),
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Gagal memverifikasi token: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Sinkronisasi user dari Supabase ke tabel lokal
    user_id = uuid.UUID(supabase_user.id)
    user_email = supabase_user.email or ""

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if user is None:
        # Buat user baru di tabel lokal
        user = User(id=user_id, email=user_email)
        db.add(user)
        await db.flush()

    return user
