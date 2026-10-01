from datetime import datetime

from pydantic import BaseModel, ConfigDict, computed_field


class ReportOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    image_filename: str
    latitude: float
    longitude: float
    description: str | None
    status: str
    severity: int | None
    damage_types: list[str] | None
    damage_area_ratio: float | None
    created_at: datetime

    @computed_field
    @property
    def image_url(self) -> str:
        return f"/uploads/{self.image_filename}"
