import io
import threading
import time
from contextlib import asynccontextmanager
from typing import Annotated

import cv2
import numpy as np
from fastapi import FastAPI, File, HTTPException, Request, UploadFile
from PIL import Image, UnidentifiedImageError
from ultralytics import YOLO

from .config import settings
from .schemas import Detection, Prediction
from .severity import compute_severity

_inference_lock = threading.Lock()


@asynccontextmanager
async def lifespan(app: FastAPI):
    model = YOLO(settings.model_path)
    model.predict(
        Image.new("RGB", (settings.imgsz, settings.imgsz)),
        imgsz=settings.imgsz,
        device=settings.device,
        verbose=False,
    )
    app.state.model = model
    yield


app = FastAPI(title="RoadPulse Model Service", lifespan=lifespan)


@app.get("/health")
def health():
    return {"status": "ok", "model_version": settings.model_version}


@app.post("/predict", response_model=Prediction)
def predict(request: Request, image: Annotated[UploadFile, File()]):
    try:
        img = Image.open(io.BytesIO(image.file.read())).convert("RGB")
    except UnidentifiedImageError:
        raise HTTPException(status_code=415, detail="File is not a readable image")

    start = time.perf_counter()
    with _inference_lock:
        result = request.app.state.model.predict(
            img,
            conf=settings.conf_threshold,
            imgsz=settings.imgsz,
            device=settings.device,
            verbose=False,
        )[0]
    inference_ms = (time.perf_counter() - start) * 1000

    h, w = result.orig_shape
    coverage = np.zeros((h, w), dtype=np.uint8)
    if result.masks is not None:
        for poly in result.masks.xy:
            if len(poly) >= 3:
                cv2.fillPoly(coverage, [poly.astype(np.int32)], 1)
    area_ratio = float(coverage.mean())

    detections = [
        Detection(
            label=result.names[int(cls)],
            confidence=round(float(conf), 3),
            box=[round(v, 1) for v in box.tolist()],
        )
        for box, cls, conf in zip(result.boxes.xyxy, result.boxes.cls, result.boxes.conf)
    ]

    max_conf = max((d.confidence for d in detections), default=0.0)

    return Prediction(
        severity=compute_severity(area_ratio),
        damage_types=sorted({d.label for d in detections}),
        damage_area_ratio=round(area_ratio, 4),
        num_detections=len(detections),
        detections=detections,
        model_version=settings.model_version,
        inference_ms=round(inference_ms, 1),
        max_confidence=max_conf,
        needs_review=bool(detections) and max_conf < settings.review_threshold,
    )
