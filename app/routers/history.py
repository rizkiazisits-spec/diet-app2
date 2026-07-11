"""
Router history: endpoint untuk melihat riwayat makanan dan olahraga.

Endpoints:
- GET /history/food     → Riwayat catatan makanan
- GET /history/exercise → Riwayat catatan olahraga
"""

from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import get_current_user
from app.database import get_db
from app.models import ExerciseLog, FoodLog, User
from app.schemas import ExerciseLogResponse, FoodLogResponse

router = APIRouter(
    prefix="/history",
    tags=["History"],
)


@router.get(
    "/food",
    response_model=list[FoodLogResponse],
    summary="Riwayat makanan",
    description="Mengembalikan riwayat catatan makanan user. "
    "Bisa difilter berdasarkan rentang tanggal.",
)
async def get_food_history(
    tanggal_dari: Optional[date] = Query(
        None, description="Filter dari tanggal (YYYY-MM-DD)"
    ),
    tanggal_sampai: Optional[date] = Query(
        None, description="Filter sampai tanggal (YYYY-MM-DD)"
    ),
    limit: int = Query(50, ge=1, le=200, description="Jumlah maksimal data"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[FoodLogResponse]:
    """
    Dapatkan riwayat catatan makanan user.

    Args:
        tanggal_dari: Filter mulai tanggal (opsional).
        tanggal_sampai: Filter sampai tanggal (opsional).
        limit: Jumlah maksimal data yang dikembalikan.
        current_user: User yang sedang login.
        db: Database session.

    Returns:
        list[FoodLogResponse]: Daftar catatan makanan.
    """
    query = (
        select(FoodLog)
        .where(FoodLog.user_id == current_user.id)
        .order_by(FoodLog.tanggal.desc(), FoodLog.created_at.desc())
        .limit(limit)
    )

    if tanggal_dari:
        query = query.where(FoodLog.tanggal >= tanggal_dari)
    if tanggal_sampai:
        query = query.where(FoodLog.tanggal <= tanggal_sampai)

    result = await db.execute(query)
    food_logs = result.scalars().all()

    return [FoodLogResponse.model_validate(log) for log in food_logs]


@router.get(
    "/exercise",
    response_model=list[ExerciseLogResponse],
    summary="Riwayat olahraga",
    description="Mengembalikan riwayat catatan olahraga user. "
    "Bisa difilter berdasarkan rentang tanggal.",
)
async def get_exercise_history(
    tanggal_dari: Optional[date] = Query(
        None, description="Filter dari tanggal (YYYY-MM-DD)"
    ),
    tanggal_sampai: Optional[date] = Query(
        None, description="Filter sampai tanggal (YYYY-MM-DD)"
    ),
    limit: int = Query(50, ge=1, le=200, description="Jumlah maksimal data"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[ExerciseLogResponse]:
    """
    Dapatkan riwayat catatan olahraga user.

    Args:
        tanggal_dari: Filter mulai tanggal (opsional).
        tanggal_sampai: Filter sampai tanggal (opsional).
        limit: Jumlah maksimal data yang dikembalikan.
        current_user: User yang sedang login.
        db: Database session.

    Returns:
        list[ExerciseLogResponse]: Daftar catatan olahraga.
    """
    query = (
        select(ExerciseLog)
        .where(ExerciseLog.user_id == current_user.id)
        .order_by(ExerciseLog.tanggal.desc(), ExerciseLog.created_at.desc())
        .limit(limit)
    )

    if tanggal_dari:
        query = query.where(ExerciseLog.tanggal >= tanggal_dari)
    if tanggal_sampai:
        query = query.where(ExerciseLog.tanggal <= tanggal_sampai)

    result = await db.execute(query)
    exercise_logs = result.scalars().all()

    return [ExerciseLogResponse.model_validate(log) for log in exercise_logs]
