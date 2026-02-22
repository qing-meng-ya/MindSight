import torch
import numpy as np
import cv2
from PIL import Image, ImageDraw, ImageFont
import os
from typing import List, Tuple, Dict, Optional
import matplotlib.pyplot as plt
import seaborn as sns
from configs.config import Config

class ImageUtils:
    """图像处理工具类"""
    
    @staticmethod
    def load_image(image_path: str) -> np.ndarray:
        """加载图像"""
        if not os.path.exists(image_path):
            raise FileNotFoundError(f"图像文件不存在: {image_path}")
        
        image = cv2.imread(image_path)
        if image is None:
            raise ValueError(f"无法读取图像: {image_path}")
        
        return cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    
    @staticmethod
    def save_image(image: np.ndarray, save_path: str):
        """保存图像"""
        os.makedirs(os.path.dirname(save_path), exist_ok=True)
        
        # 转换颜色空间
        if len(image.shape) == 3:
            image_bgr = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
        else:
            image_bgr = image
        
        cv2.imwrite(save_path, image_bgr)
    
    @staticmethod
    def resize_image(image: np.ndarray, size: Tuple[int, int]) -> np.ndarray:
        """调整图像尺寸"""
        return cv2.resize(image, size)
    
    @staticmethod
    def normalize_image(image: np.ndarray) -> np.ndarray:
        """归一化图像到0-1范围"""
        return image.astype(np.float32) / 255.0
    
    @staticmethod
    def create_prediction_overlay(
        original_image: np.ndarray,
        prediction_result: Dict,
        save_path: Optional[str] = None
    ) -> np.ndarray:
        """创建预测结果叠加图"""
        # 转换为PIL图像
        pil_image = Image.fromarray(original_image)
        draw = ImageDraw.Draw(pil_image)
        
        # 在图像上添加预测信息
        predicted_class = prediction_result['predicted_class']
        confidence = prediction_result['confidence']
        
        # 尝试加载字体
        try:
            font = ImageFont.truetype("arial.ttf", 20)
        except:
            font = ImageFont.load_default()
        
        # 绘制文本背景
        text = f"{predicted_class}: {confidence:.2f}"
        bbox = draw.textbbox((10, 10), text, font=font)
        draw.rectangle([(bbox[0]-5, bbox[1]-5), (bbox[2]+5, bbox[3]+5)], 
                       fill=(0, 0, 0, 128))
        draw.text((10, 10), text, fill=(255, 255, 255), font=font)
        
        # 转换回numpy数组
        result_image = np.array(pil_image)
        
        if save_path:
            ImageUtils.save_image(result_image, save_path)
        
        return result_image

