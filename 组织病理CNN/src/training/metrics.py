import numpy as np
import torch
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    confusion_matrix, classification_report, roc_auc_score,
    roc_curve
)
from typing import Dict, List, Tuple, Optional
import matplotlib.pyplot as plt
import seaborn as sns
from configs.config import Config

class MetricsCalculator:
    """评估指标计算器"""
    
    def __init__(self, class_names: List[str] = None):
        """
        Args:
            class_names: 类别名称列表
        """
        self.class_names = class_names or Config.PATHOLOGY_CLASSES
        self.num_classes = len(self.class_names)
    
    def calculate_metrics(
        self,
        y_true: List[int] or np.ndarray,
        y_pred: List[int] or np.ndarray,
        y_prob: Optional[List[float] or np.ndarray] = None
    ) -> Dict[str, float]:
        """
        计算分类指标
        
        Args:
            y_true: 真实标签
            y_pred: 预测标签
            y_prob: 预测概率 (可选)
            
        Returns:
            指标字典
        """
        # 转换为numpy数组
        y_true = np.array(y_true)
        y_pred = np.array(y_pred)
        
        # 基础指标
        accuracy = accuracy_score(y_true, y_pred)
        precision_macro = precision_score(y_true, y_pred, average='macro', zero_division=0)
        precision_micro = precision_score(y_true, y_pred, average='micro', zero_division=0)
        precision_weighted = precision_score(y_true, y_pred, average='weighted', zero_division=0)
        
        recall_macro = recall_score(y_true, y_pred, average='macro', zero_division=0)
        recall_micro = recall_score(y_true, y_pred, average='micro', zero_division=0)
        recall_weighted = recall_score(y_true, y_pred, average='weighted', zero_division=0)
        
        f1_macro = f1_score(y_true, y_pred, average='macro', zero_division=0)
        f1_micro = f1_score(y_true, y_pred, average='micro', zero_division=0)
        f1_weighted = f1_score(y_true, y_pred, average='weighted', zero_division=0)
        
        metrics = {
            'accuracy': accuracy,
            'macro_precision': precision_macro,
            'micro_precision': precision_micro,
            'weighted_precision': precision_weighted,
            'macro_recall': recall_macro,
            'micro_recall': recall_micro,
            'weighted_recall': recall_weighted,
            'macro_f1': f1_macro,
            'micro_f1': f1_micro,
            'weighted_f1': f1_weighted
        }
        
        # 如果有概率预测，计算AUC
        if y_prob is not None:
            y_prob = np.array(y_prob)
            
            # 多分类AUC (需要one-hot编码)
            if len(y_prob.shape) == 2 and y_prob.shape[1] > 1:
                try:
                    auc_ovr = roc_auc_score(
                        self._one_hot_encode(y_true), 
                        y_prob, 
                        average='macro',
                        multi_class='ovr'
                    )
                    auc_ovo = roc_auc_score(
                        self._one_hot_encode(y_true), 
                        y_prob, 
                        average='macro',
                        multi_class='ovo'
                    )
                    metrics['auc_ovr'] = auc_ovr
                    metrics['auc_ovo'] = auc_ovo
                except:
                    print("AUC计算失败，可能是类别不完整")
        
        return metrics
    
    def calculate_per_class_metrics(
        self,
        y_true: List[int] or np.ndarray,
        y_pred: List[int] or np.ndarray
    ) -> Dict[str, Dict[str, float]]:
        """
        计算每个类别的指标
        
        Args:
            y_true: 真实标签
            y_pred: 预测标签
            
        Returns:
            每个类别的指标字典
        """
        y_true = np.array(y_true)
        y_pred = np.array(y_pred)
        
        # 计算精确率和召回率
        precision_per_class = precision_score(
            y_true, y_pred, average=None, zero_division=0
        )
        recall_per_class = recall_score(
            y_true, y_pred, average=None, zero_division=0
        )
        f1_per_class = f1_score(
            y_true, y_pred, average=None, zero_division=0
        )
        
        per_class_metrics = {}
        for i, class_name in enumerate(self.class_names):
            if i < len(precision_per_class):
                per_class_metrics[class_name] = {
                    'precision': precision_per_class[i],
                    'recall': recall_per_class[i],
                    'f1': f1_per_class[i]
                }
        
        return per_class_metrics
    
    def get_confusion_matrix(
        self,
        y_true: List[int] or np.ndarray,
        y_pred: List[int] or np.ndarray,
        normalize: Optional[str] = None
    ) -> np.ndarray:
        """
        计算混淆矩阵
        
        Args:
            y_true: 真实标签
            y_pred: 预测标签
            normalize: 归一化方式 ('true', 'pred', 'all', None)
            
        Returns:
            混淆矩阵
        """
        y_true = np.array(y_true)
        y_pred = np.array(y_pred)
        
        cm = confusion_matrix(y_true, y_pred, normalize=normalize)
        return cm
    
    def plot_confusion_matrix(
        self,
        y_true: List[int] or np.ndarray,
        y_pred: List[int] or np.ndarray,
        save_path: Optional[str] = None,
        normalize: bool = False
    ) -> plt.Figure:
        """
        绘制混淆矩阵
        
        Args:
            y_true: 真实标签
            y_pred: 预测标签
            save_path: 保存路径
            normalize: 是否归一化
            
        Returns:
            matplotlib图形对象
        """
        cm = self.get_confusion_matrix(
            y_true, y_pred, 
            normalize='true' if normalize else None
        )
        
        fig, ax = plt.subplots(figsize=(10, 8))
        
        if normalize:
            sns.heatmap(
                cm, annot=True, fmt='.2f', cmap='Blues',
                xticklabels=self.class_names,
                yticklabels=self.class_names,
                ax=ax
            )
            ax.set_title('归一化混淆矩阵')
        else:
            sns.heatmap(
                cm, annot=True, fmt='d', cmap='Blues',
                xticklabels=self.class_names,
                yticklabels=self.class_names,
                ax=ax
            )
            ax.set_title('混淆矩阵')
        
        ax.set_xlabel('预测标签')
        ax.set_ylabel('真实标签')
        plt.xticks(rotation=45, ha='right')
        plt.yticks(rotation=0)
        plt.tight_layout()
        
        if save_path:
            plt.savefig(save_path, dpi=300, bbox_inches='tight')
            print(f"混淆矩阵已保存: {save_path}")
        
        return fig
    
    def get_classification_report(
        self,
        y_true: List[int] or np.ndarray,
        y_pred: List[int] or np.ndarray,
        output_dict: bool = True
    ) -> Dict or str:
        """
        获取分类报告
        
        Args:
            y_true: 真实标签
            y_pred: 预测标签
            output_dict: 是否输出字典格式
            
        Returns:
            分类报告
        """
        report = classification_report(
            y_true, y_pred,
            target_names=self.class_names,
            output_dict=output_dict,
            zero_division=0
        )
        
        return report
    
    def plot_roc_curves(
        self,
        y_true: List[int] or np.ndarray,
        y_prob: np.ndarray,
        save_path: Optional[str] = None
    ) -> plt.Figure:
        """
        绘制ROC曲线 (多分类)
        
        Args:
            y_true: 真实标签
            y_prob: 预测概率
            save_path: 保存路径
            
        Returns:
            matplotlib图形对象
        """
        y_true = np.array(y_true)
        y_prob = np.array(y_prob)
        
        # One-hot编码
        y_true_bin = self._one_hot_encode(y_true)
        
        fig, ax = plt.subplots(figsize=(10, 8))
        
        # 计算每个类别的ROC曲线
        for i, class_name in enumerate(self.class_names):
            if i < y_prob.shape[1]:
                fpr, tpr, _ = roc_curve(y_true_bin[:, i], y_prob[:, i])
                auc = roc_auc_score(y_true_bin[:, i], y_prob[:, i])
                
                ax.plot(fpr, tpr, label=f'{class_name} (AUC = {auc:.2f})')
        
        # 对角线
        ax.plot([0, 1], [0, 1], 'k--', label='随机分类器')
        
        ax.set_xlabel('假正率 (FPR)')
        ax.set_ylabel('真正率 (TPR)')
        ax.set_title('ROC曲线')
        ax.legend()
        ax.grid(True, alpha=0.3)
        
        if save_path:
            plt.savefig(save_path, dpi=300, bbox_inches='tight')
            print(f"ROC曲线已保存: {save_path}")
        
        return fig
    
    def _one_hot_encode(self, y: np.ndarray) -> np.ndarray:
        """将标签进行one-hot编码"""
        y = np.array(y)
        n_classes = len(self.class_names)
        return np.eye(n_classes)[y]
    
    def print_detailed_report(
        self,
        y_true: List[int] or np.ndarray,
        y_pred: List[int] or np.ndarray,
        y_prob: Optional[np.ndarray] = None
    ):
        """打印详细的评估报告"""
        print("=" * 60)
        print("分类评估报告")
        print("=" * 60)
        
        # 总体指标
        metrics = self.calculate_metrics(y_true, y_pred, y_prob)
        print(f"\n总体指标:")
        print(f"准确率: {metrics['accuracy']:.4f}")
        print(f"宏平均精确率: {metrics['macro_precision']:.4f}")
        print(f"宏平均召回率: {metrics['macro_recall']:.4f}")
        print(f"宏平均F1分数: {metrics['macro_f1']:.4f}")
        
        if 'auc_ovr' in metrics:
            print(f"AUC (One-vs-Rest): {metrics['auc_ovr']:.4f}")
            print(f"AUC (One-vs-One): {metrics['auc_ovo']:.4f}")
        
        # 每个类别的指标
        per_class_metrics = self.calculate_per_class_metrics(y_true, y_pred)
        print(f"\n各类别详细指标:")
        print("-" * 40)
        for class_name, class_metrics in per_class_metrics.items():
            print(f"{class_name}:")
            print(f"  精确率: {class_metrics['precision']:.4f}")
            print(f"  召回率: {class_metrics['recall']:.4f}")
            print(f"  F1分数: {class_metrics['f1']:.4f}")
        
        # 分类报告
        report = self.get_classification_report(y_true, y_pred, output_dict=False)
        print(f"\nSklearn分类报告:")
        print("-" * 40)
        print(report)