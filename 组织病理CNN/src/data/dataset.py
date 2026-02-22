import os
import torch
from torch.utils.data import Dataset
from PIL import Image
import numpy as np
from typing import List, Tuple, Optional, Callable
import albumentations as A
from albumentations.pytorch import ToTensorV2
import cv2

class PathologyDataset(Dataset):
    """组织病理数据集类"""
    
    def __init__(
        self,
        data_dir: str,
        classes: List[str],
        transform: Optional[Callable] = None,
        mode: str = "train"
    ):
        """
        Args:
            data_dir: 数据根目录
            classes: 病理类型列表
            transform: 数据变换
            mode: 模式 ("train", "val", "test")
        """
        self.data_dir = data_dir
        self.classes = classes
        self.class_to_idx = {cls: idx for idx, cls in enumerate(classes)}
        self.transform = transform
        self.mode = mode
        
        # 收集图像路径和标签
        self.samples = self._collect_samples()
        
    def _collect_samples(self) -> List[Tuple[str, int]]:
        """收集所有图像路径和对应标签"""
        samples = []
        
        # 假设数据目录结构: data_dir/class_name/image_files
        for class_name in self.classes:
            class_dir = os.path.join(self.data_dir, class_name)
            if not os.path.exists(class_dir):
                print(f"警告: 类别目录不存在 {class_dir}")
                continue
                
            # 支持的图像格式
            valid_extensions = {'.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.tif'}
            
            for filename in os.listdir(class_dir):
                if os.path.splitext(filename.lower())[1] in valid_extensions:
                    image_path = os.path.join(class_dir, filename)
                    label = self.class_to_idx[class_name]
                    samples.append((image_path, label))
        
        print(f"{self.mode}数据集: 找到 {len(samples)} 个样本")
        return samples
    
    def __len__(self) -> int:
        return len(self.samples)
    
    def __getitem__(self, idx: int) -> Tuple[torch.Tensor, int]:
        """获取单个样本"""
        image_path, label = self.samples[idx]
        
        # 读取图像
        try:
            # 使用OpenCV读取图像 (BGR)
            image = cv2.imread(image_path)
            if image is None:
                raise ValueError(f"无法读取图像: {image_path}")
            
            # 转换为RGB
            image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            
        except Exception as e:
            print(f"读取图像失败 {image_path}: {e}")
            # 返回一个默认的黑色图像
            image = np.zeros((224, 224, 3), dtype=np.uint8)
        
        # 应用变换
        if self.transform:
            transformed = self.transform(image=image)
            image = transformed['image']
        
        return image, label
    
    def get_class_distribution(self) -> dict:
        """获取类别分布统计"""
        distribution = {class_name: 0 for class_name in self.classes}
        
        for _, label in self.samples:
            class_name = self.classes[label]
            distribution[class_name] += 1
            
        return distribution

class PathologyInferenceDataset(Dataset):
    """推理用数据集类"""
    
    def __init__(self, images: List[np.ndarray], transform: Optional[Callable] = None):
        """
        Args:
            images: 图像列表 (numpy数组格式)
            transform: 数据变换
        """
        self.images = images
        self.transform = transform
    
    def __len__(self) -> int:
        return len(self.images)
    
    def __getitem__(self, idx: int) -> torch.Tensor:
        """获取单个图像"""
        image = self.images[idx]
        
        if self.transform:
            transformed = self.transform(image=image)
            image = transformed['image']
        
        return image