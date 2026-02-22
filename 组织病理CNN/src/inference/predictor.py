import torch
import torch.nn as nn
import numpy as np
import cv2
from PIL import Image
import io
import base64
from typing import Dict, List, Optional, Tuple, Union
from datetime import datetime

from ..models import ModelManager, ModelFactory
from ..data import PathologyTransforms
from ..training import MetricsCalculator
from .report_generator import DiagnosisReportGenerator
from configs.config import Config

class PathologyPredictor:
    """组织病理预测器"""
    
    def __init__(
        self,
        model_path: Optional[str] = None,
        device: Optional[str] = None,
        confidence_threshold: float = 0.5
    ):
        """
        Args:
            model_path: 模型文件路径
            device: 设备类型
            confidence_threshold: 置信度阈值
        """
        # 设备配置
        if device is None:
            self.device = 'cuda' if torch.cuda.is_available() else 'cpu'
        else:
            self.device = device
        
        print(f"使用设备: {self.device}")
        
        # 加载模型
        self.model_manager = ModelManager()
        self.model, self.model_info = self.model_manager.load_model(
            model_path=model_path,
            load_best=True,
            device=self.device
        )
        
        # 设置为评估模式
        self.model.eval()
        
        # 配置
        self.confidence_threshold = confidence_threshold
        self.transform = PathologyTransforms.get_inference_transforms()
        self.metrics_calculator = MetricsCalculator()
        
        # 报告生成器
        self.report_generator = DiagnosisReportGenerator()
        
        # 类别信息
        self.classes = Config.PATHOLOGY_CLASSES
        self.class_descriptions = Config.PATHOLOGY_DESCRIPTIONS
        
        print(f"模型加载成功: {self.model_info.get('model_type', 'unknown')}")
        print(f"训练轮次: {self.model_info.get('epoch', 'unknown')}")
    
    def preprocess_image(self, image: Union[bytes, np.ndarray, Image.Image]) -> np.ndarray:
        """
        预处理图像
        
        Args:
            image: 输入图像 (bytes, numpy数组, 或PIL图像)
            
        Returns:
            预处理后的numpy数组
        """
        if isinstance(image, bytes):
            # 从字节数据读取
            image = Image.open(io.BytesIO(image))
            image = np.array(image.convert('RGB'))
        
        elif isinstance(image, Image.Image):
            # 从PIL图像转换
            image = np.array(image.convert('RGB'))
        
        elif isinstance(image, np.ndarray):
            # 已经是numpy数组
            if len(image.shape) == 3 and image.shape[2] == 3:
                pass  # 已经是RGB格式
            elif len(image.shape) == 2:
                # 灰度图转RGB
                image = cv2.cvtColor(image, cv2.COLOR_GRAY2RGB)
            elif len(image.shape) == 3 and image.shape[2] == 4:
                # RGBA转RGB
                image = cv2.cvtColor(image, cv2.COLOR_RGBA2RGB)
            else:
                raise ValueError(f"不支持的图像格式: {image.shape}")
        
        else:
            raise ValueError(f"不支持的图像类型: {type(image)}")
        
        return image
    
    def predict_single(
        self, 
        image: Union[bytes, np.ndarray, Image.Image],
        return_probabilities: bool = True,
        use_tta: bool = False
    ) -> Dict[str, any]:
        """
        对单个图像进行预测
        
        Args:
            image: 输入图像
            return_probabilities: 是否返回所有类别的概率
            use_tta: 是否使用测试时数据增强
            
        Returns:
            预测结果字典
        """
        try:
            # 预处理图像
            image_array = self.preprocess_image(image)
            original_shape = image_array.shape
            
            # 应用变换
            if use_tta:
                # 测试时数据增强
                predictions = self._predict_with_tta(image_array)
                probs = np.mean(predictions, axis=0)
            else:
                # 标准预测
                transformed = self.transform(image=image_array)
                input_tensor = transformed['image'].unsqueeze(0).to(self.device)
                
                with torch.no_grad():
                    outputs = self.model(input_tensor)
                    probs = torch.softmax(outputs, dim=1).cpu().numpy()[0]
            
            # 获取预测结果
            predicted_class_idx = np.argmax(probs)
            predicted_class = self.classes[predicted_class_idx]
            confidence = float(probs[predicted_class_idx])
            
            # 构建结果
            result = {
                'predicted_class': predicted_class,
                'confidence': confidence,
                'predicted_class_idx': int(predicted_class_idx),
                'timestamp': datetime.now().isoformat(),
                'image_shape': list(original_shape),
                'threshold_met': confidence >= self.confidence_threshold
            }
            
            # 添加所有概率
            if return_probabilities:
                class_probabilities = {}
                for i, (class_name, prob) in enumerate(zip(self.classes, probs)):
                    class_probabilities[class_name] = {
                        'probability': float(prob),
                        'description': self.class_descriptions.get(class_name, ''),
                        'rank': int(np.argsort(probs)[::-1].tolist().index(i)) + 1
                    }
                
                result['probabilities'] = class_probabilities
                
                # 排序后的top-k预测
                top_k = min(5, len(self.classes))  # 返回top-5
                sorted_indices = np.argsort(probs)[::-1][:top_k]
                result['top_k_predictions'] = [
                    {
                        'class': self.classes[idx],
                        'probability': float(probs[idx]),
                        'description': self.class_descriptions.get(self.classes[idx], ''),
                        'rank': rank + 1
                    }
                    for rank, idx in enumerate(sorted_indices)
                ]
            
            return result
            
        except Exception as e:
            raise RuntimeError(f"预测失败: {str(e)}")
    
    def _predict_with_tta(self, image_array: np.ndarray) -> List[np.ndarray]:
        """使用测试时数据增强进行预测"""
        tta_transforms = PathologyTransforms.get_tta_transforms()
        predictions = []
        
        with torch.no_grad():
            for transform in tta_transforms:
                transformed = transform(image=image_array)
                input_tensor = transformed['image'].unsqueeze(0).to(self.device)
                
                outputs = self.model(input_tensor)
                probs = torch.softmax(outputs, dim=1).cpu().numpy()[0]
                predictions.append(probs)
        
        return predictions
    
    def predict_batch(
        self,
        images: List[Union[bytes, np.ndarray, Image.Image]],
        batch_size: int = 8,
        use_tta: bool = False
    ) -> List[Dict[str, any]]:
        """
        批量预测
        
        Args:
            images: 图像列表
            batch_size: 批次大小
            use_tta: 是否使用测试时数据增强
            
        Returns:
            预测结果列表
        """
        results = []
        
        # 分批处理
        for i in range(0, len(images), batch_size):
            batch_images = images[i:i + batch_size]
            
            # 预处理批次
            batch_arrays = []
            for image in batch_images:
                array = self.preprocess_image(image)
                batch_arrays.append(array)
            
            if use_tta:
                # TTA需要单独处理每张图像
                for array in batch_arrays:
                    result = self.predict_single(array, use_tta=True)
                    results.append(result)
            else:
                # 标准批量预测
                try:
                    # 应用变换
                    batch_tensors = []
                    for array in batch_arrays:
                        transformed = self.transform(image=array)
                        batch_tensors.append(transformed['image'])
                    
                    # 创建批次张量
                    input_batch = torch.stack(batch_tensors).to(self.device)
                    
                    with torch.no_grad():
                        outputs = self.model(input_batch)
                        probs = torch.softmax(outputs, dim=1).cpu().numpy()
                    
                    # 处理每张图像的结果
                    for j, prob in enumerate(probs):
                        predicted_class_idx = np.argmax(prob)
                        predicted_class = self.classes[predicted_class_idx]
                        confidence = float(prob[predicted_class_idx])
                        
                        result = {
                            'predicted_class': predicted_class,
                            'confidence': confidence,
                            'predicted_class_idx': int(predicted_class_idx),
                            'timestamp': datetime.now().isoformat(),
                            'image_shape': list(batch_arrays[j].shape),
                            'threshold_met': confidence >= self.confidence_threshold
                        }
                        
                        # 添加所有概率
                        class_probabilities = {}
                        for k, (class_name, p) in enumerate(zip(self.classes, prob)):
                            class_probabilities[class_name] = {
                                'probability': float(p),
                                'description': self.class_descriptions.get(class_name, ''),
                                'rank': int(np.argsort(prob)[::-1].tolist().index(k)) + 1
                            }
                        
                        result['probabilities'] = class_probabilities
                        
                        # 排序后的top-k预测
                        top_k = min(5, len(self.classes))
                        sorted_indices = np.argsort(prob)[::-1][:top_k]
                        result['top_k_predictions'] = [
                            {
                                'class': self.classes[idx],
                                'probability': float(prob[idx]),
                                'description': self.class_descriptions.get(self.classes[idx], ''),
                                'rank': rank + 1
                            }
                            for rank, idx in enumerate(sorted_indices)
                        ]
                        
                        results.append(result)
                        
                except Exception as e:
                    # 如果批量预测失败，回退到单个预测
                    print(f"批量预测失败，回退到单个预测: {e}")
                    for array in batch_arrays:
                        result = self.predict_single(array, use_tta=False)
                        results.append(result)
        
        return results
    
    def predict(self, image_data: bytes) -> Dict[str, any]:
        """
        兼容FastAPI的预测接口
        
        Args:
            image_data: 图像字节数据
            
        Returns:
            标准化的预测结果
        """
        try:
            # 进行预测
            result = self.predict_single(image_data, return_probabilities=True)
            
            # 格式化为API返回格式
            api_result = {
                'success': True,
                'prediction': {
                    'class': result['predicted_class'],
                    'confidence': result['confidence'],
                    'description': self.class_descriptions.get(result['predicted_class'], ''),
                    'threshold_met': result['threshold_met']
                },
                'top_predictions': result['top_k_predictions'][:3],  # 只返回top-3
                'metadata': {
                    'model_info': {
                        'type': self.model_info.get('model_type', 'unknown'),
                        'epoch': self.model_info.get('epoch', 0),
                        'device': self.device
                    },
                    'timestamp': result['timestamp'],
                    'image_shape': result['image_shape']
                }
            }
            
            return api_result
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }
    
    def generate_diagnosis_report(
        self,
        image_data: bytes,
        patient_info: Optional[Dict[str, str]] = None,
        save_report: bool = False,
        report_path: Optional[str] = None
    ) -> Dict[str, any]:
        """
        生成完整的辅助诊断报告
        
        Args:
            image_data: 图像字节数据
            patient_info: 患者信息
            save_report: 是否保存报告
            report_path: 报告保存路径
            
        Returns:
            完整的诊断报告
        """
        try:
            # 先进行预测
            prediction_result = self.predict_single(image_data, return_probabilities=True)
            
            # 生成图像元数据
            image_array = self.preprocess_image(image_data)
            image_metadata = {
                "image_shape": list(image_array.shape),
                "image_size_bytes": len(image_data),
                "processed_at": datetime.now().isoformat()
            }
            
            # 生成报告
            report = self.report_generator.generate_diagnosis_report(
                prediction_result=prediction_result,
                patient_info=patient_info,
                image_metadata=image_metadata,
                include_differential=True
            )
            
            # 添加预测器信息
            report["prediction_model_info"] = self.get_model_info()
            
            # 保存报告
            if save_report:
                if report_path is None:
                    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                    report_path = f"diagnosis_report_{timestamp}.json"
                
                self.report_generator.save_report(report, report_path)
                report["saved_to"] = report_path
            
            # 生成文本摘要
            report["summary_text"] = self.report_generator.generate_summary_text(report)
            
            return report
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }
    
    def predict_with_report(
        self,
        image_data: bytes,
        patient_info: Optional[Dict[str, str]] = None,
        include_report: bool = True
    ) -> Dict[str, any]:
        """
        预测并生成报告的组合接口
        
        Args:
            image_data: 图像字节数据
            patient_info: 患者信息
            include_report: 是否包含详细报告
            
        Returns:
            包含预测和报告的结果
        """
        try:
            # 基础预测
            prediction = self.predict(image_data)
            
            if include_report and prediction.get("success", False):
                # 生成报告
                report = self.generate_diagnosis_report(
                    image_data, patient_info, save_report=False
                )
                
                # 合并结果
                prediction["diagnosis_report"] = report
                prediction["report_summary"] = report.get("summary_text", "")
            
            return prediction
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }
    
    def get_model_info(self) -> Dict[str, any]:
        """获取模型信息"""
        return {
            'model_type': self.model_info.get('model_type', 'unknown'),
            'training_epoch': self.model_info.get('epoch', 0),
            'num_classes': len(self.classes),
            'classes': self.classes,
            'class_descriptions': self.class_descriptions,
            'device': self.device,
            'confidence_threshold': self.confidence_threshold,
            'input_size': Config.IMG_SIZE,
            'model_path': self.model_info.get('model_path', ''),
            'training_metrics': self.model_info.get('metrics', {}),
            'timestamp': self.model_info.get('timestamp', ''),
            'report_generation_available': True
        }