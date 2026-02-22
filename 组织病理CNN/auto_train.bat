@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

:: 组织病理CNN全自动训练脚本 (Windows版本)

echo 🚀 组织病理CNN全自动训练
echo ==================================

:: 颜色定义 (Windows 10+)
set "RED=[91m"
set "GREEN=[92m"
set "YELLOW=[93m"
set "BLUE=[94m"
set "NC=[0m"

:: 检查Python
echo %BLUE%ℹ️  检查Python环境...%NC%
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo %RED%❌ Python未安装，请先安装Python 3.8+%NC%
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('python --version') do echo %GREEN%✅ %%i%NC%

:: 检查GPU
nvidia-smi >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in ('nvidia-smi --query-gpu=name,memory.total --format=csv,noheader,nounits 2^>nul') do (
        echo %GREEN%✅ GPU: %%i%NC%
    )
    set USE_GPU=true
) else (
    echo %YELLOW%⚠️  未检测到GPU，将使用CPU训练%NC%
    set USE_GPU=false
)

:: 检查虚拟环境
if defined VIRTUAL_ENV (
    echo %GREEN%✅ 虚拟环境: %VIRTUAL_ENV%%NC%
) else (
    echo %YELLOW%⚠️  未检测到虚拟环境，建议使用虚拟环境%NC%
)

:: 安装依赖
echo.
echo %BLUE%ℹ️  安装依赖包...%NC%
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo %RED%❌ 依赖包安装失败%NC%
    pause
    exit /b 1
)
echo %GREEN%✅ 依赖包安装完成%NC%

:: 验证安装
python -c "import torch, cv2, fastapi; print(f'✅ PyTorch: {torch.__version__}'); print(f'✅ OpenCV: {cv2.__version__}'); print(f'✅ FastAPI: {fastapi.__version__}'); print(f'✅ CUDA可用: {torch.cuda.is_available()}')"

:: 准备目录
echo.
echo %BLUE%ℹ️  准备目录结构...%NC%
if not exist "data\raw" mkdir data\raw
if not exist "data\processed" mkdir data\processed
if not exist "data\models" mkdir data\models
if not exist "evaluation_results" mkdir evaluation_results
if not exist "logs" mkdir logs
echo %GREEN%✅ 目录结构创建完成%NC%

:: 检查训练数据
echo.
echo %BLUE%ℹ️  检查训练数据...%NC%
if not exist "data\raw" (
    echo %RED%❌ 数据目录不存在: data\raw%NC%
    echo 请按以下结构组织数据:
    echo data\raw\
    echo ├── 肺炎\
    echo │   ├── image001.jpg
    echo │   └── image002.jpg
    echo ├── 肺出血\
    echo └── ...
    pause
    exit /b 1
)

:: 统计数据
set TOTAL_IMAGES=0
set CLASS_COUNT=0
for /d %%d in (data\raw\*) do (
    set IMAGE_COUNT=0
    for %%f in ("%%d\*.jpg" "%%d\*.png" "%%d\*.tiff") do set /a IMAGE_COUNT+=1
    if !IMAGE_COUNT! gtr 0 (
        echo    %%~nd: !IMAGE_COUNT! 张图像
        set /a TOTAL_IMAGES+=!IMAGE_COUNT!
        set /a CLASS_COUNT+=1
    )
)

if !TOTAL_IMAGES! equ 0 (
    echo %RED%❌ 未找到有效的图像文件%NC%
    pause
    exit /b 1
)

echo %GREEN%✅ 数据检查完成: !CLASS_COUNT! 个类别, !TOTAL_IMAGES! 张图像%NC%

:: 选择最优配置
echo.
echo %BLUE%ℹ️  自动选择最优训练配置...%NC%

if "%USE_GPU%"=="true" (
    :: 获取GPU内存
    for /f "delims=" %%i in ('python -c "import torch; print(int(torch.cuda.get_device_properties(0).total_memory/1024**3) if torch.cuda.is_available() else 0)" 2^>nul') do set GPU_MEMORY=%%i
    
    echo %BLUE%ℹ️  GPU内存: !GPU_MEMORY!GB%NC%
    
    if !GPU_MEMORY! geq 24 (
        set MODEL_TYPE=efficientnet_b1
        set BATCH_SIZE=32
        set IMG_SIZE=384
        set EPOCHS=100
    ) else if !GPU_MEMORY! geq 16 (
        set MODEL_TYPE=resnet50
        set BATCH_SIZE=24
        set IMG_SIZE=320
        set EPOCHS=80
    ) else if !GPU_MEMORY! geq 12 (
        set MODEL_TYPE=resnet50
        set BATCH_SIZE=16
        set IMG_SIZE=256
        set EPOCHS=60
    ) else (
        set MODEL_TYPE=resnet34
        set BATCH_SIZE=8
        set IMG_SIZE=224
        set EPOCHS=40
    )
) else (
    set MODEL_TYPE=resnet34
    set BATCH_SIZE=4
    set IMG_SIZE=224
    set EPOCHS=20
)

