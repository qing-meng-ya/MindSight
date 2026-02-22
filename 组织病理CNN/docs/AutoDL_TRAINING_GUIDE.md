# AutoDL云服务器训练指南

本指南专门针对在AutoDL云服务器上训练组织病理CNN模型提供详细的操作步骤和优化建议。

## 🎯 为什么选择AutoDL？

- **GPU资源丰富**：提供RTX 3090/4090、A100等高性能GPU
- **环境预配置**：PyTorch、CUDA等深度学习环境已预装
- **按需付费**：按小时计费，避免硬件闲置成本
- **存储灵活**：临时存储+持久化存储方案
- **一键部署**：支持Jupyter、SSH等多种访问方式

## 🚀 AutoDL训练流程

### 1. 选择合适的GPU实例

| GPU型号 | 显存 | 适用场景 | 推荐配置 |
|---------|------|----------|----------|
| RTX 4090 | 24GB | 大规模训练 | batch_size=32, img_size=384 |
| RTX 3090 | 24GB | 平衡性能 | batch_size=32, img_size=320 |
| A100 | 40GB | 最大规模 | batch_size=64, img_size=512 |
| RTX 3080 | 10GB | 标准训练 | batch_size=16, img_size=256 |
| RTX 3060 | 12GB | 经济型 | batch_size=16, img_size=224 |

**推荐选择**：RTX 4090 (性价比最高)

### 2. 创建AutoDL实例

