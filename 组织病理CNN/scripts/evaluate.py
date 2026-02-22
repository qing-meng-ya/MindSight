"""
模型评估脚本

用于全面评估组织病理CNN模型的性能
"""

import os
import sys
import torch
import numpy as np
import argparse
import json
from datetime import datetime
from typing import Dict, List, Tuple
import matplotlib.pyplot as plt
import seaborn as sns

# 添加src路径
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'src'))

from src.data import PathologyDataLoader
from src.models import ModelManager
from src.training import MetricsCalculator
from src.utils import VisualizationUtils
from configs.config import Config

class ModelEvaluator:
    """模型评估器"""
    
    def __init__(
        self,
        model_path: str = None,
        data_dir: str = None,
        device: str = "auto",
        batch_size: int = 32
    ):
        """
        初始化评估器
        
        Args:
            model_path: 模型文件路径
            data_dir: 测试数据目录
            device: 设备类型
            batch_size: 批次大小
        """
        # 设备配置
        if device == "auto":
            self.device = "cuda" if torch.cuda.is_available() else "cpu"
        else:
            self.device = device
        
        print(f"使用设备: {self.device}")
        
        # 加载模型
        self.model_manager = ModelManager()
        self.model, self.model_info = self.model_manager.load_model(
            model_path=model_path,
            load_best=True,
            device=self.device
        )
        
        self.model.eval()
        print(f"模型加载成功: {self.model_info.get('model_type', 'unknown')}")
        
        # 加载数据
        if data_dir and os.path.exists(data_dir):
            self.data_loader = PathologyDataLoader(
                data_dir=data_dir,
                batch_size=batch_size
            )
            self.test_loader = self.data_loader.get_test_loader()
            self.val_loader = self.data_loader.get_val_loader()
            print(f"数据加载成功: 测试样本 {len(self.test_loader.dataset)}")
        else:
            self.test_loader = None
            self.val_loader = None
            print("未提供测试数据，仅支持基于已有指标的评估")
        
        # 评估工具
        self.metrics_calculator = MetricsCalculator()
        self.class_names = Config.PATHOLOGY_CLASSES
        
    def evaluate_test_set(self) -> Dict[str, any]:
        """评估测试集性能"""
        if self.test_loader is None:
            raise ValueError("未提供测试数据加载器")
        
        print("\n🧪 开始测试集评估...")
        
        all_predictions = []
        all_labels = []
        all_probabilities = []
        
        with torch.no_grad():
            for batch_idx, (data, targets) in enumerate(self.test_loader):
                data, targets = data.to(self.device), targets.to(self.device)
                
                # 前向传播
                outputs = self.model(data)
                probs = torch.softmax(outputs, dim=1)
                preds = torch.argmax(outputs, dim=1)
                
                # 收集结果
                all_predictions.extend(preds.cpu().numpy())
                all_labels.extend(targets.cpu().numpy())
                all_probabilities.extend(probs.cpu().numpy())
                
                if batch_idx % 10 == 0:
                    print(f"  处理批次 {batch_idx+1}/{len(self.test_loader)}")
        
        # 计算指标
        metrics = self.metrics_calculator.calculate_metrics(
            all_labels, all_predictions, all_probabilities
        )
        
        # 详细分析
        detailed_results = {
            "basic_metrics": metrics,
            "per_class_metrics": self.metrics_calculator.calculate_per_class_metrics(
                all_labels, all_predictions
            ),
            "confusion_matrix": self.metrics_calculator.get_confusion_matrix(
                all_labels, all_predictions
            ).tolist(),
            "classification_report": self.metrics_calculator.get_classification_report(
                all_labels, all_predictions
            ),
            "predictions_summary": {
                "total_samples": len(all_labels),
                "correct_predictions": sum(1 for pred, true in zip(all_predictions, all_labels) if pred == true),
                "prediction_accuracy": sum(1 for pred, true in zip(all_predictions, all_labels) if pred == true) / len(all_labels)
            }
        }
        
        return detailed_results
    
    def evaluate_model_complexity(self) -> Dict[str, any]:
        """评估模型复杂度"""
        print("\n📊 评估模型复杂度...")
        
        # 计算参数数量
        total_params = sum(p.numel() for p in self.model.parameters())
        trainable_params = sum(p.numel() for p in self.model.parameters() if p.requires_grad)
        
        # 计算模型大小
        param_size = 0
        buffer_size = 0
        
        for param in self.model.parameters():
            param_size += param.nelement() * param.element_size()
        
        for buffer in self.model.buffers():
            buffer_size += buffer.nelement() * buffer.element_size()
        
        model_size_mb = (param_size + buffer_size) / 1024 / 1024
        
        # 推理速度测试
        inference_times = []
        test_input = torch.randn(1, 3, Config.IMG_SIZE, Config.IMG_SIZE).to(self.device)
        
        # 预热
        for _ in range(10):
            with torch.no_grad():
                _ = self.model(test_input)
        
        # 测试推理时间
        with torch.no_grad():
            for _ in range(100):
                start_time = torch.cuda.Event(enable_timing=True)
                end_time = torch.cuda.Event(enable_timing=True)
                
                start_time.record()
                _ = self.model(test_input)
                end_time.record()
                
                torch.cuda.synchronize()
                inference_times.append(start_time.elapsed_time(end_time))
        
        avg_inference_time = np.mean(inference_times)
        
        complexity_info = {
            "model_parameters": {
                "total": total_params,
                "trainable": trainable_params,
                "non_trainable": total_params - trainable_params
            },
            "model_size_mb": model_size_mb,
            "inference_performance": {
                "avg_inference_time_ms": avg_inference_time,
                "fps": 1000 / avg_inference_time,
                "samples_processed": 100
            },
            "model_info": self.model_info
        }
        
        return complexity_info
    
    def evaluate_class_balance(self) -> Dict[str, any]:
        """评估类别平衡性"""
        if self.test_loader is None:
            print("⚠️  无法评估类别平衡：无测试数据")
            return {}
        
        print("\n⚖️ 评估类别平衡性...")
        
        # 统计每个类别的样本数量
        class_counts = {class_name: 0 for class_name in self.class_names}
        
        for _, targets in self.test_loader:
            for target in targets:
                class_name = self.class_names[target.item()]
                class_counts[class_name] += 1
        
        total_samples = sum(class_counts.values())
        class_percentages = {k: v/total_samples*100 for k, v in class_counts.items()}
        
        # 计算平衡性指标
        class_counts_list = list(class_counts.values())
        balance_ratio = max(class_counts_list) / min(class_counts_list) if min(class_counts_list) > 0 else float('inf')
        
        balance_info = {
            "class_distribution": class_counts,
            "class_percentages": class_percentages,
            "balance_ratio": balance_ratio,
            "total_samples": total_samples,
            "is_balanced": balance_ratio < 2.0,
            "recommendation": self._get_balance_recommendation(balance_ratio)
        }
        
        return balance_info
    
    def generate_evaluation_report(
        self,
        save_plots: bool = True,
        output_dir: str = "evaluation_results"
    ) -> Dict[str, any]:
        """生成完整的评估报告"""
        print("\n📋 生成评估报告...")
        
        # 创建输出目录
        os.makedirs(output_dir, exist_ok=True)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        report = {
            "evaluation_timestamp": datetime.now().isoformat(),
            "model_info": self.model_info,
            "evaluation_settings": {
                "device": self.device,
                "class_names": self.class_names
            }
        }
        
        # 基础性能评估
        if self.test_loader:
            print("🔍 执行性能评估...")
            performance_results = self.evaluate_test_set()
            report["performance_evaluation"] = performance_results
            
            # 生成可视化
            if save_plots:
                print("📈 生成性能图表...")
                
                # 混淆矩阵
                cm = np.array(performance_results["confusion_matrix"])
                fig_cm = self.metrics_calculator.plot_confusion_matrix(
                    performance_results["predictions_summary"]["total_samples"] - 1,  # 占位符
                    performance_results["predictions_summary"]["total_samples"] - 1,  # 占位符
                    save_path=os.path.join(output_dir, f"confusion_matrix_{timestamp}.png")
                )
                plt.close(fig_cm)
                
                # 分类报告热图
                self._plot_classification_heatmap(
                    performance_results["per_class_metrics"],
                    save_path=os.path.join(output_dir, f"classification_heatmap_{timestamp}.png")
                )
        
        # 模型复杂度评估
        print("🏗️ 执行复杂度评估...")
        complexity_results = self.evaluate_model_complexity()
        report["complexity_evaluation"] = complexity_results
        
        # 类别平衡性评估
        print("⚖️ 执行平衡性评估...")
        balance_results = self.evaluate_class_balance()
        report["balance_evaluation"] = balance_results
        
        # 总体评估和建议
        print("💡 生成评估建议...")
        report["overall_assessment"] = self._generate_overall_assessment(report)
        
        # 保存报告
        report_path = os.path.join(output_dir, f"evaluation_report_{timestamp}.json")
        with open(report_path, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False)
        
        print(f"✅ 评估报告已保存: {report_path}")
        
        # 打印摘要
        self._print_evaluation_summary(report)
        
        return report
    
    def _plot_classification_heatmap(
        self, 
        per_class_metrics: Dict[str, Dict[str, float]], 
        save_path: str = None
    ):
        """绘制分类性能热图"""
        # 准备数据
        classes = list(per_class_metrics.keys())
        metrics = ['precision', 'recall', 'f1']
        
        data_matrix = []
        for class_name in classes:
            class_metrics = per_class_metrics[class_name]
            row = [class_metrics[metric] for metric in metrics]
            data_matrix.append(row)
        
        # 创建热图
        plt.figure(figsize=(10, 8))
        sns.heatmap(
            data_matrix,
            xticklabels=metrics,
            yticklabels=classes,
            annot=True,
            fmt='.3f',
            cmap='YlOrRd',
            cbar_kws={'label': 'Score'}
        )
        plt.title('Per-Class Classification Performance')
        plt.xlabel('Metrics')
        plt.ylabel('Classes')
        plt.tight_layout()
        
        if save_path:
            plt.savefig(save_path, dpi=300, bbox_inches='tight')
        
        plt.close()
    
    def _generate_overall_assessment(self, report: Dict[str, any]) -> Dict[str, any]:
        """生成总体评估"""
        assessment = {
            "strengths": [],
            "weaknesses": [],
            "recommendations": [],
            "overall_score": 0.0
        }
        
        # 性能评估
        if "performance_evaluation" in report:
            perf = report["performance_evaluation"]["basic_metrics"]
            
            if perf["macro_f1"] > 0.85:
                assessment["strengths"].append(f"优秀的F1分数: {perf['macro_f1']:.3f}")
                assessment["overall_score"] += 30
            elif perf["macro_f1"] > 0.75:
                assessment["strengths"].append(f"良好的F1分数: {perf['macro_f1']:.3f}")
                assessment["overall_score"] += 20
            else:
                assessment["weaknesses"].append(f"F1分数需要改进: {perf['macro_f1']:.3f}")
                assessment["recommendations"].append("考虑增加训练数据或调整模型架构")
        
        # 复杂度评估
        if "complexity_evaluation" in report:
            comp = report["complexity_evaluation"]
            
            if comp["inference_performance"]["fps"] > 100:
                assessment["strengths"].append(f"高推理速度: {comp['inference_performance']['fps']:.1f} FPS")
                assessment["overall_score"] += 15
            elif comp["inference_performance"]["fps"] > 50:
                assessment["overall_score"] += 10
            
            if comp["model_size_mb"] < 100:
                assessment["strengths"].append(f"模型大小适中: {comp['model_size_mb']:.1f} MB")
                assessment["overall_score"] += 10
        
        # 平衡性评估
        if "balance_evaluation" in report and report["balance_evaluation"]:
            balance = report["balance_evaluation"]
            
            if balance["is_balanced"]:
                assessment["strengths"].append("数据分布平衡")
                assessment["overall_score"] += 15
            else:
                assessment["weaknesses"].append("数据分布不平衡")
                assessment["recommendations"].append("考虑使用类别权重或数据重采样")
        
        # 添加通用建议
        if assessment["overall_score"] < 50:
            assessment["recommendations"].append("建议全面检查模型架构和训练流程")
        
        return assessment
    
    def _print_evaluation_summary(self, report: Dict[str, any]):
        """打印评估摘要"""
        print("\n" + "="*60)
        print("📊 评估报告摘要")
        print("="*60)
        
        # 性能摘要
        if "performance_evaluation" in report:
            perf = report["performance_evaluation"]["basic_metrics"]
            print(f"\n🎯 性能指标:")
            print(f"   准确率: {perf['accuracy']:.3f}")
            print(f"   F1分数: {perf['macro_f1']:.3f}")
            print(f"   精确率: {perf['macro_precision']:.3f}")
            print(f"   召回率: {perf['macro_recall']:.3f}")
        
        # 复杂度摘要
        if "complexity_evaluation" in report:
            comp = report["complexity_evaluation"]
            print(f"\n🏗️ 模型复杂度:")
            print(f"   参数数量: {comp['model_parameters']['total']:,}")
            print(f"   模型大小: {comp['model_size_mb']:.1f} MB")
            print(f"   推理速度: {comp['inference_performance']['fps']:.1f} FPS")
        
        # 总体评估
        if "overall_assessment" in report:
            assess = report["overall_assessment"]
            print(f"\n💡 总体评估:")
            print(f"   总体得分: {assess['overall_score']}/100")
            
            if assess["strengths"]:
                print("   优势:")
                for strength in assess["strengths"]:
                    print(f"     ✅ {strength}")
            
            if assess["weaknesses"]:
                print("   劣势:")
                for weakness in assess["weaknesses"]:
                    print(f"     ⚠️  {weakness}")
            
            if assess["recommendations"]:
                print("   建议:")
                for rec in assess["recommendations"]:
                    print(f"     💡 {rec}")
        
        print("\n" + "="*60)
    
    def _get_balance_recommendation(self, balance_ratio: float) -> str:
        """获取平衡性建议"""
        if balance_ratio < 1.5:
            return "数据分布良好，无需特殊处理"
        elif balance_ratio < 3.0:
            return "建议使用类别权重或数据增强"
        else:
            return "强烈建议重新平衡数据集"

def main():
    """主函数"""
    parser = argparse.ArgumentParser(description="组织病理CNN模型评估")
    
    parser.add_argument("--model_path", type=str, 
                       help="模型文件路径（可选，默认使用最佳模型）")
    parser.add_argument("--data_dir", type=str, 
                       help="测试数据目录")
    parser.add_argument("--device", type=str, default="auto",
                       help="设备类型")
    parser.add_argument("--batch_size", type=int, default=32,
                       help="批次大小")
    parser.add_argument("--output_dir", type=str, default="evaluation_results",
                       help="结果输出目录")
    parser.add_argument("--save_plots", action="store_true", default=True,
                       help="保存可视化图表")
    
    args = parser.parse_args()
    
    # 创建评估器
    evaluator = ModelEvaluator(
        model_path=args.model_path,
        data_dir=args.data_dir,
        device=args.device,
        batch_size=args.batch_size
    )
    
    # 生成评估报告
    report = evaluator.generate_evaluation_report(
        save_plots=args.save_plots,
        output_dir=args.output_dir
    )

if __name__ == "__main__":
    main()