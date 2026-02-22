import uvicorn
from fastapi import FastAPI, File, UploadFile, HTTPException, BackgroundTasks, Query
from fastapi.responses import JSONResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
import torch
import sys
import os
import tempfile
from typing import List, Optional

# 添加src路径到Python路径
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

from src.inference.predictor import PathologyPredictor
from src.utils import ValidationUtils, FileUtils
from configs.config import Config

app = FastAPI(
    title="组织病理识别API",
    description="基于深度学习的组织病理图像识别系统，支持15种病理类型的自动识别",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# 添加CORS中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 初始化预测器
predictor = None

@app.on_event("startup")
async def startup_event():
    global predictor
    try:
        predictor = PathologyPredictor()
        print("✅ 模型加载成功")
    except Exception as e:
        print(f"❌ 模型加载失败: {e}")
        print("请确保已训练并保存模型到 data/models/ 目录")

@app.get("/")
async def root():
    """API根路径，返回基本信息"""
    return {
        "message": "组织病理识别API",
        "version": "1.0.0",
        "description": "基于深度学习的组织病理图像识别系统",
        "supported_classes": len(Config.PATHOLOGY_CLASSES),
        "model_status": "loaded" if predictor else "not_loaded",
        "endpoints": {
            "predict": "/predict - 单张图像预测",
            "predict_batch": "/predict_batch - 批量图像预测",
            "classes": "/classes - 获取支持的病理类型",
            "model_info": "/model_info - 获取模型信息",
            "health": "/health - 健康检查"
        }
    }

@app.get("/health")
async def health_check():
    """健康检查端点"""
    return {
        "status": "healthy" if predictor else "unhealthy",
        "model_loaded": predictor is not None,
        "device": predictor.device if predictor else "unknown",
        "timestamp": torch.cuda.get_device_name() if torch.cuda.is_available() else "CPU"
    }

@app.post("/predict")
async def predict_pathology(file: UploadFile = File(...)):
    """单张图像预测"""
    if predictor is None:
        raise HTTPException(status_code=500, detail="模型未加载，请检查模型文件")
    
    # 验证文件类型
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="请上传图像文件")
    
    try:
        # 读取图像文件
        contents = await file.read()
        
        # 验证图像
        validation = ValidationUtils.validate_image_format(contents)
        if not validation['valid']:
            raise HTTPException(status_code=400, detail=f"图像验证失败: {validation['errors']}")
        
        # 进行预测
        result = predictor.predict(contents)
        
        # 添加验证警告
        if validation['warnings']:
            result['warnings'] = validation['warnings']
        
        return JSONResponse(content=result)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"预测失败: {str(e)}")

@app.post("/predict_batch")
async def predict_batch_pathology(files: List[UploadFile] = File(...)):
    """批量图像预测"""
    if predictor is None:
        raise HTTPException(status_code=500, detail="模型未加载")
    
    if len(files) > 20:  # 限制批量大小
        raise HTTPException(status_code=400, detail="批量处理最多支持20张图像")
    
    results = []
    errors = []
    
    for i, file in enumerate(files):
        try:
            if not file.content_type.startswith('image/'):
                errors.append({
                    "filename": file.filename,
                    "error": "不是图像文件"
                })
                continue
            
            contents = await file.read()
            validation = ValidationUtils.validate_image_format(contents)
            
            if not validation['valid']:
                errors.append({
                    "filename": file.filename,
                    "error": validation['errors']
                })
                continue
            
            result = predictor.predict(contents)
            result['filename'] = file.filename
            result['batch_index'] = i
            
            if validation['warnings']:
                result['warnings'] = validation['warnings']
            
            results.append(result)
            
        except Exception as e:
            errors.append({
                "filename": file.filename,
                "error": str(e)
            })
    
    return JSONResponse(content={
        "success_count": len(results),
        "error_count": len(errors),
        "results": results,
        "errors": errors
    })

