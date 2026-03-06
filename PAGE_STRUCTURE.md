# 法医助手网页开发 - 页面结构规划

## 整体架构

```
┌─────────────────────────────────────────────────────────────────┐
│                        公共页面                                   │
├─────────────────────────────────────────────────────────────────┤
│  index.html     - 首页/角色选择入口                               │
│  login.html     - 登录                                          │
│  register.html  - 注册（选择角色：学习者/工作者/咨询者）             │
│  profile.html   - 个人中心                                        │
└─────────────────────────────────────────────────────────────────┘
                              ↓
    ┌───────────────────────┼───────────────────────┐
    ↓                       ↓                       ↓
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   法医学习者     │  │   法医工作者    │  │   法医咨询者    │
│   learner/      │  │   expert/      │  │   client/      │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

---

## 页面清单

### 一、公共页面 (/)

| 文件 | 功能 | 说明 |
|------|------|------|
| `index.html` | 首页 | 角色选择、功能概览、快捷入口 |
| `login.html` | 登录 | 账号登录 |
| `register.html` | 注册 | 选择角色：学习者/工作者/咨询者 |
| `profile.html` | 个人中心 | 个人信息、我的数据、业务记录 |

---

### 二、法医学习者 (learner/)

| 文件 | 功能 | 说明 |
|------|------|------|
| `learner/tools.html` | 常用工具入口 | 预测工具 + 计算估算工具 |
| `learner/tools-fracture.html` | 骨折预测 | 骨折预测工具 |
| `learner/tools-slice.html` | 切片预测 | 组织切片预测 |
| `learner/tools-joint.html` | 关节活动损失 | 肩/腕/腰颈关节计算 |
| `learner/tools-death.html` | 死亡时间估算 | PMI计算 |
| `learner/tools-height.html` | 身高推算 | 根据骨骼推算身高 |
| `learner/tools-bsa.html` | 体表面积估算 | BSA计算 |
| `learner/tools-burn.html` | 烧伤面积计算 | 烧伤面积估算 |
| `learner/tools-alcohol.html` | 血液酒精浓度 | BAC计算 |
| `learner/tools-car.html` | 车祸赔偿计算 | 赔偿金额估算 |
| `learner/tools-injury.html` | 工伤赔偿计算 | 工伤赔偿估算 |
| `learner/tools-scar.html` | 瘢痕面积计算 | 瘢痕面积估算 |
| `learner/knowledge.html` | 知识库 | 法律文件、专业书籍 |
| `learner/cases.html` | 过往案例 | 历史案例库 |
| `learner/community.html` | 社区 | 论坛帖子、讨论区 |

---

### 三、法医工作者 (expert/)

| 文件 | 功能 | 说明 |
|------|------|------|
| `expert/tools.html` | 常用工具库入口 | 预测工具 + 计算估算工具 |
| `expert/tools-fracture.html` | 骨折预测 | 专业版骨折预测 |
| `expert/tools-slice.html` | 切片预测 | 专业版切片预测 |
| `expert/tools-joint.html` | 关节活动损失 | 专业版关节计算 |
| `expert/tools-death.html` | 死亡时间估算 | 专业版PMI计算 |
| `expert/tools-height.html` | 身高推算 | 专业版骨骼推算 |
| `expert/tools-bsa.html` | 体表面积估算 | 专业版BSA计算 |
| `expert/tools-burn.html` | 烧伤面积计算 | 专业版烧伤计算 |
| `expert/tools-alcohol.html` | 血液酒精浓度 | 专业版BAC计算 |
| `expert/tools-car.html` | 车祸赔偿计算 | 专业版赔偿估算 |
| `expert/tools-injury.html` | 工伤赔偿计算 | 专业版工伤计算 |
| `expert/tools-scar.html` | 瘢痕面积计算 | 专业版瘢痕计算 |
| `expert/library.html` | 常用资料库 | 标准文件、专业书籍、相关案件 |
| `expert/nursing.html` | 护理计算 | 误工/护理/营养期 + 护理依赖程度 |
| `expert/qa.html` | 在线答疑 | 社区答疑、专业解答 |

---

### 四、法医咨询者 (client/)

| 文件 | 功能 | 说明 |
|------|------|------|
| `client/check.html` | 初步检测入口 | 骨折/关节/烧伤/手足功能 |
| `client/check-fracture.html` | 骨折分析 | 骨折分析工具 |
| `client/check-joint.html` | 关节活动检测 | 关节活动损失程度 |
| `client/check-burn.html` | 烧伤面积检测 | 烧伤面积计算 |
| `client/check-handfoot.html` | 手足功能评估 | 手足功能评估 |
| `client/consult.html` | 在线咨询 | 预约咨询、问答、鉴定师列表 |
| `client/knowledge.html` | 知识库 | 基础知识、标准规范、常见问题 |

---

## 导航结构

### 法医学习者导航
```
首页 → 学习者工作台
     ├─ 常用工具
     │   ├─ 骨折预测
     │   ├─ 切片预测
     │   └─ 计算估算工具（9个）
     ├─ 知识库
     ├─ 过往案例
     └─ 社区
