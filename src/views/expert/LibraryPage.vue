<template>
  <div class="library-page">
    <div class="section-head">
      <h1 class="section-title">资料库</h1>
      <p class="section-note">快速查找权威标准、模板和参考资料</p>
    </div>

    <!-- 分类导航 -->
    <div class="nav-tabs panel">
      <button 
        v-for="cat in categories" 
        :key="cat.id"
        class="nav-tab"
        :class="{ active: activeCategory === cat.id }"
        @click="activeCategory = cat.id"
      >
        {{ cat.name }}
        <span class="tab-count" v-if="cat.count">{{ cat.count }}</span>
      </button>
    </div>

    <!-- 高级筛选 -->
    <div class="filter-section panel">
      <div class="filter-row">
        <div class="filter-group">
          <label>类型</label>
          <select v-model="filters.type">
            <option value="">全部</option>
            <option value="standard">标准文件</option>
            <option value="template">文书模板</option>
            <option value="guide">鉴定依据</option>
            <option value="case">历史案例</option>
          </select>
        </div>
        <div class="filter-group">
          <label>年份</label>
          <select v-model="filters.year">
            <option value="">全部</option>
            <option value="2024">2024年</option>
            <option value="2023">2023年</option>
            <option value="2022">2022年</option>
            <option value="older">更早</option>
          </select>
        </div>
        <div class="filter-group">
          <label>状态</label>
          <select v-model="filters.status">
            <option value="">全部</option>
            <option value="effective">现行有效</option>
            <option value="updated">已更新</option>
            <option value="obsolete">已废止</option>
          </select>
        </div>
        <button class="btn btn-outline btn-sm" @click="resetFilters">重置</button>
      </div>
    </div>

    <!-- 文档列表 -->
    <div class="doc-list">
      <div v-for="doc in filteredDocs" :key="doc.id" class="doc-card panel">
        <div class="doc-icon">
          <span class="icon-file"></span>
        </div>
        <div class="doc-content">
          <div class="doc-header">
            <h3 class="doc-title">{{ doc.title }}</h3>
            <span class="doc-status" :class="doc.status">{{ getStatusLabel(doc.status) }}</span>
          </div>
          <p class="doc-desc">{{ doc.desc }}</p>
          <div class="doc-meta">
            <span class="meta-item">
              <span class="meta-label">适用场景</span>
              <span class="meta-value">{{ doc.scenario }}</span>
            </span>
            <span class="meta-item">
              <span class="meta-label">更新时间</span>
              <span class="meta-value">{{ doc.updateDate }}</span>
            </span>
            <span class="meta-item">
              <span class="meta-label">文件大小</span>
              <span class="meta-value">{{ doc.size }}</span>
            </span>
            <span class="meta-item">
              <span class="meta-label">格式</span>
              <span class="meta-value">{{ doc.format }}</span>
            </span>
          </div>
        </div>
        <div class="doc-actions">
          <button class="btn btn-sm btn-primary" @click="viewDoc(doc)">查看</button>
          <button class="btn btn-sm btn-outline" @click="downloadDoc(doc)">下载</button>
          <button 
            class="btn btn-sm btn-icon" 
            @click="toggleFavorite(doc)" 
            :class="{ favorited: isDocFavorited(doc.id) }"
          >
            {{ isDocFavorited(doc.id) ? '已收藏' : '收藏' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div class="empty-state panel" v-if="filteredDocs.length === 0">
      <h3>暂无相关资料</h3>
      <p>试试调整筛选条件</p>
      <button class="btn btn-outline" @click="resetFilters">重置筛选</button>
    </div>

    <!-- 侧边栏：收藏夹 + 最近查看 -->
    <div class="sidebar">
      <section class="favorites panel">
        <h3>我的收藏</h3>
        <div class="fav-list" v-if="favorites.length > 0">
          <div 
            v-for="doc in favorites" 
            :key="doc.id" 
            class="fav-item"
            @click="viewDoc(doc)"
          >
            <span class="fav-title">{{ doc.title }}</span>
          </div>
        </div>
        <p v-else class="empty-hint">暂无收藏</p>
      </section>

      <section class="recent panel">
        <h3>最近查看</h3>
        <div class="recent-list" v-if="recentDocs.length > 0">
          <div 
            v-for="doc in recentDocs" 
            :key="doc.id" 
            class="recent-item"
            @click="viewDoc(doc)"
          >
            <span class="recent-title">{{ doc.title }}</span>
            <span class="recent-time">{{ doc.lastView }}</span>
          </div>
        </div>
        <p v-else class="empty-hint">暂无记录</p>
      </section>
    </div>

    <!-- 文书模板套用提示 -->
    <section class="template-tip panel" v-if="activeCategory === 'template'">
      <h4>提示</h4>
      <p>点击"查看"可预览文书模板内容，支持"一键套用到当前案件"功能</p>
    </section>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { usePersistentList } from '../../composables/usePersistentState.js'

function getDocUrl(relativePath) {
  if (!relativePath) return ''
  return '/docs/' + relativePath.split('/').map(encodeURIComponent).join('/')
}

const activeCategory = ref('standard')

// 持久化：收藏文档ID列表
const favoriteDocIds = usePersistentList('library:favoriteDocIds', [])

// 持久化：最近查看记录
const recentDocViews = usePersistentList('library:recentDocViews', [], 20)

const isDocFavorited = (docId) => favoriteDocIds.value.includes(docId)
const filters = ref({
  type: '',
  year: '',
  status: ''
})

const categories = ref([
  { id: 'standard', name: '标准规范', count: 38 },
  { id: 'template', name: '文书模板', count: 8 },
  { id: 'guide', name: '鉴定依据', count: 15 },
  { id: 'case', name: '历史案例', count: 23 },
  { id: 'dispute', name: '常见争议', count: 6 }
])

const docs = ref([
  { 
    id: 1, 
    category: 'standard', 
    title: 'GA/T 1661-2019 法医学 关节活动度检验规范', 
    desc: '适用场景：关节活动度计算、伤残鉴定、功能障碍评定', 
    scenario: '法医临床学', 
    updateDate: '2019-01', 
    size: 'PDF', 
    format: 'PDF', 
    status: 'effective', 
    favorited: false,
    docPath: '标准规范/法医临床标准规范/2.GAT 1661-2019《法医学 关节活动度检验规范》.pdf'
  },
  { 
    id: 2, 
    category: 'standard', 
    title: 'GB/T 16180-2014 劳动能力鉴定 职工工伤与职业病致残等级', 
    desc: '适用场景：劳动能力鉴定、工伤赔偿计算、伤残等级评定', 
    scenario: '法医临床学', 
    updateDate: '2014-01', 
    size: 'PDF', 
    format: 'PDF', 
    status: 'effective', 
    favorited: false,
    docPath: ''
  },
  { 
    id: 3, 
    category: 'standard', 
    title: 'GA/T 1193-2014 人身损害误工期、护理期、营养期评定规范', 
    desc: '适用场景：护理期计算、营养期计算、误工期计算、赔偿计算', 
    scenario: '法医临床学', 
    updateDate: '2014-01', 
    size: 'PDF', 
    format: 'PDF', 
    status: 'effective', 
    favorited: false,
    docPath: ''
  },
  { 
    id: 4, 
    category: 'standard', 
    title: 'GB/T 31147-2014 人身损害护理依赖程度评定', 
    desc: '适用场景：护理依赖评定、赔偿计算', 
    scenario: '法医临床学', 
    updateDate: '2014-01', 
    size: 'PDF', 
    format: 'PDF', 
    status: 'effective', 
    favorited: false,
    docPath: '标准规范/法医临床标准规范/6.GBT 31147-2014人身损害护理依赖程度评定-janhovah1.pdf'
  },
  { 
    id: 5, 
    category: 'standard', 
    title: 'GA/T 1088-2013 道路交通事故受伤人员治疗终结时间', 
    desc: '适用场景：交通事故赔偿、治疗终结判定', 
    scenario: '法医临床学', 
    updateDate: '2013-01', 
    size: 'PDF', 
    format: 'PDF', 
    status: 'effective', 
    favorited: false,
    docPath: ''
  },
  { 
    id: 6, 
    category: 'standard', 
    title: 'GB/T 43639-2024 视觉功能障碍法医临床鉴定技术规范', 
    desc: '适用场景：视觉功能评定、伤残鉴定、视力换算', 
    scenario: '法医临床学', 
    updateDate: '2024-01', 
    size: 'PDF', 
    format: 'PDF', 
    status: 'effective', 
    favorited: false,
    docPath: '标准规范/法医临床标准规范/《视觉功能障碍法医临床鉴定技术规范》（GBT 43639-2024).pdf'
  },
  { 
    id: 7, 
    category: 'standard', 
    title: 'GB/T 44893-2024 听觉功能障碍法医临床鉴定技术规范', 
    desc: '适用场景：听觉功能评定、听力损失分级、伤残鉴定', 
    scenario: '法医临床学', 
    updateDate: '2024-01', 
    size: 'PDF', 
    format: 'PDF', 
    status: 'effective', 
    favorited: false,
    docPath: ''
  },
  { 
    id: 8, 
    category: 'standard', 
    title: 'GA/T 1555-2019 法庭科学 人身损害受伤人员后续诊疗项目评定技术规程', 
    desc: '适用场景：后续治疗费评估、赔偿计算', 
    scenario: '法医临床学', 
    updateDate: '2019-01', 
    size: 'PDF', 
    format: 'PDF', 
    status: 'effective', 
    favorited: false,
    docPath: '标准规范/法医临床标准规范/（GAT 1555-2019《法庭科学 人身损害受伤人员后续诊疗项目评定技术规程》.pdf'
  },
  { 
    id: 9, 
    category: 'standard', 
    title: 'GA/T 1197-2014 法庭科学人体损伤检验照相规范', 
    desc: '适用场景：损伤检验记录、影像资料规范', 
    scenario: '法医临床学', 
    updateDate: '2014-01', 
    size: 'PDF', 
    format: 'PDF', 
    status: 'effective', 
    favorited: false,
    docPath: '标准规范/法医临床标准规范/14.GAT 1197-2014《法庭科学人体损伤检验照相规范》.pdf'
  },
  { 
    id: 10, 
    category: 'standard', 
    title: 'SF/T 0111-2021 法医临床学检验规范', 
    desc: '适用场景：损伤程度鉴定、活体检验、人体损伤', 
    scenario: '法医临床学', 
    updateDate: '2021-01', 
    size: 'PDF', 
    format: 'PDF', 
    status: 'effective', 
    favorited: false,
    docPath: ''
  },
  { 
    id: 11, 
    category: 'standard', 
    title: 'SF/T 0096-2021 肢体运动功能评定', 
    desc: '适用场景：运动功能评定、伤残鉴定', 
    scenario: '法医临床学', 
    updateDate: '2021-01', 
    size: 'PDF', 
    format: 'PDF', 
    status: 'effective', 
    favorited: false,
    docPath: ''
  },
  { 
    id: 12, 
    category: 'standard', 
    title: 'SF/T 0095-2021 周围神经损伤与疾病法医学鉴定指南', 
    desc: '适用场景：神经损伤鉴定、伤残评定', 
    scenario: '法医临床学', 
    updateDate: '2021-01', 
    size: 'PDF', 
    format: 'PDF', 
    status: 'effective', 
    favorited: false,
    docPath: ''
  },
  { 
    id: 13, 
    category: 'standard', 
    title: 'SF/T 0112-2021 法医临床学影像学检验实施规范', 
    desc: '适用场景：影像学检验、影像资料审核', 
    scenario: '法医临床学', 
    updateDate: '2021-01', 
    size: 'PDF', 
    format: 'PDF', 
    status: 'effective', 
    favorited: false,
    docPath: ''
  },
  { 
    id: 14, 
    category: 'standard', 
    title: 'GA/T 1073-2013 生物样品血液、尿液中乙醇、甲醇、正丙醇、乙醛、丙酮、异丙醇和正丁醇的顶空-气相色谱检验方法', 
    desc: '适用场景：血液酒精浓度计算、毒物分析、酒精检测', 
    scenario: '法医毒物学', 
    updateDate: '2013-01', 
    size: 'PDF', 
    format: 'PDF', 
    status: 'effective', 
    favorited: false,
    docPath: ''
  },
  { 
    id: 15, 
    category: 'standard', 
    title: 'SF/T 0115-2021 血液中 45 种有毒生物碱液相色谱-串联质谱检验方法', 
    desc: '适用场景：毒药物检测、生物碱检测', 
    scenario: '法医毒物学', 
    updateDate: '2021-01', 
    size: 'PDF', 
    format: 'PDF', 
    status: 'effective', 
    favorited: false,
    docPath: ''
  },
  { 
    id: 16, 
    category: 'standard', 
    title: 'GA/T 1530-2018 法庭科学 230 种药（毒）物液相色谱-串联质谱筛查方法', 
    desc: '适用场景：毒药物筛查、LC-MS检测', 
    scenario: '法医毒物学', 
    updateDate: '2018-01', 
    size: 'PDF', 
    format: 'PDF', 
    status: 'effective', 
    favorited: false,
    docPath: ''
  },
  { 
    id: 17, 
    category: 'standard', 
    title: 'GA/T 1611-2019 法庭科学 生物检材中甲氰菊酯等五种拟除虫菊酯类农药及其代谢物检验 液相色谱-质谱法', 
    desc: '适用场景：农药检测、毒物分析', 
    scenario: '法医毒物学', 
    updateDate: '2019-01', 
    size: 'PDF', 
    format: 'PDF', 
    status: 'effective', 
    favorited: false,
    docPath: ''
  },
  { 
    id: 18, 
    category: 'standard', 
    title: 'GA/T 965-2011 DNA亲子鉴定规范', 
    desc: '适用场景：DNA检验、亲子鉴定、个体识别', 
    scenario: '法医物证学', 
    updateDate: '2018-01', 
    size: 'PDF', 
    format: 'PDF', 
    status: 'effective', 
    favorited: false,
    docPath: ''
  },
  { 
    id: 19, 
    category: 'standard', 
    title: 'GA/T 382-2014 法庭科学DNA实验室检验规范', 
    desc: '适用场景：DNA检验、实验室规范', 
    scenario: '法医物证学', 
    updateDate: '2014-01', 
    size: 'PDF', 
    format: 'PDF', 
    status: 'effective', 
    favorited: false,
    docPath: ''
  },
  { 
    id: 20, 
    category: 'standard', 
    title: 'GA/T 1162-2014 法医生物检材', 
    desc: '适用场景：生物检材、物证检验', 
    scenario: '法医物证学', 
    updateDate: '2014-01', 
    size: 'PDF', 
    format: 'PDF', 
    status: 'effective', 
    favorited: false,
    docPath: ''
  },
  { 
    id: 21, 
    category: 'standard', 
    title: 'GA/T 147-2019 法医学 尸体检验技术总则', 
    desc: '适用场景：尸体检验、死亡原因、法医病理', 
    scenario: '法医病理学', 
    updateDate: '2019-01', 
    size: 'PDF', 
    format: 'PDF', 
    status: 'effective', 
    favorited: false,
    docPath: '标准规范/法医病理标准规范/GAT 147-2019 法医学 尸体检验技术总则.pdf'
  },
  { 
    id: 22, 
    category: 'standard', 
    title: 'GA/T 148-2019 法医学 病理检材的提取、固定、取材及保存规范', 
    desc: '适用场景：病理检材、尸体检验', 
    scenario: '法医病理学', 
    updateDate: '2019-01', 
    size: 'PDF', 
    format: 'PDF', 
    status: 'effective', 
    favorited: false,
    docPath: '标准规范/法医病理标准规范/GAT 148-2019法医学 病理建材的提取、固定、取材及保存规范.pdf'
  },
  { 
    id: 23, 
    category: 'standard', 
    title: 'GA/T 150-2019 法医学 机械性窒息尸体检验规范', 
    desc: '适用场景：机械性窒息、尸体检验、死亡原因', 
    scenario: '法医病理学', 
    updateDate: '2019-01', 
    size: 'PDF', 
    format: 'PDF', 
    status: 'effective', 
    favorited: false,
    docPath: '标准规范/法医病理标准规范/GAT 150-2019法医学 机械性窒息尸体检验规范.pdf'
  },
  { 
    id: 24, 
    category: 'standard', 
    title: 'GA/T 151-2019 法医学 新生儿尸体检验规范', 
    desc: '适用场景：新生儿尸体检验、法医病理', 
    scenario: '法医病理学', 
    updateDate: '2019-01', 
    size: 'PDF', 
    format: 'PDF', 
    status: 'effective', 
    favorited: false,
    docPath: '标准规范/法医病理标准规范/GAT 151-2019法医学 新生儿尸体检验规范.pdf'
  },
  { 
    id: 25, 
    category: 'standard', 
    title: 'GA/T 1662-2019 法庭科学 硅藻检验技术规范 微波消解-真空抽滤-显微镜法', 
    desc: '适用场景：硅藻检验、溺死鉴定', 
    scenario: '法医病理学', 
    updateDate: '2019-01', 
    size: 'PDF', 
    format: 'PDF', 
    status: 'effective', 
    favorited: false,
    docPath: '标准规范/法医病理标准规范/GAT 1662-2019法庭科学 硅藻检验技术规范微波消解-真空抽滤-显微镜法.PDF'
  },
  { 
    id: 26, 
    category: 'standard', 
    title: 'GA/T 167-2019 法医学 中毒尸体检验规范', 
    desc: '适用场景：中毒尸体检验、毒物分析', 
    scenario: '法医毒物学/病理学', 
    updateDate: '2019-01', 
    size: 'PDF', 
    format: 'PDF', 
    status: 'effective', 
    favorited: false,
    docPath: '标准规范/法医病理标准规范/GAT 167-2019法医学 中毒尸体检验规范.pdf'
  },
  { 
    id: 27, 
    category: 'standard', 
    title: 'GA/T 168-2019 法医学 机械性损伤尸体检验规范', 
    desc: '适用场景：机械性损伤、尸体检验、损伤鉴定', 
    scenario: '法医病理学', 
    updateDate: '2019-01', 
    size: 'PDF', 
    format: 'PDF', 
    status: 'effective', 
    favorited: false,
    docPath: '标准规范/法医病理标准规范/GAT 168-2019法医学 机械性损伤尸体检验规范.pdf'
  },
  { 
    id: 28, 
    category: 'standard', 
    title: 'GA/T 170-2019 法医学 猝死尸体检验规范', 
    desc: '适用场景：猝死、尸体检验、死亡原因', 
    scenario: '法医病理学', 
    updateDate: '2019-01', 
    size: 'PDF', 
    format: 'PDF', 
    status: 'effective', 
    favorited: false,
    docPath: '标准规范/法医病理标准规范/GAT 170-2019法医学 猝死尸体检验规范.pdf'
  },
  { 
    id: 29, 
    category: 'standard', 
    title: 'GA/T 1198-2014 法庭科学 尸体检验照相规范', 
    desc: '适用场景：尸体检验、照相规范', 
    scenario: '法医病理学', 
    updateDate: '2014-01', 
    size: 'PDF', 
    format: 'PDF', 
    status: 'effective', 
    favorited: false,
    docPath: ''
  },
  { 
    id: 30, 
    category: 'standard', 
    title: 'GA/T 1585-2019 法庭科学 尸体检验摄像技术规范', 
    desc: '适用场景：尸体检验、摄像规范', 
    scenario: '法医病理学', 
    updateDate: '2019-01', 
    size: 'PDF', 
    format: 'PDF', 
    status: 'effective', 
    favorited: false,
    docPath: ''
  },
  { 
    id: 31, 
    category: 'standard', 
    title: 'GA/T 1968-2021 法医学 死亡原因分类及其鉴定指南', 
    desc: '适用场景：死亡原因、死因鉴定、法医病理', 
    scenario: '法医病理学', 
    updateDate: '2021-01', 
    size: 'PDF', 
    format: 'PDF', 
    status: 'effective', 
    favorited: false,
    docPath: ''
  },
  { 
    id: 32, 
    category: 'standard', 
    title: 'GA/T 1969-2021 法医学 机械性损伤致伤物分类及推断指南', 
    desc: '适用场景：致伤物推断、机械性损伤', 
    scenario: '法医病理学', 
    updateDate: '2021-01', 
    size: 'PDF', 
    format: 'PDF', 
    status: 'effective', 
    favorited: false,
    docPath: ''
  },
  { 
    id: 33, 
    category: 'standard', 
    title: 'GA/T 813-2008 人体组织器官中硅藻硝酸破机法检验', 
    desc: '适用场景：硅藻检验、溺死鉴定', 
    scenario: '法医病理学', 
    updateDate: '2018-01', 
    size: 'PDF', 
    format: 'PDF', 
    status: 'effective', 
    favorited: false,
    docPath: '标准规范/法医病理标准规范/GAT 813-2008人体组织器官中硅藻硝酸破机法检验.pdf'
  },
  { 
    id: 34, 
    category: 'standard', 
    title: 'GB/T 37237-2018 男性性功能障碍法医学鉴定', 
    desc: '适用场景：性功能鉴定、伤残评定', 
    scenario: '法医临床学', 
    updateDate: '2018-01', 
    size: 'PDF', 
    format: 'PDF', 
    status: 'effective', 
    favorited: false,
    docPath: ''
  },
  { 
    id: 35, 
    category: 'standard', 
    title: 'GA/T 268-2019 道路交通事故尸体检验', 
    desc: '适用场景：交通事故、尸体检验', 
    scenario: '法医病理学', 
    updateDate: '2019-01', 
    size: 'PDF', 
    format: 'PDF', 
    status: 'effective', 
    favorited: false,
    docPath: ''
  },
  { 
    id: 36, 
    category: 'standard', 
    title: 'SF/T 0097-2021 医疗损害司法鉴定指南', 
    desc: '适用场景：医疗损害、司法鉴定', 
    scenario: '司法鉴定管理', 
    updateDate: '2021-01', 
    size: 'PDF', 
    format: 'PDF', 
    status: 'effective', 
    favorited: false,
    docPath: ''
  },
  { 
    id: 37, 
    category: 'standard', 
    title: 'SF/T 0183 法医精神病鉴定技术规范', 
    desc: '适用场景：精神状态鉴定、责任能力评定', 
    scenario: '法医精神病学', 
    updateDate: '2018-01', 
    size: 'PDF', 
    format: 'PDF', 
    status: 'effective', 
    favorited: false,
    docPath: ''
  },
  { 
    id: 38, 
    category: 'standard', 
    title: 'GA/T 1588-2019 法庭科学 法医临床鉴定标准编制规范', 
    desc: '适用场景：鉴定标准、规范编制', 
    scenario: '法医临床学', 
    updateDate: '2019-01', 
    size: 'PDF', 
    format: 'PDF', 
    status: 'effective', 
    favorited: false,
    docPath: ''
  },
  { 
    id: 39, 
    category: 'template', 
    title: '伤残等级鉴定意见书模板', 
    desc: '标准化的伤残鉴定报告模板，包含所有必要字段', 
    scenario: '伤残鉴定', 
    updateDate: '2024-02', 
    size: '156 KB', 
    format: 'DOCX', 
    status: 'effective', 
    favorited: false 
  },
  { 
    id: 40, 
    category: 'guide', 
    title: '司法鉴定程序通则', 
    desc: '司法部令第132号，司法鉴定程序基本规范', 
    scenario: '程序规范', 
    updateDate: '2023-11', 
    size: '856 KB', 
    format: 'PDF', 
    status: 'effective', 
    favorited: false 
  },
  { 
    id: 41, 
    category: 'case', 
    title: '道路交通事故典型案例汇编', 
    desc: '收录近三年典型交通事故鉴定案例', 
    scenario: '案例参考', 
    updateDate: '2024-01', 
    size: '15 MB', 
    format: 'PDF', 
    status: 'updated', 
    favorited: false 
  }
])

const filteredDocs = computed(() => {
  let result = docs.value.filter(d => d.category === activeCategory.value)
  
  if (filters.value.type) {
    result = result.filter(d => d.category === filters.value.type)
  }
  if (filters.value.year) {
    if (filters.value.year === 'older') {
      result = result.filter(d => parseInt(d.updateDate) < 2022)
    } else {
      result = result.filter(d => d.updateDate.startsWith(filters.value.year))
    }
  }
  if (filters.value.status) {
    result = result.filter(d => d.status === filters.value.status)
  }
  
  return result
})

const favorites = computed(() => docs.value.filter(d => isDocFavorited(d.id)))

const recentDocs = computed(() => {
  return recentDocViews.value
    .slice(0, 5)
    .map(r => docs.value.find(d => d.id === r.id))
    .filter(Boolean)
    .map(d => ({ ...d, lastView: '刚刚' }))
})

const getStatusLabel = (status) => {
  const map = { effective: '现行有效', updated: '已更新', obsolete: '已废止' }
  return map[status] || status
}

const viewDoc = (doc) => {
  const path = doc.docPath || doc.path
  if (path) {
    const url = getDocUrl(path)
    window.open(url, '_blank')
  } else {
    console.log('暂无文档路径:', doc.title)
  }
  // 记录最近查看
  const existing = recentDocViews.value.findIndex(r => r.id === doc.id)
  if (existing >= 0) recentDocViews.value.splice(existing, 1)
  recentDocViews.value.unshift({ id: doc.id, title: doc.title })
}

const downloadDoc = (doc) => {
  const path = doc.docPath || doc.path
  if (path) {
    const url = getDocUrl(path)
    const a = document.createElement('a')
    a.href = url
    a.download = doc.title + '.pdf'
    a.click()
  }
}

const toggleFavorite = (doc) => {
  const idx = favoriteDocIds.value.indexOf(doc.id)
  if (idx >= 0) {
    favoriteDocIds.value.splice(idx, 1)
  } else {
    favoriteDocIds.value.push(doc.id)
  }
}

const resetFilters = () => {
  filters.value = { type: '', year: '', status: '' }
}
</script>

<style scoped>
.library-page {
  display: grid;
  gap: 24px;
}

.section-head {
  text-align: center;
}

.section-title {
  margin: 0;
  font-size: 24px;
}

.section-note {
  color: var(--text-muted);
  font-size: 14px;
  margin: 6px 0 0;
}

.nav-tabs {
  display: flex;
  gap: 8px;
  padding: 16px;
  overflow-x: auto;
}

.nav-tab {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: transparent;
  color: var(--text-muted);
  font-size: 13px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.nav-tab:hover {
  border-color: var(--accent);
}

.nav-tab.active {
  background: rgba(64, 216, 197, 0.15);
  border-color: var(--accent);
  color: var(--accent);
}

.tab-count {
  padding: 2px 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  font-size: 11px;
}

.filter-section {
  padding: 16px;
}

.filter-row {
  display: flex;
  gap: 16px;
  align-items: flex-end;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.filter-group label {
  font-size: 12px;
  color: var(--text-muted);
}

.filter-group select {
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  color: var(--text);
  font-size: 13px;
  min-width: 120px;
}

.filter-group select:focus {
  outline: none;
  border-color: var(--accent);
}

.btn-sm {
  padding: 8px 12px;
  font-size: 12px;
}

.btn-outline {
  background: transparent;
  border: 1px solid var(--line);
  color: var(--text);
}

.btn-outline:hover {
  border-color: var(--accent);
}

.btn-primary {
  background: var(--accent);
  border: none;
  color: var(--bg-0);
}

.btn-icon {
  background: transparent;
  border: 1px solid var(--line);
  color: var(--text-muted);
}

.btn-icon.favorited {
  border-color: var(--accent);
  color: var(--accent);
}

.doc-list {
  display: grid;
  gap: 16px;
}

.doc-card {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 20px;
}

.doc-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(64, 216, 197, 0.1);
  border-radius: var(--radius-md);
  flex-shrink: 0;
}

.icon-file {
  width: 24px;
  height: 24px;
  background: var(--line);
}

.doc-content {
  flex: 1;
}

.doc-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.doc-title {
  margin: 0;
  font-size: 17px;
}

.doc-status {
  padding: 2px 8px;
  font-size: 11px;
  border-radius: 4px;
}

.doc-status.effective {
  background: rgba(107, 203, 119, 0.15);
  color: #6bcb77;
}

.doc-status.updated {
  background: rgba(255, 217, 61, 0.15);
  color: #ffd93d;
}

.doc-status.obsolete {
  background: rgba(255, 107, 107, 0.15);
  color: #ff6b6b;
}

.doc-desc {
  margin: 0 0 12px;
  color: var(--text-muted);
  font-size: 13px;
}

.doc-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.meta-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.meta-label {
  font-size: 11px;
  color: var(--text-muted);
}

.meta-value {
  font-size: 12px;
}

.doc-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.empty-state {
  text-align: center;
  padding: 40px;
}

.empty-state h3 {
  margin: 0 0 8px;
}

.empty-state p {
  margin: 0 0 16px;
  color: var(--text-muted);
}

.sidebar {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.sidebar h3 {
  margin: 0 0 12px;
  font-size: 14px;
  color: var(--text-muted);
}

.fav-list, .recent-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.fav-item, .recent-item {
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.2s ease;
}

.fav-item:hover, .recent-item:hover {
  background: rgba(255, 255, 255, 0.06);
}

.fav-title, .recent-title {
  font-size: 13px;
}

.recent-time {
  font-size: 11px;
  color: var(--text-muted);
}

.empty-hint {
  font-size: 13px;
  color: var(--text-muted);
  text-align: center;
  padding: 20px;
}

.template-tip {
  background: rgba(64, 216, 197, 0.05);
}

.template-tip h4 {
  margin: 0 0 8px;
  font-size: 14px;
}

.template-tip p {
  margin: 0;
  font-size: 13px;
  color: var(--text-muted);
}

@media (max-width: 768px) {
  .sidebar {
    grid-template-columns: 1fr;
  }
  
  .doc-card {
    flex-direction: column;
  }
  
  .doc-actions {
    width: 100%;
  }
}
</style>