"""
AutoDL平台训练配置文件

针对AutoDL云服务器优化的训练参数和配置
"""

import os
import torch
from configs.config import Config

class AutoDLConfig:
    """AutoDL平台专用配置"""
    
    # AutoDL环境检测
    IS_AUTODL = os.getenv('AUTODL_JOB_ID') is not None
    
    # GPU配置（自动检测）
    if IS_AUTODL and torch.cuda.is_available():
        GPU_COUNT = torch.cuda.device_count()
        CURRENT_GPU = int(os.getenv('CUDA_VISIBLE_DEVICES', '0'))
        GPU_NAME = torch.cuda.get_device_name(CURRENT_GPU)
        GPU_MEMORY = torch.cuda.get_device_properties(CURRENT_GPU).total_memory / 1024**3  # GB
        
        print(f"检测到AutoDL环境:")
        print(f"  GPU数量: {GPU_COUNT}")
        print(f"  当前GPU: {CURRENT_GPU} ({GPU_NAME})")
        print(f"  GPU内存: {GPU_MEMORY:.1f}GB")
    else:
        GPU_COUNT = 0
        CURRENT_GPU = 0
        GPU_NAME = "Unknown"
        GPU_MEMORY = 0
    
    # 根据GPU内存自动调整batch size
    if GPU_MEMORY >= 40:  # A100, RTX 4090
        AUTO_BATCH_SIZE = 64
        IMG_SIZE = 512
        ACCUMULATION_STEPS = 1
    elif GPU_MEMORY >= 24:  # RTX 3090, RTX 4080
        AUTO_BATCH_SIZE = 32
        IMG_SIZE = 384
        ACCUMULATION_STEPS = 2
    elif GPU_MEMORY >= 16:  # RTX 3080, RTX 3070
        AUTO_BATCH_SIZE = 24
        IMG_SIZE = 320
        ACCUMULATION_STEPS = 2
    elif GPU_MEMORY >= 12:  # RTX 3060, RTX 2080 Ti
        AUTO_BATCH_SIZE = 16
        IMG_SIZE = 256
        ACCUMULATION_STEPS = 4
    else:  # 较小GPU
        AUTO_BATCH_SIZE = 8
        IMG_SIZE = 224
        ACCUMULATION_STEPS = 8
    
    # 训练参数优化
    TRAINING_CONFIG = {
        'batch_size': AUTO_BATCH_SIZE,
        'accumulation_steps': ACCUMULATION_STEPS,
        'img_size': IMG_SIZE,
        'learning_rate': 0.001,
        'epochs': 100,
        'num_workers': min(8, os.cpu_count()),
        'pin_memory': True,
        'mixed_precision': True,  # 启用混合精度训练
        'gradient_clipping': 1.0,
        'early_stopping': 15,
        'save_every': 5
    }
    
    # 模型配置（根据GPU性能选择）
    if GPU_MEMORY >= 24:
        MODEL_CONFIG = {
            'model_type': 'efficientnet_b1',  # 更强大的模型
            'pretrained': True,
            'dropout_rate': 0.3
        }
    else:
        MODEL_CONFIG = {
            'model_type': 'resnet50',  # 平衡性能和内存
            'pretrained': True,
            'dropout_rate': 0.3
        }
    
    # 损失函数配置
    LOSS_CONFIG = {
        'loss_type': 'combined',  # 使用组合损失
        'focal_alpha': 1.0,
        'focal_gamma': 2.0,
        'smoothing': 0.1,
        'use_class_weights': True
    }
    
    # 数据配置
    DATA_CONFIG = {
        'val_split': 0.15,  # AutoDL通常数据较多
        'test_split': 0.15,
        'random_seed': 42,
        'use_augmentation': True,
        'augmentation_intensity': 'medium'
    }
    
    # AutoDL存储配置
    STORAGE_CONFIG = {
        'data_dir': '/root/autodl-tmp/datasets',  # AutoDL临时存储
        'model_save_dir': '/root/autodl-tmp/models',
        'log_dir': '/root/autodl-tmp/logs',
        'backup_dir': '/root/autodl-fs',  # 持久化存储
    }
    
    # 监控和日志配置
    MONITORING_CONFIG = {
        'log_interval': 50,  # 每50个batch记录一次
        'save_visualizations': True,
        'enable_tensorboard': True,
        'email_notification': False,  # 可配置邮件通知
    }
    
    @classmethod
    def get_optimized_config(cls):
        """获取AutoDL优化的完整配置"""
        return {
            'training': cls.TRAINING_CONFIG,
            'model': cls.MODEL_CONFIG,
            'loss': cls.LOSS_CONFIG,
            'data': cls.DATA_CONFIG,
            'storage': cls.STORAGE_CONFIG,
            'monitoring': cls.MONITORING_CONFIG,
            'autodl_info': {
                'is_autodl': cls.IS_AUTODL,
                'gpu_count': cls.GPU_COUNT,
                'gpu_name': cls.GPU_NAME,
                'gpu_memory': cls.GPU_MEMORY,
                'recommended_batch_size': cls.AUTO_BATCH_SIZE,
                'recommended_img_size': cls.IMG_SIZE
            }
        }
    
    @classmethod
    def create_training_command(cls, data_dir):
        """生成训练命令"""
        config = cls.get_optimized_config()
        
        cmd = f"""python scripts/train.py \\
    --data_dir {data_dir} \\
    --model_type {config['model']['model_type']} \\
    --batch_size {config['training']['batch_size']} \\
    --img_size {config['training']['img_size']} \\
    --epochs {config['training']['epochs']} \\
    --lr {config['training']['learning_rate']} \\
    --loss_type {config['loss']['loss_type']} \\
    --use_class_weights \\
    --device cuda \\
    --num_workers {config['training']['num_workers']} \\
    --early_stopping {config['training']['early_stopping']}"""
        
        return cmd

