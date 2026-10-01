from datetime import datetime

from sqlalchemy import JSON, DateTime, String, func
from sqlalchemy.orm import Mapped, mapped_column

from .db import Base


class Report(Base):
    __tablename__ = "reports"

    id: Mapped[int] = mapped_column(primary_key=True)
    image_filename: Mapped[str] = mapped_column(String(255))
    latitude: Mapped[float]
    longitude: Mapped[float]
    description: Mapped[str | None] = mapped_column(String(500))
    status: Mapped[str] = mapped_column(String(20), default="pending", index=True)
    severity: Mapped[int | None] = mapped_column(index=True)
    damage_types: Mapped[list[str] | None] = mapped_column(JSON)
    damage_area_ratio: Mapped[float | None]
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), index=True
    )
