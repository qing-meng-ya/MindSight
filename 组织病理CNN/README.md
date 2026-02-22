# 组织病理CNN识别系统

🔬 **基于深度学习的组织病理图像识别系统**

支持15种常见病理类型的自动识别、置信度分析和辅助诊断报告生成，为病理诊断提供AI辅助工具。

## ✨ 核心特性

- 🎯 **15种病理类型识别**：覆盖肺、心、脑、肝、脾、肾、胰腺等多个器官
- 🤖 **先进深度学习**：基于PyTorch和预训练模型的高精度识别
- 📊 **智能诊断报告**：自动生成详细的诊断建议、置信度分析和鉴别诊断
- 🚀 **高性能API**：FastAPI构建的RESTful接口，支持单张和批量处理
- 📈 **完整评估体系**：全面的模型性能分析、可视化和质量评估工具
- 🐳 **容器化部署**：支持Docker和Docker Compose一键部署
- 📚 **详细文档**：完整的API文档、使用指南和示例代码

## 🏗️ 系统架构

```
组织病理CNN识别系统
├── 核心功能层
│   ├── 深度学习模型    # 基于ResNet/EfficientNet的CNN模型
│   ├── 数据处理管道    # 图像预处理、增强、加载
│   ├── 训练框架       # 多种损失函数、优化器、调度策略
│   └── 推理引擎       # 高性能预测、TTA增强
├── 业务逻辑层
│   ├── 预测服务       # 单张/批量图像识别
│   ├── 报告生成       # 智能诊断建议、严重程度评估
│   ├── 质量控制       # 置信度分析、结果验证
│   └── 评估分析       # 性能指标、可视化图表
├── 接口服务层
│   ├── RESTful API    # FastAPI接口服务
│   ├── 文档生成       # Swagger UI、ReDoc
│   └── 健康监控       # 服务状态、性能监控
└── 部署运维层
    ├── 容器化        # Docker、Docker Compose
    ├── 负载均衡        # Nginx反向代理
    └── 监控日志        # 性能监控、错误追踪
```

## 🎯 支持的病理类型

### 肺部病变 (4种)
- **肺出血** - 肺泡和间质内红细胞渗出
- **肺水肿** - 肺部液体积聚，肺泡壁增厚  
- **肺血栓** - 血管内血栓形成，阻塞血流
- **肺炎** - 肺部炎症反应，炎性细胞浸润

### 心血管病变 (3种)
- **冠心病** - 冠状动脉狭窄或阻塞
- **心肌纤维断裂** - 心肌纤维结构破坏
- **心肌炎** - 心肌组织炎症反应

### 脑部病变 (4种)
- **脑出血** - 脑实质出血，血肿形成
- **脑水肿** - 脑组织水肿，压力增高
- **脑血管畸形** - 血管结构异常，发育异常
- **脑蛛网膜下腔淤血** - 蛛网膜下腔血液积聚

### 其他器官病变 (4种)
- **肝脂肪变性** - 肝细胞内脂肪滴积聚
- **脾小动脉玻璃样改变** - 小动脉壁玻璃样变性
- **肾小球纤维化** - 肾小球结构纤维化
- **胰腺炎** - 胰腺组织炎症，水肿坏死

## 📁 项目结构

```
组织病理CNN/
├── src/                          # 核心源代码
│   ├── models/                   # CNN模型定义和管理
│   │   ├── cnn_model.py         # 模型架构定义
│   │   └── model_manager.py     # 模型保存/加载/版本管理
│   ├── data/                     # 数据处理模块
│   │   ├── dataset.py           # 自定义数据集
│   │   ├── transforms.py        # 数据增强和变换
│   │   └── loader.py            # 数据加载器
│   ├── training/                 # 训练流程
│   │   ├── trainer.py           # 训练器主类
│   │   ├── metrics.py           # 评估指标计算
│   │   └── losses.py            # 损失函数集合
│   ├── inference/                # 推理预测
│   │   ├── predictor.py         # 预测器核心
│   │   └── report_generator.py  # 诊断报告生成
│   └── utils/                    # 工具函数
│       └── helpers.py           # 图像处理、可视化等
├── scripts/                      # 实用脚本
│   ├── train.py                 # 训练脚本
│   └── evaluate.py              # 模型评估脚本
├── tests/                        # 测试代码
│   └── test_api.py              # API测试脚本
├── examples/                     # 示例代码
│   └── api_demo.py              # API使用示例
├── docs/                         # 文档
│   └── USER_GUIDE.md            # 详细使用指南
├── configs/                      # 配置文件
│   └── config.py                # 系统配置
├── data/                         # 数据目录
│   ├── raw/                     # 原始训练数据
│   ├── processed/               # 预处理后数据
│   └── models/                  # 训练好的模型
├── api/                          # API相关 (可扩展)
├── main.py                       # 主入口
├── requirements.txt              # 依赖包
├── Dockerfile                   # Docker镜像
├── docker-compose.yml           # Docker编排
├── nginx.conf                   # Nginx配置
├── start.sh                     # Linux启动脚本
├── start.bat                    # Windows启动脚本
└── README.md                    # 项目说明
```

