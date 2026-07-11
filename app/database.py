"""
Koneksi database async menggunakan SQLAlchemy + asyncpg.

Menyediakan async engine, session factory, dan Base model.
"""

import uuid
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.config import settings

engine = create_async_engine(
    settings.database_url,
    echo=False,
    pool_size=5,
    max_overflow=10,
    connect_args={
        "statement_cache_size": 0,
        "prepared_statement_cache_size": 0,
        "prepared_statement_name_func": lambda: f"__asyncpg_{uuid.uuid4()}__",
    },
)

# Session factory — menghasilkan AsyncSession
async_session_factory = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


class Base(DeclarativeBase):
    """Base class untuk semua model SQLAlchemy."""

    pass


async def get_db() -> AsyncSession:  # type: ignore[misc]
    """
    Dependency untuk mendapatkan database session.

    Yields:
        AsyncSession: Session database yang aktif.
    """
    async with async_session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def create_tables() -> None:
    """Membuat semua tabel di database berdasarkan model yang terdaftar."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        
        # Run raw migrations to add name, avatar_url, goal, deadline to users table
        from sqlalchemy import text
        await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS name VARCHAR(255);"))
        await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;"))
        await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS goal VARCHAR(255);"))
        await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS deadline VARCHAR(255);"))
