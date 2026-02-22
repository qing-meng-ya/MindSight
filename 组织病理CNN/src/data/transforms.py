import albumentations as A
from albumentations.pytorch import ToTensorV2
from typing import Optional

class PathologyTransforms:
    """组织病理图像数据变换类"""
    
    @staticmethod
    def get_train_transforms(img_size: int = 224) -> A.Compose:
        """训练时的数据增强"""
        return A.Compose([
            # 基础变换
            A.Resize(height=img_size, width=img_size),
            
            # 水平翻转和垂直翻转
            A.HorizontalFlip(p=0.5),
            A.VerticalFlip(p=0.3),
            
            # 旋转
            A.Rotate(limit=15, p=0.5, border_mode=cv2.BORDER_CONSTANT, value=0),
            
            # 亮度和对比度调整
            A.RandomBrightnessContrast(
                brightness_limit=0.2,
                contrast_limit=0.2,
                p=0.3
            ),
            
            # 噪声添加
            A.GaussNoise(var_limit=(10.0, 50.0), p=0.3),
            
            # 模糊处理
            A.OneOf([
                A.GaussianBlur(blur_limit=(3, 7), p=1.0),
                A.MedianBlur(blur_limit=5, p=1.0),
            ], p=0.2),
            
            # 颜色抖动
            A.ColorJitter(
                brightness=0.1,
                contrast=0.1,
                saturation=0.1,
                hue=0.05,
                p=0.3
            ),
            
            # 弹性变换 (模拟组织变形)
            A.ElasticTransform(
                alpha=1,
                sigma=50,
                alpha_affine=50,
                p=0.2
            ),
            
            # 网格扭曲
            A.GridDistortion(num_steps=5, distort_limit=0.3, p=0.2),
            
            # 标准化和转换为Tensor
            A.Normalize(
                mean=[0.485, 0.456, 0.406],  # ImageNet标准化参数
                std=[0.229, 0.224, 0.225]
            ),
            ToTensorV2()
        ])
    
    @staticmethod
    def get_val_transforms(img_size: int = 224) -> A.Compose:
        """验证时的基础变换"""
        return A.Compose([
            A.Resize(height=img_size, width=img_size),
            A.Normalize(
                mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225]
            ),
            ToTensorV2()
        ])
    
    @staticmethod
    def get_inference_transforms(img_size: int = 224) -> A.Compose:
        """推理时的变换"""
        return A.Compose([
            A.Resize(height=img_size, width=img_size),
            A.Normalize(
                mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225]
            ),
            ToTensorV2()
        ])
    
    @staticmethod
    def get_tta_transforms(img_size: int = 224) -> list:
        """测试时数据增强 (TTA)"""
        transforms_list = [
            # 原始图像
            PathologyTransforms.get_val_transforms(img_size),
            
            # 水平翻转
            A.Compose([
                A.Resize(height=img_size, width=img_size),
                A.HorizontalFlip(p=1.0),
                A.Normalize(
                    mean=[0.485, 0.456, 0.406],
                    std=[0.229, 0.224, 0.225]
                ),
                ToTensorV2()
            ]),
            
            # 垂直翻转
            A.Compose([
                A.Resize(height=img_size, width=img_size),
                A.VerticalFlip(p=1.0),
                A.Normalize(
                    mean=[0.485, 0.456, 0.406],
                    std=[0.229, 0.224, 0.225]
                ),
                ToTensorV2()
            ]),
            
            # 旋转90度
            A.Compose([
                A.Resize(height=img_size, width=img_size),
                A.Rotate(limit=90, p=1.0, border_mode=cv2.BORDER_CONSTANT, value=0),
                A.Normalize(
                    mean=[0.485, 0.456, 0.406],
                    std=[0.229, 0.224, 0.225]
                ),
                ToTensorV2()
            ])
        ]
        
        return transforms_list

# 为了避免导入问题，添加cv2
import cv2