#!/bin/bash

# 组织病理CNN识别系统快速启动脚本

set -e

echo "🚀 组织病理CNN识别系统快速启动"
echo "=================================="

# 检查Python环境
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 未安装，请先安装Python 3.8+"
    exit 1
fi

# 检查虚拟环境
if [[ "$VIRTUAL_ENV" == "" ]]; then
    echo "⚠️  建议在虚拟环境中运行"
    echo "创建虚拟环境: python3 -m venv venv && source venv/bin/activate"
    read -p "是否继续? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# 安装依赖
echo "📦 安装依赖包..."
pip install -r requirements.txt

# 检查CUDA
if command -v nvidia-smi &> /dev/null; then
    echo "✅ 检测到GPU，将使用CUDA加速"
    export CUDA_VISIBLE_DEVICES=0
else
    echo "⚠️  未检测到GPU，将使用CPU模式"
fi

# 创建必要的目录
echo "📁 创建目录结构..."
mkdir -p data/raw data/processed data/models evaluation_results

# 检查模型文件
if [[ ! -f "data/models/best_model.pth" ]]; then
    echo "⚠️  未找到训练好的模型文件"
    echo "请先训练模型或下载预训练模型到 data/models/ 目录"
    echo "训练命令: python scripts/train.py --data_dir data/raw"
    read -p "是否继续启动API服务? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# 启动API服务
echo "🌟 启动API服务..."
echo "服务地址: http://localhost:8000"
echo "API文档: http://localhost:8000/docs"
echo "健康检查: http://localhost:8000/health"
echo ""
echo "按 Ctrl+C 停止服务"
echo ""

# 启动主程序
python main.py