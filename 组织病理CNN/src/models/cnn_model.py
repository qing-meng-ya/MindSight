import torch
import torch.nn as nn
import torchvision.models as models
from typing import Optional, List
from configs.config import Config

class PathologyCNN(nn.Module):
    """基于ResNet的组织病理分类模型"""
    
    def __init__(
        self,
        num_classes: int = Config.NUM_CLASSES,
        pretrained: bool = True,
        backbone: str = 'resnet50',
        dropout_rate: float = 0.3
    ):
        """
        Args:
            num_classes: 分类数量
            pretrained: 是否使用预训练权重
            backbone: 骨干网络类型
            dropout_rate: dropout比率
        """
        super(PathologyCNN, self).__init__()
        
        self.num_classes = num_classes
        self.backbone_name = backbone
        
        # 选择骨干网络
        if backbone == 'resnet18':
            self.backbone = models.resnet18(pretrained=pretrained)
            feature_dim = 512
        elif backbone == 'resnet34':
            self.backbone = models.resnet34(pretrained=pretrained)
            feature_dim = 512
        elif backbone == 'resnet50':
            self.backbone = models.resnet50(pretrained=pretrained)
            feature_dim = 2048
        elif backbone == 'resnet101':
            self.backbone = models.resnet101(pretrained=pretrained)
            feature_dim = 2048
        elif backbone == 'efficientnet_b0':
            self.backbone = models.efficientnet_b0(pretrained=pretrained)
            feature_dim = 1280
        elif backbone == 'efficientnet_b1':
            self.backbone = models.efficientnet_b1(pretrained=pretrained)
            feature_dim = 1280
        else:
            raise ValueError(f"不支持的骨干网络: {backbone}")
        
        # 移除原始分类器
        if 'resnet' in backbone:
            self.backbone = nn.Sequential(*list(self.backbone.children())[:-1])
        elif 'efficientnet' in backbone:
            self.backbone.classifier = nn.Identity()
        
        # 自定义分类头
        self.classifier = nn.Sequential(
            nn.AdaptiveAvgPool2d((1, 1)),
            nn.Flatten(),
            nn.Dropout(dropout_rate),
            nn.Linear(feature_dim, 512),
            nn.BatchNorm1d(512),
            nn.ReLU(inplace=True),
            nn.Dropout(dropout_rate * 0.5),
            nn.Linear(512, 256),
            nn.BatchNorm1d(256),
            nn.ReLU(inplace=True),
            nn.Dropout(dropout_rate * 0.3),
            nn.Linear(256, num_classes)
        )
        
        # 初始化权重
        self._initialize_weights()
    
    def _initialize_weights(self):
        """初始化分类头权重"""
        for m in self.classifier.modules():
            if isinstance(m, nn.Linear):
                nn.init.kaiming_normal_(m.weight, mode='fan_out', nonlinearity='relu')
                if m.bias is not None:
                    nn.init.constant_(m.bias, 0)
            elif isinstance(m, nn.BatchNorm1d):
                nn.init.constant_(m.weight, 1)
                nn.init.constant_(m.bias, 0)
    
    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """前向传播"""
        # 特征提取
        features = self.backbone(x)
        
        # 分类
        logits = self.classifier(features)
        
        return logits
    
    def get_feature_vector(self, x: torch.Tensor) -> torch.Tensor:
        """获取特征向量（用于特征分析）"""
        with torch.no_grad():
            features = self.backbone(x)
            # 展平特征
            features = torch.flatten(features, 1)
            return features

