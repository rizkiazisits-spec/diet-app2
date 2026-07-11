"""
Pydantic schemas untuk validasi request/response.

Semua input divalidasi ketat dengan type hints dan constraints.
"""

import uuid
from datetime import date, datetime

from pydantic import BaseModel, EmailStr, Field


# ──────────────────────────────────────────────
# Auth Schemas
# ──────────────────────────────────────────────


class RegisterRequest(BaseModel):
    """Schema untuk registrasi pengguna baru."""

    email: EmailStr = Field(..., description="Email pengguna")
    password: str = Field(
        ...,
        min_length=8,
        max_length=128,
        description="Password minimal 8 karakter",
    )


class LoginRequest(BaseModel):
    """Schema untuk login pengguna."""

    email: EmailStr = Field(..., description="Email pengguna")
    password: str = Field(..., description="Password pengguna")


class AuthResponse(BaseModel):
    """Schema response setelah login/register berhasil."""

    access_token: str = Field(..., description="JWT access token dari Supabase")
    refresh_token: str = Field(..., description="Refresh token dari Supabase")
    user_id: str = Field(..., description="UUID pengguna")
    email: str = Field(..., description="Email pengguna")


class MessageResponse(BaseModel):
    """Schema response pesan umum."""

    message: str
    detail: str | None = None


# ──────────────────────────────────────────────
# User Schemas
# ──────────────────────────────────────────────


class UserProfile(BaseModel):
    """Schema profil pengguna."""

    id: uuid.UUID
    email: str
    berat_badan: float | None = None
    tinggi_badan: float | None = None
    umur: int | None = None
    jenis_kelamin: str | None = None
    name: str | None = None
    avatar_url: str | None = None
    goal: str | None = None
    deadline: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class UserProfileUpdate(BaseModel):
    """Schema untuk update profil pengguna."""

    berat_badan: float | None = Field(None, gt=0, le=500, description="Berat badan (kg)")
    tinggi_badan: float | None = Field(None, gt=0, le=300, description="Tinggi badan (cm)")
    umur: int | None = Field(None, gt=0, le=150, description="Umur (tahun)")
    jenis_kelamin: str | None = Field(
        None, pattern=r"^(laki-laki|perempuan)$", description="laki-laki / perempuan"
    )
    name: str | None = Field(None, max_length=255, description="Nama lengkap pengguna")
    avatar_url: str | None = Field(None, description="URL atau base64 foto profil")
    goal: str | None = Field(None, max_length=255, description="Target diet")
    deadline: str | None = Field(None, max_length=255, description="Batas waktu target")


# ──────────────────────────────────────────────
# FoodLog Schemas
# ──────────────────────────────────────────────


class FoodLogCreate(BaseModel):
    """Schema untuk mencatat makanan baru."""

    makanan: str = Field(..., min_length=1, max_length=255, description="Nama makanan")
    kalori: float = Field(..., gt=0, description="Jumlah kalori (kkal)")
    porsi: float = Field(1.0, gt=0, description="Jumlah porsi")
    tanggal: date = Field(default_factory=date.today, description="Tanggal konsumsi")


class FoodLogResponse(BaseModel):
    """Schema response catatan makanan."""

    id: uuid.UUID
    user_id: uuid.UUID
    makanan: str
    kalori: float
    porsi: float
    tanggal: date
    created_at: datetime

    model_config = {"from_attributes": True}


# ──────────────────────────────────────────────
# ExerciseLog Schemas
# ──────────────────────────────────────────────


class ExerciseLogCreate(BaseModel):
    """Schema untuk mencatat olahraga baru."""

    olahraga: str = Field(..., min_length=1, max_length=255, description="Jenis olahraga")
    durasi_menit: int = Field(..., gt=0, description="Durasi dalam menit")
    kalori_terbakar: float = Field(..., gt=0, description="Kalori terbakar (kkal)")
    tanggal: date = Field(default_factory=date.today, description="Tanggal olahraga")


class ExerciseLogResponse(BaseModel):
    """Schema response catatan olahraga."""

    id: uuid.UUID
    user_id: uuid.UUID
    olahraga: str
    durasi_menit: int
    kalori_terbakar: float
    tanggal: date
    created_at: datetime

    model_config = {"from_attributes": True}


# ──────────────────────────────────────────────
# DietPlan Schemas
# ──────────────────────────────────────────────


class DietPlanCreate(BaseModel):
    """Schema untuk membuat rencana diet."""

    target_defisit: float = Field(..., gt=0, description="Target defisit kalori harian (kkal)")


class DietPlanResponse(BaseModel):
    """Schema response rencana diet."""

    id: uuid.UUID
    user_id: uuid.UUID
    target_defisit: float
    rekomendasi_harian: str
    created_at: datetime

    model_config = {"from_attributes": True}


# ──────────────────────────────────────────────
# Chat Schemas
# ──────────────────────────────────────────────


class ChatRequest(BaseModel):
    """Schema untuk request chat ke AI agent."""

    message: str = Field(
        ...,
        min_length=1,
        max_length=2000,
        description="Pesan user (contoh: 'Saya makan nasi padang dan lari 30 menit')",
    )


class ChatFoodItem(BaseModel):
    """Schema untuk item makanan dalam response chat."""

    nama: str
    kalori: float
    porsi: float
    sumber: str


class ChatExerciseItem(BaseModel):
    """Schema untuk item olahraga dalam response chat."""

    olahraga: str
    durasi_menit: int
    kalori_terbakar: float
    met_value: float


class ChatResponse(BaseModel):
    """Schema response dari chat AI agent."""

    ringkasan: str = Field(..., description="Ringkasan dari AI agent")
    foods: list[ChatFoodItem] = Field(default_factory=list, description="Daftar makanan terdeteksi")
    exercises: list[ChatExerciseItem] = Field(
        default_factory=list, description="Daftar olahraga terdeteksi"
    )
    total_kalori_masuk: float = Field(0.0, description="Total kalori masuk (kkal)")
    total_kalori_keluar: float = Field(0.0, description="Total kalori keluar (kkal)")
    defisit_surplus: float = Field(
        0.0, description="Defisit (negatif) atau surplus (positif) kalori"
    )
    items_tersimpan: bool = Field(False, description="True jika data berhasil disimpan ke database")


# ──────────────────────────────────────────────
# History Query Schemas
# ──────────────────────────────────────────────


class HistoryQuery(BaseModel):
    """Schema untuk query parameter history."""

    tanggal_dari: date | None = Field(None, description="Filter dari tanggal (YYYY-MM-DD)")
    tanggal_sampai: date | None = Field(None, description="Filter sampai tanggal (YYYY-MM-DD)")
    limit: int = Field(50, ge=1, le=200, description="Jumlah maksimal data yang dikembalikan")
