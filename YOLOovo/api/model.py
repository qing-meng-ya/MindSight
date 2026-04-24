"""YOLO model wrapper for inference."""
import os
import io
import base64
from pathlib import Path
from typing import List, Optional

import cv2
import numpy as np
from PIL import Image

# Lazy import ultralytics to avoid loading on module import
def get_YOLO():
    from ultralytics import YOLO
    return YOLO


CLASS_NAMES = {
    0: "结构类型A",
    1: "结构类型B",
    2: "结构类型C",
    3: "类别3",
    4: "类别4",
    5: "类别5",
    6: "类别6",
}

CLASS_COLORS = {
    0: (255, 107, 107),    # #ff6b6b
    1: (78, 205, 196),     # #4ecdc4
    2: (69, 183, 209),     # #45b7d1
    3: (150, 206, 180),    # #96ceb4
    4: (255, 234, 167),    # #ffeaa7
    5: (223, 230, 233),    # #dfe6e9
    6: (253, 121, 168),    # #fd79a8
}


class YoloPredictor:
    def __init__(self, model_path: Optional[str] = None):
        self.model = None
        self.model_path = None
        self._load_model(model_path)

    def _load_model(self, model_path: Optional[str] = None):
        """Load the YOLO model."""
        if model_path is None:
            # Try to find best.pt in runs/detect/
            base_dir = Path(__file__).parent.parent
            candidates = [
                base_dir / "runs" / "detect" / "train4" / "weights" / "best.pt",
                base_dir / "runs" / "detect" / "train3" / "weights" / "best.pt",
                base_dir / "runs" / "detect" / "train2" / "weights" / "best.pt",
                base_dir / "runs" / "detect" / "train" / "weights" / "best.pt",
                base_dir / "yolo11n.pt",
            ]
            for candidate in candidates:
                if candidate.exists():
                    model_path = str(candidate)
                    break

        if model_path is None or not os.path.exists(model_path):
            raise FileNotFoundError("Could not find YOLO model weights. Please provide a valid model path.")

        self.model_path = model_path
        YOLO = get_YOLO()
        self.model = YOLO(model_path)
        print(f"[YOLO] Model loaded from: {model_path}")

    def predict(self, image_bytes: bytes, conf_threshold: float = 0.25) -> dict:
        """Run prediction on image bytes."""
        # Decode image
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is None:
            raise ValueError("Could not decode image.")

        # Run inference
        results = self.model(img, conf=conf_threshold)
        result = results[0]

        # Parse detections
        detections = []
        class_counts = {i: 0 for i in range(7)}

        if result.boxes is not None:
            boxes = result.boxes.xywhn.cpu().numpy()  # normalized xywh
            confs = result.boxes.conf.cpu().numpy()
            cls_ids = result.boxes.cls.cpu().numpy().astype(int)

            for box, conf, cls_id in zip(boxes, confs, cls_ids):
                detections.append({
                    "class_id": int(cls_id),
                    "class_name": CLASS_NAMES.get(int(cls_id), f"类别{cls_id}"),
                    "confidence": round(float(conf), 4),
                    "bbox": {
                        "x": round(float(box[0]), 4),
                        "y": round(float(box[1]), 4),
                        "width": round(float(box[2]), 4),
                        "height": round(float(box[3]), 4),
                    }
                })
                class_counts[int(cls_id)] += 1

        # Draw annotations
        annotated_img = self._draw_annotations(img.copy(), result)
        _, buffer = cv2.imencode('.jpg', annotated_img)
        annotated_b64 = base64.b64encode(buffer).decode('utf-8')

        return {
            "success": True,
            "message": "预测完成" if detections else "未检测到目标",
            "detections": detections,
            "annotated_image": f"data:image/jpeg;base64,{annotated_b64}",
            "total_detections": len(detections),
            "class_counts": {k: v for k, v in class_counts.items() if v > 0 or k < 3},
        }

    def _draw_annotations(self, img: np.ndarray, result) -> np.ndarray:
        """Draw bounding boxes on the image."""
        h, w = img.shape[:2]

        if result.boxes is not None:
            boxes = result.boxes.xyxy.cpu().numpy()
            confs = result.boxes.conf.cpu().numpy()
            cls_ids = result.boxes.cls.cpu().numpy().astype(int)

            for box, conf, cls_id in zip(boxes, confs, cls_ids):
                x1, y1, x2, y2 = map(int, box)
                color = CLASS_COLORS.get(int(cls_id), (128, 128, 128))
                name = CLASS_NAMES.get(int(cls_id), f"类别{cls_id}")
                label = f"{name} {conf:.2f}"

                # Draw box
                cv2.rectangle(img, (x1, y1), (x2, y2), color, 2)

                # Draw label background
                (tw, th), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 1)
                cv2.rectangle(img, (x1, y1 - th - 8), (x1 + tw + 4, y1), color, -1)
                cv2.putText(img, label, (x1 + 2, y1 - 4),
                           cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)

        return img

    def health_check(self) -> dict:
        return {
            "status": "ok",
            "model_loaded": self.model is not None,
            "model_path": self.model_path,
            "num_classes": 7,
        }
