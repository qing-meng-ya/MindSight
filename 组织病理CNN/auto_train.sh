#!/bin/bash

# 组织病理CNN全自动训练脚本
# 只需要准备数据，其他全部自动化

set -e

echo "🚀 组织病理CNN全自动训练"
echo "=================================="

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# 检查系统环境
check_environment() {
    log_info "检查系统环境..."
    
    # 检查Python
    if ! command -v python3 &> /dev/null; then
        log_error "Python3未安装，请先安装Python 3.8+"
        exit 1
    fi
    log_success "Python: $(python3 --version)"
    
    # 检查GPU
    if command -v nvidia-smi &> /dev/null; then
        GPU_INFO=$(nvidia-smi --query-gpu=name,memory.total --format=csv,noheader,nounits | head -1)
        log_success "GPU: $GPU_INFO"
        export CUDA_VISIBLE_DEVICES=0
        USE_GPU=true
    else
        log_warning "未检测到GPU，将使用CPU训练"
        USE_GPU=false
    fi
    
    # 检查虚拟环境
    if [[ "$VIRTUAL_ENV" != "" ]]; then
        log_success "虚拟环境: $VIRTUAL_ENV"
    else
        log_warning "未检测到虚拟环境，建议使用虚拟环境"
    fi
}

# 自动安装依赖
install_dependencies() {
    log_info "检查并安装依赖包..."
    
    # 升级pip
    python3 -m pip install --upgrade pip
    
    # 安装依赖
    if python3 -m pip install -r requirements.txt; then
        log_success "依赖包安装完成"
    else
        log_error "依赖包安装失败"
        exit 1
    fi
    
    # 验证关键包
    python3 -c "
import torch, cv2, fastapi
print(f'✅ PyTorch: {torch.__version__}')
print(f'✅ OpenCV: {cv2.__version__}')
print(f'✅ FastAPI: {fastapi.__version__}')
print(f'✅ CUDA可用: {torch.cuda.is_available()}')
"
}

# 准备数据目录
prepare_directories() {
    log_info "准备目录结构..."
    
    # 创建必要目录
    mkdir -p data/raw data/processed data/models
    mkdir -p evaluation_results logs
    log_success "目录结构创建完成"
}

