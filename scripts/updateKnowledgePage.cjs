const fs = require('fs');

const content = fs.readFileSync('src/views/learner/KnowledgePage.vue', 'utf-8');
const scriptStart = content.indexOf('<script setup>');
const scriptEnd = content.indexOf('</script>', scriptStart);

const beforeScript = content.substring(0, scriptStart);
const afterScript = content.substring(scriptEnd + '</script>'.length);

const newScript = `<script setup>
import { ref, computed } from 'vue'
import { getSubjects, getStandards } from '../../utils/toolDataService.js'
import documentIndex from '../../data/documentIndex.json'

const searchKeyword = ref('')
const activeCategory = ref('')
const currentResource = ref(null)

const categories = ref([
  { id: '', name: '全部' },
  { id: 'law', name: '法规标准' },
  { id: 'book', name: '教材资料' },
  { id: 'article', name: '专题文章' },
  { id: 'video', name: '教学视频' }
])

const subjects = getSubjects()
const learningPaths = computed(() => {
  return subjects.map((s, idx) => ({
    id: s.id,
    name: s.name,
    level: idx < 2 ? '入门' : idx < 4 ? '进阶' : '精通',
    desc: s.description,
    duration: s.tools.length + '项工具',
    count: s.tools.length + s.relatedBooks.length + s.atlas.length
  }))
})

const standards = getStandards()
const documents = documentIndex.documents || []

const resources = computed(() => {
  const result = []
  let id = 1
  
  standards.forEach(s => {
    result.push({
      id: id++,
      type: '法规标准',
      difficulty: 'A',
      title: s.code + ' ' + s.name,
      desc: '适用：' + s.applicable.join('、'),
      prerequisites: '无',
      duration: '20分钟',
      views: 500 + Math.floor(Math.random() * 1500),
      progress: 0,
      collected: false,
      docPath: s.filename,
      category: 'law'
    })
  })
  
  documents.filter(d => d.category === '法医学本科教材' || d.category === '人卫医学教材').forEach((d, idx) => {
    if (idx > 20) return
    result.push({
      id: id++,
      type: '教材资料',
      difficulty: 'B',
      title: d.title,
      desc: d.subCategory ? d.subCategory + '教材' : '法医学教材',
      prerequisites: '法医入门',
      duration: '2小时',
      views: 300 + Math.floor(Math.random() * 800),
      progress: 0,
      collected: false,
      docPath: d.relativePath,
      category: 'book'
    })
  })
  
  subjects.forEach(s => {
    result.push({
      id: id++,
      type: '专题文章',
      difficulty: s.tools.some(t => t.difficulty === 'A') ? 'D' : 'C',
      title: s.name + '专题导读',
      desc: s.description,
      prerequisites: s.id === 'forensic-clinical' ? '无' : '法医入门',
      duration: '1小时',
      views: 200 + Math.floor(Math.random() * 600),
      progress: 0,
      collected: false,
      category: 'article'
    })
  })
  
  return result
})

const filteredResources = computed(() => {
  let result = resources.value
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(r => 
      r.title.toLowerCase().includes(keyword) || 
      r.desc.toLowerCase().includes(keyword)
    )
  }
  if (activeCategory.value) {
    result = result.filter(r => r.type === getCategoryName(activeCategory.value))
  }
  return result
})

const relatedResources = computed(() => {
  if (!currentResource.value) return []
  return resources.value
    .filter(r => r.id !== currentResource.value.id && r.type === currentResource.value.type)
    .slice(0, 4)
})

const getDifficultyLabel = (difficulty) => {
  const map = { A: 'A级', B: 'B级', C: 'C级', D: 'D级', E: 'E级' }
  return map[difficulty] || difficulty
}

const getCategoryName = (id) => {
  const cat = categories.value.find(c => c.id === id)
  return cat ? cat.name : ''
}

const startPath = (path) => {
  console.log('开始学习路径:', path.name)
}

const startLearning = (item) => {
  currentResource.value = item
  console.log('开始学习:', item.title)
}

const toggleCollect = (item) => {
  item.collected = !item.collected
}

const resetSearch = () => {
  searchKeyword.value = ''
  activeCategory.value = ''
}
</script>`;

const newContent = beforeScript + newScript + afterScript;
fs.writeFileSync('src/views/learner/KnowledgePage.vue', newContent, 'utf-8');
console.log('Updated KnowledgePage.vue');
