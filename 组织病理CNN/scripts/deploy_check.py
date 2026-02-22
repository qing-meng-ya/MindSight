"""
系统部署验证脚本

用于验证组织病理CNN识别系统的完整性和功能
"""

import os
import sys
import requests
import json
import time
from pathlib import Path

def check_environment():
    """检查环境配置"""
    print("🔍 检查环境配置...")
    
    issues = []
    
    # 检查Python版本
    if sys.version_info < (3, 8):
        issues.append(f"Python版本过低: {sys.version_info.major}.{sys.version_info.minor}")
    
    # 检查必要文件
    required_files = [
        "main.py",
        "requirements.txt",
        "configs/config.py",
        "src/models/cnn_model.py",
        "src/inference/predictor.py"
    ]
    
    for file in required_files:
        if not os.path.exists(file):
            issues.append(f"缺少必要文件: {file}")
    
    # 检查目录结构
    required_dirs = [
        "src",
        "configs",
        "data",
        "tests",
        "examples"
    ]
    
    for dir_name in required_dirs:
        if not os.path.isdir(dir_name):
            issues.append(f"缺少必要目录: {dir_name}")
    
    if issues:
        print("❌ 发现问题:")
        for issue in issues:
            print(f"   - {issue}")
        return False
    else:
        print("✅ 环境配置检查通过")
        return True

def check_dependencies():
    """检查依赖包"""
    print("\n📦 检查依赖包...")
    
    required_packages = [
        "torch",
        "fastapi", 
        "uvicorn",
        "pillow",
        "numpy",
        "opencv-python",
        "requests"
    ]
    
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package.replace("-", "_"))
        except ImportError:
            missing_packages.append(package)
    
    if missing_packages:
        print("❌ 缺少依赖包:")
        for package in missing_packages:
            print(f"   - {package}")
        print("请运行: pip install -r requirements.txt")
        return False
    else:
        print("✅ 依赖包检查通过")
        return True

def check_data_structure():
    """检查数据结构"""
    print("\n📁 检查数据结构...")
    
    warnings = []
    
    # 检查数据目录
    data_dirs = ["data/raw", "data/processed", "data/models"]
    for dir_path in data_dirs:
        if not os.path.exists(dir_path):
            os.makedirs(dir_path, exist_ok=True)
            print(f"   创建目录: {dir_path}")
    
    # 检查模型文件
    model_files = [
        "data/models/best_model.pth",
        "data/models/latest_model.pth"
    ]
    
    model_found = False
    for model_file in model_files:
        if os.path.exists(model_file):
            model_found = True
            print(f"✅ 找到模型文件: {model_file}")
            break
    
    if not model_found:
        warnings.append("未找到训练好的模型文件")
        print("⚠️  未找到模型文件，API将使用默认配置")
    
    return warnings

def test_api_service():
    """测试API服务"""
    print("\n🚀 测试API服务...")
    
    base_url = "http://localhost:8000"
    
    # 检查服务是否运行
    try:
        response = requests.get(f"{base_url}/health", timeout=5)
        if response.status_code == 200:
            print("✅ API服务运行正常")
            health_data = response.json()
            print(f"   状态: {health_data.get('status', 'unknown')}")
            print(f"   模型已加载: {health_data.get('model_loaded', False)}")
            return True
        else:
            print(f"❌ API服务响应异常: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ 无法连接到API服务")
        print("   请确保服务正在运行: python main.py")
        return False
    except Exception as e:
        print(f"❌ API测试失败: {e}")
        return False

