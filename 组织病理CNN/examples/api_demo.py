"""
API使用示例脚本

演示如何使用组织病理识别API的各种功能
"""

import requests
import json
import os
import time
from typing import Dict, List, Optional

class PathologyAPIClient:
    """组织病理API客户端"""
    
    def __init__(self, base_url: str = "http://localhost:8000"):
        """
        初始化API客户端
        
        Args:
            base_url: API基础URL
        """
        self.base_url = base_url
        self.session = requests.Session()
    
    def health_check(self) -> Dict:
        """健康检查"""
        try:
            response = self.session.get(f"{self.base_url}/health")
            return response.json()
        except Exception as e:
            return {"error": str(e)}
    
    def get_model_info(self) -> Dict:
        """获取模型信息"""
        try:
            response = self.session.get(f"{self.base_url}/model_info")
            return response.json()
        except Exception as e:
            return {"error": str(e)}
    
    def get_supported_classes(self) -> Dict:
        """获取支持的病理类型"""
        try:
            response = self.session.get(f"{self.base_url}/classes")
            return response.json()
        except Exception as e:
            return {"error": str(e)}
    
    def predict_image(self, image_path: str) -> Dict:
        """
        预测单张图像
        
        Args:
            image_path: 图像文件路径
            
        Returns:
            预测结果
        """
        if not os.path.exists(image_path):
            return {"error": f"图像文件不存在: {image_path}"}
        
        try:
            with open(image_path, 'rb') as f:
                files = {'file': f}
                response = self.session.post(f"{self.base_url}/predict", files=files)
                return response.json()
        except Exception as e:
            return {"error": str(e)}
    
    def predict_batch(self, image_paths: List[str]) -> Dict:
        """
        批量预测图像
        
        Args:
            image_paths: 图像文件路径列表
            
        Returns:
            批量预测结果
        """
        if len(image_paths) > 20:
            return {"error": "批量处理最多支持20张图像"}
        
        files = []
        try:
            for image_path in image_paths:
                if os.path.exists(image_path):
                    files.append(('files', open(image_path, 'rb')))
                else:
                    return {"error": f"图像文件不存在: {image_path}"}
            
            response = self.session.post(f"{self.base_url}/predict_batch", files=files)
            
            # 关闭文件
            for _, f in files:
                f.close()
            
            return response.json()
        except Exception as e:
            return {"error": str(e)}
    
    def generate_diagnosis_report(
        self, 
        image_path: str, 
        patient_info: Optional[Dict] = None
    ) -> Dict:
        """
        生成诊断报告
        
        Args:
            image_path: 图像文件路径
            patient_info: 患者信息字典
            
        Returns:
            诊断报告
        """
        if not os.path.exists(image_path):
            return {"error": f"图像文件不存在: {image_path}"}
        
        try:
            with open(image_path, 'rb') as f:
                files = {'file': f}
                data = {}
                
                if patient_info:
                    data['patient_info'] = json.dumps(patient_info, ensure_ascii=False)
                
                response = self.session.post(
                    f"{self.base_url}/diagnose", 
                    files=files, 
                    data=data
                )
                return response.json()
        except Exception as e:
            return {"error": str(e)}
    
    def predict_with_report(
        self, 
        image_path: str, 
        patient_info: Optional[Dict] = None
    ) -> Dict:
        """
        预测并包含简化的诊断报告
        
        Args:
            image_path: 图像文件路径
            patient_info: 患者信息字典
            
        Returns:
            预测结果和报告
        """
        if not os.path.exists(image_path):
            return {"error": f"图像文件不存在: {image_path}"}
        
        try:
            with open(image_path, 'rb') as f:
                files = {'file': f}
                data = {}
                
                if patient_info:
                    data['patient_info'] = json.dumps(patient_info, ensure_ascii=False)
                
                response = self.session.post(
                    f"{self.base_url}/predict_with_report", 
                    files=files, 
                    data=data
                )
                return response.json()
        except Exception as e:
            return {"error": str(e)}

def demo_basic_usage():
    """演示基础使用"""
    print("🚀 组织病理识别API基础使用演示")
    print("=" * 50)
    
    # 初始化客户端
    client = PathologyAPIClient()
    
    # 1. 健康检查
    print("\n1️⃣ 健康检查...")
    health = client.health_check()
    if "error" in health:
        print(f"❌ 服务不可用: {health['error']}")
        return
    print(f"✅ 服务状态: {health.get('status', 'unknown')}")
    print(f"   模型已加载: {health.get('model_loaded', False)}")
    
    # 2. 获取模型信息
    print("\n2️⃣ 获取模型信息...")
    model_info = client.get_model_info()
    if "error" not in model_info:
        print(f"✅ 模型类型: {model_info.get('model_type', 'unknown')}")
        print(f"   训练轮次: {model_info.get('training_epoch', 0)}")
        print(f"   支持类别: {model_info.get('num_classes', 0)}")
    
    # 3. 获取支持的病理类型
    print("\n3️⃣ 获取支持的病理类型...")
    classes = client.get_supported_classes()
    if "error" not in classes:
        print(f"✅ 共支持 {classes.get('total_classes', 0)} 种病理类型:")
        for i, class_info in enumerate(classes.get('classes', [])[:5]):  # 显示前5个
            print(f"   {i+1}. {class_info['name']} - {class_info.get('category', '')}")

