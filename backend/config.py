"""Runtime settings — loaded from env via pydantic-settings."""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    google_api_key: str = ""
    host: str = "127.0.0.1"
    port: int = 8000
    agent_mode: str = "simulated"  # "real" or "simulated"


settings = Settings()
