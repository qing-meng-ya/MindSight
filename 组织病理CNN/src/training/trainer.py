import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader
from typing import Dict, List, Tuple, Optional, Callable
import numpy as np
from tqdm import tqdm
import matplotlib.pyplot as plt
import os
from datetime import datetime

from ..models import ModelManager
from ..data import PathologyDataLoader
from .metrics import MetricsCalculator
from .losses import FocalLoss
from configs.config import Config

class Trainer:
    """模型训练器"""
    
    def __init__(
        self,
        model: nn.Module,
        train_loader: DataLoader,
        val_loader: DataLoader,
        test_loader: Optional[DataLoader] = None,
        model_config: Optional[Dict] = None,
        device: str = 'cuda' if torch.cuda.is_available() else 'cpu',
        save_dir: str = Config.MODELS_DIR
    ):
        """
        Args:
            model: 模型实例
            train_loader: 训练数据加载器
            val_loader: 验证数据加载器
            test_loader: 测试数据加载器
            model_config: 模型配置
            device: 设备类型
            save_dir: 模型保存目录
        """
        self.model = model.to(device)
        self.train_loader = train_loader
        self.val_loader = val_loader
        self.test_loader = test_loader
        self.model_config = model_config or {}
        self.device = device
        
        # 初始化组件
        self.model_manager = ModelManager(save_dir)
        self.metrics_calculator = MetricsCalculator()
        
        # 训练历史
        self.train_history = {
            'loss': [],
            'accuracy': [],
            'precision': [],
            'recall': [],
            'f1': []
        }
        self.val_history = {
            'loss': [],
            'accuracy': [],
            'precision': [],
            'recall': [],
            'f1': []
        }
        
        # 最佳指标
        self.best_val_f1 = 0.0
        self.best_epoch = 0
        
    def setup_training(
        self,
        learning_rate: float = Config.LEARNING_RATE,
        weight_decay: float = 1e-4,
        use_focal_loss: bool = True,
        focal_alpha: float = 1.0,
        focal_gamma: float = 2.0,
        class_weights: Optional[torch.Tensor] = None
    ) -> Tuple[nn.Module, torch.optim.Optimizer]:
        """设置训练组件"""
        # 损失函数
        if use_focal_loss:
            criterion = FocalLoss(alpha=focal_alpha, gamma=focal_gamma)
            print("使用Focal Loss")
        else:
            if class_weights is not None:
                class_weights = class_weights.to(self.device)
                criterion = nn.CrossEntropyLoss(weight=class_weights)
                print("使用加权CrossEntropy Loss")
            else:
                criterion = nn.CrossEntropyLoss()
                print("使用标准CrossEntropy Loss")
        
        # 优化器
        optimizer = optim.AdamW(
            self.model.parameters(),
            lr=learning_rate,
            weight_decay=weight_decay
        )
        
        # 学习率调度器
        scheduler = optim.lr_scheduler.ReduceLROnPlateau(
            optimizer,
            mode='max',
            factor=0.5,
            patience=5,
            verbose=True
        )
        
        self.criterion = criterion
        self.optimizer = optimizer
        self.scheduler = scheduler
        
        return criterion, optimizer
    
    def train_epoch(self) -> Dict[str, float]:
        """训练一个epoch"""
        self.model.train()
        epoch_loss = 0.0
        all_preds = []
        all_labels = []
        
        # 进度条
        pbar = tqdm(self.train_loader, desc="训练中")
        
        for batch_idx, (data, target) in enumerate(pbar):
            data, target = data.to(self.device), target.to(self.device)
            
            # 前向传播
            self.optimizer.zero_grad()
            output = self.model(data)
            loss = self.criterion(output, target)
            
            # 反向传播
            loss.backward()
            self.optimizer.step()
            
            # 统计
            epoch_loss += loss.item()
            preds = torch.argmax(output, dim=1)
            
            all_preds.extend(preds.cpu().numpy())
            all_labels.extend(target.cpu().numpy())
            
            # 更新进度条
            pbar.set_postfix({
                'loss': f'{loss.item():.4f}',
                'avg_loss': f'{epoch_loss/(batch_idx+1):.4f}'
            })
        
        # 计算指标
        avg_loss = epoch_loss / len(self.train_loader)
        metrics = self.metrics_calculator.calculate_metrics(all_labels, all_preds)
        
        return {
            'loss': avg_loss,
            'accuracy': metrics['accuracy'],
            'precision': metrics['macro_precision'],
            'recall': metrics['macro_recall'],
            'f1': metrics['macro_f1']
        }
    
    def validate_epoch(self) -> Dict[str, float]:
        """验证一个epoch"""
        self.model.eval()
        epoch_loss = 0.0
        all_preds = []
        all_labels = []
        
        with torch.no_grad():
            pbar = tqdm(self.val_loader, desc="验证中")
            
            for data, target in pbar:
                data, target = data.to(self.device), target.to(self.device)
                
                output = self.model(data)
                loss = self.criterion(output, target)
                
                epoch_loss += loss.item()
                preds = torch.argmax(output, dim=1)
                
                all_preds.extend(preds.cpu().numpy())
                all_labels.extend(target.cpu().numpy())
                
                pbar.set_postfix({'val_loss': f'{loss.item():.4f}'})
        
        # 计算指标
        avg_loss = epoch_loss / len(self.val_loader)
        metrics = self.metrics_calculator.calculate_metrics(all_labels, all_preds)
        
        return {
            'loss': avg_loss,
            'accuracy': metrics['accuracy'],
            'precision': metrics['macro_precision'],
            'recall': metrics['macro_recall'],
            'f1': metrics['macro_f1']
        }
    
    def train(
        self,
        num_epochs: int = Config.NUM_EPOCHS,
        early_stopping_patience: int = 15,
        save_every: int = 10,
        validate_every: int = 1
    ) -> Dict[str, List[float]]:
        """
        训练模型
        
        Args:
            num_epochs: 训练轮次
            early_stopping_patience: 早停耐心值
            save_every: 每隔多少轮保存一次
            validate_every: 每隔多少轮验证一次
            
        Returns:
            训练历史
        """
        print(f"开始训练，共 {num_epochs} 轮，设备: {self.device}")
        print(f"模型参数数量: {sum(p.numel() for p in self.model.parameters()):,}")
        
        early_stopping_counter = 0
        
        for epoch in range(num_epochs):
            print(f"\nEpoch {epoch+1}/{num_epochs}")
            print("-" * 50)
            
            # 训练
            train_metrics = self.train_epoch()
            
            # 验证
            if (epoch + 1) % validate_every == 0:
                val_metrics = self.validate_epoch()
            else:
                val_metrics = {k: 0.0 for k in train_metrics.keys()}
            
            # 记录历史
            for key in train_metrics:
                self.train_history[key].append(train_metrics[key])
                self.val_history[key].append(val_metrics[key])
            
            # 打印指标
            print(f"训练 - Loss: {train_metrics['loss']:.4f}, "
                  f"Acc: {train_metrics['accuracy']:.4f}, "
                  f"F1: {train_metrics['f1']:.4f}")
            
            if (epoch + 1) % validate_every == 0:
                print(f"验证 - Loss: {val_metrics['loss']:.4f}, "
                      f"Acc: {val_metrics['accuracy']:.4f}, "
                      f"F1: {val_metrics['f1']:.4f}")
            
            # 学习率调度
            if hasattr(self, 'scheduler'):
                self.scheduler.step(val_metrics['f1'])
            
            # 保存最佳模型
            if val_metrics['f1'] > self.best_val_f1:
                self.best_val_f1 = val_metrics['f1']
                self.best_epoch = epoch + 1
                early_stopping_counter = 0
                
                self.model_manager.save_model(
                    model=self.model,
                    optimizer=self.optimizer,
                    epoch=epoch + 1,
                    metrics=val_metrics,
                    model_config=self.model_config,
                    is_best=True
                )
            else:
                early_stopping_counter += 1
            
            # 定期保存
            if (epoch + 1) % save_every == 0:
                self.model_manager.save_model(
                    model=self.model,
                    optimizer=self.optimizer,
                    epoch=epoch + 1,
                    metrics=val_metrics,
                    model_config=self.model_config
                )
            
            # 早停
            if early_stopping_counter >= early_stopping_patience:
                print(f"\n早停触发，在第 {epoch+1} 轮停止训练")
                print(f"最佳F1: {self.best_val_f1:.4f} (第 {self.best_epoch} 轮)")
                break
        
        print("\n训练完成!")
        print(f"最佳验证F1: {self.best_val_f1:.4f} (第 {self.best_epoch} 轮)")
        
        # 保存训练历史
        self.save_training_history()
        
        return {
            'train_history': self.train_history,
            'val_history': self.val_history
        }
    
    def test(self) -> Dict[str, float]:
        """测试模型"""
        if self.test_loader is None:
            print("未提供测试数据加载器")
            return {}
        
        print("开始测试...")
        
        # 加载最佳模型
        best_model, _ = self.model_manager.load_model(load_best=True, device=self.device)
        best_model.eval()
        
        all_preds = []
        all_labels = []
        
        with torch.no_grad():
            for data, target in tqdm(self.test_loader, desc="测试中"):
                data, target = data.to(self.device), target.to(self.device)
                
                output = best_model(data)
                preds = torch.argmax(output, dim=1)
                
                all_preds.extend(preds.cpu().numpy())
                all_labels.extend(target.cpu().numpy())
        
        # 计算指标
        metrics = self.metrics_calculator.calculate_metrics(all_labels, all_preds)
        
        print(f"\n测试结果:")
        print(f"准确率: {metrics['accuracy']:.4f}")
        print(f"宏精确率: {metrics['macro_precision']:.4f}")
        print(f"宏召回率: {metrics['macro_recall']:.4f}")
        print(f"宏F1分数: {metrics['macro_f1']:.4f}")
        
        return metrics
    
    def save_training_history(self):
        """保存训练历史"""
        history_dir = os.path.join(self.model_manager.models_dir, "training_history")
        os.makedirs(history_dir, exist_ok=True)
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        history_path = os.path.join(history_dir, f"history_{timestamp}.png")
        
        # 绘制训练曲线
        fig, axes = plt.subplots(2, 2, figsize=(12, 8))
        
        # Loss
        axes[0, 0].plot(self.train_history['loss'], label='训练')
        axes[0, 0].plot(self.val_history['loss'], label='验证')
        axes[0, 0].set_title('损失')
        axes[0, 0].legend()
        
        # Accuracy
        axes[0, 1].plot(self.train_history['accuracy'], label='训练')
        axes[0, 1].plot(self.val_history['accuracy'], label='验证')
        axes[0, 1].set_title('准确率')
        axes[0, 1].legend()
        
        # Precision
        axes[1, 0].plot(self.train_history['precision'], label='训练')
        axes[1, 0].plot(self.val_history['precision'], label='验证')
        axes[1, 0].set_title('精确率')
        axes[1, 0].legend()
        
        # F1 Score
        axes[1, 1].plot(self.train_history['f1'], label='训练')
        axes[1, 1].plot(self.val_history['f1'], label='验证')
        axes[1, 1].set_title('F1分数')
        axes[1, 1].legend()
        
        plt.tight_layout()
        plt.savefig(history_path, dpi=300, bbox_inches='tight')
        plt.close()
        
        print(f"训练历史已保存: {history_path}")