"""
Tool untuk menghitung kalori yang terbakar dari olahraga.

Menggunakan rumus MET (Metabolic Equivalent of Task):
  Kalori (kkal) = (MET × 3.5 × berat_kg) / 200 × durasi_menit

Referensi MET:
- Ainsworth et al. (2011) Compendium of Physical Activities
"""


# ──────────────────────────────────────────────
# Database MET Values
# ──────────────────────────────────────────────

MET_VALUES: dict[str, float] = {
    # Cardio
    "jalan kaki": 3.5,
    "jalan cepat": 4.5,
    "lari": 8.0,
    "lari sprint": 12.0,
    "jogging": 7.0,
    "bersepeda": 6.0,
    "bersepeda santai": 4.0,
    "sepeda statis": 7.0,
    "renang": 6.0,
    "berenang": 6.0,
    "renang cepat": 9.0,
    "skipping": 10.0,
    "lompat tali": 10.0,
    # Olahraga tim
    "sepak bola": 7.0,
    "futsal": 8.0,
    "basket": 6.5,
    "voli": 4.0,
    "bulu tangkis": 5.5,
    "badminton": 5.5,
    "tenis": 7.0,
    "tenis meja": 4.0,
    "ping pong": 4.0,
    # Gym & strength
    "angkat beban": 6.0,
    "gym": 5.0,
    "push up": 8.0,
    "sit up": 5.0,
    "plank": 4.0,
    "squat": 5.0,
    "deadlift": 6.0,
    "bench press": 5.0,
    "crossfit": 8.0,
    # Flexibility & mind-body
    "yoga": 3.0,
    "pilates": 3.5,
    "stretching": 2.5,
    "tai chi": 3.0,
    "meditasi": 1.5,
    # Lainnya
    "senam": 5.0,
    "senam aerobik": 6.5,
    "zumba": 7.0,
    "dansa": 5.0,
    "hiking": 6.0,
    "mendaki": 6.0,
    "naik tangga": 8.0,
    "berkebun": 3.5,
    "bersih-bersih": 3.0,
    "tinju": 9.0,
    "boxing": 9.0,
    "muay thai": 10.0,
    "karate": 5.0,
    "taekwondo": 5.0,
    "silat": 6.0,
    "rowing": 7.0,
    "mendayung": 7.0,
    "eliptical": 5.0,
    "treadmill": 7.0,
}

# MET default jika olahraga tidak ditemukan di database
MET_DEFAULT: float = 5.0


def hitung_olahraga(
    jenis: str,
    durasi_menit: int,
    berat_kg: float,
) -> dict[str, object]:
    """
    Menghitung estimasi kalori yang terbakar dari olahraga.

    Menggunakan rumus MET:
      Kalori (kkal) = (MET × 3.5 × berat_kg) / 200 × durasi_menit

    Args:
        jenis: Jenis olahraga (contoh: 'lari', 'renang').
        durasi_menit: Durasi olahraga dalam menit.
        berat_kg: Berat badan pengguna dalam kilogram.

    Returns:
        dict: Hasil perhitungan dengan keys:
            - olahraga (str): Jenis olahraga
            - durasi_menit (int): Durasi
            - berat_kg (float): Berat badan yang digunakan
            - met_value (float): Nilai MET yang digunakan
            - kalori_terbakar (float): Estimasi kalori terbakar (kkal)
            - sumber_met (str): 'database' atau 'default'
    """
    jenis_lower = jenis.lower().strip()

    # Cari MET value di database
    met_value = MET_DEFAULT
    sumber_met = "default"

    for key, met in MET_VALUES.items():
        if key in jenis_lower or jenis_lower in key:
            met_value = met
            sumber_met = "database"
            break

    # Hitung kalori: (MET × 3.5 × berat_kg) / 200 × durasi_menit
    kalori_terbakar = (met_value * 3.5 * berat_kg) / 200 * durasi_menit

    return {
        "olahraga": jenis,
        "durasi_menit": durasi_menit,
        "berat_kg": berat_kg,
        "met_value": met_value,
        "kalori_terbakar": round(kalori_terbakar, 1),
        "sumber_met": sumber_met,
    }
