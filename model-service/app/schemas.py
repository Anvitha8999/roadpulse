from pydantic import BaseModel


class Detection(BaseModel):
    label: str
    confidence: float
    box: list[float]


class Prediction(BaseModel):
    severity: int
    damage_types: list[str]
    damage_area_ratio: float
    num_detections: int
    max_confidence: float
    needs_review: bool
    detections: list[Detection]
    model_version: str
    inference_ms: float
