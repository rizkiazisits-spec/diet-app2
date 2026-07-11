"""
Router chat: endpoint untuk berinteraksi dengan AI Diet Agent.

Endpoints:
- POST /chat/  → Kirim pesan, AI analisis makanan & olahraga
"""

from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.agents.diet_agent import DietAgent
from app.auth import get_current_user
from app.database import get_db
from app.models import ExerciseLog, FoodLog, User
from app.schemas import (
    ChatExerciseItem,
    ChatFoodItem,
    ChatRequest,
    ChatResponse,
)

router = APIRouter(
    prefix="/chat",
    tags=["Chat AI Agent"],
)


@router.post(
    "/",
    response_model=ChatResponse,
    summary="Chat dengan AI Diet Agent",
    description=(
        "Kirim pesan natural language, AI akan menganalisis makanan dan olahraga "
        "yang disebutkan, menghitung kalori, dan menyimpan ke database. "
        "Contoh: 'Saya makan nasi padang dan lari 30 menit'."
    ),
)
async def chat(
    payload: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ChatResponse:
    """
    Endpoint utama chat — memproses pesan user dengan AI agent.

    Flow:
    1. Terima pesan natural language dari user
    2. AI Agent (DeepSeek) mengidentifikasi makanan & olahraga
    3. Tools dieksekusi (cari_makanan, hitung_olahraga)
    4. Hasil disimpan ke FoodLog & ExerciseLog
    5. Return ringkasan lengkap

    Args:
        payload: Pesan user.
        current_user: User yang sedang login (dari JWT).
        db: Database session.

    Returns:
        ChatResponse: Hasil analisis lengkap.

    Raises:
        HTTPException: 500 jika terjadi error pada AI agent.
    """
    # Ambil berat badan user (atau default 65 kg)
    berat_kg = current_user.berat_badan or 65.0

    # Inisialisasi agent dan analisis
    try:
        agent = DietAgent()
        analysis = await agent.analyze(
            user_message=payload.message,
            berat_kg=berat_kg,
        )
    except RuntimeError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(e),
        )
    except Exception as e:
        error_msg = str(e)
        if "401" in error_msg or "Unauthorized" in error_msg or "authentication" in error_msg.lower():
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    "DEEPSEEK_API_KEY tidak valid atau sudah kedaluwarsa. "
                    "Silakan periksa API key di file .env."
                ),
            )
        elif "429" in error_msg or "rate" in error_msg.lower():
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Rate limit DeepSeek API terlampaui. Coba lagi nanti.",
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error saat memproses chat: {error_msg}",
        )

    # Simpan ke database
    items_tersimpan = False
    try:
        today = date.today()

        # Simpan food logs
        for food in analysis.foods:
            food_log = FoodLog(
                user_id=current_user.id,
                makanan=food.nama,
                kalori=food.kalori,
                porsi=food.porsi,
                tanggal=today,
            )
            db.add(food_log)

        # Simpan exercise logs
        for exercise in analysis.exercises:
            exercise_log = ExerciseLog(
                user_id=current_user.id,
                olahraga=exercise.olahraga,
                durasi_menit=exercise.durasi_menit,
                kalori_terbakar=exercise.kalori_terbakar,
                tanggal=today,
            )
            db.add(exercise_log)

        if analysis.foods or analysis.exercises:
            await db.flush()
            items_tersimpan = True

        # Calculate cumulative totals for today from the database
        from sqlalchemy import select
        
        # Query total makanan hari ini
        food_sel = select(FoodLog).where(FoodLog.user_id == current_user.id, FoodLog.tanggal == today)
        food_res = await db.execute(food_sel)
        today_foods = food_res.scalars().all()
        total_kalori_masuk = sum(f.kalori * f.porsi for f in today_foods)
        
        # Query total olahraga hari ini
        ex_sel = select(ExerciseLog).where(ExerciseLog.user_id == current_user.id, ExerciseLog.tanggal == today)
        ex_res = await db.execute(ex_sel)
        today_exercises = ex_res.scalars().all()
        total_kalori_keluar = sum(e.kalori_terbakar for e in today_exercises)
        
        defisit_surplus = total_kalori_masuk - total_kalori_keluar

    except Exception as e:
        # Log error tapi jangan gagalkan response
        items_tersimpan = False
        total_kalori_masuk = analysis.total_kalori_masuk
        total_kalori_keluar = analysis.total_kalori_keluar
        defisit_surplus = analysis.defisit_surplus

    # Build response
    return ChatResponse(
        ringkasan=analysis.ringkasan,
        foods=[
            ChatFoodItem(
                nama=f.nama,
                kalori=f.kalori,
                porsi=f.porsi,
                sumber=f.sumber,
            )
            for f in analysis.foods
        ],
        exercises=[
            ChatExerciseItem(
                olahraga=e.olahraga,
                durasi_menit=e.durasi_menit,
                kalori_terbakar=e.kalori_terbakar,
                met_value=e.met_value,
            )
            for e in analysis.exercises
        ],
        total_kalori_masuk=total_kalori_masuk,
        total_kalori_keluar=total_kalori_keluar,
        defisit_surplus=defisit_surplus,
        items_tersimpan=items_tersimpan,
    )
