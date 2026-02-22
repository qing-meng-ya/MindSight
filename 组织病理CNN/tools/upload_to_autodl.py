"""
快速上传到AutoDL的脚本

帮助用户快速将项目文件和训练数据上传到AutoDL实例
"""

import os
import sys
import argparse
import subprocess
import json
from pathlib import Path
from datetime import datetime

class AutoDLUploader:
    """AutoDL文件上传器"""
    
    def __init__(self, host: str, username: str, password: str = None, key_file: str = None):
        """
        初始化上传器
        
        Args:
            host: AutoDL实例地址
            username: 用户名 (通常是 'root')
            password: 密码 (可选)
            key_file: SSH密钥文件 (可选)
        """
        self.host = host
        self.username = username
        self.password = password
        self.key_file = key_file
        
        # 验证连接参数
        if not password and not key_file:
            print("❌ 必须提供密码或SSH密钥文件")
            sys.exit(1)
    
    def get_ssh_command(self, command: str) -> str:
        """构建SSH命令"""
        ssh_cmd = f"ssh {self.username}@{self.host}"
        
        if self.key_file:
            ssh_cmd += f" -i {self.key_file}"
        
        ssh_cmd += f" '{command}'"
        return ssh_cmd
    
    def get_scp_command(self, source: str, dest: str, recursive: bool = False) -> str:
        """构建SCP命令"""
        scp_cmd = "scp"
        
        if self.key_file:
            scp_cmd += f" -i {self.key_file}"
        
        if recursive:
            scp_cmd += " -r"
        
        scp_cmd += f" {source} {self.username}@{self.host}:{dest}"
        return scp_cmd
    
    def test_connection(self) -> bool:
        """测试连接"""
        try:
            print("🔍 测试AutoDL连接...")
            cmd = self.get_ssh_command("echo 'Connection successful'")
            result = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=10)
            
            if result.returncode == 0:
                print("✅ 连接测试成功")
                return True
            else:
                print(f"❌ 连接测试失败: {result.stderr}")
                return False
                
        except subprocess.TimeoutExpired:
            print("❌ 连接超时")
            return False
        except Exception as e:
            print(f"❌ 连接错误: {e}")
            return False
    
    def upload_project(self, project_dir: str) -> bool:
        """上传项目文件"""
        project_path = Path(project_dir)
        if not project_path.exists():
            print(f"❌ 项目目录不存在: {project_dir}")
            return False
        
        print(f"📦 上传项目文件: {project_path}")
        
        try:
            # 创建远程目录
            remote_dir = "/root/pathology_cnn"
            mkdir_cmd = self.get_ssh_command(f"mkdir -p {remote_dir}")
            subprocess.run(mkdir_cmd, shell=True, check=True)
            
            # 上传项目文件
            exclude_patterns = [
                "__pycache__",
                "*.pyc", 
                ".git",
                "data/raw",
                "*.pth",
                "logs",
                "*.log"
            ]
            
            # 构建rsync命令（更高效）
            rsync_cmd = f"rsync -avz --progress"
            for pattern in exclude_patterns:
                rsync_cmd += f" --exclude {pattern}"
            
            if self.key_file:
                rsync_cmd += f" -e 'ssh -i {self.key_file}'"
            
            rsync_cmd += f" {project_path}/ {self.username}@{self.host}:{remote_dir}/"
            
            print(f"🚀 执行上传命令: {rsync_cmd}")
            result = subprocess.run(rsync_cmd, shell=True, check=True)
            
            print("✅ 项目文件上传成功")
            return True
            
        except subprocess.CalledProcessError as e:
            print(f"❌ 项目上传失败: {e}")
            return False
        except Exception as e:
            print(f"❌ 上传错误: {e}")
            return False
    
    def upload_data(self, data_dir: str, remote_data_dir: str = "/root/autodl-tmp/datasets/pathology_raw") -> bool:
        """上传训练数据"""
        data_path = Path(data_dir)
        if not data_path.exists():
            print(f"❌ 数据目录不存在: {data_dir}")
            return False
        
        print(f"📊 上传训练数据: {data_path}")
        
        try:
            # 创建远程数据目录
            mkdir_cmd = self.get_ssh_command(f"mkdir -p {remote_data_dir}")
            subprocess.run(mkdir_cmd, shell=True, check=True)
            
            # 上传数据
            scp_cmd = self.get_scp_command(f"{data_path}/*", remote_data_dir, recursive=True)
            print(f"🚀 执行数据上传...")
            result = subprocess.run(scp_cmd, shell=True, check=True)
            
            print("✅ 训练数据上传成功")
            return True
            
        except subprocess.CalledProcessError as e:
            print(f"❌ 数据上传失败: {e}")
            return False
        except Exception as e:
            print(f"❌ 上传错误: {e}")
            return False
    
    def setup_remote_environment(self) -> bool:
        """设置远程环境"""
        print("🔧 设置远程环境...")
        
        commands = [
            "mkdir -p /root/autodl-tmp/{datasets,models,logs}",
            "mkdir -p /root/autodl-fs",
            "cd /root/pathology_cnn",
            "pip install -r requirements.txt"
        ]
        
        for cmd in commands:
            try:
                ssh_cmd = self.get_ssh_command(cmd)
                print(f"  执行: {cmd}")
                subprocess.run(ssh_cmd, shell=True, check=True, timeout=60)
            except subprocess.TimeoutExpired:
                print(f"⚠️  命令超时，继续下一步: {cmd}")
            except subprocess.CalledProcessError as e:
                print(f"❌ 命令失败: {cmd}")
                return False
        
        print("✅ 远程环境设置完成")
        return True
    
    def verify_upload(self) -> bool:
        """验证上传结果"""
        print("🔍 验证上传结果...")
        
        commands = [
            "ls -la /root/pathology_cnn/",
            "ls -la /root/autodl-tmp/datasets/pathology_raw/ | head -10",
            "cd /root/pathology_cnn && python3 -c 'import torch; print(f\"PyTorch: {torch.__version__}\"); print(f\"CUDA: {torch.cuda.is_available()}\")'"
        ]
        
        for cmd in commands:
            try:
                ssh_cmd = self.get_ssh_command(cmd)
                result = subprocess.run(ssh_cmd, shell=True, capture_output=True, text=True, timeout=30)
                
                if result.returncode == 0:
                    print(f"✅ {cmd}")
                    print(result.stdout[:200])  # 只显示前200字符
                else:
                    print(f"❌ 失败: {cmd}")
                    print(result.stderr[:200])
                    
            except Exception as e:
                print(f"❌ 验证错误: {e}")
                return False
        
        return True

