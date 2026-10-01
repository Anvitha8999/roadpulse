import logging
from pathlib import Path

import httpx

from .config import settings
from .db import SessionLocal
from .models import Report

logger = logging.getLogger(__name__)


def score_report(report_id: int) -> None:
    with SessionLocal() as db:
        report = db.get(Report, report_id)
        if report is None:
            return

        image_path = Path(settings.upload_dir) / report.image_filename
        try:
            with image_path.open("rb") as f:
                response = httpx.post(
                    f"{settings.model_service_url}/predict",
                    files={"image": (report.image_filename, f)},
                    timeout=30.0,
                )
            response.raise_for_status()
            prediction = response.json()
        except (httpx.HTTPError, OSError) as exc:
            logger.warning("Scoring failed for report %s: %s", report_id, exc)
            report.status = "failed"
            db.commit()
            return

        report.severity = prediction["severity"]
        report.damage_types = prediction["damage_types"]
        report.damage_area_ratio = prediction["damage_area_ratio"]
        report.num_detections = prediction["num_detections"]
        report.max_confidence = prediction["max_confidence"]
        report.needs_review = prediction["needs_review"]
        report.model_version = prediction["model_version"]
        report.status = "scored"
        db.commit()