@app.get("/classes")
async def get_pathology_classes():
    """获取支持的病理类型"""
    return {
        "total_classes": len(Config.PATHOLOGY_CLASSES),
        "classes": [
            {
                "id": idx,
                "name": class_name,
                "description": Config.PATHOLOGY_DESCRIPTIONS.get(class_name, ""),
                "category": _get_category_by_class(class_name)
            }
            for idx, class_name in enumerate(Config.PATHOLOGY_CLASSES)
        ]
    }

@app.get("/model_info")
async def get_model_info():
    """获取模型详细信息"""
    if predictor is None:
        raise HTTPException(status_code=500, detail="模型未加载")
    
    info = predictor.get_model_info()
    
    # 添加系统信息
    info['system_info'] = {
        "torch_version": torch.__version__,
        "cuda_available": torch.cuda.is_available(),
        "cuda_version": torch.version.cuda if torch.cuda.is_available() else None,
        "device_name": torch.cuda.get_device_name() if torch.cuda.is_available() else "CPU",
        "python_version": sys.version
    }
    
    return JSONResponse(content=info)

@app.post("/diagnose")
async def generate_diagnosis_report(
    file: UploadFile = File(...),
    patient_info: Optional[str] = None
):
    """生成完整的辅助诊断报告"""
    if predictor is None:
        raise HTTPException(status_code=500, detail="模型未加载")
    
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="请上传图像文件")
    
    try:
        # 解析患者信息
        patient_data = {}
        if patient_info:
            try:
                patient_data = json.loads(patient_info)
            except:
                patient_data = {"info": patient_info}
        
        # 读取图像
        contents = await file.read()
        
        # 验证图像
        validation = ValidationUtils.validate_image_format(contents)
        if not validation['valid']:
            raise HTTPException(status_code=400, detail=f"图像验证失败: {validation['errors']}")
        
        # 生成诊断报告
        report = predictor.generate_diagnosis_report(
            image_data=contents,
            patient_info=patient_data,
            save_report=True  # 自动保存报告
        )
        
        return JSONResponse(content=report)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"诊断报告生成失败: {str(e)}")

@app.post("/predict_with_report")
async def predict_with_diagnosis_report(
    file: UploadFile = File(...),
    patient_info: Optional[str] = None,
    include_full_report: bool = True
):
    """预测并包含诊断报告"""
    if predictor is None:
        raise HTTPException(status_code=500, detail="模型未加载")
    
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="请上传图像文件")
    
    try:
        # 解析患者信息
        patient_data = {}
        if patient_info:
            try:
                patient_data = json.loads(patient_info)
            except:
                patient_data = {"info": patient_info}
        
        # 读取图像
        contents = await file.read()
        
        # 验证图像
        validation = ValidationUtils.validate_image_format(contents)
        if not validation['valid']:
            raise HTTPException(status_code=400, detail=f"图像验证失败: {validation['errors']}")
        
        # 预测并生成报告
        result = predictor.predict_with_report(
            image_data=contents,
            patient_info=patient_data,
            include_report=include_full_report
        )
        
        return JSONResponse(content=result)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"预测失败: {str(e)}")

@app.get("/statistics")
async def get_statistics():
    """获取API使用统计（示例）"""
    return {
        "total_predictions": 0,  # 可以集成计数器
        "success_rate": 0.0,
        "average_confidence": 0.0,
        "popular_classes": [],  # 可以记录预测分布
        "uptime": "0h 0m 0s"
    }

def _get_category_by_class(class_name: str) -> str:
    """根据病理类型获取分类"""
    categories = {
        "肺出血": "肺部病变", "肺水肿": "肺部病变", "肺血栓": "肺部病变", "肺炎": "肺部病变",
        "冠心病": "心血管病变", "心肌纤维断裂": "心血管病变", "心肌炎": "心血管病变",
        "脑出血": "脑部病变", "脑水肿": "脑部病变", "脑血管畸形": "脑部病变", "脑蛛网膜下腔淤血": "脑部病变",
        "肝脂肪变性": "肝脏病变",
        "脾小动脉玻璃样改变": "脾脏病变",
        "肾小球纤维化": "肾脏病变",
        "胰腺炎": "胰腺病变"
    }
    return categories.get(class_name, "其他病变")

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=Config.API_HOST,
        port=Config.API_PORT,
        reload=True
    )