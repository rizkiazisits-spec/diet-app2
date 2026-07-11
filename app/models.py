"""
Model-model SQLAlchemy untuk aplikasi diet kalori.

Tabel:
- User: Data profil pengguna (auth via Supabase)
- FoodLog: Catatan makanan harian
- ExerciseLog: Catatan olahraga harian
- DietPlan: Rencana diet yang di-generate AI
"""

import uuid
from datetime import date, datetime

from sqlalchemy import (
    Date,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class User(Base):
    """Model pengguna — terintegrasi dengan Supabase Auth."""

    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        comment="UUID dari Supabase Auth",
    )
    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        nullable=False,
        index=True,
        comment="Email pengguna",
    )
    berat_badan: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
        comment="Berat badan dalam kg",
    )
    tinggi_badan: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
        comment="Tinggi badan dalam cm",
    )
    umur: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
        comment="Umur dalam tahun",
    )
    jenis_kelamin: Mapped[str | None] = mapped_column(
        String(20),
        nullable=True,
        comment="Jenis kelamin: laki-laki / perempuan",
    )
    name: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
        comment="Nama lengkap pengguna",
    )
    avatar_url: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
        comment="URL atau data base64 foto profil",
    )
    goal: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
        comment="Target diet/nutrisi",
    )
    deadline: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
        comment="Batas waktu target diet",
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        comment="Waktu pembuatan akun",
    )

    # Relationships
    food_logs: Mapped[list["FoodLog"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    exercise_logs: Mapped[list["ExerciseLog"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    diet_plans: Mapped[list["DietPlan"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )


class FoodLog(Base):
    """Catatan makanan yang dikonsumsi pengguna."""

    __tablename__ = "food_logs"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    makanan: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        comment="Nama makanan",
    )
    kalori: Mapped[float] = mapped_column(
        Float,
        nullable=False,
        comment="Jumlah kalori (kkal)",
    )
    porsi: Mapped[float] = mapped_column(
        Float,
        nullable=False,
        default=1.0,
        comment="Jumlah porsi",
    )
    tanggal: Mapped[date] = mapped_column(
        Date,
        nullable=False,
        server_default=func.current_date(),
        index=True,
        comment="Tanggal konsumsi",
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    # Relationship
    user: Mapped["User"] = relationship(back_populates="food_logs")


class ExerciseLog(Base):
    """Catatan olahraga yang dilakukan pengguna."""

    __tablename__ = "exercise_logs"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    olahraga: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        comment="Jenis olahraga",
    )
    durasi_menit: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        comment="Durasi olahraga dalam menit",
    )
    kalori_terbakar: Mapped[float] = mapped_column(
        Float,
        nullable=False,
        comment="Kalori yang terbakar (kkal)",
    )
    tanggal: Mapped[date] = mapped_column(
        Date,
        nullable=False,
        server_default=func.current_date(),
        index=True,
        comment="Tanggal olahraga",
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    # Relationship
    user: Mapped["User"] = relationship(back_populates="exercise_logs")


class DietPlan(Base):
    """Rencana diet yang di-generate oleh AI (Gemini)."""

    __tablename__ = "diet_plans"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    target_defisit: Mapped[float] = mapped_column(
        Float,
        nullable=False,
        comment="Target defisit kalori harian (kkal)",
    )
    rekomendasi_harian: Mapped[str] = mapped_column(
        Text,
        nullable=False,
        comment="Rekomendasi diet harian dari AI",
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    # Relationship
    user: Mapped["User"] = relationship(back_populates="diet_plans")
