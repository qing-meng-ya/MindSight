"""
AutoDL平台训练脚本入口

专门为AutoDL云服务器优化的训练入口
"""

import os
import sys
import argparse
import logging
from pathlib import Path

# 添加项目路径
current_dir = Path(__file__).parent
project_dir = current_dir.parent
sys.path.append(str(project_dir))

from autodl.autodl_trainer import create_autodl_trainer
from autodl.autodl_config import AutoDLConfig, GPUMemoryMonitor
from configs.config import Config

def setup_autodl_environment():
    """设置AutoDL环境"""
    print("🚀 AutoDL组织病理CNN训练")
    print("=" * 50)
    
    # 检查AutoDL环境
    if not AutoDLConfig.IS_AUTODL:
        print("⚠️  未检测到AutoDL环境，使用默认配置")
    else:
        print("✅ 检测到AutoDL环境")
    
    # 显示GPU信息
    print(f"📊 GPU信息:")
    print(f"   名称: {AutoDLConfig.GPU_NAME}")
    print(f"   数量: {AutoDLConfig.GPU_COUNT}")
    print(f"   内存: {AutoDLConfig.GPU_MEMORY:.1f}GB")
    
    # 显示优化配置
    config = AutoDLConfig.get_optimized_config()
    print(f"\n🎯 优化配置:")
    print(f"   模型: {config['model']['model_type']}")
    print(f"   批次大小: {config['training']['batch_size']}")
    print(f"   图像尺寸: {config['training']['img_size']}")
    print(f"   学习率: {config['training']['learning_rate']}")
    print(f"   混合精度: {config['training']['mixed_precision']}")

def validate_data_directory(data_dir: str) -> bool:
    """验证数据目录"""
    data_path = Path(data_dir)
    
    if not data_path.exists():
        print(f"❌ 数据目录不存在: {data_dir}")
        return False
    
    # 检查是否包含子目录
    subdirs = [d for d in data_path.iterdir() if d.is_dir()]
    if not subdirs:
        print(f"❌ 数据目录中未找到子目录: {data_dir}")
        print("   请按以下结构组织数据:")
        print("   data_dir/")
        print("   ├── 肺炎/")
        print("   ├── 肺出血/")
        print("   └── ...")
        return False
    
    # 统计数据
    total_images = 0
    valid_extensions = {'.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.tif'}
    
    for subdir in subdirs:
        images = list(subdir.glob('*'))
        valid_images = [img for img in images 
                       if img.suffix.lower() in valid_extensions]
        total_images += len(valid_images)
        print(f"   {subdir.name}: {len(valid_images)} 张图像")
    
    if total_images == 0:
        print(f"❌ 未找到有效的图像文件")
        return False
    
    print(f"✅ 数据验证通过，共 {total_images} 张图像")
    return True

def main():
    """主函数"""
    parser = argparse.ArgumentParser(description="AutoDL组织病理CNN训练")
    
    # 数据参数
    parser.add_argument("--data_dir", type=str, required=True,
                       help="训练数据目录路径")
    
    # 覆盖配置参数
    parser.add_argument("--model_type", type=str,
                       help="模型类型 (覆盖自动配置)")
    parser.add_argument("--batch_size", type=int,
                       help="批次大小 (覆盖自动配置)")
    parser.add_argument("--img_size", type=int,
                       help="图像尺寸 (覆盖自动配置)")
    parser.add_argument("--epochs", type=int,
                       help="训练轮次")
    parser.add_argument("--lr", type=float,
                       help="学习率")
    parser.add_argument("--loss_type", type=str,
                       choices=['ce', 'focal', 'combined'],
                       help="损失函数类型")
    
    # 输出参数
    parser.add_argument("--output_dir", type=str,
                       help="输出目录 (覆盖默认配置)")
    parser.add_argument("--experiment_name", type=str,
                       default="autodl_experiment",
                       help="实验名称")
    
    # 其他参数
    parser.add_argument("--skip_validation", action="store_true",
                       help="跳过数据验证")
    parser.add_argument("--mixed_precision", action="store_true",
                       default=None, help="启用混合精度训练")
    parser.add_argument("--debug", action="store_true",
                       help="调试模式")
    
    args = parser.parse_args()
    
    # 设置环境
    setup_autodl_environment()
    
    # 验证数据
    if not args.skip_validation:
        if not validate_data_directory(args.data_dir):
            return 1
    
    # 获取配置
    config = AutoDLConfig.get_optimized_config()
    
    # 覆盖配置
    if args.model_type:
        config['model']['model_type'] = args.model_type
    if args.batch_size:
        config['training']['batch_size'] = args.batch_size
    if args.img_size:
        config['training']['img_size'] = args.img_size
    if args.epochs:
        config['training']['epochs'] = args.epochs
    if args.lr:
        config['training']['learning_rate'] = args.lr
    if args.loss_type:
        config['loss']['loss_type'] = args.loss_type
    if args.mixed_precision is not None:
        config['training']['mixed_precision'] = args.mixed_precision
    
    # 更新输出目录
    if args.output_dir:
        config['storage']['model_save_dir'] = f"{args.output_dir}/models"
        config['storage']['log_dir'] = f"{args.output_dir}/logs"
    
    # 创建输出目录
    experiment_dir = Path(f"/root/autodl-fs/{args.experiment_name}")
    model_save_dir = experiment_dir / "models"
    log_dir = experiment_dir / "logs"
    
    model_save_dir.mkdir(parents=True, exist_ok=True)
    log_dir.mkdir(parents=True, exist_ok=True)
    
    config['storage']['model_save_dir'] = str(model_save_dir)
    config['storage']['log_dir'] = str(log_dir)
    config['storage']['backup_dir'] = str(experiment_dir)
    
    print(f"\n📁 输出目录: {experiment_dir}")
    
    # 创建训练器
    print("\n🏗️ 创建AutoDL训练器...")
    try:
        trainer = create_autodl_trainer(args.data_dir)
        print("✅ 训练器创建成功")
    except Exception as e:
        print(f"❌ 训练器创建失败: {e}")
        return 1
    
    # 保存配置
    config_file = experiment_dir / "config.json"
    import json
    with open(config_file, 'w') as f:
        json.dump(config, f, indent=2)
    print(f"✅ 配置已保存: {config_file}")
    
    # 开始训练
    print(f"\n🚀 开始训练...")
    try:
        history = trainer.train_autodl(num_epochs=config['training']['epochs'])
        
        # 测试模型
        print(f"\n🧪 测试模型...")
        test_metrics = trainer.test()
        
        print(f"\n🎉 AutoDL训练完成!")
        print(f"📊 结果保存在: {experiment_dir}")
        
        # 保存最终结果
        results_file = experiment_dir / "final_results.json"
        final_results = {
            'config': config,
            'history': history,
            'test_metrics': test_metrics,
            'stats': trainer.training_stats
        }
        
        with open(results_file, 'w') as f:
            json.dump(final_results, f, indent=2)
        
        print(f"✅ 最终结果已保存: {results_file}")
        
        return 0
        
    except KeyboardInterrupt:
        print(f"\n⏹️ 训练被用户中断")
        return 1
    except Exception as e:
        print(f"\n❌ 训练失败: {e}")
        return 1

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)