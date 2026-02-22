import os
from typing import List, Dict

class Config:
    # 项目根目录
    ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    
    # 数据路径
    DATA_DIR = os.path.join(ROOT_DIR, "data")
    RAW_DATA_DIR = os.path.join(DATA_DIR, "raw")
    PROCESSED_DATA_DIR = os.path.join(DATA_DIR, "processed")
    MODELS_DIR = os.path.join(DATA_DIR, "models")
    
    # 模型配置
    MODEL_NAME = "pathology_cnn"
    IMG_SIZE = 224
    BATCH_SIZE = 32
    LEARNING_RATE = 0.001
    NUM_EPOCHS = 100
    
    # 15种病理类型
    PATHOLOGY_CLASSES = [
        "肺出血",
        "肺水肿", 
        "肺血栓",
        "肺炎",
        "肝脂肪变性",
        "冠心病",
        "脑出血",
        "脑水肿",
        "脑血管畸形",
        "脑蛛网膜下腔淤血",
        "脾小动脉玻璃样改变",
        "肾小球纤维化",
        "心肌纤维断裂",
        "心肌炎",
        "胰腺炎"
    ]
    
    NUM_CLASSES = len(PATHOLOGY_CLASSES)
    
    # 病理描述映射
    PATHOLOGY_DESCRIPTIONS = {
        "肺出血": "肺部组织出血，可见红细胞渗出",
        "肺水肿": "肺部液体积聚，肺泡壁增厚",
        "肺血栓": "血管内血栓形成，阻塞血流",
        "肺炎": "肺部炎症反应，炎性细胞浸润",
        "肝脂肪变性": "肝细胞内脂肪滴积聚",
        "冠心病": "冠状动脉狭窄或阻塞",
        "脑出血": "脑实质出血，血肿形成",
        "脑水肿": "脑组织水肿，压力增高",
        "脑血管畸形": "血管结构异常，发育异常",
        "脑蛛网膜下腔淤血": "蛛网膜下腔血液积聚",
        "脾小动脉玻璃样改变": "小动脉壁玻璃样变性",
        "肾小球纤维化": "肾小球结构纤维化",
        "心肌纤维断裂": "心肌纤维结构破坏",
        "心肌炎": "心肌组织炎症反应",
        "胰腺炎": "胰腺组织炎症，水肿坏死"
    }
    
    # API配置
    API_HOST = "0.0.0.0"
    API_PORT = 8000
    
    # 设备配置
    DEVICE = "cuda" if os.system("nvidia-smi") == 0 else "cpu"