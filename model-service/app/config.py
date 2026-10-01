from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file="../.env", extra="ignore", protected_namespaces=()
    )

    model_path: str = "weights/best.pt"
    model_version: str = "yolo26n-seg-crackseg-v1"
    conf_threshold: float = 0.25
    imgsz: int = 640
    device: str = "cpu"


settings = Settings()