# GPU内存监控工具
class GPUMemoryMonitor:
    """GPU内存监控"""
    
    def __init__(self):
        self.device = torch.device('cuda')
    
    def get_memory_info(self):
        """获取GPU内存信息"""
        if torch.cuda.is_available():
            allocated = torch.cuda.memory_allocated(self.device) / 1024**3  # GB
            reserved = torch.cuda.memory_reserved(self.device) / 1024**3  # GB
            total = torch.cuda.get_device_properties(self.device).total_memory / 1024**3  # GB
            
            return {
                'allocated': allocated,
                'reserved': reserved,
                'total': total,
                'free': total - reserved,
                'utilization': (reserved / total) * 100
            }
        return None
    
    def print_memory_info(self):
        """打印内存信息"""
        info = self.get_memory_info()
        if info:
            print(f"GPU内存使用情况:")
            print(f"  已分配: {info['allocated']:.2f}GB")
            print(f"  已预留: {info['reserved']:.2f}GB")
            print(f"  可用: {info['free']:.2f}GB")
            print(f"  总计: {info['total']:.2f}GB")
            print(f"  利用率: {info['utilization']:.1f}%")

# 混合精度训练支持
class MixedPrecisionTrainer:
    """混合精度训练支持"""
    
    def __init__(self, enabled=True):
        self.enabled = enabled and torch.cuda.is_available()
        self.scaler = torch.cuda.amp.GradScaler() if self.enabled else None
    
    def autocast_context(self):
        """获取autocast上下文"""
        if self.enabled:
            return torch.cuda.amp.autocast()
        return torch.no_context()
    
    def scale_loss(self, loss):
        """缩放损失"""
        if self.enabled:
            return self.scaler.scale(loss)
        return loss
    
    def scaler_step(self, optimizer):
        """scaler步骤"""
        if self.enabled:
            self.scaler.step(optimizer)
        else:
            optimizer.step()
    
    def scaler_update(self):
        """scaler更新"""
        if self.enabled:
            self.scaler.update()