# 检查训练数据
check_training_data() {
    log_info "检查训练数据..."
    
    if [[ ! -d "data/raw" ]]; then
        log_error "数据目录不存在: data/raw"
        echo "请按以下结构组织数据:"
        echo "data/raw/"
        echo "├── 肺炎/"
        echo "│   ├── image001.jpg"
        echo "│   └── image002.jpg"
        echo "├── 肺出血/"
        echo "└── ..."
        exit 1
    fi
    
    # 统计数据
    TOTAL_IMAGES=0
    CLASS_COUNT=0
    for class_dir in data/raw/*/; do
        if [[ -d "$class_dir" ]]; then
            CLASS_NAME=$(basename "$class_dir")
            IMAGE_COUNT=$(find "$class_dir" -type f \( -name "*.jpg" -o -name "*.png" -o -name "*.tiff" \) | wc -l)
            if [[ $IMAGE_COUNT -gt 0 ]]; then
                echo "   $CLASS_NAME: $IMAGE_COUNT 张图像"
                TOTAL_IMAGES=$((TOTAL_IMAGES + IMAGE_COUNT))
                CLASS_COUNT=$((CLASS_COUNT + 1))
            fi
        fi
    done
    
    if [[ $TOTAL_IMAGES -eq 0 ]]; then
        log_error "未找到有效的图像文件"
        exit 1
    fi
    
    log_success "数据检查完成: $CLASS_COUNT 个类别, $TOTAL_IMAGES 张图像"
    
    # 检查数据充足性
    if [[ $TOTAL_IMAGES -lt 100 ]]; then
        log_warning "数据量较少 (<100张)，可能影响训练效果"
    elif [[ $TOTAL_IMAGES -lt 500 ]]; then
        log_warning "数据量适中 (100-500张)，建议增加数据"
    else
        log_success "数据量充足 (>500张)"
    fi
}

# 自动选择最优配置
select_optimal_config() {
    log_info "自动选择最优训练配置..."
    
    if [[ "$USE_GPU" == "true" ]]; then
        # 获取GPU内存
        GPU_MEMORY=$(python3 -c "
import torch
if torch.cuda.is_available():
    memory_gb = torch.cuda.get_device_properties(0).total_memory / 1024**3
    print(f'{memory_gb:.0f}')
else:
    print('0')
" 2>/dev/null || echo "0")
        
        log_info "GPU内存: ${GPU_MEMORY}GB"
        
        # 根据GPU内存选择配置
        if [[ $GPU_MEMORY -ge 24 ]]; then
            # RTX 4090/3090/A100
            MODEL_TYPE="efficientnet_b1"
            BATCH_SIZE=32
            IMG_SIZE=384
            EPOCHS=100
        elif [[ $GPU_MEMORY -ge 16 ]]; then
            # RTX 3080/4080
            MODEL_TYPE="resnet50"
            BATCH_SIZE=24
            IMG_SIZE=320
            EPOCHS=80
        elif [[ $GPU_MEMORY -ge 12 ]]; then
            # RTX 3060/3070
            MODEL_TYPE="resnet50"
            BATCH_SIZE=16
            IMG_SIZE=256
            EPOCHS=60
        else
            # 小GPU或CPU
            MODEL_TYPE="resnet34"
            BATCH_SIZE=8
            IMG_SIZE=224
            EPOCHS=40
        fi
    else
        # CPU训练
        MODEL_TYPE="resnet34"
        BATCH_SIZE=4
        IMG_SIZE=224
        EPOCHS=20
    fi
    
    log_success "训练配置:"
    echo "   模型类型: $MODEL_TYPE"
    echo "   批次大小: $BATCH_SIZE"
    echo "   图像尺寸: $IMG_SIZE"
    echo "   训练轮次: $EPOCHS"
    
    # 保存配置到文件
    cat > training_config.json << EOF
{
    "model_type": "$MODEL_TYPE",
    "batch_size": $BATCH_SIZE,
    "img_size": $IMG_SIZE,
    "epochs": $EPOCHS",
    "use_gpu": $USE_GPU,
    "auto_config": true,
    "timestamp": "$(date -Iseconds)"
}
EOF
    
    log_success "配置已保存: training_config.json"
}

# 开始训练
start_training() {
    log_info "开始自动训练..."
    
    # 构建训练命令
    TRAIN_CMD="python scripts/train.py \
        --data_dir data/raw \
        --model_type $MODEL_TYPE \
        --batch_size $BATCH_SIZE \
        --img_size $IMG_SIZE \
        --epochs $EPOCHS \
        --loss_type focal \
        --use_class_weights"
    
    if [[ "$USE_GPU" == "true" ]]; then
        TRAIN_CMD="$TRAIN_CMD --device cuda"
    else
        TRAIN_CMD="$TRAIN_CMD --device cpu"
    fi
    
    log_info "执行训练命令:"
    echo "$TRAIN_CMD"
    echo ""
    
    # 开始训练计时
    TRAIN_START_TIME=$(date +%s)
    
    # 执行训练
    if eval "$TRAIN_CMD"; then
        TRAIN_END_TIME=$(date +%s)
        TRAIN_DURATION=$((TRAIN_END_TIME - TRAIN_START_TIME))
        TRAIN_HOURS=$((TRAIN_DURATION / 3600))
        TRAIN_MINUTES=$(((TRAIN_DURATION % 3600) / 60))
        
        log_success "训练完成!"
        log_success "训练用时: ${TRAIN_HOURS}小时${TRAIN_MINUTES}分钟"
    else
        log_error "训练失败!"
        exit 1
    fi
}

# 自动评估模型
evaluate_model() {
    log_info "开始模型评估..."
    
    # 评估命令
    EVAL_CMD="python scripts/evaluate.py \
        --data_dir data/raw \
        --model_path data/models/best_model.pth \
        --output_dir evaluation_results"
    
    if eval "$EVAL_CMD"; then
        log_success "模型评估完成!"
        log_success "评估结果保存在: evaluation_results/"
        
        # 显示关键指标
        if [[ -f "evaluation_results/evaluation_report_*.json" ]]; then
            python3 -c "
import json
import glob
latest_file = max(glob.glob('evaluation_results/evaluation_report_*.json'))
with open(latest_file) as f:
    report = json.load(f)

if 'performance_evaluation' in report:
    perf = report['performance_evaluation']['basic_metrics']
    print(f'📊 模型性能指标:')
    print(f'   准确率: {perf[\"accuracy\"]:.3f}')
    print(f'   F1分数: {perf[\"macro_f1\"]:.3f}')
    print(f'   精确率: {perf[\"macro_precision\"]:.3f}')
    print(f'   召回率: {perf[\"macro_recall\"]:.3f}')
"
        fi
    else
        log_warning "模型评估失败，但训练完成"
    fi
}

# 启动API服务
start_api_service() {
    log_info "启动API服务..."
    
    # 检查模型文件
    if [[ -f "data/models/best_model.pth" ]]; then
        log_success "找到训练好的模型，启动API服务..."
        
        # 启动API（后台运行）
        nohup python main.py > api_service.log 2>&1 &
        API_PID=$!
        
        log_success "API服务已启动 (PID: $API_PID)"
        log_info "API地址: http://localhost:8000"
        log_info "API文档: http://localhost:8000/docs"
        log_info "服务日志: api_service.log"
        
        # 保存PID到文件
        echo $API_PID > api_service.pid
        log_success "API PID已保存: api_service.pid"
        
        # 等待服务启动
        sleep 5
        
        # 测试API
        if curl -s http://localhost:8000/health > /dev/null; then
            log_success "API服务测试通过!"
        else
            log_warning "API服务可能还在启动中，请稍后测试"
        fi
        
    else
        log_warning "未找到训练好的模型，跳过API启动"
    fi
}

# 生成训练报告
generate_report() {
    log_info "生成训练报告..."
    
    REPORT_FILE="training_report_$(date +%Y%m%d_%H%M%S).md"
    
    cat > "$REPORT_FILE" << EOF
# 组织病理CNN训练报告

## 训练配置
- 模型类型: $MODEL_TYPE
- 批次大小: $BATCH_SIZE
- 图像尺寸: $IMG_SIZE
- 训练轮次: $EPOCHS
- GPU加速: $USE_GPU
- 训练时间: $(date)

## 数据统计
EOF
    
    if [[ -f "training_config.json" ]]; then
        python3 -c "
import json
import os
from pathlib import Path

# 统计数据
data_dir = Path('data/raw')
total_images = 0
class_stats = {}

if data_dir.exists():
    for class_dir in data_dir.iterdir():
        if class_dir.is_dir():
            images = list(class_dir.glob('*.jpg')) + list(class_dir.glob('*.png')) + list(class_dir.glob('*.tiff'))
            class_stats[class_dir.name] = len(images)
            total_images += len(images)

print('### 数据分布')
print(f'- 总图像数: {total_images}')
print(f'- 类别数: {len(class_stats)}')
print('')
print('#### 各类别数量')
for class_name, count in sorted(class_stats.items()):
    print(f'- {class_name}: {count} 张')
" >> "$REPORT_FILE"
    fi
    
    echo "" >> "$REPORT_FILE"
    echo "## 模型文件" >> "$REPORT_FILE"
    echo "- 最佳模型: \`data/models/best_model.pth\`" >> "$REPORT_FILE"
    echo "- 最新模型: \`data/models/latest_model.pth\`" >> "$REPORT_FILE"
    echo "- 训练历史: \`data/models/training_history/\`" >> "$REPORT_FILE"
    
    echo "" >> "$REPORT_FILE"
    echo "## API服务" >> "$REPORT_FILE"
    echo "- API地址: http://localhost:8000" >> "$REPORT_FILE"
    echo "- API文档: http://localhost:8000/docs" >> "$REPORT_FILE"
    echo "- 健康检查: http://localhost:8000/health" >> "$REPORT_FILE"
    
    log_success "训练报告已生成: $REPORT_FILE"
}

# 主函数
main() {
    echo "🤖 组织病理CNN全自动训练系统"
    echo "=================================="
    echo ""
    
    # 检查是否在正确的目录
    if [[ ! -f "main.py" ]] || [[ ! -f "requirements.txt" ]]; then
        log_error "请在项目根目录运行此脚本"
        exit 1
    fi
    
    # 执行训练流程
    check_environment
    install_dependencies
    prepare_directories
    check_training_data
    select_optimal_config
    
    echo ""
    log_info "🚀 开始全自动训练流程"
    echo ""
    
    start_training
    evaluate_model
    start_api_service
    generate_report
    
    echo ""
    log_success "🎉 全自动训练完成!"
    echo ""
    log_info "📊 训练结果:"
    echo "   ✅ 模型训练: data/models/best_model.pth"
    echo "   ✅ 模型评估: evaluation_results/"
    echo "   ✅ API服务: http://localhost:8000"
    echo "   ✅ 训练报告: training_report_*.md"
    echo ""
    log_info "🚀 您可以:"
    echo "   1. 访问API文档: http://localhost:8000/docs"
    echo "   2. 测试预测: curl -X POST http://localhost:8000/predict -F 'file=@test_image.jpg'"
    echo "   3. 停止API: kill \$(cat api_service.pid)"
    echo ""
}

# 错误处理
trap 'log_error "训练过程中断"; exit 1' INT TERM

# 执行主函数
main "$@"