def test_api_endpoints():
    """测试API端点"""
    print("\n🔗 测试API端点...")
    
    base_url = "http://localhost:8000"
    endpoints = [
        ("/", "根路径"),
        ("/classes", "病理类型"),
        ("/model_info", "模型信息"),
        ("/statistics", "统计数据")
    ]
    
    success_count = 0
    
    for endpoint, description in endpoints:
        try:
            response = requests.get(f"{base_url}{endpoint}", timeout=5)
            if response.status_code == 200:
                print(f"   ✅ {description} - 正常")
                success_count += 1
            else:
                print(f"   ❌ {description} - HTTP {response.status_code}")
        except Exception as e:
            print(f"   ❌ {description} - 错误: {e}")
    
    print(f"\n📊 端点测试结果: {success_count}/{len(endpoints)} 成功")
    return success_count == len(endpoints)

def check_docker_setup():
    """检查Docker配置"""
    print("\n🐳 检查Docker配置...")
    
    docker_files = ["Dockerfile", "docker-compose.yml", "nginx.conf"]
    found_files = []
    
    for file in docker_files:
        if os.path.exists(file):
            found_files.append(file)
    
    if len(found_files) >= 2:
        print(f"✅ Docker配置文件完整: {', '.join(found_files)}")
        return True
    else:
        print(f"⚠️  Docker配置不完整，找到: {', '.join(found_files)}")
        return False

def check_documentation():
    """检查文档完整性"""
    print("\n📚 检查文档...")
    
    doc_files = [
        "README.md",
        "docs/USER_GUIDE.md",
        "examples/api_demo.py",
        "tests/test_api.py"
    ]
    
    found_docs = []
    
    for file in doc_files:
        if os.path.exists(file):
            found_docs.append(file)
    
    print(f"✅ 文档文件: {len(found_docs)}/{len(doc_files)} 完整")
    
    missing_docs = set(doc_files) - set(found_docs)
    if missing_docs:
        print(f"⚠️  缺少文档: {', '.join(missing_docs)}")
    
    return len(missing_docs) == 0

def generate_deployment_report():
    """生成部署报告"""
    print("\n📋 生成部署报告...")
    
    report = {
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
        "system_info": {
            "python_version": f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}",
            "platform": sys.platform
        },
        "checks": {
            "environment": check_environment(),
            "dependencies": check_dependencies(),
            "data_structure": len(check_data_structure()) == 0,
            "api_service": test_api_service(),
            "api_endpoints": test_api_endpoints(),
            "docker_setup": check_docker_setup(),
            "documentation": check_documentation()
        }
    }
    
    # 计算总体状态
    passed_checks = sum(1 for check in report["checks"].values() if check)
    total_checks = len(report["checks"])
    report["overall_status"] = {
        "passed": passed_checks,
        "total": total_checks,
        "percentage": passed_checks / total_checks * 100
    }
    
    # 保存报告
    report_file = f"deployment_report_{time.strftime('%Y%m%d_%H%M%S')}.json"
    with open(report_file, 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2, ensure_ascii=False)
    
    print(f"✅ 部署报告已保存: {report_file}")
    
    return report

def print_final_summary(report):
    """打印最终摘要"""
    print("\n" + "="*60)
    print("🏁 部署验证完成")
    print("="*60)
    
    status = report["overall_status"]
    print(f"总体状态: {status['passed']}/{status['total']} 通过 ({status['percentage']:.1f}%)")
    
    print("\n📊 详细结果:")
    for check_name, result in report["checks"].items():
        status_icon = "✅" if result else "❌"
        print(f"{status_icon} {check_name}: {'通过' if result else '失败'}")
    
    if status["percentage"] >= 80:
        print("\n🎉 系统部署成功！可以开始使用组织病理识别服务")
    else:
        print("\n⚠️  发现一些问题，请根据上述检查结果进行修复")
    
    print("\n🚀 快速启动:")
    print("  本地运行: python main.py")
    print("  Docker: docker-compose up -d")
    print("  文档: http://localhost:8000/docs")

def main():
    """主函数"""
    print("🧪 组织病理CNN识别系统部署验证")
    print("=" * 60)
    
    # 生成完整的部署报告
    report = generate_deployment_report()
    
    # 打印最终摘要
    print_final_summary(report)
    
    return report["overall_status"]["percentage"] >= 80

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)