"""
Application configuration using pydantic-settings.
Reads from environment variables with sensible defaults for local development.
"""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Global application settings."""

    DATABASE_URL: str = "sqlite:///./zhicui.db"

    # API key for the speech-to-text provider (SiliconFlow / DashScope).
    API_KEY: str = ""

    # LLM configuration — supports Anthropic-compatible endpoints via LiteLLM.
    LLM_MODEL: str = "mimo-v2.5-pro"
    LLM_API_BASE: str = "https://token-plan-cn.xiaomimimo.com/anthropic"
    LLM_API_KEY: str = ""

    # SiliconFlow ASR endpoint and model (used by the DouyinProcessor)
    ASR_API_BASE_URL: str = "https://api.siliconflow.cn/v1/audio/transcriptions"
    ASR_MODEL: str = "FunAudioLLM/SenseVoiceSmall"

    HOST: str = "0.0.0.0"
    PORT: int = 8000

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "extra": "ignore",
    }


settings = Settings()