class CustomPathologyCNN(nn.Module):
    """专门设计的组织病理分类CNN"""
    
    def __init__(
        self,
        num_classes: int = Config.NUM_CLASSES,
        input_channels: int = 3,
        dropout_rate: float = 0.3
    ):
        """
        Args:
            num_classes: 分类数量
            input_channels: 输入通道数
            dropout_rate: dropout比率
        """
        super(CustomPathologyCNN, self).__init__()
        
        self.num_classes = num_classes
        
        # 特征提取层
        self.features = nn.Sequential(
            # 第一个卷积块
            nn.Conv2d(input_channels, 64, kernel_size=3, stride=1, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(inplace=True),
            nn.Conv2d(64, 64, kernel_size=3, stride=1, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(kernel_size=2, stride=2),
            
            # 第二个卷积块
            nn.Conv2d(64, 128, kernel_size=3, stride=1, padding=1),
            nn.BatchNorm2d(128),
            nn.ReLU(inplace=True),
            nn.Conv2d(128, 128, kernel_size=3, stride=1, padding=1),
            nn.BatchNorm2d(128),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(kernel_size=2, stride=2),
            
            # 第三个卷积块
            nn.Conv2d(128, 256, kernel_size=3, stride=1, padding=1),
            nn.BatchNorm2d(256),
            nn.ReLU(inplace=True),
            nn.Conv2d(256, 256, kernel_size=3, stride=1, padding=1),
            nn.BatchNorm2d(256),
            nn.ReLU(inplace=True),
            nn.Conv2d(256, 256, kernel_size=3, stride=1, padding=1),
            nn.BatchNorm2d(256),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(kernel_size=2, stride=2),
            
            # 第四个卷积块
            nn.Conv2d(256, 512, kernel_size=3, stride=1, padding=1),
            nn.BatchNorm2d(512),
            nn.ReLU(inplace=True),
            nn.Conv2d(512, 512, kernel_size=3, stride=1, padding=1),
            nn.BatchNorm2d(512),
            nn.ReLU(inplace=True),
            nn.Conv2d(512, 512, kernel_size=3, stride=1, padding=1),
            nn.BatchNorm2d(512),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(kernel_size=2, stride=2),
        )
        
        # 自适应池化
        self.avgpool = nn.AdaptiveAvgPool2d((7, 7))
        
        # 分类器
        self.classifier = nn.Sequential(
            nn.Dropout(dropout_rate),
            nn.Linear(512 * 7 * 7, 4096),
            nn.ReLU(inplace=True),
            nn.Dropout(dropout_rate),
            nn.Linear(4096, 4096),
            nn.ReLU(inplace=True),
            nn.Dropout(dropout_rate * 0.5),
            nn.Linear(4096, num_classes)
        )
        
        # 初始化权重
        self._initialize_weights()
    
    def _initialize_weights(self):
        """初始化权重"""
        for m in self.modules():
            if isinstance(m, nn.Conv2d):
                nn.init.kaiming_normal_(m.weight, mode='fan_out', nonlinearity='relu')
                if m.bias is not None:
                    nn.init.constant_(m.bias, 0)
            elif isinstance(m, nn.BatchNorm2d):
                nn.init.constant_(m.weight, 1)
                nn.init.constant_(m.bias, 0)
            elif isinstance(m, nn.Linear):
                nn.init.normal_(m.weight, 0, 0.01)
                nn.init.constant_(m.bias, 0)
    
    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """前向传播"""
        x = self.features(x)
        x = self.avgpool(x)
        x = torch.flatten(x, 1)
        x = self.classifier(x)
        return x

class ModelFactory:
    """模型工厂类"""
    
    @staticmethod
    def create_model(
        model_type: str = 'resnet50',
        num_classes: int = Config.NUM_CLASSES,
        **kwargs
    ) -> nn.Module:
        """
        创建模型
        
        Args:
            model_type: 模型类型 ('resnet18', 'resnet34', 'resnet50', 'resnet101', 
                      'efficientnet_b0', 'efficientnet_b1', 'custom')
            num_classes: 分类数量
            **kwargs: 其他参数
        """
        if model_type == 'custom':
            return CustomPathologyCNN(num_classes=num_classes, **kwargs)
        else:
            return PathologyCNN(
                num_classes=num_classes,
                backbone=model_type,
                **kwargs
            )
    
    @staticmethod
    def get_available_models() -> List[str]:
        """获取可用的模型列表"""
        return [
            'resnet18', 'resnet34', 'resnet50', 'resnet101',
            'efficientnet_b0', 'efficientnet_b1', 'custom'
        ]