#### 2.1 访问AutoDL控制台
1. 登录 [AutoDL官网](https://www.autodl.com/)
2. 进入"算力市场"
3. 选择合适的GPU实例

#### 2.2 配置实例参数
```bash
# 推荐配置
镜像: PyTorch 2.0 + CUDA 11.8
系统: Ubuntu 20.04
存储: 100GB+
GPU: RTX 4090 x 1
```

### 3. 上传项目文件

#### 3.1 方式一：Git克隆（推荐）
```bash
# 在AutoDL实例中执行
git clone <your-repository-url>
cd 组织病理CNN
```

#### 3.2 方式二：文件上传
```bash
# 上传压缩包
scp -r pathology_cnn.zip user@autodl-instance:/root/
# 解压
unzip pathology_cnn.zip
cd 组织病理CNN
```

#### 3.3 方式三：使用AutoDL文件管理器
1. 登录AutoDL控制台
2. 选择实例 → 文件管理
3. 上传项目文件

### 4. 准备训练数据

#### 4.1 数据目录结构
```
/root/autodl-tmp/datasets/pathology_raw/
├── 肺炎/
│   ├── img001.jpg
│   ├── img002.jpg
│   └── ...
├── 肺出血/
├── 肺水肿/
├── 肺血栓/
├── 冠心病/
├── 脑出血/
├── 肝脂肪变性/
└── ... (其他病理类型)
```

#### 4.2 数据上传方式

**方式一：AutoDL数据集**
1. 在控制台选择"数据集"
2. 上传数据集（支持压缩包）
3. 挂载到实例

**方式二：直接上传**
```bash
# 使用scp上传
scp -r local_data/ user@autodl-instance:/root/autodl-tmp/datasets/pathology_raw

# 或使用rsync（大文件推荐）
rsync -av --progress local_data/ user@autodl-instance:/root/autodl-tmp/datasets/pathology_raw
```

#### 4.3 数据验证
```bash
# 验证数据结构
python3 -c "
import os
data_dir = '/root/autodl-tmp/datasets/pathology_raw'
for class_name in os.listdir(data_dir):
    class_dir = os.path.join(data_dir, class_name)
    if os.path.isdir(class_dir):
        images = [f for f in os.listdir(class_dir) if f.lower().endswith(('.jpg', '.png', '.tiff'))]
        print(f'{class_name}: {len(images)} 张图像')
"
```

### 5. 安装依赖和配置环境

#### 5.1 自动配置（推荐）
```bash
# 使用提供的配置脚本
chmod +x autodl/setup_autodl.sh
./autodl/setup_autodl.sh
```

#### 5.2 手动配置
```bash
# 创建虚拟环境
python3 -m venv /root/pathology_env
source /root/pathology_env/bin/activate

# 安装依赖
pip install -r requirements.txt

# 验证安装
python3 -c "import torch; print(f'PyTorch: {torch.__version__}'); print(f'CUDA: {torch.cuda.is_available()}')"
```

### 6. 开始训练

#### 6.1 一键启动训练
```bash
# 使用优化的训练脚本
chmod +x autodl/train_autodl.sh
./autodl/train_autodl.sh
```

#### 6.2 手动训练（自定义参数）
```bash
# 基础训练
python scripts/train_autodl.py \
  --data_dir /root/autodl-tmp/datasets/pathology_raw \
  --epochs 100

# 高级配置
python scripts/train_autodl.py \
  --data_dir /root/autodl-tmp/datasets/pathology_raw \
  --model_type efficientnet_b1 \
  --batch_size 32 \
  --img_size 384 \
  --epochs 100 \
  --lr 0.001 \
  --loss_type combined \
  --mixed_precision \
  --experiment_name "exp_v1_large"
```

#### 6.3 监控训练进度
```bash
# 查看日志
tail -f /root/autodl-fs/experiment_name/logs/training_*.log

# 监控GPU使用
watch -n 2 nvidia-smi

# 查看训练统计
python3 -c "
import json
with open('/root/autodl-fs/experiment_name/training_stats.json') as f:
    stats = json.load(f)
print(f'训练时间: {stats[\"total_time\"]/3600:.2f} 小时')
print(f'最佳F1: {max(stats[\"epoch_times\"])}')
"
```

### 7. 模型管理和备份

#### 7.1 自动备份
训练过程中，系统会自动：
- 每5个epoch保存一次模型
- 验证集性能提升时保存最佳模型
- 训练完成后备份到持久化存储

#### 7.2 手动备份
```bash
# 备份到本地
scp -r user@autodl-instance:/root/autodl-fs/experiment_name ./

# 下载最佳模型
scp user@autodl-instance:/root/autodl-fs/experiment_name/models/best_model.pth ./
```

#### 7.3 模型评估
```bash
# 在AutoDL上评估
python scripts/evaluate.py \
  --data_dir /root/autodl-tmp/datasets/pathology_raw \
  --model_path /root/autodl-fs/experiment_name/models/best_model.pth \
  --output_dir /root/autodl-fs/evaluation_results
```

## 🔧 AutoDL优化技巧

### 1. GPU内存优化

#### 1.1 自动配置
系统会根据GPU内存自动调整：
- RTX 4090 (24GB): batch_size=32, img_size=384
- RTX 3090 (24GB): batch_size=32, img_size=320
- RTX 3080 (10GB): batch_size=16, img_size=256

#### 1.2 手动优化
```bash
# 减小batch size
python scripts/train_autodl.py \
  --batch_size 16 \
  --img_size 256

# 启用梯度累积
# 在autodl_config.py中调整accumulation_steps

# 启用混合精度训练
python scripts/train_autodl.py --mixed_precision
```

### 2. 存储优化

#### 2.1 存储策略
- **临时存储** (`/root/autodl-tmp/`): 高速SSD，用于训练数据
- **持久化存储** (`/root/autodl-fs/`): 网络存储，用于模型备份

#### 2.2 数据缓存
```bash
# 解压数据到临时存储
unzip dataset.zip -d /root/autodl-tmp/datasets/

# 预处理数据缓存
python -c "
import os
from pathlib import Path
# 创建预处理缓存目录
cache_dir = Path('/root/autodl-tmp/cache')
cache_dir.mkdir(exist_ok=True)
"
```

### 3. 训练优化

#### 3.1 混合精度训练
```python
# 自动启用混合精度（默认开启）
# 在RTX 20系列及更新GPU上可显著加速
```

#### 3.2 数据加载优化
```python
# 增加worker数量
# 在autodl_config.py中调整num_workers = min(8, cpu_count())

# 启用pin_memory
# 自动设置为True
```

#### 3.3 学习率调度
```python
# 自动使用ReduceLROnPlateau
# 根据验证集F1调整学习率
```

## 📊 监控和调试

### 1. 实时监控

#### 1.1 系统监控
```bash
# GPU监控
watch -n 1 nvidia-smi

# 内存监控
watch -n 5 free -h

# 磁盘监控
watch -n 10 df -h
```

#### 1.2 训练监控
```bash
# 查看训练日志
tail -f /root/autodl-fs/*/logs/training_*.log

# 查看模型保存情况
ls -la /root/autodl-fs/*/models/
```

### 2. 常见问题排查

#### 2.1 内存不足
```bash
# 检查GPU内存使用
python3 -c "
import torch
print(f'GPU Memory: {torch.cuda.get_device_properties(0).total_memory/1024**3:.1f}GB')
print(f'Allocated: {torch.cuda.memory_allocated()/1024**3:.1f}GB')
print(f'Cached: {torch.cuda.memory_reserved()/1024**3:.1f}GB')
"

# 清理缓存
torch.cuda.empty_cache()
```

#### 2.2 训练速度慢
```bash
# 检查数据加载瓶颈
# 在代码中添加时间统计
import time
start = time.time()
# 数据加载代码
print(f'Load time: {time.time()-start:.2f}s')
```

#### 2.3 模型不收敛
- 检查学习率设置
- 验证数据质量
- 尝试不同的损失函数
- 增加数据增强

### 3. 性能调优

#### 3.1 批次大小调优
```bash
# 从小batch开始测试
for bs in 8 16 32 64; do
    python scripts/train_autodl.py --batch_size $bs --epochs 5
    # 记录GPU使用率和训练速度
done
```

#### 3.2 图像尺寸调优
```bash
# 测试不同图像尺寸
for size in 224 256 320 384 512; do
    python scripts/train_autodl.py --img_size $size --epochs 5
    # 记录准确率和速度
done
```

## 💰 成本优化建议

### 1. 选择合适的实例
- **短期训练**：RTX 4090 (单价高但用时短)
- **长期训练**：RTX 3090 (性价比高)
- **实验测试**：RTX 3060 (经济实惠)

### 2. 时间管理
- **预估训练时间**：根据数据量和GPU性能
- **设置合理的早停**：避免无效训练
- **使用检查点**：支持断点续训

### 3. 存储优化
- **数据压缩**：使用压缩格式上传数据
- **及时清理**：训练结束后清理临时文件
- **增量备份**：只备份重要的模型文件

## 🚀 高级功能

### 1. 分布式训练
```bash
# 多GPU训练（如果有多个GPU）
python -m torch.distributed.launch \
  --nproc_per_node=2 \
  scripts/train_autodl.py \
  --data_dir /root/autodl-tmp/datasets/pathology_raw
```

### 2. 自动超参数调优
```bash
# 使用网格搜索
for lr in 0.001 0.0005 0.0001; do
  for bs in 16 32 64; do
    python scripts/train_autodl.py \
      --lr $lr --batch_size $bs \
      --experiment_name "tune_lr${lr}_bs${bs}"
  done
done
```

### 3. 模型集成
```bash
# 训练多个模型进行集成
for model_type in resnet50 efficientnet_b1 efficientnet_b2; do
  python scripts/train_autodl.py \
    --model_type $model_type \
    --experiment_name "ensemble_${model_type}"
done
```

## 📞 故障排除

### 常见问题及解决方案

1. **GPU内存不足**
   - 减小batch_size
   - 减小img_size  
   - 启用梯度累积

2. **训练速度慢**
   - 启用混合精度训练
   - 增加数据加载worker数量
   - 检查数据I/O瓶颈

3. **模型不收敛**
   - 调整学习率
   - 检查数据质量
   - 尝试不同损失函数

4. **连接中断**
   - 使用断点续训
   - 定期备份到持久化存储
   - 使用tmux/screen保持会话

5. **数据上传失败**
   - 使用压缩包上传
   - 分批上传大文件
   - 使用rsync替代scp

## 🎯 总结

AutoDL平台为组织病理CNN训练提供了强大的计算资源和灵活的配置选项。通过本指南的优化配置和最佳实践，您可以：

- ✅ 充分利用GPU资源，最大化训练效率
- ✅ 合理控制成本，避免资源浪费
- ✅ 确保训练稳定性和结果可靠性
- ✅ 实现高效的模型开发和迭代

开始您的AutoDL训练之旅吧！🚀