"""Runtime settings — loaded from env via pydantic-settings."""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # --- Bindings -----------------------------------------------------------
    host: str = "127.0.0.1"
    port: int = 8000

    # --- AI ------------------------------------------------------------------
    google_api_key: str = ""
    agent_mode: str = "simulated"  # "real" or "simulated"

    # --- CORS ----------------------------------------------------------------
    # Comma-separated list of allowed CORS origins; defaults to localhost dev ports.
    # Never set this to "*" — bearer auth alone does not protect against CSRF.
    cors_origins: str = "http://localhost:3000,http://localhost:3001"

    # --- Auth ----------------------------------------------------------------
    # Shared-secret bearer token for ops endpoints. Phase 1+: swap for OIDC.
    # Generate with: python -c "import secrets; print(secrets.token_urlsafe(32))"
    ops_token: str = ""
    # When true, missing/invalid token returns 401. When false, requests pass
    # through with a loud warning (dev/demo only).
    ops_auth_enforce: bool = False

    # --- Hardening flags -----------------------------------------------------
    enable_hsts: bool = False
    ws_max_message_bytes: int = 32 * 1024
    bus_history_max: int = 5000
    redact_errors: bool = True

    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


settings = Settings()
