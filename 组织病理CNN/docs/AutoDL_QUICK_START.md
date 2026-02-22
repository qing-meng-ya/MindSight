# AutoDL训练快速开始指南

## 🎯 一键上传到AutoDL

### 步骤1：获取AutoDL实例信息
```bash
# 从AutoDL控制台获取以下信息：
# - 实例地址：例如 123.45.67.89:22
# - 用户名：通常是 root
# - 密码或SSH密钥
```

### 步骤2：使用快速上传工具
```bash
# 方式一：使用密码认证
python tools/upload_to_autodl.py \
  --host "123.45.67.89" \
  --username "root" \
  --password "your_password" \
  --data_dir "/path/to/your/data"

# 方式二：使用SSH密钥认证（推荐）
python tools/upload_to_autodl.py \
  --host "123.45.67.89" \
  --username "root" \
  --key_file "~/.ssh/autodl_key" \
  --data_dir "/path/to/your/data"
```

### 步骤3：开始训练
```bash
# SSH连接到AutoDL实例
ssh root@123.45.67.89

# 进入项目目录
cd /root/pathology_cnn

# 开始训练（自动优化配置）
python scripts/train_autodl.py \
  --data_dir /root/autodl-tmp/datasets/pathology_raw \
  --epochs 100
```

## 🚀 AutoDL配置建议

| GPU型号 | 推荐配置 | 预期训练时间 (每epoch) |
|---------|----------|---------------------|
| RTX 4090 | batch=32, img=384 | ~2-3分钟 |
| RTX 3090 | batch=32, img=320 | ~3-4分钟 |
| A100 | batch=64, img=512 | ~1-2分钟 |
| RTX 3080 | batch=16, img=256 | ~4-5分钟 |

## 📊 监控训练进度
```bash
# 查看实时GPU状态
watch -n 2 nvidia-smi

# 查看训练日志
tail -f /root/autodl-fs/*/logs/training_*.log

# 查看最佳模型
ls -la /root/autodl-fs/*/models/best_model.pth
```

## 🔧 常用命令
```bash
# 检查数据目录结构
tree /root/autodl-tmp/datasets/pathology_raw/

# 查看训练配置
cat /root/autodl-fs/*/config.json

# 下载训练好的模型
scp root@123.45.67.89:/root/autodl-fs/*/models/best_model.pth ./
```

## ❓ 故障排除

### 连接问题
```bash
# 检查网络连通性
ping 123.45.67.89

# 测试SSH连接
ssh -v root@123.45.67.89
```

### 内存不足
```bash
# 减小批次大小
python scripts/train_autodl.py --batch_size 16

# 或减小图像尺寸
python scripts/train_autodl.py --img_size 224
```

### 训练中断
```bash
# 查看检查点文件
ls -la /root/autodl-fs/*/models/

# 从检查点恢复训练
python scripts/train_autodl.py --data_dir /root/autodl-tmp/datasets/pathology_raw --resume
```

---

🎉 **现在您可以开始在AutoDL上训练您的组织病理CNN模型了！**

更多详细信息请查看：[AutoDL训练完整指南](docs/AutoDL_TRAINING_GUIDE.md)