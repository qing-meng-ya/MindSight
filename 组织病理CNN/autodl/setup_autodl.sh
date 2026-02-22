#!/bin/bash

# AutoDL组织病理CNN训练环境配置脚本
# 用于在AutoDL平台上快速配置训练环境

set -e

echo "🚀 AutoDL组织病理CNN训练环境配置"
echo "=================================="

# 检测AutoDL环境
if [ -z "$AUTODL_JOB_ID" ]; then
    echo "⚠️  警告: 未检测到AutoDL环境变量"
    echo "请确保在AutoDL平台上运行此脚本"
fi

# 显示系统信息
echo "📊 系统信息:"
echo "   操作系统: $(lsb_release -d | cut -f2)"
echo "   内核版本: $(uname -r)"
echo "   GPU信息:"
nvidia-smi | head -10

# 检查Python环境
echo -e "\n🐍 Python环境:"
python3 --version
echo "   CUDA版本: $(python3 -c 'import torch; print(torch.version.cuda)')"
echo "   PyTorch版本: $(python3 -c 'import torch; print(torch.__version__)')"
echo "   GPU可用: $(python3 -c 'import torch; print(torch.cuda.is_available())')"

# 创建工作目录
echo -e "\n📁 创建工作目录..."
mkdir -p /root/pathology_cnn
cd /root/pathology_cnn

# 克隆项目（如果需要）
echo -e "\n📥 设置项目文件..."
# 这里需要用户上传或下载项目文件

# 安装额外依赖
echo -e "\n📦 安装依赖包..."
pip install -r requirements.txt

# 验证安装
echo -e "\n✅ 验证安装:"
python3 -c "
import torch
import cv2
import fastapi
print(f'PyTorch: {torch.__version__}')
print(f'OpenCV: {cv2.__version__}')
print(f'FastAPI: {fastapi.__version__}')
print(f'CUDA GPU数量: {torch.cuda.device_count()}')
if torch.cuda.is_available():
    for i in range(torch.cuda.device_count()):
        print(f'GPU {i}: {torch.cuda.get_device_name(i)}')
"

echo -e "\n🎯 AutoDL环境配置完成!"
echo "现在可以开始训练模型了"