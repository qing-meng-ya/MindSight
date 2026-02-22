import torch
import torch.nn as nn
import torch.nn.functional as F
from typing import Optional

class FocalLoss(nn.Module):
    """Focal Loss - 用于处理类别不平衡问题
    
    Reference:
        Lin et al. Focal Loss for Dense Object Detection.
        https://arxiv.org/abs/1708.02002
    """
    
    def __init__(
        self,
        alpha: float = 1.0,
        gamma: float = 2.0,
        reduction: str = 'mean'
    ):
        """
        Args:
            alpha: 平衡因子，用于平衡正负样本
            gamma: 调制因子，用于调节难易样本的权重
            reduction: 约简方式 ('none', 'mean', 'sum')
        """
        super(FocalLoss, self).__init__()
        self.alpha = alpha
        self.gamma = gamma
        self.reduction = reduction
        
    def forward(self, inputs: torch.Tensor, targets: torch.Tensor) -> torch.Tensor:
        """
        Args:
            inputs: 预测 logits (batch_size, num_classes)
            targets: 真实标签 (batch_size,)
            
        Returns:
            Focal Loss
        """
        # 计算交叉熵损失
        ce_loss = F.cross_entropy(inputs, targets, reduction='none')
        
        # 计算概率
        pt = torch.exp(-ce_loss)
        
        # 计算Focal Loss
        focal_loss = self.alpha * (1 - pt) ** self.gamma * ce_loss
        
        if self.reduction == 'mean':
            return focal_loss.mean()
        elif self.reduction == 'sum':
            return focal_loss.sum()
        else:
            return focal_loss

class LabelSmoothingLoss(nn.Module):
    """标签平滑损失 - 防止过拟合
    
    Reference:
        Szegedy et al. Rethinking the Inception Architecture for Computer Vision.
        https://arxiv.org/abs/1512.00567
    """
    
    def __init__(
        self,
        num_classes: int,
        smoothing: float = 0.1,
        reduction: str = 'mean'
    ):
        """
        Args:
            num_classes: 类别数量
            smoothing: 平滑系数
            reduction: 约简方式 ('none', 'mean', 'sum')
        """
        super(LabelSmoothingLoss, self).__init__()
        self.num_classes = num_classes
        self.smoothing = smoothing
        self.reduction = reduction
        self.confidence = 1.0 - smoothing
        
    def forward(self, inputs: torch.Tensor, targets: torch.Tensor) -> torch.Tensor:
        """
        Args:
            inputs: 预测 logits (batch_size, num_classes)
            targets: 真实标签 (batch_size,)
            
        Returns:
            Label Smoothing Loss
        """
        log_probs = F.log_softmax(inputs, dim=-1)
        
        # 创建平滑标签
        true_dist = torch.zeros_like(log_probs)
        true_dist.fill_(self.smoothing / (self.num_classes - 1))
        true_dist.scatter_(1, targets.data.unsqueeze(1), self.confidence)
        
        # 计算KL散度
        loss = torch.sum(-true_dist * log_probs, dim=-1)
        
        if self.reduction == 'mean':
            return loss.mean()
        elif self.reduction == 'sum':
            return loss.sum()
        else:
            return loss

class CombinedLoss(nn.Module):
    """组合损失函数 - 结合多种损失的优势"""
    
    def __init__(
        self,
        num_classes: int,
        focal_weight: float = 0.7,
        label_smoothing_weight: float = 0.3,
        focal_alpha: float = 1.0,
        focal_gamma: float = 2.0,
        smoothing: float = 0.1,
        class_weights: Optional[torch.Tensor] = None
    ):
        """
        Args:
            num_classes: 类别数量
            focal_weight: Focal Loss权重
            label_smoothing_weight: Label Smoothing权重
            focal_alpha: Focal Loss alpha参数
            focal_gamma: Focal Loss gamma参数
            smoothing: Label Smoothing平滑系数
            class_weights: 类别权重
        """
        super(CombinedLoss, self).__init__()
        
        self.focal_weight = focal_weight
        self.label_smoothing_weight = label_smoothing_weight
        
        # Focal Loss
        self.focal_loss = FocalLoss(alpha=focal_alpha, gamma=focal_gamma)
        
        # Label Smoothing Loss
        self.label_smoothing_loss = LabelSmoothingLoss(
            num_classes=num_classes, 
            smoothing=smoothing
        )
        
        # 加权交叉熵损失
        if class_weights is not None:
            self.ce_loss = nn.CrossEntropyLoss(weight=class_weights)
        else:
            self.ce_loss = nn.CrossEntropyLoss()
    
    def forward(self, inputs: torch.Tensor, targets: torch.Tensor) -> torch.Tensor:
        """
        Args:
            inputs: 预测 logits (batch_size, num_classes)
            targets: 真实标签 (batch_size,)
            
        Returns:
            组合损失
        """
        focal_loss = self.focal_loss(inputs, targets)
        smoothing_loss = self.label_smoothing_loss(inputs, targets)
        
        # 组合损失
        total_loss = (
            self.focal_weight * focal_loss + 
            self.label_smoothing_weight * smoothing_loss
        )
        
        return total_loss