```

### 法医工作者导航
```
首页 → 工作者工作台
     ├─ 常用工具库
     │   ├─ 骨折预测
     │   ├─ 切片预测
     │   └─ 计算估算工具（9个）
     ├─ 常用资料库
     ├─ 在线答疑
     └─ 护理
```

### 法医咨询者导航
```
首页 → 咨询者工作台
     ├─ 初步检测
     ├─ 在线咨询
     └─ 知识库
```

---

## 角色权限说明

| 功能 | 学习者 | 工作者 | 咨询者 |
|------|--------|--------|--------|
| 基础计算工具 | ✓ | ✓ | ✓ |
| 预测工具 | ✓ | ✓ | - |
| 知识库(学习) | ✓ | - | ✓ |
| 知识库(专业) | - | ✓ | ✓ |
| 过往案例 | ✓ | ✓ | - |
| 在线答疑 | - | ✓ | - |
| 初步检测 | - | - | ✓ |
| 在线咨询 | - | - | ✓ |
| 护理计算 | - | ✓ | - |
| 资料库 | - | ✓ | - |

---

## 已创建页面清单

### 公共页面 (/)
| 文件 | 状态 | 说明 |
|------|------|------|
| `index.html` | ✅ 已创建 | 首页/角色选择入口 |
| `login.html` | ✅ 已有 | 登录 |
| `register.html` | ✅ 已更新 | 注册（三种角色选择） |
| `profile.html` | ✅ 已有 | 个人中心 |
| `merged.html` | ✅ 保留 | 汇总页面（可删除） |
| `store.html` | ⚠️ 待清理 | 旧商城页面 |
| `consult.html` | ⚠️ 待清理 | 旧咨询页面 |
| `appraisal.html` | ⚠️ 待清理 | 旧鉴定页面 |
| `forum.html` | ⚠️ 待清理 | 旧论坛页面 |

### 法医学习者 (learner/)
| 文件 | 状态 | 说明 |
|------|------|------|
| `learner/tools.html` | ✅ 已创建 | 常用工具入口 |
| `learner/tools-fracture.html` | ✅ 已创建 | 骨折预测 |
| `learner/tools-slice.html` | ✅ 已创建 | 切片预测 |
| `learner/tools-joint.html` | ✅ 已创建 | 关节活动损失 |
| `learner/tools-death.html` | ✅ 已创建 | 死亡时间估算 |
| `learner/tools-height.html` | ✅ 已创建 | 身高推算 |
| `learner/tools-bsa.html` | ✅ 已创建 | 体表面积估算 |
| `learner/tools-burn.html` | ✅ 已创建 | 烧伤面积计算 |
| `learner/tools-alcohol.html` | ✅ 已创建 | 血液酒精浓度 |
| `learner/tools-car.html` | ✅ 已创建 | 车祸赔偿计算 |
| `learner/tools-injury.html` | ✅ 已创建 | 工伤赔偿计算 |
| `learner/tools-scar.html` | ✅ 已创建 | 瘢痕面积计算 |
| `learner/knowledge.html` | ✅ 已创建 | 知识库 |
| `learner/cases.html` | ✅ 已创建 | 过往案例 |
| `learner/community.html` | ✅ 已创建 | 社区 |

### 法医工作者 (expert/)
| 文件 | 状态 | 说明 |
|------|------|------|
| `expert/tools.html` | ✅ 已创建 | 常用工具库入口 |
| `expert/tools-*.html` | ✅ 已创建 | 11个工具页面（与学习者相同） |
| `expert/library.html` | ✅ 已创建 | 常用资料库 |
| `expert/qa.html` | ✅ 已创建 | 在线答疑 |
| `expert/nursing.html` | ✅ 已创建 | 护理计算 |

### 法医咨询者 (client/)
| 文件 | 状态 | 说明 |
|------|------|------|
| `client/check.html` | ✅ 已创建 | 初步检测入口 |
| `client/check-fracture.html` | ✅ 已创建 | 骨折分析 |
| `client/check-joint.html` | ✅ 已创建 | 关节活动检测 |
| `client/check-burn.html` | ✅ 已创建 | 烧伤面积检测 |
| `client/check-handfoot.html` | ✅ 已创建 | 手足功能评估 |
| `client/consult.html` | ✅ 已创建 | 在线咨询 |
| `client/knowledge.html` | ✅ 已创建 | 知识库 |

---

## 下一步建议

1. **清理旧页面**：删除 `store.html`, `consult.html`, `appraisal.html`, `forum.html`
2. **完善工具页面**：为各工具页面添加具体的计算逻辑和表单
3. **添加登录功能**：实现完整的用户认证系统
4. **数据持久化**：为各模块添加数据存储功能
5. **样式优化**：统一各页面的样式细节

---

## 技术说明

- 样式统一使用 `assets/css/site.css`
- 各页面JS放在 `assets/js/` 目录
- 图片资源放在 `assets/images/` 目录
- 保持现有深蓝暗色风格
- 每个模块独立HTML文件
- 使用锚点 `#section` 进行同页导航
