"""FastAPI server for YOLO image prediction."""
import os
import sys

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from model import YoloPredictor
from schemas import PredictResponse, HealthResponse

app = FastAPI(
    title="YOLO 超声影像检测 API",
    description="基于 YOLO 的医学超声影像目标检测服务",
    version="1.0.0",
)

# CORS for frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global predictor instance
predictor: YoloPredictor = None


@app.on_event("startup")
async def startup_event():
    global predictor
    try:
        predictor = YoloPredictor()
        print("[API] YOLO model loaded successfully.")
    except Exception as e:
        print(f"[API] Warning: Could not load YOLO model: {e}")
        print("[API] Prediction endpoint will return errors until model is available.")


@app.get("/health", response_model=HealthResponse)
async def health_check():
    if predictor is None:
        return HealthResponse(status="model_not_loaded", model_loaded=False)
    return HealthResponse(**predictor.health_check())


@app.post("/predict", response_model=PredictResponse)
async def predict(image: UploadFile = File(...)):
    if predictor is None:
        raise HTTPException(status_code=503, detail="模型未加载，请稍后重试")

    # Validate file type
    allowed_types = {"image/jpeg", "image/png", "image/jpg", "image/webp"}
    if image.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=f"不支持的文件类型: {image.content_type}，请上传 JPG/PNG 图片"
        )

    try:
        image_bytes = await image.read()
        if len(image_bytes) > 20 * 1024 * 1024:  # 20MB limit
            raise HTTPException(status_code=400, detail="图片大小超过 20MB 限制")

        result = predictor.predict(image_bytes)
        result["filename"] = image.filename
        return PredictResponse(**result)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"预测失败: {str(e)}")


@app.post("/predict_batch")
async def predict_batch(images: list[UploadFile] = File(...)):
    if predictor is None:
        raise HTTPException(status_code=503, detail="模型未加载，请稍后重试")

    results = []
    for img in images:
        try:
            image_bytes = await img.read()
            result = predictor.predict(image_bytes)
            result["filename"] = img.filename
            results.append(result)
        except Exception as e:
            results.append({
                "success": False,
                "message": f"预测失败: {str(e)}",
                "filename": img.filename,
                "detections": [],
                "annotated_image": None,
                "total_detections": 0,
                "class_counts": {},
            })
    return {"results": results}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