class DiceLoss(nn.Module):
    """Dice Loss - 通常用于分割任务，但也可用于分类
    
    Reference:
        Milletari et al. V-Net: Fully Convolutional Neural Networks for Volumetric Medical Image Segmentation.
        https://arxiv.org/abs/1606.04797
    """
    
    def __init__(
        self,
        smooth: float = 1.0,
        reduction: str = 'mean'
    ):
        """
        Args:
            smooth: 平滑系数，防止除零
            reduction: 约简方式 ('none', 'mean', 'sum')
        """
        super(DiceLoss, self).__init__()
        self.smooth = smooth
        self.reduction = reduction
    
    def forward(self, inputs: torch.Tensor, targets: torch.Tensor) -> torch.Tensor:
        """
        Args:
            inputs: 预测 logits (batch_size, num_classes)
            targets: 真实标签 (batch_size,)
            
        Returns:
            Dice Loss
        """
        # 转换为概率
        probs = F.softmax(inputs, dim=1)
        
        # 创建one-hot标签
        num_classes = inputs.size(1)
        targets_one_hot = F.one_hot(targets, num_classes).float()
        
        # 计算Dice系数
        intersection = (probs * targets_one_hot).sum(dim=0)
        union = probs.sum(dim=0) + targets_one_hot.sum(dim=0)
        
        dice = (2.0 * intersection + self.smooth) / (union + self.smooth)
        dice_loss = 1.0 - dice
        
        if self.reduction == 'mean':
            return dice_loss.mean()
        elif self.reduction == 'sum':
            return dice_loss.sum()
        else:
            return dice_loss

class TverskyLoss(nn.Module):
    """Tversky Loss - Dice Loss的泛化形式
    
    Reference:
        Salehi et al. Tversky loss function for image segmentation using 3D fully convolutional deep networks.
        https://arxiv.org/abs/1706.05721
    """
    
    def __init__(
        self,
        alpha: float = 0.7,
        beta: float = 0.3,
        smooth: float = 1.0,
        reduction: str = 'mean'
    ):
        """
        Args:
            alpha: 假阴性的权重
            beta: 假阳性的权重
            smooth: 平滑系数
            reduction: 约简方式 ('none', 'mean', 'sum')
        """
        super(TverskyLoss, self).__init__()
        self.alpha = alpha
        self.beta = beta
        self.smooth = smooth
        self.reduction = reduction
    
    def forward(self, inputs: torch.Tensor, targets: torch.Tensor) -> torch.Tensor:
        """
        Args:
            inputs: 预测 logits (batch_size, num_classes)
            targets: 真实标签 (batch_size,)
            
        Returns:
            Tversky Loss
        """
        # 转换为概率
        probs = F.softmax(inputs, dim=1)
        
        # 创建one-hot标签
        num_classes = inputs.size(1)
        targets_one_hot = F.one_hot(targets, num_classes).float()
        
        # 计算Tversky系数
        tp = (probs * targets_one_hot).sum(dim=0)
        fp = (probs * (1 - targets_one_hot)).sum(dim=0)
        fn = ((1 - probs) * targets_one_hot).sum(dim=0)
        
        tversky = (tp + self.smooth) / (tp + self.alpha * fn + self.beta * fp + self.smooth)
        tversky_loss = 1.0 - tversky
        
        if self.reduction == 'mean':
            return tversky_loss.mean()
        elif self.reduction == 'sum':
            return tversky_loss.sum()
        else:
            return tversky_loss

# 损失函数工厂
class LossFactory:
    """损失函数工厂类"""
    
    @staticmethod
    def create_loss(
        loss_type: str = 'focal',
        num_classes: int = 15,
        **kwargs
    ) -> nn.Module:
        """
        创建损失函数
        
        Args:
            loss_type: 损失类型 ('ce', 'focal', 'label_smoothing', 'combined', 'dice', 'tversky')
            num_classes: 类别数量
            **kwargs: 其他参数
            
        Returns:
            损失函数实例
        """
        if loss_type == 'ce':
            class_weights = kwargs.get('class_weights', None)
            return nn.CrossEntropyLoss(weight=class_weights)
        
        elif loss_type == 'focal':
            alpha = kwargs.get('alpha', 1.0)
            gamma = kwargs.get('gamma', 2.0)
            return FocalLoss(alpha=alpha, gamma=gamma)
        
        elif loss_type == 'label_smoothing':
            smoothing = kwargs.get('smoothing', 0.1)
            return LabelSmoothingLoss(num_classes=num_classes, smoothing=smoothing)
        
        elif loss_type == 'combined':
            return CombinedLoss(num_classes=num_classes, **kwargs)
        
        elif loss_type == 'dice':
            return DiceLoss(**kwargs)
        
        elif loss_type == 'tversky':
            return TverskyLoss(**kwargs)
        
        else:
            raise ValueError(f"不支持的损失类型: {loss_type}")
    
    @staticmethod
    def get_available_losses() -> list:
        """获取可用的损失函数列表"""
        return [
            'ce',           # Cross Entropy
            'focal',        # Focal Loss
            'label_smoothing',  # Label Smoothing
            'combined',     # Combined Loss
            'dice',         # Dice Loss
            'tversky'       # Tversky Loss
        ]