## 🚀 快速开始

### 方式一：一键启动（推荐）

**Linux/Mac:**
```bash
chmod +x start.sh
./start.sh
```

**Windows:**
```cmd
start.bat
```

### 方式二：手动安装

#### 1. 环境要求
- Python 3.8+
- CUDA 11.0+ (GPU加速，可选)
- 内存: 8GB+ (推荐16GB+)

#### 2. 安装依赖
```bash
# 创建虚拟环境
python -m venv pathology_env
source pathology_env/bin/activate  # Linux/Mac
# pathology_env\Scripts\activate  # Windows

# 安装依赖
pip install -r requirements.txt
```

#### 3. 准备模型（可选）
```bash
# 训练自己的模型
python scripts/train.py --data_dir data/raw --epochs 100

# 或下载预训练模型到 data/models/best_model.pth
```

#### 4. 启动服务
```bash
python main.py
```

#### 5. 访问服务
- 🌐 API服务: http://localhost:8000
- 📚 API文档: http://localhost:8000/docs
- 📖 ReDoc文档: http://localhost:8000/redoc
- ❤️ 健康检查: http://localhost:8000/health

## 🐳 Docker部署

### 使用Docker Compose（推荐）
```bash
# 启动完整服务栈
docker-compose up -d

# 查看服务状态
docker-compose ps

# 停止服务
docker-compose down
```

### 单独使用Docker
```bash
# 构建镜像
docker build -t pathology-cnn .

# 运行容器
docker run -p 8000:8000 -v $(pwd)/data:/app/data pathology-cnn
```

## 📖 API使用示例

### Python客户端
```python
import requests

# 预测单张图像
with open('test_image.jpg', 'rb') as f:
    files = {'file': f}
    response = requests.post('http://localhost:8000/predict', files=files)
    result = response.json()
    print(f"预测结果: {result['prediction']['class']}")
    print(f"置信度: {result['prediction']['confidence']:.3f}")

# 生成诊断报告
patient_info = {"name": "张三", "age": "45", "gender": "男"}
with open('test_image.jpg', 'rb') as f:
    files = {'file': f}
    data = {'patient_info': json.dumps(patient_info)}
    response = requests.post('http://localhost:8000/diagnose', files=files, data=data)
    report = response.json()
    print(f"诊断报告: {report['report_id']}")
```

### cURL示例
```bash
# 基础预测
curl -X POST "http://localhost:8000/predict" \
  -F "file=@test_image.jpg"

# 生成完整诊断报告
curl -X POST "http://localhost:8000/diagnose" \
  -F "file=@test_image.jpg" \
  -F "patient_info={\"name\":\"张三\",\"age\":\"45\"}"
```

## 🎓 训练自定义模型

### 准备训练数据
```
data/raw/
├── 肺炎/
│   ├── image001.jpg
│   ├── image002.jpg
│   └── ...
├── 肺出血/
├── 肺水肿/
└── ... (其他病理类型)
```

### 开始训练
```bash
python scripts/train.py \
  --data_dir data/raw \
  --model_type resnet50 \
  --epochs 100 \
  --batch_size 32 \
  --lr 0.001 \
  --loss_type focal
```

### 评估模型性能
```bash
python scripts/evaluate.py \
  --data_dir data/raw \
  --model_path data/models/best_model.pth \
  --output_dir evaluation_results
```

## 📊 核心接口

