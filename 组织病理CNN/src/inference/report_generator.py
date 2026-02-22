import torch
import numpy as np
from typing import Dict, List, Optional, Tuple, Union
from datetime import datetime
import json
import os
from dataclasses import dataclass
from enum import Enum

from configs.config import Config

class SeverityLevel(Enum):
    """严重程度枚举"""
    LOW = "低"
    MEDIUM = "中"
    HIGH = "高"
    CRITICAL = "危重"

class UrgencyLevel(Enum):
    """紧急程度枚举"""
    ROUTINE = "常规"
    URGENT = "紧急"
    EMERGENCY = "危急诊"

@dataclass
class MedicalRecommendation:
    """医疗建议数据类"""
    action: str
    priority: str
    description: str
    follow_up: str

class DiagnosisReportGenerator:
    """辅助诊断报告生成器"""
    
    def __init__(self):
        """初始化报告生成器"""
        self.classes = Config.PATHOLOGY_CLASSES
        self.descriptions = Config.PATHOLOGY_DESCRIPTIONS
        
        # 病理严重程度映射
        self.severity_mapping = {
            # 肺部病变
            "肺出血": SeverityLevel.HIGH,
            "肺水肿": SeverityLevel.MEDIUM,
            "肺血栓": SeverityLevel.CRITICAL,
            "肺炎": SeverityLevel.MEDIUM,
            
            # 心血管病变
            "冠心病": SeverityLevel.HIGH,
            "心肌纤维断裂": SeverityLevel.HIGH,
            "心肌炎": SeverityLevel.MEDIUM,
            
            # 脑部病变
            "脑出血": SeverityLevel.CRITICAL,
            "脑水肿": SeverityLevel.CRITICAL,
            "脑血管畸形": SeverityLevel.HIGH,
            "脑蛛网膜下腔淤血": SeverityLevel.HIGH,
            
            # 其他器官病变
            "肝脂肪变性": SeverityLevel.LOW,
            "脾小动脉玻璃样改变": SeverityLevel.MEDIUM,
            "肾小球纤维化": SeverityLevel.HIGH,
            "胰腺炎": SeverityLevel.MEDIUM
        }
        
        # 紧急程度映射
        self.urgency_mapping = {
            "肺出血": UrgencyLevel.URGENT,
            "肺水肿": UrgencyLevel.URGENT,
            "肺血栓": UrgencyLevel.EMERGENCY,
            "肺炎": UrgencyLevel.URGENT,
            "冠心病": UrgencyLevel.EMERGENCY,
            "心肌纤维断裂": UrgencyLevel.EMERGENCY,
            "心肌炎": UrgencyLevel.URGENT,
            "脑出血": UrgencyLevel.EMERGENCY,
            "脑水肿": UrgencyLevel.EMERGENCY,
            "脑血管畸形": UrgencyLevel.URGENT,
            "脑蛛网膜下腔淤血": UrgencyLevel.URGENT,
            "肝脂肪变性": UrgencyLevel.ROUTINE,
            "脾小动脉玻璃样改变": UrgencyLevel.ROUTINE,
            "肾小球纤维化": UrgencyLevel.URGENT,
            "胰腺炎": UrgencyLevel.URGENT
        }
    
    def generate_diagnosis_report(
        self,
        prediction_result: Dict[str, any],
        patient_info: Optional[Dict[str, str]] = None,
        image_metadata: Optional[Dict[str, any]] = None,
        include_differential: bool = True
    ) -> Dict[str, any]:
        """
        生成完整的辅助诊断报告
        
        Args:
            prediction_result: 预测结果
            patient_info: 患者信息
            image_metadata: 图像元数据
            include_differential: 是否包含鉴别诊断
            
        Returns:
            完整的诊断报告
        """
        predicted_class = prediction_result['predicted_class']
        confidence = prediction_result['confidence']
        probabilities = prediction_result.get('probabilities', {})
        
        # 基础信息
        report = {
            "report_id": f"DXR_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            "generated_at": datetime.now().isoformat(),
            "patient_info": patient_info or {},
            "image_metadata": image_metadata or {}
        }
        
        # 主要诊断
        report["primary_diagnosis"] = self._generate_primary_diagnosis(
            predicted_class, confidence
        )
        
        # 置信度分析
        report["confidence_analysis"] = self._analyze_confidence(
            confidence, probabilities
        )
        
        # 病理描述
        report["pathology_description"] = self._get_detailed_description(
            predicted_class
        )
        
        # 严重程度和紧急程度
        report["severity_assessment"] = self._assess_severity(predicted_class)
        
        # 医疗建议
        report["medical_recommendations"] = self._generate_recommendations(
            predicted_class, confidence
        )
        
        # 鉴别诊断
        if include_differential and probabilities:
            report["differential_diagnosis"] = self._generate_differential_diagnosis(
                probabilities, predicted_class
            )
        
        # 质量控制
        report["quality_control"] = self._quality_assessment(
            confidence, predicted_class
        )
        
        # 免责声明
        report["disclaimer"] = self._get_disclaimer()
        
        return report
    
    def _generate_primary_diagnosis(
        self, 
        predicted_class: str, 
        confidence: float
    ) -> Dict[str, any]:
        """生成主要诊断信息"""
        return {
            "diagnosis": predicted_class,
            "confidence": confidence,
            "confidence_level": self._get_confidence_level(confidence),
            "reliability": self._assess_reliability(confidence),
            "category": self._get_category_by_class(predicted_class)
        }
    
    def _analyze_confidence(
        self, 
        confidence: float, 
        probabilities: Dict[str, Dict[str, float]]
    ) -> Dict[str, any]:
        """分析置信度分布"""
        if not probabilities:
            return {"analysis": "无概率数据"}
        
        # 计算置信度统计
        confidences = [prob['probability'] for prob in probabilities.values()]
        
        analysis = {
            "primary_confidence": confidence,
            "mean_confidence": np.mean(confidences),
            "confidence_std": np.std(confidences),
            "confidence_range": {
                "min": min(confidences),
                "max": max(confidences)
            },
            "distribution": self._analyze_distribution(confidences)
        }
        
        # 置信度间隔分析
        top_2_confidence = sorted(confidences, reverse=True)[:2]
        if len(top_2_confidence) >= 2:
            analysis["confidence_gap"] = top_2_confidence[0] - top_2_confidence[1]
            analysis["certainty_level"] = self._get_certainty_level(
                analysis["confidence_gap"]
            )
        
        return analysis
    
    def _get_detailed_description(self, predicted_class: str) -> Dict[str, any]:
        """获取详细的病理描述"""
        base_description = self.descriptions.get(predicted_class, "")
        
        return {
            "basic_description": base_description,
            "detailed_findings": self._get_detailed_findings(predicted_class),
            "clinical_significance": self._get_clinical_significance(predicted_class),
            "common_associations": self._get_common_associations(predicted_class)
        }
    
    def _assess_severity(self, predicted_class: str) -> Dict[str, any]:
        """评估严重程度"""
        severity = self.severity_mapping.get(predicted_class, SeverityLevel.MEDIUM)
        urgency = self.urgency_mapping.get(predicted_class, UrgencyLevel.ROUTINE)
        
        return {
            "severity_level": severity.value,
            "urgency_level": urgency.value,
            "risk_factors": self._get_risk_factors(predicted_class),
            "prognosis": self._get_prognosis_assessment(predicted_class),
            "monitoring_requirements": self._get_monitoring_requirements(predicted_class)
        }
    
    def _generate_recommendations(
        self, 
        predicted_class: str, 
        confidence: float
    ) -> List[MedicalRecommendation]:
        """生成医疗建议"""
        recommendations = []
        
        # 基础建议
        if confidence >= 0.8:
            recommendations.append(MedicalRecommendation(
                action="立即临床确认",
                priority="高",
                description=f"建议立即进行{predicted_class}的临床确认和相关检查",
                follow_up="安排专科医生会诊"
            ))
        elif confidence >= 0.6:
            recommendations.append(MedicalRecommendation(
                action="进一步检查",
                priority="中",
                description=f"建议进行进一步的影像学和实验室检查以确认{predicted_class}",
                follow_up="1-2周内复查"
            ))
        else:
            recommendations.append(MedicalRecommendation(
                action="密切观察",
                priority="常规",
                description=f"建议密切观察临床症状变化，必要时重复检查",
                follow_up="定期随访"
            ))
        
        # 特定病理建议
        specific_recs = self._get_specific_recommendations(predicted_class)
        recommendations.extend(specific_recs)
        
        return [
            {
                "action": rec.action,
                "priority": rec.priority,
                "description": rec.description,
                "follow_up": rec.follow_up
            }
            for rec in recommendations
        ]
    
    def _generate_differential_diagnosis(
        self, 
        probabilities: Dict[str, Dict[str, float]], 
        primary_class: str
    ) -> Dict[str, any]:
        """生成鉴别诊断"""
        # 排序并排除主要诊断
        sorted_probs = sorted(
            [(class_name, prob_data) for class_name, prob_data in probabilities.items() 
             if class_name != primary_class],
            key=lambda x: x[1]['probability'],
            reverse=True
        )[:5]  # Top-5鉴别诊断
        
        differential_list = []
        for class_name, prob_data in sorted_probs:
            if prob_data['probability'] > 0.05:  # 只考虑概率>5%的
                differential_list.append({
                    "diagnosis": class_name,
                    "probability": prob_data['probability'],
                    "reasoning": self._get_differential_reasoning(primary_class, class_name),
                    "key_distinguishing_features": self._get_distinguishing_features(primary_class, class_name)
                })
        
        return {
            "differential_diagnoses": differential_list,
            "total_considered": len(differential_list),
            "confidence_in_primary": probabilities[primary_class]['probability'],
            "diagnostic_certainty": self._get_diagnostic_certainty(
                probabilities[primary_class]['probability'],
                len(differential_list)
            )
        }
    
    def _quality_assessment(
        self, 
        confidence: float, 
        predicted_class: str
    ) -> Dict[str, any]:
        """质量控制评估"""
        quality_score = 0
        issues = []
        
        # 置信度评估
        if confidence >= 0.9:
            quality_score += 40
        elif confidence >= 0.7:
            quality_score += 30
        elif confidence >= 0.5:
            quality_score += 20
        else:
            issues.append("置信度较低，建议人工复核")
        
        # 类别常见性评估（模拟）
        if self._is_common_pathology(predicted_class):
            quality_score += 30
        else:
            issues.append("相对少见的病理类型，建议专家确认")
        
        # 图像质量评估（模拟）
        quality_score += 30  # 假设图像质量良好
        
        return {
            "overall_quality_score": min(quality_score, 100),
            "quality_level": self._get_quality_level(quality_score),
            "issues": issues,
            "recommendations": self._get_quality_recommendations(quality_score, issues)
        }
    
    # 辅助方法
    def _get_confidence_level(self, confidence: float) -> str:
        if confidence >= 0.9:
            return "非常高"
        elif confidence >= 0.7:
            return "高"
        elif confidence >= 0.5:
            return "中等"
        else:
            return "低"
    
    def _assess_reliability(self, confidence: float) -> str:
        if confidence >= 0.8:
            return "可靠"
        elif confidence >= 0.6:
            return "较可靠"
        else:
            return "需人工确认"
    
    def _get_category_by_class(self, class_name: str) -> str:
        categories = {
            "肺出血": "肺部病变", "肺水肿": "肺部病变", "肺血栓": "肺部病变", "肺炎": "肺部病变",
            "冠心病": "心血管病变", "心肌纤维断裂": "心血管病变", "心肌炎": "心血管病变",
            "脑出血": "脑部病变", "脑水肿": "脑部病变", "脑血管畸形": "脑部病变", "脑蛛网膜下腔淤血": "脑部病变",
            "肝脂肪变性": "肝脏病变",
            "脾小动脉玻璃样改变": "脾脏病变",
            "肾小球纤维化": "肾脏病变",
            "胰腺炎": "胰腺病变"
        }
        return categories.get(class_name, "其他病变")
    
    def _analyze_distribution(self, confidences: List[float]) -> str:
        if len(confidences) == 0:
            return "无数据"
        
        std = np.std(confidences)
        if std < 0.1:
            return "分布均匀"
        elif std < 0.2:
            return "略有差异"
        else:
            return "差异显著"
    
    def _get_certainty_level(self, confidence_gap: float) -> str:
        if confidence_gap > 0.3:
            return "高度确定"
        elif confidence_gap > 0.15:
            return "中等确定"
        else:
            return "不确定"
    
    def _get_detailed_findings(self, predicted_class: str) -> str:
        findings_map = {
            "肺出血": "肺泡和间质内红细胞渗出，可伴有含铁血黄素巨噬细胞",
            "肺水肿": "肺泡壁增厚，肺泡腔内蛋白性液体，可见心衰细胞",
            "肺血栓": "血管内纤维素性血栓形成，可见炎症细胞浸润",
            "肺炎": "肺泡壁炎症细胞浸润，肺泡腔内渗出物"
        }
        return findings_map.get(predicted_class, "病理学特征明显")
    
    def _get_clinical_significance(self, predicted_class: str) -> str:
        significance_map = {
            "肺出血": "可能导致呼吸衰竭，需要紧急处理",
            "肺水肿": "提示心功能不全或肺损伤，需要及时干预",
            "肺血栓": "可导致肺梗死，危及生命",
            "肺炎": "常见感染性疾病，需抗生素治疗"
        }
        return significance_map.get(predicted_class, "具有临床意义")
    
    def _get_common_associations(self, predicted_class: str) -> List[str]:
        associations = {
            "肺出血": ["创伤", "肿瘤", "感染", "凝血功能障碍"],
            "肺水肿": ["心力衰竭", "肾功能衰竭", "ARDS"],
            "肺血栓": ["深静脉血栓", "长期卧床", "手术"],
            "肺炎": ["细菌感染", "病毒感染", "免疫功能低下"]
        }
        return associations.get(predicted_class, [])
    
    def _get_risk_factors(self, predicted_class: str) -> List[str]:
        risk_factors = {
            "肺出血": ["高血压", "抗凝治疗", "肺部肿瘤"],
            "冠心病": ["高血压", "糖尿病", "高脂血症", "吸烟"],
            "脑出血": ["高血压", "动脉瘤", "脑血管畸形"],
            "胰腺炎": ["胆结石", "饮酒", "高脂血症"]
        }
        return risk_factors.get(predicted_class, [])
    
    def _get_prognosis_assessment(self, predicted_class: str) -> str:
        prognosis_map = {
            "肺出血": "预后取决于出血量和病因",
            "冠心病": "需要长期管理和治疗",
            "脑出血": "预后较差，可能有后遗症",
            "肝脂肪变性": "预后良好，可逆性病变"
        }
        return prognosis_map.get(predicted_class, "预后因个体差异而异")
    
    def _get_monitoring_requirements(self, predicted_class: str) -> List[str]:
        monitoring = {
            "肺出血": ["血氧饱和度", "血红蛋白", "胸部影像学"],
            "冠心病": ["心电图", "心肌酶谱", "心脏超声"],
            "脑出血": ["意识状态", "颅内压", "神经影像学"],
            "肺炎": ["体温", "血常规", "胸部影像学"]
        }
        return monitoring.get(predicted_class, ["临床症状观察"])
    
    def _get_specific_recommendations(self, predicted_class: str) -> List[MedicalRecommendation]:
        """获取特定病理的建议"""
        recommendations_map = {
            "肺血栓": [
                MedicalRecommendation(
                    action="抗凝治疗评估",
                    priority="紧急",
                    description="评估抗凝治疗的适应症和禁忌症",
                    follow_up="血液科会诊"
                )
            ],
            "冠心病": [
                MedicalRecommendation(
                    action="心脏功能评估",
                    priority="高",
                    description="进行心电图、心脏超声和心肌酶谱检查",
                    follow_up="心内科会诊"
                )
            ]
        }
        return recommendations_map.get(predicted_class, [])
    
    def _get_differential_reasoning(self, primary: str, differential: str) -> str:
        """获取鉴别诊断的理由"""
        return f"临床表现相似，{differential}需要与{primary}进行鉴别"
    
    def _get_distinguishing_features(self, primary: str, differential: str) -> List[str]:
        """获取鉴别特征"""
        return [
            f"{primary}的特征性表现",
            f"{differential}的特征性表现",
            "影像学差异",
            "实验室检查差异"
        ]
    
    def _get_diagnostic_certainty(self, primary_prob: float, diff_count: int) -> str:
        """评估诊断确定性"""
        if primary_prob > 0.8 and diff_count < 2:
            return "高度确定"
        elif primary_prob > 0.6 and diff_count < 4:
            return "中等确定"
        else:
            return "需要进一步确认"
    
    def _get_quality_level(self, score: int) -> str:
        if score >= 80:
            return "优秀"
        elif score >= 60:
            return "良好"
        elif score >= 40:
            return "一般"
        else:
            return "需要改进"
    
    def _get_quality_recommendations(self, score: int, issues: List[str]) -> List[str]:
        """获取质量改进建议"""
        recommendations = []
        
        if score < 60:
            recommendations.append("建议进行人工复核")
        
        for issue in issues:
            if "置信度" in issue:
                recommendations.append("考虑获取更高质量的图像样本")
            elif "少见" in issue:
                recommendations.append("建议相关领域专家会诊")
        
        return recommendations
    
    def _is_common_pathology(self, predicted_class: str) -> bool:
        """判断是否为常见病理"""
        common_pathologies = ["肺炎", "冠心病", "胰腺炎", "肝脂肪变性"]
        return predicted_class in common_pathologies
    
    def _get_disclaimer(self) -> Dict[str, str]:
        """获取免责声明"""
        return {
            "title": "免责声明",
            "content": "本报告仅作为辅助诊断参考，不能替代执业医师的临床判断。最终诊断应由合格的专业医师结合患者的完整临床信息做出。",
            "version": "1.0",
            "date": datetime.now().strftime("%Y-%m-%d")
        }
    
    def save_report(self, report: Dict[str, any], save_path: str):
        """保存报告到文件"""
        os.makedirs(os.path.dirname(save_path), exist_ok=True)
        
        with open(save_path, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False)
        
        print(f"诊断报告已保存: {save_path}")
    
    def generate_summary_text(self, report: Dict[str, any]) -> str:
        """生成报告摘要文本"""
        primary = report["primary_diagnosis"]
        severity = report["severity_assessment"]
        
        summary = f"""
诊断报告摘要
================

主要诊断: {primary['diagnosis']}
置信度: {primary['confidence']:.3f} ({primary['confidence_level']})
可靠性: {primary['reliability']}

严重程度: {severity['severity_level']}
紧急程度: {severity['urgency_level']}

主要建议:
"""
        
        for rec in report["medical_recommendations"][:3]:
            summary += f"- {rec['action']} ({rec['priority']}): {rec['description']}\n"
        
        summary += f"\n质量控制: {report['quality_control']['quality_level']}"
        
        return summary