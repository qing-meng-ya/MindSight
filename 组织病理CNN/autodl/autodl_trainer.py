"""
AutoDL平台专用训练器

针对AutoDL云服务器优化的训练流程和资源配置
"""

import os
import sys
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader
import time
import json
import logging
from datetime import datetime
from pathlib import Path

# 添加项目路径
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from src.training import Trainer, MetricsCalculator
from src.data import PathologyDataLoader
from src.models import ModelFactory
from src.training.losses import LossFactory
from autodl.autodl_config import AutoDLConfig, GPUMemoryMonitor, MixedPrecisionTrainer

class AutoDLTrainer(Trainer):
    """AutoDL平台专用训练器"""
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        
        # AutoDL特定配置
        self.autodl_config = AutoDLConfig.get_optimized_config()
        self.gpu_monitor = GPUMemoryMonitor()
        self.mixed_precision = MixedPrecisionTrainer(
            enabled=self.autodl_config['training']['mixed_precision']
        )
        
        # 设置日志
        self.setup_logging()
        
        # 训练统计
        self.training_stats = {
            'start_time': None,
            'end_time': None,
            'total_time': 0,
            'epoch_times': [],
            'memory_usage': [],
            'gpu_utilization': []
        }
        
        self.logger.info(f"AutoDL训练器初始化完成")
        self.logger.info(f"GPU: {AutoDLConfig.GPU_NAME}")
        self.logger.info(f"内存: {AutoDLConfig.GPU_MEMORY:.1f}GB")
        self.logger.info(f"批次大小: {self.autodl_config['training']['batch_size']}")
    
    def setup_logging(self):
        """设置日志记录"""
        log_dir = Path(self.autodl_config['storage']['log_dir'])
        log_dir.mkdir(parents=True, exist_ok=True)
        
        # 创建日志文件
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        log_file = log_dir / f"training_{timestamp}.log"
        
        # 配置日志
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler(log_file),
                logging.StreamHandler()
            ]
        )
        
        self.logger = logging.getLogger(__name__)
        self.log_file = log_file
    
    def setup_autodl_training(self):
        """设置AutoDL优化训练"""
        # 损失函数配置
        loss_config = self.autodl_config['loss']
        
        # 计算类别权重
        class_weights = None
        if loss_config['use_class_weights'] and hasattr(self, 'data_loader'):
            class_weights = self.data_loader.get_class_weights()
            self.logger.info("使用类别权重")
        
        # 创建损失函数
        self.criterion = LossFactory.create_loss(
            loss_type=loss_config['loss_type'],
            num_classes=len(Config.PATHOLOGY_CLASSES),
            alpha=loss_config['focal_alpha'],
            gamma=loss_config['focal_gamma'],
            smoothing=loss_config['smoothing'],
            class_weights=class_weights
        )
        
        # 优化器配置
        training_config = self.autodl_config['training']
        self.optimizer = optim.AdamW(
            self.model.parameters(),
            lr=training_config['learning_rate'],
            weight_decay=1e-4
        )
        
        # 学习率调度器
        self.scheduler = optim.lr_scheduler.ReduceLROnPlateau(
            self.optimizer,
            mode='max',
            factor=0.5,
            patience=5,
            verbose=True
        )
        
        # 梯度裁剪
        self.gradient_clipping = training_config.get('gradient_clipping', 1.0)
        
        self.logger.info("AutoDL训练配置完成")
    
    def train_epoch_autodl(self) -> dict:
        """AutoDL优化的训练epoch"""
        self.model.train()
        epoch_loss = 0.0
        all_preds = []
        all_labels = []
        
        # 记录epoch开始时间
        epoch_start_time = time.time()
        
        # 梯度累积
        accumulation_steps = self.autodl_config['training']['accumulation_steps']
        effective_batch_size = self.train_loader.batch_size * accumulation_steps
        
        self.optimizer.zero_grad()
        
        # 添加GPU内存监控
        if self.gpu_monitor:
            self.gpu_monitor.print_memory_info()
        
        for batch_idx, (data, target) in enumerate(self.train_loader):
            data, target = data.to(self.device), target.to(self.device)
            
            # 前向传播（混合精度）
            with self.mixed_precision.autocast_context():
                output = self.model(data)
                loss = self.criterion(output, target)
                
                # 梯度累积缩放
                loss = loss / accumulation_steps
            
            # 反向传播
            scaled_loss = self.mixed_precision.scale_loss(loss)
            scaled_loss.backward()
            
            # 梯度累积
            if (batch_idx + 1) % accumulation_steps == 0:
                # 梯度裁剪
                if self.gradient_clipping > 0:
                    if self.mixed_precision.enabled:
                        self.mixed_precision.scaler.unscale_(self.optimizer)
                        torch.nn.utils.clip_grad_norm_(
                            self.model.parameters(), 
                            self.gradient_clipping
                        )
                
                # 优化器步骤
                self.mixed_precision.scaler_step(self.optimizer)
                self.mixed_precision.scaler_update()
                self.optimizer.zero_grad()
            
            # 统计
            epoch_loss += loss.item() * accumulation_steps
            preds = torch.argmax(output, dim=1)
            
            all_preds.extend(preds.cpu().numpy())
            all_labels.extend(target.cpu().numpy())
            
            # 记录GPU使用情况
            if batch_idx % 50 == 0:
                if self.gpu_monitor:
                    memory_info = self.gpu_monitor.get_memory_info()
                    if memory_info:
                        self.training_stats['memory_usage'].append({
                            'batch': batch_idx,
                            'utilization': memory_info['utilization']
                        })
                
                # 日志记录
                current_loss = epoch_loss / (batch_idx + 1)
                self.logger.info(
                    f"Batch {batch_idx}/{len(self.train_loader)} - "
                    f"Loss: {current_loss:.4f} - "
                    f"GPU: {memory_info['utilization']:.1f}%" if memory_info else ""
                )
        
        # 计算指标
        avg_loss = epoch_loss / len(self.train_loader)
        metrics = self.metrics_calculator.calculate_metrics(all_labels, all_preds)
        
        # 记录epoch时间
        epoch_time = time.time() - epoch_start_time
        self.training_stats['epoch_times'].append(epoch_time)
        
        self.logger.info(f"训练epoch完成 - 用时: {epoch_time:.2f}s")
        
        return {
            'loss': avg_loss,
            'accuracy': metrics['accuracy'],
            'precision': metrics['macro_precision'],
            'recall': metrics['macro_recall'],
            'f1': metrics['macro_f1'],
            'time': epoch_time
        }
    
    def train_autodl(self, num_epochs: int = None) -> dict:
        """AutoDL优化训练流程"""
        if num_epochs is None:
            num_epochs = self.autodl_config['training']['epochs']
        
        self.logger.info(f"开始AutoDL训练 - {num_epochs}轮")
        self.training_stats['start_time'] = time.time()
        
        # 设置训练
        self.setup_autodl_training()
        
        # 训练循环
        best_val_f1 = 0.0
        early_stopping_counter = 0
        early_stopping_patience = self.autodl_config['training']['early_stopping']
        
        for epoch in range(num_epochs):
            epoch_start_time = time.time()
            
            self.logger.info(f"\nEpoch {epoch+1}/{num_epochs}")
            self.logger.info("-" * 50)
            
            # 训练
            train_metrics = self.train_epoch_autodl()
            
            # 验证
            val_metrics = self.validate_epoch()
            
            # 学习率调度
            self.scheduler.step(val_metrics['f1'])
            
            # 记录历史
            self.train_history['loss'].append(train_metrics['loss'])
            self.train_history['accuracy'].append(train_metrics['accuracy'])
            self.train_history['f1'].append(train_metrics['f1'])
            
            self.val_history['loss'].append(val_metrics['loss'])
            self.val_history['accuracy'].append(val_metrics['accuracy'])
            self.val_history['f1'].append(val_metrics['f1'])
            
            # 打印指标
            self.logger.info(f"训练 - Loss: {train_metrics['loss']:.4f}, F1: {train_metrics['f1']:.4f}")
            self.logger.info(f"验证 - Loss: {val_metrics['loss']:.4f}, F1: {val_metrics['f1']:.4f}")
            
            # 保存最佳模型
            if val_metrics['f1'] > best_val_f1:
                best_val_f1 = val_metrics['f1']
                early_stopping_counter = 0
                
                self.save_autodl_model(epoch, val_metrics, is_best=True)
            else:
                early_stopping_counter += 1
            
            # 定期保存
            save_every = self.autodl_config['training']['save_every']
            if (epoch + 1) % save_every == 0:
                self.save_autodl_model(epoch, val_metrics)
            
            # AutoDL特定：检查剩余时间和备份
            if AutoDLConfig.IS_AUTODL:
                self.check_autodl_time_limit()
            
            # 早停
            if early_stopping_counter >= early_stopping_patience:
                self.logger.info(f"早停触发，在第{epoch+1}轮停止训练")
                break
        
        # 训练完成
        self.training_stats['end_time'] = time.time()
        self.training_stats['total_time'] = self.training_stats['end_time'] - self.training_stats['start_time']
        
        self.logger.info(f"训练完成! 总用时: {self.training_stats['total_time']/3600:.2f}小时")
        self.logger.info(f"最佳验证F1: {best_val_f1:.4f}")
        
        # 保存训练统计
        self.save_autodl_stats()
        
        return {
            'train_history': self.train_history,
            'val_history': self.val_history,
            'stats': self.training_stats
        }
    
    def save_autodl_model(self, epoch: int, metrics: dict, is_best: bool = False):
        """保存AutoDL训练的模型"""
        from src.models import ModelManager
        
        # 确保保存目录存在
        model_dir = Path(self.autodl_config['storage']['model_save_dir'])
        model_dir.mkdir(parents=True, exist_ok=True)
        
        model_manager = ModelManager(model_dir)
        
        # 保存模型
        save_path = model_manager.save_model(
            model=self.model,
            optimizer=self.optimizer,
            epoch=epoch,
            metrics=metrics,
            model_config=self.autodl_config['model'],
            is_best=is_best
        )
        
        # 同步到持久化存储
        if AutoDLConfig.IS_AUTODL:
            backup_dir = Path(self.autodl_config['storage']['backup_dir'])
            backup_dir.mkdir(parents=True, exist_ok=True)
            
            import shutil
            if is_best:
                shutil.copy2(save_path, backup_dir / "best_model.pth")
                self.logger.info("最佳模型已同步到持久化存储")
    
    def save_autodl_stats(self):
        """保存训练统计信息"""
        stats_file = Path(self.autodl_config['storage']['log_dir']) / "training_stats.json"
        
        with open(stats_file, 'w') as f:
            json.dump(self.training_stats, f, indent=2)
        
        self.logger.info(f"训练统计已保存: {stats_file}")
    
    def check_autodl_time_limit(self):
        """检查AutoDL时间限制"""
        # 这里可以添加时间检查逻辑
        # 比如检查剩余时间，提前保存结果
        pass

def create_autodl_trainer(data_dir: str, **kwargs):
    """创建AutoDL训练器"""
    # 获取AutoDL配置
    config = AutoDLConfig.get_optimized_config()
    
    # 创建数据加载器
    data_loader = PathologyDataLoader(
        data_dir=data_dir,
        batch_size=config['training']['batch_size'],
        img_size=config['training']['img_size'],
        num_workers=config['training']['num_workers'],
        val_split=config['data']['val_split'],
        test_split=config['data']['test_split']
    )
    
    # 创建模型
    model = ModelFactory.create_model(
        model_type=config['model']['model_type'],
        num_classes=len(Config.PATHOLOGY_CLASSES),
        **config['model']
    )
    
    # 创建训练器
    trainer = AutoDLTrainer(
        model=model,
        train_loader=data_loader.get_train_loader(),
        val_loader=data_loader.get_val_loader(),
        test_loader=data_loader.get_test_loader(),
        model_config=config['model'],
        device='cuda' if torch.cuda.is_available() else 'cpu',
        save_dir=config['storage']['model_save_dir']
    )
    
    # 设置数据加载器引用（用于计算类别权重）
    trainer.data_loader = data_loader
    
    return trainer