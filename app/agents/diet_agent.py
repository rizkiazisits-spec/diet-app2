"""
Diet AI Agent menggunakan DeepSeek via OpenAI-compatible API.

Agent ini menerima pesan natural language dari user (contoh: "Saya makan
nasi padang dan lari 30 menit") dan secara otomatis:
1. Mengidentifikasi makanan & olahraga dari teks
2. Memanggil tools (cari_makanan, hitung_olahraga)
3. Menghitung total kalori masuk, keluar, dan defisit/surplus
4. Mengembalikan breakdown lengkap per item
"""

import json
from dataclasses import dataclass, field

from openai import OpenAI

from app.config import settings
from app.tools.exercise_tools import hitung_olahraga
from app.tools.food_tools import cari_makanan


# ──────────────────────────────────────────────
# Data classes untuk hasil analisis
# ──────────────────────────────────────────────


@dataclass
class FoodItem:
    """Representasi satu item makanan yang terdeteksi."""

    nama: str
    kalori: float
    porsi: float
    sumber: str


@dataclass
class ExerciseItem:
    """Representasi satu item olahraga yang terdeteksi."""

    olahraga: str
    durasi_menit: int
    kalori_terbakar: float
    met_value: float


@dataclass
class AnalysisResult:
    """Hasil analisis lengkap dari AI agent."""

    foods: list[FoodItem] = field(default_factory=list)
    exercises: list[ExerciseItem] = field(default_factory=list)
    total_kalori_masuk: float = 0.0
    total_kalori_keluar: float = 0.0
    defisit_surplus: float = 0.0
    ringkasan: str = ""


# ──────────────────────────────────────────────
# Tool definitions (OpenAI function calling format)
# ──────────────────────────────────────────────

TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "cari_makanan",
            "description": (
                "Mencari informasi kalori makanan berdasarkan nama. "
                "Panggil tool ini untuk SETIAP makanan yang disebutkan user. "
                "Contoh: jika user bilang 'nasi padang dan es teh', panggil 2x: "
                "cari_makanan(nama='nasi padang') dan cari_makanan(nama='es teh manis')."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "nama": {
                        "type": "string",
                        "description": "Nama makanan yang dicari (contoh: 'nasi goreng', 'ayam bakar')",
                    },
                },
                "required": ["nama"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "hitung_olahraga",
            "description": (
                "Menghitung kalori yang terbakar dari olahraga berdasarkan rumus MET. "
                "Panggil tool ini untuk SETIAP olahraga yang disebutkan user. "
                "Contoh: jika user bilang 'lari 30 menit dan renang 20 menit', panggil 2x."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "jenis": {
                        "type": "string",
                        "description": "Jenis olahraga (contoh: 'lari', 'renang', 'yoga')",
                    },
                    "durasi_menit": {
                        "type": "integer",
                        "description": "Durasi olahraga dalam menit",
                    },
                    "berat_kg": {
                        "type": "number",
                        "description": "Berat badan pengguna dalam kilogram",
                    },
                },
                "required": ["jenis", "durasi_menit", "berat_kg"],
            },
        },
    },
]

# System prompt untuk agent
SYSTEM_PROMPT = """Kamu adalah Diet AI Assistant yang membantu user mencatat makanan dan olahraga.

ATURAN PENTING:
1. Ketika user menyebutkan makanan, SELALU panggil tool `cari_makanan` untuk SETIAP makanan.
2. Ketika user menyebutkan olahraga, SELALU panggil tool `hitung_olahraga` untuk SETIAP olahraga.
3. Jika user menyebutkan porsi (misal "2 porsi nasi goreng"), catat porsinya.
4. Jika tool cari_makanan mengembalikan ditemukan=false, ESTIMASI kalorinya sendiri berdasarkan pengetahuanmu.
5. Untuk olahraga, gunakan berat badan user yang diberikan. Jika tidak ada, gunakan 65 kg sebagai default.

SETELAH semua tool dipanggil, berikan tanggapan RINGKAS (1-3 kalimat) yang berfokus HANYA pada tips gizi singkat, motivasi, atau komentar edukatif yang bersahabat berdasarkan makanan/olahraga yang dicatat.
JANGAN pernah mengulang daftar makanan, daftar olahraga, angka total kalori, atau nilai surplus/defisit dalam teks jawaban Anda, karena data tersebut sudah ditampilkan otomatis dalam bentuk tabel bento dashboard di layar pengguna. Gunakan bahasa Indonesia yang ramah dan suportif."""


# ──────────────────────────────────────────────
# Agent class
# ──────────────────────────────────────────────


