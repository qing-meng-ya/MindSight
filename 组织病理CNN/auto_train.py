#!/usr/bin/env python3
"""
组织病理CNN全自动训练系统

只需准备数据，其他全部自动化
"""

import os
import sys
import json
import time
import subprocess
import logging
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Optional

# 添加项目路径
project_root = Path(__file__).parent
sys.path.append(str(project_root))

try:
    import torch
    import cv2
    import fastapi
    from src.data import PathologyDataLoader
    from src.models import ModelFactory
    from src.training import Trainer
    from configs.config import Config
except ImportError as e:
    print(f"❌ 导入错误: {e}")
    print("请先安装依赖: pip install -r requirements.txt")
    sys.exit(1)

class AutoTrainingSystem:
    """全自动训练系统"""
    
    def __init__(self):
        """初始化训练系统"""
        self.setup_logging()
        self.logger = logging.getLogger(__name__)
        
        # 训练配置
        self.config = {}
        self.training_stats = {}
        
        # 系统信息
        self.system_info = self.get_system_info()
        
    def setup_logging(self):
        """设置日志"""
        log_dir = Path("logs")
        log_dir.mkdir(exist_ok=True)
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        log_file = log_dir / f"auto_training_{timestamp}.log"
        
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler(log_file),
                logging.StreamHandler()
            ]
        )
        
        self.logger = logging.getLogger(__name__)
        self.logger.info("🤖 组织病理CNN全自动训练系统启动")
    
    def get_system_info(self) -> Dict:
        """获取系统信息"""
        info = {
            "python_version": f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}",
            "pytorch_version": torch.__version__,
            "cuda_available": torch.cuda.is_available(),
            "opencv_version": cv2.__version__,
            "fastapi_version": fastapi.__version__
        }
        
        if torch.cuda.is_available():
            info["gpu_name"] = torch.cuda.get_device_name(0)
            info["gpu_memory"] = torch.cuda.get_device_properties(0).total_memory / 1024**3
            info["gpu_count"] = torch.cuda.device_count()
        
        return info
    
    def check_environment(self) -> bool:
        """检查环境"""
        self.logger.info("🔍 检查系统环境...")
        
        # 检查Python版本
        if sys.version_info < (3, 8):
            self.logger.error("❌ Python版本过低，需要3.8+")
            return False
        
        # 检查关键包
        required_packages = ['torch', 'cv2', 'fastapi', 'numpy', 'PIL']
        for package in required_packages:
            try:
                __import__(package)
            except ImportError:
                self.logger.error(f"❌ 缺少包: {package}")
                return False
        
        # 显示系统信息
        self.logger.info("✅ 环境检查通过")
        self.logger.info(f"   Python: {self.system_info['python_version']}")
        self.logger.info(f"   PyTorch: {self.system_info['pytorch_version']}")
        self.logger.info(f"   CUDA: {'可用' if self.system_info['cuda_available'] else '不可用'}")
        
        if self.system_info['cuda_available']:
            self.logger.info(f"   GPU: {self.system_info['gpu_name']}")
            self.logger.info(f"   GPU内存: {self.system_info['gpu_memory']:.1f}GB")
        
        return True
    
    def prepare_directories(self) -> bool:
        """准备目录结构"""
        self.logger.info("📁 准备目录结构...")
        
        required_dirs = [
            "data/raw",
            "data/processed", 
            "data/models",
            "evaluation_results",
            "logs"
        ]
        
        for dir_path in required_dirs:
            Path(dir_path).mkdir(parents=True, exist_ok=True)
        
        self.logger.info("✅ 目录结构准备完成")
        return True
    
    def check_training_data(self) -> Dict:
        """检查训练数据"""
        self.logger.info("📊 检查训练数据...")
        
        data_dir = Path("data/raw")
        
        if not data_dir.exists():
            self.logger.error("❌ 数据目录不存在: data/raw")
            self.logger.error("请按以下结构组织数据:")
            self.logger.error("data/raw/")
            self.logger.error("├── 肺炎/")
            self.logger.error("│   ├── image001.jpg")
            self.logger.error("│   └── image002.jpg")
            self.logger.error("├── 肺出血/")
            self.logger.error("└── ...")
            return {"valid": False}
        
        # 统计数据
        total_images = 0
        class_stats = {}
        valid_extensions = {'.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.tif'}
        
        for class_dir in data_dir.iterdir():
            if class_dir.is_dir():
                class_name = class_dir.name
                images = []
                
                for ext in valid_extensions:
                    images.extend(class_dir.glob(f"*{ext}"))
                    images.extend(class_dir.glob(f"*{ext.upper()}"))
                
                if images:
                    class_stats[class_name] = len(images)
                    total_images += len(images)
        
        if total_images == 0:
            self.logger.error("❌ 未找到有效的图像文件")
            return {"valid": False}
        
        # 数据质量评估
        data_quality = self.assess_data_quality(class_stats, total_images)
        
        self.logger.info("✅ 数据检查完成")
        self.logger.info(f"   总图像数: {total_images}")
        self.logger.info(f"   类别数: {len(class_stats)}")
        
        for class_name, count in sorted(class_stats.items()):
            self.logger.info(f"   {class_name}: {count} 张图像")
        
        return {
            "valid": True,
            "total_images": total_images,
            "class_count": len(class_stats),
            "class_stats": class_stats,
            "quality": data_quality
        }
    
    def assess_data_quality(self, class_stats: Dict, total_images: int) -> Dict:
        """评估数据质量"""
        quality = {"score": 0, "issues": [], "recommendations": []}
        
        # 数据量评估
        if total_images >= 1000:
            quality["score"] += 30
        elif total_images >= 500:
            quality["score"] += 20
        elif total_images >= 100:
            quality["score"] += 10
        else:
            quality["issues"].append("数据量过少，可能影响训练效果")
            quality["recommendations"].append("建议每类至少50张图像")
        
        # 类别平衡性评估
        if class_stats:
            counts = list(class_stats.values())
            max_count = max(counts)
            min_count = min(counts)
            balance_ratio = max_count / min_count if min_count > 0 else float('inf')
            
            if balance_ratio <= 2:
                quality["score"] += 30
            elif balance_ratio <= 5:
                quality["score"] += 20
            else:
                quality["issues"].append("数据分布不平衡")
                quality["recommendations"].append("考虑使用类别权重或数据增强")
        
        # 每类最小样本数
        min_samples = min(class_stats.values()) if class_stats else 0
        if min_samples >= 50:
            quality["score"] += 20
        elif min_samples >= 20:
            quality["score"] += 10
        else:
            quality["issues"].append("部分类别样本过少")
            quality["recommendations"].append("建议每类至少20张图像")
        
        # 类别数量
        class_count = len(class_stats)
        if class_count == len(Config.PATHOLOGY_CLASSES):
            quality["score"] += 20
        elif class_count >= 10:
            quality["score"] += 15
        elif class_count >= 5:
            quality["score"] += 10
        else:
            quality["issues"].append("类别数量过少")
            quality["recommendations"].append("建议增加更多病理类型")
        
        return quality
    
    def select_optimal_config(self, data_info: Dict) -> Dict:
        """自动选择最优配置"""
        self.logger.info("🎯 自动选择最优训练配置...")
        
        # 基础配置
        config = {
            "model_type": "resnet50",
            "batch_size": 16,
            "img_size": 224,
            "epochs": 50,
            "learning_rate": 0.001,
            "loss_type": "focal",
            "use_class_weights": True,
            "device": "cuda" if self.system_info['cuda_available'] else "cpu"
        }
        
        # 根据GPU调整配置
        if self.system_info['cuda_available']:
            gpu_memory = self.system_info['gpu_memory']
            
            if gpu_memory >= 24:  # RTX 4090/3090/A100
                config.update({
                    "model_type": "efficientnet_b1",
                    "batch_size": 32,
                    "img_size": 384,
                    "epochs": 100
                })
            elif gpu_memory >= 16:  # RTX 3080/4080
                config.update({
                    "batch_size": 24,
                    "img_size": 320,
                    "epochs": 80
                })
            elif gpu_memory >= 12:  # RTX 3060/3070
                config.update({
                    "batch_size": 16,
                    "img_size": 256,
                    "epochs": 60
                })
        
        # 根据数据量调整
        total_images = data_info.get("total_images", 0)
        if total_images < 200:
            config["epochs"] = min(config["epochs"], 30)
        elif total_images > 1000:
            config["epochs"] = min(config["epochs"], 150)
        
        # 根据数据质量调整
        quality = data_info.get("quality", {})
        if quality.get("issues"):
            config["use_class_weights"] = True
            config["loss_type"] = "focal"
        
        self.config = config
        
        # 显示配置
        self.logger.info("✅ 训练配置:")
        for key, value in config.items():
            self.logger.info(f"   {key}: {value}")
        
        # 保存配置
        config_file = "auto_training_config.json"
        with open(config_file, 'w') as f:
            json.dump(config, f, indent=2)
        
        self.logger.info(f"✅ 配置已保存: {config_file}")
        return config
    
    def start_training(self, config: Dict) -> bool:
        """开始训练"""
        self.logger.info("🚀 开始自动训练...")
        
        try:
            # 创建数据加载器
            self.logger.info("📊 创建数据加载器...")
            data_loader = PathologyDataLoader(
                data_dir="data/raw",
                batch_size=config["batch_size"],
                img_size=config["img_size"],
                num_workers=4
            )
            
            train_loader = data_loader.get_train_loader()
            val_loader = data_loader.get_val_loader()
            test_loader = data_loader.get_test_loader()
            
            self.logger.info(f"   训练样本: {len(train_loader.dataset)}")
            self.logger.info(f"   验证样本: {len(val_loader.dataset)}")
            self.logger.info(f"   测试样本: {len(test_loader.dataset)}")
            
            # 创建模型
            self.logger.info("🏗️ 创建模型...")
            model = ModelFactory.create_model(
                model_type=config["model_type"],
                num_classes=len(Config.PATHOLOGY_CLASSES),
                pretrained=True
            )
            
            model = model.to(config["device"])
            param_count = sum(p.numel() for p in model.parameters())
            self.logger.info(f"   模型参数: {param_count:,}")
            
            # 创建训练器
            self.logger.info("🏋️ 创建训练器...")
            trainer = Trainer(
                model=model,
                train_loader=train_loader,
                val_loader=val_loader,
                test_loader=test_loader,
                model_config=config,
                device=config["device"]
            )
            
            # 设置训练
            trainer.setup_training(
                learning_rate=config["learning_rate"],
                use_focal_loss=(config["loss_type"] == "focal")
            )
            
            # 开始训练
            self.logger.info("🎯 开始训练流程...")
            start_time = time.time()
            
            history = trainer.train(
                num_epochs=config["epochs"],
                early_stopping_patience=15,
                save_every=10
            )
            
            training_time = time.time() - start_time
            self.training_stats["training_time"] = training_time
            self.training_stats["history"] = history
            
            self.logger.info(f"✅ 训练完成! 用时: {training_time/3600:.2f}小时")
            
            # 测试模型
            self.logger.info("🧪 测试模型...")
            test_metrics = trainer.test()
            self.training_stats["test_metrics"] = test_metrics
            
            return True
            
        except Exception as e:
            self.logger.error(f"❌ 训练失败: {e}")
            return False
    
    def evaluate_model(self) -> bool:
        """评估模型"""
        self.logger.info("📊 开始模型评估...")
        
        try:
            # 运行评估脚本
            eval_cmd = [
                "python", "scripts/evaluate.py",
                "--data_dir", "data/raw",
                "--model_path", "data/models/best_model.pth",
                "--output_dir", "evaluation_results"
            ]
            
            result = subprocess.run(eval_cmd, capture_output=True, text=True)
            
            if result.returncode == 0:
                self.logger.info("✅ 模型评估完成")
                self.logger.info("📁 评估结果: evaluation_results/")
                return True
            else:
                self.logger.error(f"❌ 评估失败: {result.stderr}")
                return False
                
        except Exception as e:
            self.logger.error(f"❌ 评估错误: {e}")
            return False
    
    def start_api_service(self) -> bool:
        """启动API服务"""
        self.logger.info("🌐 启动API服务...")
        
        try:
            # 检查模型文件
            model_file = Path("data/models/best_model.pth")
            if not model_file.exists():
                self.logger.warning("⚠️ 未找到训练好的模型，跳过API启动")
                return False
            
            # 启动API服务（后台）
            import subprocess
            import signal
            
            api_cmd = ["python", "main.py"]
            process = subprocess.Popen(
                api_cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            
            # 等待服务启动
            time.sleep(5)
            
            # 测试API
            try:
                import requests
                response = requests.get("http://localhost:8000/health", timeout=5)
                if response.status_code == 200:
                    self.logger.info("✅ API服务启动成功")
                    self.logger.info("🌐 API地址: http://localhost:8000")
                    self.logger.info("📚 API文档: http://localhost:8000/docs")
                    
                    # 保存进程信息
                    self.training_stats["api_pid"] = process.pid
                    with open("api_service.pid", 'w') as f:
                        f.write(str(process.pid))
                    
                    return True
                else:
                    self.logger.warning("⚠️ API服务可能还在启动中")
                    return False
            except:
                self.logger.warning("⚠️ API服务测试失败")
                return False
                
        except Exception as e:
            self.logger.error(f"❌ API启动失败: {e}")
            return False
    
    def generate_report(self) -> str:
        """生成训练报告"""
        self.logger.info("📋 生成训练报告...")
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        report_file = f"auto_training_report_{timestamp}.md"
        
        with open(report_file, 'w', encoding='utf-8') as f:
            f.write("# 组织病理CNN自动训练报告\n\n")
            f.write(f"**生成时间**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
            
            # 系统信息
            f.write("## 系统环境\n\n")
            f.write(f"- Python版本: {self.system_info['python_version']}\n")
            f.write(f"- PyTorch版本: {self.system_info['pytorch_version']}\n")
            f.write(f"- CUDA可用: {self.system_info['cuda_available']}\n")
            
            if self.system_info['cuda_available']:
                f.write(f"- GPU: {self.system_info['gpu_name']}\n")
                f.write(f"- GPU内存: {self.system_info['gpu_memory']:.1f}GB\n")
            
            # 训练配置
            f.write("\n## 训练配置\n\n")
            for key, value in self.config.items():
                f.write(f"- {key}: {value}\n")
            
            # 训练结果
            if self.training_stats:
                f.write("\n## 训练结果\n\n")
                
                if "training_time" in self.training_stats:
                    training_time = self.training_stats["training_time"]
                    f.write(f"- 训练用时: {training_time/3600:.2f}小时\n")
                
                if "test_metrics" in self.training_stats:
                    metrics = self.training_stats["test_metrics"]
                    f.write(f"- 测试准确率: {metrics.get('accuracy', 0):.3f}\n")
                    f.write(f"- 测试F1分数: {metrics.get('macro_f1', 0):.3f}\n")
            
            # 文件位置
            f.write("\n## 生成文件\n\n")
            f.write("- 最佳模型: `data/models/best_model.pth`\n")
            f.write("- 最新模型: `data/models/latest_model.pth`\n")
            f.write("- 评估结果: `evaluation_results/`\n")
            f.write("- 训练日志: `logs/`\n")
            
            # API服务
            f.write("\n## API服务\n\n")
            f.write("- API地址: http://localhost:8000\n")
            f.write("- API文档: http://localhost:8000/docs\n")
            f.write("- 健康检查: http://localhost:8000/health\n")
            
            # 使用说明
            f.write("\n## 使用说明\n\n")
            f.write("### 测试预测\n")
            f.write("```bash\n")
            f.write("curl -X POST http://localhost:8000/predict \\\n")
            f.write("  -F 'file=@test_image.jpg'\n")
            f.write("```\n\n")
            
            f.write("### 停止API服务\n")
            f.write("```bash\n")
            f.write("kill $(cat api_service.pid)\n")
            f.write("```\n")
        
        self.logger.info(f"✅ 训练报告已生成: {report_file}")
        return report_file
    
    def run_full_pipeline(self) -> bool:
        """运行完整训练流程"""
        try:
            # 1. 环境检查
            if not self.check_environment():
                return False
            
            # 2. 准备目录
            if not self.prepare_directories():
                return False
            
            # 3. 检查数据
            data_info = self.check_training_data()
            if not data_info["valid"]:
                return False
            
            # 4. 选择配置
            config = self.select_optimal_config(data_info)
            
            # 5. 开始训练
            if not self.start_training(config):
                return False
            
            # 6. 评估模型
            self.evaluate_model()
            
            # 7. 启动API
            self.start_api_service()
            
            # 8. 生成报告
            report_file = self.generate_report()
            
            # 9. 显示结果
            self.show_final_results(report_file)
            
            return True
            
        except Exception as e:
            self.logger.error(f"❌ 训练流程失败: {e}")
            return False
    
    def show_final_results(self, report_file: str):
        """显示最终结果"""
        self.logger.info("\n" + "="*60)
        self.logger.info("🎉 全自动训练完成!")
        self.logger.info("="*60)
        
        self.logger.info("\n📊 训练结果:")
        self.logger.info("   ✅ 模型训练: data/models/best_model.pth")
        self.logger.info("   ✅ 模型评估: evaluation_results/")
        self.logger.info("   ✅ API服务: http://localhost:8000")
        self.logger.info("   ✅ 训练报告: " + report_file)
        
        if self.training_stats:
            if "training_time" in self.training_stats:
                time_hours = self.training_stats["training_time"] / 3600
                self.logger.info(f"   ⏱️ 训练用时: {time_hours:.2f}小时")
            
            if "test_metrics" in self.training_stats:
                metrics = self.training_stats["test_metrics"]
                self.logger.info(f"   📈 测试准确率: {metrics.get('accuracy', 0):.3f}")
                self.logger.info(f"   📈 测试F1分数: {metrics.get('macro_f1', 0):.3f}")
        
        self.logger.info("\n🚀 您可以:")
        self.logger.info("   1. 访问API文档: http://localhost:8000/docs")
        self.logger.info("   2. 测试预测: curl -X POST http://localhost:8000/predict -F 'file=@test_image.jpg'")
        self.logger.info("   3. 查看详细报告: " + report_file)
        
        if "api_pid" in self.training_stats:
            self.logger.info("   4. 停止API: kill $(cat api_service.pid)")

def main():
    """主函数"""
    print("🤖 组织病理CNN全自动训练系统")
    print("=" * 50)
    
    # 检查是否在正确目录
    if not Path("main.py").exists() or not Path("requirements.txt").exists():
        print("❌ 请在项目根目录运行此脚本")
        return 1
    
    # 创建训练系统
    trainer = AutoTrainingSystem()
    
    # 运行完整流程
    success = trainer.run_full_pipeline()
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())