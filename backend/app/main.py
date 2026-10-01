import uuid
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Annotated, Literal

from fastapi import (
    BackgroundTasks,
    Depends,
    FastAPI,
    File,
    Form,
    HTTPException,
    Query,
    UploadFile,
)
from fastapi.staticfiles import StaticFiles
from sqlalchemy import select
from sqlalchemy.orm import Session

from .config import settings
from .db import Base, engine, get_db
from .models import Report
from .schemas import ReportOut
from .scoring import score_report

UPLOAD_DIR = Path(settings.upload_dir)
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
ALLOWED_TYPES = {"image/jpeg": ".jpg", "image/png": ".png"}

DbSession = Annotated[Session, Depends(get_db)]


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(title="RoadPulse API", lifespan=lifespan)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/reports", response_model=ReportOut, status_code=201)
def create_report(
    image: Annotated[UploadFile, File()],
    latitude: Annotated[float, Form(ge=-90, le=90)],
    longitude: Annotated[float, Form(ge=-180, le=180)],
    db: DbSession,
    background_tasks: BackgroundTasks,
    description: Annotated[str | None, Form(max_length=500)] = None,
):
    ext = ALLOWED_TYPES.get(image.content_type)
    if ext is None:
        raise HTTPException(status_code=415, detail="Only JPEG or PNG images are accepted")

    filename = f"{uuid.uuid4().hex}{ext}"
    (UPLOAD_DIR / filename).write_bytes(image.file.read())

    report = Report(
        image_filename=filename,
        latitude=latitude,
        longitude=longitude,
        description=description,
    )
    db.add(report)
    db.commit()
    db.refresh(report)

    background_tasks.add_task(score_report, report.id)
    return report


@app.post("/reports/{report_id}/score", response_model=ReportOut, status_code=202)
def rescore_report(report_id: int, db: DbSession, background_tasks: BackgroundTasks):
    report = db.get(Report, report_id)
    if report is None:
        raise HTTPException(status_code=404, detail="Report not found")
    report.status = "pending"
    db.commit()
    db.refresh(report)
    background_tasks.add_task(score_report, report.id)
    return report


@app.get("/reports", response_model=list[ReportOut])
def list_reports(
    db: DbSession,
    sort: Literal["newest", "severity"] = "newest",
    limit: Annotated[int, Query(ge=1, le=100)] = 50,
):
    stmt = select(Report)
    if sort == "severity":
        stmt = stmt.order_by(Report.severity.desc().nulls_last(), Report.created_at.desc())
    else:
        stmt = stmt.order_by(Report.created_at.desc())
    return db.scalars(stmt.limit(limit)).all()


@app.get("/reports/{report_id}", response_model=ReportOut)
def get_report(report_id: int, db: DbSession):
    report = db.get(Report, report_id)
    if report is None:
        raise HTTPException(status_code=404, detail="Report not found")
    return report
