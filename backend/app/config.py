from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file="../.env", extra="ignore", protected_namespaces=()
    )

    database_url: str
    upload_dir: str = "uploads"
    model_service_url: str = "http://localhost:8001"


settings = Settings()
