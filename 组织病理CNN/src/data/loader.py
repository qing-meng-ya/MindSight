import torch
from torch.utils.data import DataLoader, random_split
from typing import Tuple, Dict, Optional
import os
from .dataset import PathologyDataset
from .transforms import PathologyTransforms
from configs.config import Config

class PathologyDataLoader:
    """组织病理数据加载器管理类"""
    
    def __init__(
        self,
        data_dir: str,
        batch_size: int = Config.BATCH_SIZE,
        img_size: int = Config.IMG_SIZE,
        num_workers: int = 4,
        val_split: float = 0.2,
        test_split: float = 0.1,
        random_seed: int = 42
    ):
        """
        Args:
            data_dir: 数据目录
            batch_size: 批次大小
            img_size: 图像尺寸
            num_workers: 数据加载进程数
            val_split: 验证集比例
            test_split: 测试集比例
            random_seed: 随机种子
        """
        self.data_dir = data_dir
        self.batch_size = batch_size
        self.img_size = img_size
        self.num_workers = num_workers
        self.val_split = val_split
        self.test_split = test_split
        self.random_seed = random_seed
        
        # 设置随机种子
        torch.manual_seed(random_seed)
        
        # 检查数据目录
        if not os.path.exists(data_dir):
            raise ValueError(f"数据目录不存在: {data_dir}")
        
        # 创建数据集
        self.full_dataset = PathologyDataset(
            data_dir=data_dir,
            classes=Config.PATHOLOGY_CLASSES,
            transform=None  # 先不应用变换
        )
        
        # 分割数据集
        self.train_dataset, self.val_dataset, self.test_dataset = self._split_dataset()
        
        # 应用相应的变换
        self.train_dataset.transform = PathologyTransforms.get_train_transforms(self.img_size)
        self.val_dataset.transform = PathologyTransforms.get_val_transforms(self.img_size)
        self.test_dataset.transform = PathologyTransforms.get_val_transforms(self.img_size)
        
        print(f"数据集分割完成:")
        print(f"  训练集: {len(self.train_dataset)} 样本")
        print(f"  验证集: {len(self.val_dataset)} 样本")
        print(f"  测试集: {len(self.test_dataset)} 样本")
    
    def _split_dataset(self) -> Tuple[PathologyDataset, PathologyDataset, PathologyDataset]:
        """分割数据集为训练集、验证集和测试集"""
        total_size = len(self.full_dataset)
        
        # 计算各数据集大小
        test_size = int(total_size * self.test_split)
        val_size = int(total_size * self.val_split)
        train_size = total_size - val_size - test_size
        
        # 分割数据集
        train_dataset, val_dataset, test_dataset = random_split(
            self.full_dataset,
            [train_size, val_size, test_size],
            generator=torch.Generator().manual_seed(self.random_seed)
        )
        
        return train_dataset, val_dataset, test_dataset
    
    def get_train_loader(self) -> DataLoader:
        """获取训练数据加载器"""
        return DataLoader(
            dataset=self.train_dataset,
            batch_size=self.batch_size,
            shuffle=True,
            num_workers=self.num_workers,
            pin_memory=True,
            drop_last=True  # 丢弃最后一个不完整的批次
        )
    
    def get_val_loader(self) -> DataLoader:
        """获取验证数据加载器"""
        return DataLoader(
            dataset=self.val_dataset,
            batch_size=self.batch_size,
            shuffle=False,
            num_workers=self.num_workers,
            pin_memory=True,
            drop_last=False
        )
    
    def get_test_loader(self) -> DataLoader:
        """获取测试数据加载器"""
        return DataLoader(
            dataset=self.test_dataset,
            batch_size=self.batch_size,
            shuffle=False,
            num_workers=self.num_workers,
            pin_memory=True,
            drop_last=False
        )
    
    def get_class_weights(self) -> torch.Tensor:
        """计算类别权重（用于处理类别不平衡）"""
        # 统计每个类别的样本数
        class_counts = torch.zeros(len(Config.PATHOLOGY_CLASSES))
        
        for _, label in self.train_dataset:
            class_counts[label] += 1
        
        # 计算权重（样本数越少，权重越大）
        total_samples = len(self.train_dataset)
        class_weights = total_samples / (len(class_counts) * class_counts)
        
        # 归一化权重
        class_weights = class_weights / class_weights.sum() * len(class_weights)
        
        print("类别权重:")
        for i, (class_name, weight) in enumerate(zip(Config.PATHOLOGY_CLASSES, class_weights)):
            print(f"  {class_name}: {weight:.4f}")
        
        return class_weights
    
    def get_dataset_statistics(self) -> Dict:
        """获取数据集统计信息"""
        stats = {}
        
        # 训练集分布
        train_dist = self.full_dataset.get_class_distribution()
        stats['train_distribution'] = train_dist
        stats['total_train_samples'] = len(self.train_dataset)
        stats['total_val_samples'] = len(self.val_dataset)
        stats['total_test_samples'] = len(self.test_dataset)
        
        return stats

def create_data_loaders(
    data_dir: str,
    batch_size: int = Config.BATCH_SIZE,
    img_size: int = Config.IMG_SIZE,
    **kwargs
) -> Tuple[DataLoader, DataLoader, DataLoader]:
    """便捷函数：创建数据加载器"""
    data_loader_manager = PathologyDataLoader(
        data_dir=data_dir,
        batch_size=batch_size,
        img_size=img_size,
        **kwargs
    )
    
    return (
        data_loader_manager.get_train_loader(),
        data_loader_manager.get_val_loader(),
        data_loader_manager.get_test_loader()
    )