class VisualizationUtils:
    """可视化工具类"""
    
    @staticmethod
    def plot_confidence_distribution(
        probabilities: Dict[str, float],
        save_path: Optional[str] = None
    ) -> plt.Figure:
        """绘制置信度分布图"""
        fig, ax = plt.subplots(figsize=(12, 6))
        
        classes = list(probabilities.keys())
        probs = list(probabilities.values())
        
        # 排序
        sorted_data = sorted(zip(classes, probs), key=lambda x: x[1], reverse=True)
        classes, probs = zip(*sorted_data)
        
        # 创建颜色映射
        colors = plt.cm.RdYlBu_r(np.linspace(0.2, 0.8, len(classes)))
        
        bars = ax.barh(range(len(classes)), probs, color=colors)
        
        # 添加数值标签
        for i, (bar, prob) in enumerate(zip(bars, probs)):
            ax.text(prob + 0.01, bar.get_y() + bar.get_height()/2, 
                   f'{prob:.3f}', va='center', ha='left')
        
        ax.set_yticks(range(len(classes)))
        ax.set_yticklabels(classes)
        ax.set_xlabel('置信度')
        ax.set_title('病理类型置信度分布')
        ax.set_xlim(0, 1)
        
        plt.tight_layout()
        
        if save_path:
            plt.savefig(save_path, dpi=300, bbox_inches='tight')
        
        return fig
    
    @staticmethod
    def create_prediction_report(
        original_image: np.ndarray,
        prediction_result: Dict,
        save_path: Optional[str] = None
    ) -> plt.Figure:
        """创建预测报告图"""
        fig = plt.figure(figsize=(16, 10))
        
        # 创建网格布局
        gs = fig.add_gridspec(3, 3, height_ratios=[2, 1, 1], width_ratios=[2, 1, 1])
        
        # 原始图像
        ax_img = fig.add_subplot(gs[0, :])
        ax_img.imshow(original_image)
        ax_img.set_title('原始图像', fontsize=14, fontweight='bold')
        ax_img.axis('off')
        
        # 预测结果
        ax_pred = fig.add_subplot(gs[1, 0])
        ax_pred.axis('off')
        predicted_class = prediction_result['predicted_class']
        confidence = prediction_result['confidence']
        
        pred_text = f"预测结果:\n\n"
        pred_text += f"类型: {predicted_class}\n"
        pred_text += f"置信度: {confidence:.3f}\n"
        pred_text += f"阈值通过: {'是' if prediction_result.get('threshold_met', False) else '否'}"
        
        ax_pred.text(0.1, 0.5, pred_text, transform=ax_pred.transAxes,
                    fontsize=12, verticalalignment='center',
                    bbox=dict(boxstyle="round,pad=0.3", facecolor="lightblue"))
        
        # Top-K预测
        ax_topk = fig.add_subplot(gs[1, 1:])
        ax_topk.axis('off')
        
        top_predictions = prediction_result.get('top_k_predictions', [])
        topk_text = "Top-K 预测:\n\n"
        
        for i, pred in enumerate(top_predictions[:5]):
            topk_text += f"{i+1}. {pred['class']}: {pred['probability']:.3f}\n"
        
        ax_topk.text(0.1, 0.5, topk_text, transform=ax_topk.transAxes,
                    fontsize=10, verticalalignment='center',
                    bbox=dict(boxstyle="round,pad=0.3", facecolor="lightgreen"))
        
        # 置信度分布
        ax_conf = fig.add_subplot(gs[2, :])
        probabilities = prediction_result.get('probabilities', {})
        if probabilities:
            class_names = list(probabilities.keys())
            confidences = [probabilities[name]['probability'] for name in class_names]
            
            # 排序
            sorted_data = sorted(zip(class_names, confidences), key=lambda x: x[1], reverse=True)
            class_names, confidences = zip(*sorted_data)
            
            colors = plt.cm.RdYlBu_r(np.linspace(0.2, 0.8, len(class_names)))
            bars = ax_conf.barh(range(len(class_names)), confidences, color=colors)
            
            ax_conf.set_yticks(range(len(class_names)))
            ax_conf.set_yticklabels(class_names)
            ax_conf.set_xlabel('置信度')
            ax_conf.set_title('各类别置信度分布')
            ax_conf.set_xlim(0, 1)
        else:
            ax_conf.axis('off')
        
        plt.tight_layout()
        
        if save_path:
            plt.savefig(save_path, dpi=300, bbox_inches='tight')
        
        return fig

class FileUtils:
    """文件操作工具类"""
    
    @staticmethod
    def ensure_dir(directory: str):
        """确保目录存在"""
        os.makedirs(directory, exist_ok=True)
    
    @staticmethod
    def get_file_size(file_path: str) -> int:
        """获取文件大小（字节）"""
        if os.path.exists(file_path):
            return os.path.getsize(file_path)
        return 0
    
    @staticmethod
    def format_file_size(size_bytes: int) -> str:
        """格式化文件大小"""
        for unit in ['B', 'KB', 'MB', 'GB']:
            if size_bytes < 1024.0:
                return f"{size_bytes:.1f}{unit}"
            size_bytes /= 1024.0
        return f"{size_bytes:.1f}TB"
    
    @staticmethod
    def get_image_files(directory: str, extensions: List[str] = None) -> List[str]:
        """获取目录中的图像文件"""
        if extensions is None:
            extensions = ['.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.tif']
        
        image_files = []
        for file in os.listdir(directory):
            if os.path.splitext(file.lower())[1] in extensions:
                image_files.append(os.path.join(directory, file))
        
        return sorted(image_files)

class ValidationUtils:
    """验证工具类"""
    
    @staticmethod
    def validate_image_format(image_data: bytes, max_size_mb: int = 10) -> Dict[str, any]:
        """验证图像格式和大小"""
        result = {'valid': True, 'errors': [], 'warnings': []}
        
        # 检查文件大小
        size_mb = len(image_data) / (1024 * 1024)
        if size_mb > max_size_mb:
            result['valid'] = False
            result['errors'].append(f"文件大小 {size_mb:.1f}MB 超过限制 {max_size_mb}MB")
        
        # 检查图像格式
        try:
            from PIL import Image
            image = Image.open(io.BytesIO(image_data))
            
            # 检查尺寸
            if image.size[0] < 64 or image.size[1] < 64:
                result['warnings'].append("图像尺寸较小，可能影响识别效果")
            
            # 检查模式
            if image.mode not in ['RGB', 'RGBA', 'L']:
                result['warnings'].append(f"图像模式 {image.mode} 可能不被完全支持")
                
        except Exception as e:
            result['valid'] = False
            result['errors'].append(f"无法解析图像格式: {str(e)}")
        
        return result

# 为了避免导入问题，添加必要的import
import io