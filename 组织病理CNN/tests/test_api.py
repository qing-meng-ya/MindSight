"""
API测试脚本

用于测试组织病理识别API的各个端点
"""

import requests
import json
import os
from typing import Dict, Any

class APITester:
    """API测试类"""
    
    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url
        self.session = requests.Session()
    
    def test_health(self) -> Dict[str, Any]:
        """测试健康检查"""
        try:
            response = self.session.get(f"{self.base_url}/health")
            return {
                "status_code": response.status_code,
                "data": response.json(),
                "success": response.status_code == 200
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    def test_root(self) -> Dict[str, Any]:
        """测试根路径"""
        try:
            response = self.session.get(f"{self.base_url}/")
            return {
                "status_code": response.status_code,
                "data": response.json(),
                "success": response.status_code == 200
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    def test_classes(self) -> Dict[str, Any]:
        """测试获取病理类型"""
        try:
            response = self.session.get(f"{self.base_url}/classes")
            return {
                "status_code": response.status_code,
                "data": response.json(),
                "success": response.status_code == 200
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    def test_model_info(self) -> Dict[str, Any]:
        """测试获取模型信息"""
        try:
            response = self.session.get(f"{self.base_url}/model_info")
            return {
                "status_code": response.status_code,
                "data": response.json(),
                "success": response.status_code == 200
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    def test_predict(self, image_path: str) -> Dict[str, Any]:
        """测试单张图像预测"""
        if not os.path.exists(image_path):
            return {
                "success": False,
                "error": f"图像文件不存在: {image_path}"
            }
        
        try:
            with open(image_path, 'rb') as f:
                files = {'file': f}
                response = self.session.post(f"{self.base_url}/predict", files=files)
            
            result = {
                "status_code": response.status_code,
                "data": response.json(),
                "success": response.status_code == 200
            }
            
            # 额外检查预测结果
            if result["success"] and result["data"].get("success"):
                prediction = result["data"]["prediction"]
                result["prediction_summary"] = {
                    "class": prediction["class"],
                    "confidence": prediction["confidence"],
                    "threshold_met": prediction["threshold_met"]
                }
            
            return result
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    def test_predict_batch(self, image_paths: list) -> Dict[str, Any]:
        """测试批量预测"""
        files_data = []
        
        for image_path in image_paths:
            if not os.path.exists(image_path):
                return {
                    "success": False,
                    "error": f"图像文件不存在: {image_path}"
                }
        
        try:
            files = []
            for i, image_path in enumerate(image_paths):
                files.append(('files', open(image_path, 'rb')))
            
            response = self.session.post(f"{self.base_url}/predict_batch", files=files)
            
            # 关闭文件
            for _, f in files:
                f.close()
            
            result = {
                "status_code": response.status_code,
                "data": response.json(),
                "success": response.status_code == 200
            }
            
            # 额外检查批量结果
            if result["success"]:
                data = result["data"]
                result["batch_summary"] = {
                    "total_images": len(image_paths),
                    "success_count": data.get("success_count", 0),
                    "error_count": data.get("error_count", 0),
                    "success_rate": data.get("success_count", 0) / len(image_paths) * 100
                }
            
            return result
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    def run_all_tests(self, sample_image_path: str = None) -> Dict[str, Any]:
        """运行所有测试"""
        print("🧪 开始API测试...")
        
        results = {}
        
        # 基础测试
        print("\n1️⃣ 测试健康检查...")
        results["health"] = self.test_health()
        
        print("2️⃣ 测试根路径...")
        results["root"] = self.test_root()
        
        print("3️⃣ 测试获取病理类型...")
        results["classes"] = self.test_classes()
        
        print("4️⃣ 测试获取模型信息...")
        results["model_info"] = self.test_model_info()
        
        # 图像预测测试
        if sample_image_path and os.path.exists(sample_image_path):
            print("5️⃣ 测试单张图像预测...")
            results["predict"] = self.test_predict(sample_image_path)
            
            # 批量测试（使用同一张图像模拟多张）
            print("6️⃣ 测试批量预测...")
            results["predict_batch"] = self.test_predict_batch([sample_image_path])
        else:
            print("⚠️  跳过图像预测测试（未提供示例图像）")
        
        # 统计结果
        total_tests = len(results)
        successful_tests = sum(1 for result in results.values() if result.get("success", False))
        
        print(f"\n📊 测试结果汇总:")
        print(f"总测试数: {total_tests}")
        print(f"成功测试: {successful_tests}")
        print(f"成功率: {successful_tests/total_tests*100:.1f}%")
        
        # 详细结果
        for test_name, result in results.items():
            status = "✅" if result.get("success", False) else "❌"
            print(f"{status} {test_name}: {result.get('status_code', 'N/A')}")
            
            if not result.get("success", False) and "error" in result:
                print(f"   错误: {result['error']}")
        
        return results

def main():
    """主函数"""
    import argparse
    
    parser = argparse.ArgumentParser(description="组织病理识别API测试工具")
    parser.add_argument("--url", default="http://localhost:8000", help="API基础URL")
    parser.add_argument("--image", help="测试图像路径")
    
    args = parser.parse_args()
    
    # 创建测试器
    tester = APITester(args.url)
    
    # 运行测试
    results = tester.run_all_tests(args.image)
    
    # 保存结果
    if results:
        with open("api_test_results.json", "w", encoding="utf-8") as f:
            json.dump(results, f, indent=2, ensure_ascii=False)
        print(f"\n💾 测试结果已保存到: api_test_results.json")

if __name__ == "__main__":
    main()