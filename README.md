# MindSight 法医助手

一个司法法医辅助诊断系统

## 技术栈

- 前端：React 18 + React Router + Axios
- 后端：Express + SQLite
- 其他：PDFKit, Docx, Python Shell

## 前置要求

- Node.js 16+
- Python 3.8+（用于CNN模型）

## 快速开始

### 1. 克隆项目
```bash
git clone https://github.com/qing-meng-ya/MindSight.git
cd MindSight
```

### 2. 安装依赖
```bash
# 前端
cd former
npm install

# 后端
cd ../latter
npm install
```

### 3. 运行项目
```bash
# 终端1 - 启动后端
cd latter
npm run dev

# 终端2 - 启动前端
cd former
npm start
```

访问 http://localhost:3000

## 项目结构

```
MindSight/
├── former/          # React 前端
│   ├── src/
│   │   ├── pages/   # 页面组件
│   │   └── services/ # API 服务
│   └── public/
└── latter/          # Express 后端
    ├── src/
    │   ├── routes/  # 路由
    │   ├── services/ # 业务逻辑
    │   └── middleware/ # 中间件
```

## 功能列表

- 用户注册/登录
- 法医临床诊断
- 法医病理分析
- 法医毒物检测
- 法医精神病鉴定
- 法医证据管理
- 专家咨询
- 报告生成
