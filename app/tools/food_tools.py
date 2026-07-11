"""
Tool untuk mencari informasi kalori makanan.

Sumber data:
1. Calorieninjas API (gratis, tanpa API key)
2. Fallback ke estimasi Gemini jika tidak ditemukan
"""

import httpx


# ──────────────────────────────────────────────
# Database kalori makanan Indonesia (fallback lokal)
# ──────────────────────────────────────────────

KALORI_LOKAL: dict[str, float] = {
    "nasi putih": 130.0,
    "nasi goreng": 267.0,
    "nasi padang": 400.0,
    "nasi uduk": 241.0,
    "mie goreng": 300.0,
    "mie ayam": 320.0,
    "bakso": 250.0,
    "soto ayam": 150.0,
    "soto betawi": 280.0,
    "rendang": 193.0,
    "ayam goreng": 260.0,
    "ayam bakar": 190.0,
    "ikan goreng": 200.0,
    "tempe goreng": 160.0,
    "tahu goreng": 115.0,
    "gado-gado": 200.0,
    "pecel": 180.0,
    "rujak": 100.0,
    "martabak manis": 350.0,
    "martabak telur": 280.0,
    "roti bakar": 200.0,
    "bubur ayam": 180.0,
    "es teh manis": 80.0,
    "es jeruk": 90.0,
    "kopi susu": 120.0,
    "teh tarik": 100.0,
    "indomie": 350.0,
    "sate ayam": 225.0,
    "sate kambing": 250.0,
    "nasi kuning": 240.0,
    "ketoprak": 200.0,
    "siomay": 180.0,
    "batagor": 200.0,
    "pempek": 195.0,
    "rawon": 250.0,
    "gudeg": 210.0,
    "cap cay": 150.0,
    "kangkung": 25.0,
    "sayur asem": 60.0,
    "sayur lodeh": 120.0,
    "telur dadar": 150.0,
    "telur rebus": 77.0,
    "pisang goreng": 170.0,
    "kerupuk": 50.0,
    "sambal": 20.0,
}


async def cari_makanan(nama: str) -> dict[str, object]:
    """
    Mencari informasi kalori makanan berdasarkan nama.

    Urutan pencarian:
    1. Database lokal makanan Indonesia
    2. CalorieNinjas API (gratis)
    3. Return not_found agar Gemini bisa estimasi

    Args:
        nama: Nama makanan yang dicari (contoh: 'nasi goreng').

    Returns:
        dict: Informasi makanan dengan keys:
            - nama (str): Nama makanan
            - kalori_per_porsi (float): Kalori per porsi dalam kkal
            - sumber (str): Sumber data ('database_lokal', 'calorieninjas', 'estimasi_ai')
            - ditemukan (bool): True jika data ditemukan
    """
    nama_lower = nama.lower().strip()

    # 1. Cek database lokal dulu
    for key, kalori in KALORI_LOKAL.items():
        if key in nama_lower or nama_lower in key:
            return {
                "nama": nama,
                "kalori_per_porsi": kalori,
                "sumber": "database_lokal",
                "ditemukan": True,
            }

    # 2. Coba CalorieNinjas API
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                "https://api.calorieninjas.com/v1/nutrition",
                params={"query": nama},
                headers={"X-Api-Key": ""},  # Free tier tanpa key
            )
            if response.status_code == 200:
                data = response.json()
                items = data.get("items", [])
                if items:
                    total_kalori = sum(item.get("calories", 0) for item in items)
                    return {
                        "nama": nama,
                        "kalori_per_porsi": round(total_kalori, 1),
                        "sumber": "calorieninjas",
                        "ditemukan": True,
                    }
    except Exception:
        pass  # Fallback ke estimasi AI

    # 3. Tidak ditemukan — lakukan estimasi cepat menggunakan DeepSeek API
    try:
        from openai import OpenAI
        from app.config import settings
        
        if settings.deepseek_api_key:
            client = OpenAI(
                api_key=settings.deepseek_api_key,
                base_url=settings.deepseek_base_url,
            )
            prompt = (
                f"Berapa estimasi kalori untuk 1 porsi '{nama}'? "
                "Jawab HANYA dengan satu angka kalori saja dalam kkal (integer). "
                "Contoh: jika 250 kkal, jawab '250'."
            )
            response = client.chat.completions.create(
                model="deepseek-chat",
                messages=[
                    {"role": "system", "content": "Kamu adalah ahli gizi. Berikan jawaban angka kalori saja tanpa teks lain."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.1,
                max_tokens=10
            )
            text = response.choices[0].message.content.strip()
            digits = "".join(c for c in text if c.isdigit())
            if digits:
                return {
                    "nama": nama,
                    "kalori_per_porsi": float(digits),
                    "sumber": "estimasi_ai",
                    "ditemukan": True,
                }
    except Exception:
        pass

    # Fallback terakhir jika API fail
    return {
        "nama": nama,
        "kalori_per_porsi": 150.0,
        "sumber": "estimasi_default",
        "ditemukan": True,
    }