class DietAgent:
    """
    AI Agent untuk analisis diet menggunakan DeepSeek via OpenAI API.

    Agent ini menggunakan OpenAI SDK (kompatibel DeepSeek) untuk:
    - Memahami input natural language
    - Memanggil tools (cari_makanan, hitung_olahraga)
    - Menghasilkan ringkasan kalori
    """

    def __init__(self) -> None:
        """Inisialisasi DeepSeek client via OpenAI SDK."""
        if not settings.deepseek_api_key:
            raise RuntimeError(
                "DEEPSEEK_API_KEY belum dikonfigurasi di .env"
            )
        self.client = OpenAI(
            api_key=settings.deepseek_api_key,
            base_url=settings.deepseek_base_url,
        )
        self.model = "deepseek-chat"

    async def _execute_tool_call(
        self,
        function_name: str,
        function_args: dict,
    ) -> dict:
        """
        Eksekusi tool call dari DeepSeek.

        Args:
            function_name: Nama fungsi yang dipanggil.
            function_args: Argumen untuk fungsi.

        Returns:
            dict: Hasil eksekusi tool.
        """
        if function_name == "cari_makanan":
            return await cari_makanan(function_args.get("nama", ""))
        elif function_name == "hitung_olahraga":
            return hitung_olahraga(
                jenis=function_args.get("jenis", ""),
                durasi_menit=int(function_args.get("durasi_menit", 0)),
                berat_kg=float(function_args.get("berat_kg", 65)),
            )
        else:
            return {"error": f"Tool tidak dikenal: {function_name}"}

    async def analyze(
        self,
        user_message: str,
        berat_kg: float = 65.0,
    ) -> AnalysisResult:
        """
        Analisis pesan user untuk mendeteksi makanan dan olahraga.

        Args:
            user_message: Pesan dari user dalam bahasa natural.
            berat_kg: Berat badan user (untuk kalkulasi MET).

        Returns:
            AnalysisResult: Hasil analisis lengkap.
        """
        result = AnalysisResult()

        # Tambahkan info berat badan ke context
        context_message = (
            f"Berat badan user: {berat_kg} kg. "
            f"Gunakan berat ini untuk perhitungan olahraga.\n\n"
            f"Pesan user: {user_message}"
        )

        # Build messages dalam format OpenAI
        messages: list[dict] = [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": context_message},
        ]

        # Initial request ke DeepSeek
        response = self.client.chat.completions.create(
            model=self.model,
            messages=messages,
            tools=TOOLS,
            temperature=0.1,
        )

        # Loop untuk handle multiple rounds of function calling
        max_rounds = 10
        for _ in range(max_rounds):
            choice = response.choices[0]

            # Cek apakah ada tool calls
            if choice.finish_reason != "tool_calls" or not choice.message.tool_calls:
                break

            # Tambahkan assistant message (berisi tool_calls) ke messages
            messages.append(choice.message.model_dump())

            # Eksekusi semua tool calls
            for tool_call in choice.message.tool_calls:
                fc = tool_call.function
                function_args = json.loads(fc.arguments)

                tool_result = await self._execute_tool_call(
                    fc.name,
                    function_args,
                )

                # Parse hasil dan simpan ke result
                if fc.name == "cari_makanan":
                    kalori = float(tool_result.get("kalori_per_porsi", 0))
                    if tool_result.get("ditemukan", False) and kalori > 0:
                        result.foods.append(FoodItem(
                            nama=str(tool_result.get("nama", "")),
                            kalori=kalori,
                            porsi=1.0,
                            sumber=str(tool_result.get("sumber", "")),
                        ))

                elif fc.name == "hitung_olahraga":
                    result.exercises.append(ExerciseItem(
                        olahraga=str(tool_result.get("olahraga", "")),
                        durasi_menit=int(tool_result.get("durasi_menit", 0)),
                        kalori_terbakar=float(tool_result.get("kalori_terbakar", 0)),
                        met_value=float(tool_result.get("met_value", 0)),
                    ))

                # Tambahkan tool response ke messages
                messages.append({
                    "role": "tool",
                    "tool_call_id": tool_call.id,
                    "content": json.dumps(tool_result),
                })

            # Kirim kembali ke DeepSeek dengan tool results
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                tools=TOOLS,
                temperature=0.1,
            )

        # Hitung totals
        result.total_kalori_masuk = sum(f.kalori * f.porsi for f in result.foods)
        result.total_kalori_keluar = sum(e.kalori_terbakar for e in result.exercises)
        result.defisit_surplus = result.total_kalori_masuk - result.total_kalori_keluar

        # Ambil ringkasan dari response terakhir
        final_choice = response.choices[0]
        result.ringkasan = final_choice.message.content or ""

        return result
