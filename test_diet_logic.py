"""
Self-check script untuk memverifikasi logika lokal Step 2 (Tools makanan & olahraga).

Menjalankan pengujian berbasis assert secara langsung tanpa framework eksternal.
"""

import asyncio

from app.tools.exercise_tools import hitung_olahraga
from app.tools.food_tools import cari_makanan


async def test_food_tools() -> None:
    """Verifikasi tool cari_makanan menggunakan database lokal."""
    # Test makanan lokal yang ada di database
    result = await cari_makanan("nasi goreng")
    assert result["ditemukan"] is True
    assert result["kalori_per_porsi"] == 267.0
    assert result["sumber"] == "database_lokal"

    # Test makanan lokal dengan variasi case/whitespace
    result_caps = await cari_makanan("  NASI GORENG  ")
    assert result_caps["ditemukan"] is True
    assert result_caps["kalori_per_porsi"] == 267.0

    # Test makanan yang tidak terdaftar
    result_unknown = await cari_makanan("makanan_tidak_dikenal_sama_sekali")
    assert result_unknown["ditemukan"] is False
    assert result_unknown["kalori_per_porsi"] == 0
    assert result_unknown["sumber"] == "tidak_ditemukan"

    print("[OK] test_food_tools passed!")


def test_exercise_tools() -> None:
    """Verifikasi tool hitung_olahraga menggunakan rumus MET."""
    # Test olahraga terdaftar (lari): MET 8.0, berat 70 kg, durasi 30 menit
    # Kalori = (8.0 * 3.5 * 70.0) / 200 * 30 = 294.0
    result = hitung_olahraga("lari", 30, 70.0)
    assert result["met_value"] == 8.0
    assert result["kalori_terbakar"] == 294.0
    assert result["sumber_met"] == "database"

    # Test olahraga default/fallback
    result_default = hitung_olahraga("panjat tebing ekstrim", 60, 60.0)
    assert result_default["met_value"] == 5.0  # default MET
    assert result_default["sumber_met"] == "default"

    print("[OK] test_exercise_tools passed!")


async def main() -> None:
    """Entry point untuk test runner."""
    print("Menjalankan self-check logika diet...")
    await test_food_tools()
    test_exercise_tools()
    print("Semua unit test lokal berhasil!")



if __name__ == "__main__":
    asyncio.run(main())