| 接口 | 方法 | 功能 | 用途 |
|------|------|------|------|
| `/predict` | POST | 单张图像预测 | 快速识别 |
| `/predict_batch` | POST | 批量图像预测 | 批量处理 |
| `/diagnose` | POST | 生成诊断报告 | 完整分析 |
| `/predict_with_report` | POST | 预测+简要报告 | 综合使用 |
| `/classes` | GET | 获取支持的类型 | 信息查询 |
| `/model_info` | GET | 获取模型信息 | 状态检查 |
| `/health` | GET | 健康检查 | 监控服务 |

## 🔧 技术栈

### 深度学习
- **PyTorch** - 深度学习框架
- **torchvision** - 预训练模型和变换
- **Albumentations** - 高级数据增强

### Web服务
- **FastAPI** - 现代高性能Web框架
- **Uvicorn** - ASGI服务器
- **Pydantic** - 数据验证和序列化

### 图像处理
- **OpenCV** - 计算机视觉库
- **PIL/Pillow** - 图像处理库
- **NumPy** - 数值计算

### 评估分析
- **scikit-learn** - 机器学习评估指标
- **matplotlib/seaborn** - 数据可视化
- **pandas** - 数据分析

### 部署运维
- **Docker** - 容器化技术
- **Nginx** - 反向代理和负载均衡
- **Gunicorn** - WSGI服务器

## 📈 性能指标

### 模型性能
- **准确率**: 目标 85-90% (临床辅助水平)
- **支持格式**: JPEG, PNG, TIFF, BMP
- **输入尺寸**: 224×224 (自动调整)
- **推理速度**: < 1秒/张 (GPU), 2-3秒/张 (CPU)

### 系统性能
- **并发处理**: 支持多请求并发
- **内存占用**: ~2-4GB (GPU模型加载)
- **存储需求**: 模型文件 ~200-500MB
- **网络带宽**: 支持大图像上传 (最大50MB)

## 🛠️ 配置选项

### 模型配置
- **骨干网络**: ResNet18/34/50/101, EfficientNet-B0/B1
- **预训练权重**: ImageNet预训练或自定义
- **分类头**: 自定义多层分类器

### 训练配置
- **损失函数**: CrossEntropy, Focal, Label Smoothing, Combined
- **优化器**: Adam, AdamW, SGD
- **学习率调度**: ReduceLROnPlateau, CosineAnnealingLR
- **数据增强**: 几何变换、颜色变换、噪声添加

### 推理配置
- **TTA增强**: 水平/垂直翻转、旋转、多尺度
- **置信度阈值**: 可调节，默认0.5
- **Top-K预测**: 可配置，默认Top-5

## 🧪 测试和质量保证

### API测试
```bash
# 运行完整API测试
python tests/test_api.py --url http://localhost:8000 --image test.jpg

# 运行使用示例
python examples/api_demo.py
```

### 模型评估
- **基础指标**: 准确率、精确率、召回率、F1分数
- **详细分析**: 每类性能、混淆矩阵
- **模型复杂度**: 参数数量、推理速度、模型大小
- **数据平衡性**: 类别分布分析

## 🔍 故障排除

### 常见问题

**Q: 模型预测置信度很低？**
A: 检查图像质量，考虑使用TTA增强或重新训练

**Q: API响应很慢？**
A: 使用GPU加速，增加worker进程，启用批量处理

**Q: 内存不足？**
A: 减小batch_size，使用梯度累积，选择更小的模型

**Q: Docker部署失败？**
A: 检查Docker版本，确保端口未被占用

### 日志查看
```bash
# 查看服务日志
docker-compose logs -f pathology-api

# 查看Nginx日志
docker-compose logs -f nginx
```

## 📞 技术支持

- 📧 **邮箱**: support@pathology-ai.com
- 🐛 **问题反馈**: [GitHub Issues](https://github.com/your-repo/issues)
- 📖 **详细文档**: [在线文档](https://docs.pathology-ai.com)
- 💬 **交流群**: [微信群/QQ群](https://your-community-link)

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🤝 贡献指南

欢迎提交 Pull Request 和 Issue！

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

---

**⚠️ 免责声明**: 本系统仅供辅助诊断使用，不能替代执业医师的临床判断。最终诊断应由合格的专业医师结合患者的完整临床信息做出。