echo %GREEN%✅ 训练配置:%NC%
echo    模型类型: !MODEL_TYPE!
echo    批次大小: !BATCH_SIZE!
echo    图像尺寸: !IMG_SIZE!
echo    训练轮次: !EPOCHS!

:: 保存配置
(
echo {
echo     "model_type": "!MODEL_TYPE!",
echo     "batch_size": !BATCH_SIZE!,
echo     "img_size": !IMG_SIZE!,
echo     "epochs": !EPOCHS!,
echo     "use_gpu": %USE_GPU%,
echo     "auto_config": true,
echo     "timestamp": "%date:~0,4%-%date:~5,2%-%date:~8,2%T%time:~0,2%:%time:~3,2%:%time:~6,2%"
echo }
) > training_config.json

echo %GREEN%✅ 配置已保存: training_config.json%NC%

:: 开始训练
echo.
echo %BLUE%ℹ️  开始自动训练...%NC%

set TRAIN_CMD=python scripts/train.py --data_dir data/raw --model_type !MODEL_TYPE! --batch_size !BATCH_SIZE! --img_size !IMG_SIZE! --epochs !EPOCHS! --loss_type focal --use_class_weights

if "%USE_GPU%"=="true" (
    set TRAIN_CMD=!TRAIN_CMD! --device cuda
) else (
    set TRAIN_CMD=!TRAIN_CMD! --device cpu
)

echo %BLUE%ℹ️  执行训练命令:%NC%
echo !TRAIN_CMD!
echo.

:: 记录开始时间
set START_TIME=%time%

:: 执行训练
!TRAIN_CMD!
if %errorlevel% neq 0 (
    echo %RED%❌ 训练失败!%NC%
    pause
    exit /b 1
)

echo %GREEN%✅ 训练完成!%NC%
echo %GREEN%✅ 训练用时: %START_TIME% -> %time%%NC%

:: 评估模型
echo.
echo %BLUE%ℹ️  开始模型评估...%NC%

set EVAL_CMD=python scripts/evaluate.py --data_dir data/raw --model_path data\models\best_model.pth --output_dir evaluation_results

!EVAL_CMD!
if %errorlevel% neq 0 (
    echo %YELLOW%⚠️  模型评估失败，但训练完成%NC%
) else (
    echo %GREEN%✅ 模型评估完成!%NC%
    echo %GREEN%✅ 评估结果保存在: evaluation_results\%NC%
)

:: 启动API服务
echo.
echo %BLUE%ℹ️  启动API服务...%NC%

if exist "data\models\best_model.pth" (
    echo %GREEN%✅ 找到训练好的模型，启动API服务...%NC%
    
    start /b python main.py > api_service.log 2>&1
    
    echo %GREEN%✅ API服务已启动%NC%
    echo %BLUE%ℹ️  API地址: http://localhost:8000%NC%
    echo %BLUE%ℹ️  API文档: http://localhost:8000/docs%NC%
    echo %BLUE%ℹ️  服务日志: api_service.log%NC%
    
    :: 等待服务启动
    timeout /t 5 >nul
    
    echo %GREEN%✅ API服务已就绪!%NC%
) else (
    echo %YELLOW%⚠️  未找到训练好的模型，跳过API启动%NC%
)

:: 生成报告
echo.
echo %BLUE%ℹ️  生成训练报告...%NC%

set REPORT_FILE=training_report_%date:~0,4%%date:~5,2%%date:~8,2%_%time:~0,2%%time:~3,2%.md

(
echo # 组织病理CNN训练报告
echo.
echo ## 训练配置
echo - 模型类型: !MODEL_TYPE!
echo - 批次大小: !BATCH_SIZE!
echo - 图像尺寸: !IMG_SIZE!
echo - 训练轮次: !EPOCHS!
echo - GPU加速: %USE_GPU%
echo - 训练时间: %date% %time%
echo.
echo ## 数据统计
echo - 总图像数: !TOTAL_IMAGES!
echo - 类别数: !CLASS_COUNT!
echo.
echo ## 模型文件
echo - 最佳模型: `data\models\best_model.pth`
echo - 最新模型: `data\models\latest_model.pth`
echo.
echo ## API服务
echo - API地址: http://localhost:8000
echo - API文档: http://localhost:8000/docs
echo - 健康检查: http://localhost:8000/health
) > "%REPORT_FILE%"

echo %GREEN%✅ 训练报告已生成: %REPORT_FILE%%NC%

echo.
echo %GREEN%🎉 全自动训练完成!%NC%
echo.
echo %BLUE%ℹ️  训练结果:%NC%
echo    ✅ 模型训练: data\models\best_model.pth
echo    ✅ 模型评估: evaluation_results\
echo    ✅ API服务: http://localhost:8000
echo    ✅ 训练报告: %REPORT_FILE%
echo.
echo %BLUE%ℹ️  您可以:%NC%
echo    1. 访问API文档: http://localhost:8000/docs
echo    2. 测试预测: curl -X POST http://localhost:8000/predict -F "file=@test_image.jpg"
echo    3. 查看服务日志: type api_service.log
echo.
pause