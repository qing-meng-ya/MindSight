#!/bin/bash

# AutoDL组织病理CNN训练脚本
# 针对AutoDL云服务器优化

set -e

echo "🚀 AutoDL组织病理CNN训练启动"
echo "=========================="

# AutoDL环境变量检查
if [ -z "$AUTODL_JOB_ID" ]; then
    echo "⚠️  警告: 未检测到AutoDL环境"
    echo "请确保在AutoDL平台上运行"
fi

# 设置环境变量
export CUDA_VISIBLE_DEVICES=0
export PYTHONPATH="/root/pathology_cnn:$PYTHONPATH"

# 创建必要目录
mkdir -p /root/autodl-tmp/{datasets,models,logs}
mkdir -p /root/autodl-fs

# GPU信息
echo "📊 GPU信息:"
nvidia-smi --query-gpu=name,memory.total,memory.used,memory.free --format=csv,noheader,nounits

# 数据准备函数
prepare_data() {
    echo "📥 准备训练数据..."
    
    # 检查数据目录
    if [ ! -d "/root/autodl-tmp/datasets/pathology_raw" ]; then
        echo "❌ 数据目录不存在: /root/autodl-tmp/datasets/pathology_raw"
        echo "请上传数据集到该目录"
        exit 1
    fi
    
    # 统计数据
    echo "📈 数据统计:"
    find /root/autodl-tmp/datasets/pathology_raw -name "*.jpg" -o -name "*.png" -o -name "*.tiff" | wc -l
}

# 训练函数
start_training() {
    echo "🏋️ 开始模型训练..."
    
    # 获取最优配置
    python3 -c "
from autodl.autodl_config import AutoDLConfig
config = AutoDLConfig.get_optimized_config()
print('🎯 训练配置:')
print(f'  模型类型: {config[\"model\"][\"model_type\"]}')
print(f'  批次大小: {config[\"training\"][\"batch_size\"]}')
print(f'  图像尺寸: {config[\"training\"][\"img_size\"]}')
print(f'  学习率: {config[\"training\"][\"learning_rate\"]}')
print(f'  训练轮次: {config[\"training\"][\"epochs\"]}')
"
    
    # 生成训练命令
    TRAIN_CMD=$(python3 -c "
from autodl.autodl_config import AutoDLConfig
print(AutoDLConfig.create_training_command('/root/autodl-tmp/datasets/pathology_raw'))
")
    
    echo "🔧 执行训练命令:"
    echo "$TRAIN_CMD"
    
    # 执行训练
    cd /root/pathology_cnn
    eval "$TRAIN_CMD"
}

# 监控函数
monitor_training() {
    echo "📊 开始训练监控..."
    
    # 在后台启动监控脚本
    python3 -c "
import time
import torch
from autodl.autodl_config import GPUMemoryMonitor

monitor = GPUMemoryMonitor()

while True:
    try:
        monitor.print_memory_info()
        print('='*50)
        time.sleep(60)  # 每分钟监控一次
    except KeyboardInterrupt:
        break
" &
    
    MONITOR_PID=$!
    echo "监控进程ID: $MONITOR_PID"
}

# 备份函数
backup_results() {
    echo "💾 备份训练结果..."
    
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    BACKUP_DIR="/root/autodl-fs/backup_$TIMESTAMP"
    
    mkdir -p "$BACKUP_DIR"
    
    # 备份模型文件
    if [ -d "/root/autodl-tmp/models" ]; then
        cp -r /root/autodl-tmp/models "$BACKUP_DIR/"
        echo "✅ 模型文件已备份"
    fi
    
    # 备份日志文件
    if [ -d "/root/autodl-tmp/logs" ]; then
        cp -r /root/autodl-tmp/logs "$BACKUP_DIR/"
        echo "✅ 日志文件已备份"
    fi
    
    # 备份配置文件
    cp /root/pathology_cnn/configs/config.py "$BACKUP_DIR/"
    echo "✅ 配置文件已备份"
    
    echo "📦 备份完成: $BACKUP_DIR"
}

# 清理函数
cleanup() {
    echo "🧹 清理临时文件..."
    
    # 清理GPU缓存
    python3 -c "import torch; torch.cuda.empty_cache()" 2>/dev/null || true
    
    # 清理临时文件
    rm -rf /tmp/* 2>/dev/null || true
    
    echo "✅ 清理完成"
}

# 主流程
main() {
    echo "开始AutoDL训练流程..."
    
    # 检查环境
    if ! command -v python3 &> /dev/null; then
        echo "❌ Python3未安装"
        exit 1
    fi
    
    # 数据准备
    prepare_data
    
    # 启动监控
    monitor_training
    
    # 开始训练
    start_training
    
    # 备份结果
    backup_results
    
    # 清理
    cleanup
    
    echo "🎉 AutoDL训练完成!"
}

# 信号处理
trap 'echo "收到中断信号，开始清理..."; cleanup; backup_results; exit 1' INT TERM

# 执行主流程
main "$@"