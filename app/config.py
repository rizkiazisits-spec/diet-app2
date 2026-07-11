"""
Konfigurasi aplikasi.

Membaca semua kredensial dari file .env menggunakan pydantic-settings.
"""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Pengaturan aplikasi yang dibaca dari environment variables."""

    # Supabase
    supabase_url: str
    supabase_key: str
    supabase_jwt_secret: str

    # Database
    database_url: str

    # DeepSeek API
    deepseek_api_key: str = ""
    deepseek_base_url: str = "https://api.deepseek.com/v1"

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
    }


settings = Settings()  # type: ignore[call-arg]
