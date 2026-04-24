"""Pydantic models for YOLO prediction API."""
from pydantic import BaseModel
from typing import List, Optional


class BoundingBox(BaseModel):
    x: float
    y: float
    width: float
    height: float


class Detection(BaseModel):
    class_id: int
    class_name: str
    confidence: float
    bbox: BoundingBox


class PredictResponse(BaseModel):
    success: bool
    message: str
    filename: str
    detections: List[Detection]
    annotated_image: Optional[str] = None  # base64 encoded image
    total_detections: int
    class_counts: dict


class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    model_path: Optional[str] = None
    num_classes: int = 7