def demo_prediction_with_sample():
    """演示预测功能（需要示例图像）"""
    print("\n\n🔮 预测功能演示")
    print("=" * 50)
    
    # 检查是否有示例图像
    sample_image = "sample_pathology_image.jpg"  # 替换为实际图像路径
    
    if not os.path.exists(sample_image):
        print(f"⚠️  未找到示例图像: {sample_image}")
        print("请准备一张病理图像并修改sample_image路径")
        return
    
    client = PathologyAPIClient()
    
    # 1. 单张图像预测
    print(f"\n1️⃣ 预测单张图像: {sample_image}")
    result = client.predict_image(sample_image)
    
    if "error" not in result:
        print(f"✅ 预测成功!")
        print(f"   预测类别: {result['prediction']['class']}")
        print(f"   置信度: {result['prediction']['confidence']:.3f}")
        print(f"   描述: {result['prediction']['description']}")
        
        # 显示top-3预测
        print("\n   Top-3 预测:")
        for i, pred in enumerate(result.get('top_predictions', [])[:3]):
            print(f"   {i+1}. {pred['class']}: {pred['probability']:.3f}")
    else:
        print(f"❌ 预测失败: {result['error']}")
    
    # 2. 生成完整诊断报告
    print(f"\n2️⃣ 生成完整诊断报告...")
    patient_info = {
        "name": "示例患者",
        "age": "45",
        "gender": "男",
        "clinical_notes": "胸痛、咳嗽3天"
    }
    
    report = client.generate_diagnosis_report(sample_image, patient_info)
    
    if "error" not in report:
        print(f"✅ 诊断报告生成成功!")
        print(f"   报告ID: {report.get('report_id', 'unknown')}")
        print(f"   主要诊断: {report.get('primary_diagnosis', {}).get('diagnosis', 'unknown')}")
        print(f"   严重程度: {report.get('severity_assessment', {}).get('severity_level', 'unknown')}")
        print(f"   紧急程度: {report.get('severity_assessment', {}).get('urgency_level', 'unknown')}")
        
        # 显示医疗建议
        recommendations = report.get('medical_recommendations', [])
        if recommendations:
            print("\n   医疗建议:")
            for i, rec in enumerate(recommendations[:3]):
                print(f"   {i+1}. {rec['action']} ({rec['priority']})")
    else:
        print(f"❌ 报告生成失败: {report['error']}")

def demo_batch_processing():
    """演示批量处理"""
    print("\n\n📦 批量处理演示")
    print("=" * 50)
    
    # 准备示例图像列表（需要实际存在的图像文件）
    sample_images = [
        "sample_pathology_image.jpg",
        "sample_pathology_image2.jpg"
    ]
    
    # 检查文件是否存在
    existing_images = [img for img in sample_images if os.path.exists(img)]
    
    if not existing_images:
        print("⚠️  未找到示例图像文件")
        print("请准备一些病理图像并修改sample_images列表")
        return
    
    client = PathologyAPIClient()
    
    print(f"🔄 批量处理 {len(existing_images)} 张图像...")
    result = client.predict_batch(existing_images)
    
    if "error" not in result:
        print(f"✅ 批量处理完成!")
        print(f"   成功: {result.get('success_count', 0)}")
        print(f"   失败: {result.get('error_count', 0)}")
        
        # 显示成功的结果
        results = result.get('results', [])
        if results:
            print("\n   处理结果:")
            for i, res in enumerate(results):
                pred = res.get('prediction', {})
                print(f"   {i+1}. {res.get('filename', 'unknown')}: "
                      f"{pred.get('class', 'unknown')} "
                      f"({pred.get('confidence', 0):.3f})")
    else:
        print(f"❌ 批量处理失败: {result['error']}")

def demo_performance_test():
    """演示性能测试"""
    print("\n\n⚡ 性能测试")
    print("=" * 50)
    
    sample_image = "sample_pathology_image.jpg"
    
    if not os.path.exists(sample_image):
        print("⚠️  未找到示例图像，跳过性能测试")
        return
    
    client = PathologyAPIClient()
    
    # 测试多次预测的响应时间
    num_tests = 10
    response_times = []
    
    print(f"🧪 进行 {num_tests} 次预测测试...")
    
    for i in range(num_tests):
        start_time = time.time()
        result = client.predict_image(sample_image)
        end_time = time.time()
        
        if "error" not in result:
            response_time = end_time - start_time
            response_times.append(response_time)
            print(f"   测试 {i+1}: {response_time:.3f}秒")
        else:
            print(f"   测试 {i+1}: 失败")
    
    if response_times:
        avg_time = sum(response_times) / len(response_times)
        min_time = min(response_times)
        max_time = max(response_times)
        
        print(f"\n📊 性能统计:")
        print(f"   平均响应时间: {avg_time:.3f}秒")
        print(f"   最快响应时间: {min_time:.3f}秒")
        print(f"   最慢响应时间: {max_time:.3f}秒")
        print(f"   QPS: {1/avg_time:.1f}")

def main():
    """主函数"""
    print("🧪 组织病理识别API使用示例")
    print("=" * 60)
    
    # 基础功能演示
    demo_basic_usage()
    
    # 预测功能演示（需要示例图像）
    demo_prediction_with_sample()
    
    # 批量处理演示
    demo_batch_processing()
    
    # 性能测试
    demo_performance_test()
    
    print("\n\n🏁 演示完成!")
    print("\n💡 提示:")
    print("1. 请准备病理图像文件以测试预测功能")
    print("2. 修改脚本中的图像路径以匹配您的文件位置")
    print("3. 确保API服务正在运行 (python main.py)")
    print("4. 查看API文档: http://localhost:8000/docs")

if __name__ == "__main__":
    main()