def create_deployment_script(host: str, username: str, data_dir: str) -> str:
    """创建远程部署脚本"""
    script_content = f"""#!/bin/bash
# AutoDL自动部署脚本
# 生成时间: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}

echo "🚀 AutoDL自动部署开始"

# 切换到项目目录
cd /root/pathology_cnn

# 检查环境
echo "📊 检查环境..."
python3 -c "import torch; print(f'PyTorch: {{torch.__version__}}'); print(f'CUDA: {{torch.cuda.is_available()}}')"
nvidia-smi | head -5

# 验证数据
echo "📁 验证训练数据..."
if [ -d "{data_dir}" ]; then
    find {data_dir} -name "*.jpg" -o -name "*.png" -o -name "*.tiff" | wc -l
else
    echo "❌ 数据目录不存在: {data_dir}"
    exit 1
fi

# 开始训练
echo "🏋️ 开始训练..."
python scripts/train_autodl.py \\
    --data_dir {data_dir} \\
    --epochs 100 \\
    --experiment_name "auto_deploy_$(date +%Y%m%d_%H%M%S)"

echo "🎉 训练完成!"
"""
    
    script_path = "autodl_deploy.sh"
    with open(script_path, 'w') as f:
        f.write(script_content)
    
    os.chmod(script_path, 0o755)
    return script_path

def main():
    """主函数"""
    parser = argparse.ArgumentParser(description="AutoDL快速上传工具")
    
    # 连接参数
    parser.add_argument("--host", required=True, help="AutoDL实例地址")
    parser.add_argument("--username", default="root", help="SSH用户名")
    parser.add_argument("--password", help="SSH密码")
    parser.add_argument("--key_file", help="SSH私钥文件")
    
    # 上传参数
    parser.add_argument("--project_dir", default=".", help="项目目录")
    parser.add_argument("--data_dir", required=True, help="训练数据目录")
    parser.add_argument("--skip_project", action="store_true", help="跳过项目上传")
    parser.add_argument("--skip_data", action="store_true", help="跳过数据上传")
    parser.add_argument("--skip_setup", action="store_true", help="跳过环境设置")
    
    args = parser.parse_args()
    
    # 创建上传器
    uploader = AutoDLUploader(
        host=args.host,
        username=args.username,
        password=args.password,
        key_file=args.key_file
    )
    
    print("🚀 AutoDL快速上传工具")
    print("=" * 50)
    
    # 测试连接
    if not uploader.test_connection():
        print("❌ 连接失败，请检查网络和认证信息")
        return 1
    
    # 上传项目文件
    if not args.skip_project:
        if not uploader.upload_project(args.project_dir):
            return 1
    
    # 上传训练数据
    if not args.skip_data:
        if not uploader.upload_data(args.data_dir):
            return 1
    
    # 设置远程环境
    if not args.skip_setup:
        if not uploader.setup_remote_environment():
            return 1
    
    # 验证上传
    if not uploader.verify_upload():
        print("⚠️  验证过程中发现一些问题")
    
    # 创建部署脚本
    remote_data_dir = "/root/autodl-tmp/datasets/pathology_raw"
    script_path = create_deployment_script(args.host, args.username, remote_data_dir)
    
    print(f"\n✅ 上传完成!")
    print(f"📝 部署脚本已生成: {script_path}")
    print(f"🔗 您可以 SSH 连接到 AutoDL 实例并运行训练:")
    print(f"   ssh {args.username}@{args.host}")
    print(f"   cd /root/pathology_cnn && python scripts/train_autodl.py --data_dir {remote_data_dir}")
    
    return 0

if __name__ == "__main__":
    sys.exit(main())