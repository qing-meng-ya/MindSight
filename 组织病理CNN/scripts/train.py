"""
训练脚本示例

演示如何使用组织病理CNN进行模型训练
"""

import os
import sys
import torch
import argparse
from datetime import datetime

# 添加src路径
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'src'))

from src.data import PathologyDataLoader
from src.models import ModelFactory
from src.training import Trainer, LossFactory

def parse_args():
    """解析命令行参数"""
    parser = argparse.ArgumentParser(description="组织病理CNN训练脚本")
    
    # 数据参数
    parser.add_argument("--data_dir", type=str, required=True, 
                       help="训练数据目录路径")
    parser.add_argument("--batch_size", type=int, default=32,
                       help="批次大小")
    parser.add_argument("--img_size", type=int, default=224,
                       help="输入图像尺寸")
    
    # 模型参数
    parser.add_argument("--model_type", type=str, default="resnet50",
                       choices=['resnet18', 'resnet34', 'resnet50', 'resnet101', 
                               'efficientnet_b0', 'efficientnet_b1', 'custom'],
                       help="模型类型")
    parser.add_argument("--pretrained", action="store_true", default=True,
                       help="使用预训练权重")
    
    # 训练参数
    parser.add_argument("--epochs", type=int, default=100,
                       help="训练轮次")
    parser.add_argument("--lr", type=float, default=0.001,
                       help="学习率")
    parser.add_argument("--loss_type", type=str, default="focal",
                       choices=['ce', 'focal', 'label_smoothing', 'combined'],
                       help="损失函数类型")
    parser.add_argument("--use_class_weights", action="store_true",
                       help="使用类别权重")
    
    # 其他参数
    parser.add_argument("--device", type=str, default="auto",
                       help="设备类型 (auto, cpu, cuda)")
    parser.add_argument("--num_workers", type=int, default=4,
                       help="数据加载进程数")
    parser.add_argument("--early_stopping", type=int, default=15,
                       help="早停耐心值")
    
    return parser.parse_args()

def main():
    """主训练函数"""
    args = parse_args()
    
    print("=" * 60)
    print("组织病理CNN训练脚本")
    print("=" * 60)
    
    # 设备配置
    if args.device == "auto":
        device = "cuda" if torch.cuda.is_available() else "cpu"
    else:
        device = args.device
    
    print(f"使用设备: {device}")
    print(f"PyTorch版本: {torch.__version__}")
    print(f"CUDA可用: {torch.cuda.is_available()}")
    
    # 检查数据目录
    if not os.path.exists(args.data_dir):
        print(f"❌ 数据目录不存在: {args.data_dir}")
        return
    
    # 创建数据加载器
    print("\n📊 创建数据加载器...")
    try:
        data_loader = PathologyDataLoader(
            data_dir=args.data_dir,
            batch_size=args.batch_size,
            img_size=args.img_size,
            num_workers=args.num_workers
        )
        
        train_loader = data_loader.get_train_loader()
        val_loader = data_loader.get_val_loader()
        test_loader = data_loader.get_test_loader()
        
        print(f"✅ 数据加载器创建成功")
        print(f"   训练样本: {len(train_loader.dataset)}")
        print(f"   验证样本: {len(val_loader.dataset)}")
        print(f"   测试样本: {len(test_loader.dataset)}")
        
    except Exception as e:
        print(f"❌ 数据加载器创建失败: {e}")
        return
    
    # 创建模型
    print("\n🏗️ 创建模型...")
    try:
        model = ModelFactory.create_model(
            model_type=args.model_type,
            num_classes=15,  # 固定为15种病理类型
            pretrained=args.pretrained
        )
        
        model = model.to(device)
        print(f"✅ 模型创建成功: {args.model_type}")
        print(f"   模型参数数量: {sum(p.numel() for p in model.parameters()):,}")
        
    except Exception as e:
        print(f"❌ 模型创建失败: {e}")
        return
    
    # 计算类别权重
    class_weights = None
    if args.use_class_weights:
        print("\n⚖️ 计算类别权重...")
        class_weights = data_loader.get_class_weights()
        print("✅ 类别权重计算完成")
    
    # 创建训练器
    print("\n🏃 创建训练器...")
    try:
        trainer = Trainer(
            model=model,
            train_loader=train_loader,
            val_loader=val_loader,
            test_loader=test_loader,
            model_config={
                "model_type": args.model_type,
                "pretrained": args.pretrained,
                "img_size": args.img_size
            },
            device=device
        )
        
        # 设置训练
        trainer.setup_training(
            learning_rate=args.lr,
            use_focal_loss=(args.loss_type == "focal"),
            class_weights=class_weights
        )
        
        print("✅ 训练器创建成功")
        
    except Exception as e:
        print(f"❌ 训练器创建失败: {e}")
        return
    
    # 开始训练
    print(f"\n🚀 开始训练 ({args.epochs} 轮)...")
    print("=" * 60)
    
    try:
        history = trainer.train(
            num_epochs=args.epochs,
            early_stopping_patience=args.early_stopping,
            save_every=10
        )
        
        print("\n✅ 训练完成!")
        
        # 测试模型
        print("\n🧪 测试模型...")
        test_metrics = trainer.test()
        
        # 保存训练历史
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        history_file = f"training_history_{timestamp}.json"
        
        import json
        with open(history_file, 'w') as f:
            json.dump(history, f, indent=2)
        
        print(f"📝 训练历史已保存: {history_file}")
        
    except KeyboardInterrupt:
        print("\n⏹️ 训练被用户中断")
    except Exception as e:
        print(f"\n❌ 训练失败: {e}")
    
    print("\n🏁 训练脚本执行完成")

if __name__ == "__main__":
    main()