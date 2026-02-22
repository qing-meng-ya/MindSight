import torch
import torch.nn as nn
import os
import json
from typing import Dict, Any, Optional, Tuple
from datetime import datetime
import shutil
from .cnn_model import ModelFactory
from configs.config import Config

class ModelManager:
    """模型管理类"""
    
    def __init__(self, models_dir: str = Config.MODELS_DIR):
        """
        Args:
            models_dir: 模型保存目录
        """
        self.models_dir = models_dir
        os.makedirs(models_dir, exist_ok=True)
        
        # 最佳模型路径
        self.best_model_path = os.path.join(models_dir, "best_model.pth")
        self.latest_model_path = os.path.join(models_dir, "latest_model.pth")
        self.model_info_path = os.path.join(models_dir, "model_info.json")
    
    def save_model(
        self,
        model: nn.Module,
        optimizer: torch.optim.Optimizer,
        epoch: int,
        metrics: Dict[str, float],
        model_config: Dict[str, Any],
        is_best: bool = False,
        save_latest: bool = True
    ) -> str:
        """
        保存模型
        
        Args:
            model: 模型实例
            optimizer: 优化器
            epoch: 训练轮次
            metrics: 评估指标
            model_config: 模型配置
            is_best: 是否为最佳模型
            save_latest: 是否保存为最新模型
            
        Returns:
            保存的模型路径
        """
        # 创建保存信息
        save_info = {
            'epoch': epoch,
            'model_state_dict': model.state_dict(),
            'optimizer_state_dict': optimizer.state_dict(),
            'metrics': metrics,
            'model_config': model_config,
            'timestamp': datetime.now().isoformat(),
            'model_type': model_config.get('model_type', 'unknown'),
            'num_classes': Config.NUM_CLASSES,
            'pathology_classes': Config.PATHOLOGY_CLASSES
        }
        
        # 生成带时间戳的文件名
        timestamp_str = datetime.now().strftime("%Y%m%d_%H%M%S")
        model_filename = f"model_epoch{epoch}_{timestamp_str}.pth"
        model_path = os.path.join(self.models_dir, model_filename)
        
        # 保存模型
        torch.save(save_info, model_path)
        
        # 保存为最新模型
        if save_latest:
            shutil.copy2(model_path, self.latest_model_path)
        
        # 保存为最佳模型
        if is_best:
            shutil.copy2(model_path, self.best_model_path)
        
        # 更新模型信息文件
        self._update_model_info(save_info, model_filename)
        
        print(f"模型已保存: {model_path}")
        if is_best:
            print(f"更新最佳模型: {self.best_model_path}")
        
        return model_path
    
    def load_model(
        self,
        model_path: Optional[str] = None,
        load_best: bool = True,
        device: str = 'cpu'
    ) -> Tuple[nn.Module, Dict[str, Any]]:
        """
        加载模型
        
        Args:
            model_path: 模型文件路径
            load_best: 是否加载最佳模型
            device: 设备类型
            
        Returns:
            模型和元信息
        """
        if model_path is None:
            if load_best and os.path.exists(self.best_model_path):
                model_path = self.best_model_path
                print(f"加载最佳模型: {model_path}")
            elif os.path.exists(self.latest_model_path):
                model_path = self.latest_model_path
                print(f"加载最新模型: {model_path}")
            else:
                raise FileNotFoundError("未找到可用的模型文件")
        
        # 加载模型信息
        checkpoint = torch.load(model_path, map_location=device)
        
        # 重建模型
        model_config = checkpoint.get('model_config', {})
        model_type = model_config.get('model_type', 'resnet50')
        
        model = ModelFactory.create_model(
            model_type=model_type,
            num_classes=checkpoint.get('num_classes', Config.NUM_CLASSES),
            **model_config
        )
        
        # 加载权重
        model.load_state_dict(checkpoint['model_state_dict'])
        model = model.to(device)
        
        # 准备元信息
        metadata = {
            'epoch': checkpoint.get('epoch', 0),
            'metrics': checkpoint.get('metrics', {}),
            'model_config': model_config,
            'timestamp': checkpoint.get('timestamp', ''),
            'model_path': model_path
        }
        
        print(f"模型加载成功: {model_type}, Epoch: {metadata['epoch']}")
        
        return model, metadata
    
    def load_optimizer(
        self,
        optimizer_class: torch.optim.Optimizer,
        model: nn.Module,
        model_path: Optional[str] = None,
        load_best: bool = True,
        **optimizer_kwargs
    ) -> torch.optim.Optimizer:
        """
        加载优化器状态
        
        Args:
            optimizer_class: 优化器类
            model: 模型实例
            model_path: 模型文件路径
            load_best: 是否加载最佳模型
            **optimizer_kwargs: 优化器参数
            
        Returns:
            优化器实例
        """
        if model_path is None:
            if load_best and os.path.exists(self.best_model_path):
                model_path = self.best_model_path
            elif os.path.exists(self.latest_model_path):
                model_path = self.latest_model_path
            else:
                raise FileNotFoundError("未找到可用的模型文件")
        
        # 加载检查点
        checkpoint = torch.load(model_path, map_location='cpu')
        
        # 创建优化器
        optimizer = optimizer_class(model.parameters(), **optimizer_kwargs)
        
        # 加载状态
        if 'optimizer_state_dict' in checkpoint:
            optimizer.load_state_dict(checkpoint['optimizer_state_dict'])
            print(f"优化器状态加载成功")
        else:
            print("未找到优化器状态，使用初始化状态")
        
        return optimizer
    
    def _update_model_info(self, save_info: Dict[str, Any], filename: str):
        """更新模型信息文件"""
        model_info = {}
        
        # 加载现有信息
        if os.path.exists(self.model_info_path):
            try:
                with open(self.model_info_path, 'r', encoding='utf-8') as f:
                    model_info = json.load(f)
            except:
                model_info = {}
        
        # 添加新模型信息
        model_info[filename] = {
            'epoch': save_info['epoch'],
            'metrics': save_info['metrics'],
            'timestamp': save_info['timestamp'],
            'model_type': save_info['model_type'],
            'num_classes': save_info['num_classes']
        }
        
        # 保存信息文件
        with open(self.model_info_path, 'w', encoding='utf-8') as f:
            json.dump(model_info, f, indent=2, ensure_ascii=False)
    
    def list_models(self) -> Dict[str, Dict[str, Any]]:
        """列出所有已保存的模型"""
        if not os.path.exists(self.model_info_path):
            return {}
        
        with open(self.model_info_path, 'r', encoding='utf-8') as f:
            model_info = json.load(f)
        
        return model_info
    
    def get_best_model_path(self) -> Optional[str]:
        """获取最佳模型路径"""
        if os.path.exists(self.best_model_path):
            return self.best_model_path
        return None
    
    def get_latest_model_path(self) -> Optional[str]:
        """获取最新模型路径"""
        if os.path.exists(self.latest_model_path):
            return self.latest_model_path
        return None
    
    def cleanup_old_models(self, keep_count: int = 5):
        """清理旧模型，保留最新的几个"""
        model_files = []
        
        # 获取所有模型文件
        for filename in os.listdir(self.models_dir):
            if filename.startswith('model_epoch') and filename.endswith('.pth'):
                filepath = os.path.join(self.models_dir, filename)
                model_files.append((filepath, os.path.getctime(filepath)))
        
        # 按时间排序
        model_files.sort(key=lambda x: x[1], reverse=True)
        
        # 删除旧模型
        for filepath, _ in model_files[keep_count:]:
            if filepath not in [self.best_model_path, self.latest_model_path]:
                os.remove(filepath)
                print(f"删除旧模型: {filepath}")