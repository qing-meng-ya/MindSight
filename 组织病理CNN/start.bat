@echo off
chcp 65001 >nul

echo 🚀 组织病理CNN识别系统快速启动
echo ==================================

REM 检查Python环境
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python未安装，请先安装Python 3.8+
    pause
    exit /b 1
)

REM 检查虚拟环境
if defined VIRTUAL_ENV (
    echo ✅ 检测到虚拟环境
) else (
    echo ⚠️  建议在虚拟环境中运行
    echo 创建虚拟环境: python -m venv venv && venv\Scripts\activate
    set /p continue="是否继续? (y/N): "
    if /i not "%continue%"=="y" exit /b 1
)

REM 安装依赖
echo 📦 安装依赖包...
pip install -r requirements.txt

REM 检查CUDA
nvidia-smi >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ 检测到GPU，将使用CUDA加速
    set CUDA_VISIBLE_DEVICES=0
) else (
    echo ⚠️  未检测到GPU，将使用CPU模式
)

REM 创建必要的目录
echo 📁 创建目录结构...
if not exist "data\raw" mkdir data\raw
if not exist "data\processed" mkdir data\processed
if not exist "data\models" mkdir data\models
if not exist "evaluation_results" mkdir evaluation_results

REM 检查模型文件
if not exist "data\models\best_model.pth" (
    echo ⚠️  未找到训练好的模型文件
    echo 请先训练模型或下载预训练模型到 data\models\ 目录
    echo 训练命令: python scripts\train.py --data_dir data\raw
    set /p continue="是否继续启动API服务? (y/N): "
    if /i not "%continue%"=="y" exit /b 1
)

REM 启动API服务
echo 🌟 启动API服务...
echo 服务地址: http://localhost:8000
echo API文档: http://localhost:8000/docs
echo 健康检查: http://localhost:8000/health
echo.
echo 按 Ctrl+C 停止服务
echo.

REM 启动主程序
python main.py