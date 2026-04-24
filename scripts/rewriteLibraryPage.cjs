const fs = require('fs');
const standards = JSON.parse(fs.readFileSync('src/data/standards.json', 'utf-8'));
const docIndex = JSON.parse(fs.readFileSync('src/data/documentIndex.json', 'utf-8'));

// Build code->path map
const codeToPath = {};
docIndex.documents.forEach(d => {
  if (d.standardCode) codeToPath[d.standardCode] = d.relativePath;
});
standards.standards.forEach(s => {
  if (!codeToPath[s.code]) {
    const m = docIndex.documents.find(d => d.filename && d.filename.includes(s.code.replace('/', '')));
    if (m) codeToPath[s.code] = m.relativePath;
  }
});

let content = fs.readFileSync('src/views/expert/LibraryPage.vue', 'utf-8');

// Extract template and style
const scriptStart = content.indexOf('<script setup>');
const scriptEnd = content.indexOf('</script>', scriptStart);
const beforeScript = content.substring(0, scriptStart);
const afterScript = content.substring(scriptEnd + '</script>'.length);

// Build new script
let docItems = '';
let id = 1;

standards.standards.forEach(s => {
  const path = codeToPath[s.code] || '';
  docItems += `  { 
    id: ${id++}, 
    category: 'standard', 
    title: '${s.code} ${s.name}', 
    desc: '适用场景：${s.applicable.join('、')}', 
    scenario: '${s.category}', 
    updateDate: '${s.code.includes('2024') ? '2024' : s.code.includes('2021') ? '2021' : s.code.includes('2019') ? '2019' : s.code.includes('2014') ? '2014' : s.code.includes('2013') ? '2013' : '2018'}-01', 
    size: 'PDF', 
    format: 'PDF', 
    status: 'effective', 
    favorited: false,
    docPath: '${path}'
  },\n`;
});

docItems += `  { 
    id: ${id++}, 
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
    id: ${id++}, 
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
    id: ${id++}, 
    category: 'case', 
    title: '道路交通事故典型案例汇编', 
    desc: '收录近三年典型交通事故鉴定案例', 
    scenario: '案例参考', 
    updateDate: '2024-01', 
    size: '15 MB', 
    format: 'PDF', 
    status: 'updated', 
    favorited: false 
  }\n`;

const newScript = `<script setup>
import { ref, computed } from 'vue'

function getDocUrl(relativePath) {
  if (!relativePath) return ''
  return '/docs/' + relativePath.split('/').map(encodeURIComponent).join('/')
}

const activeCategory = ref('standard')
const filters = ref({
  type: '',
  year: '',
  status: ''
})

const categories = ref([
  { id: 'standard', name: '标准规范', count: ${standards.standards.length} },
  { id: 'template', name: '文书模板', count: 8 },
  { id: 'guide', name: '鉴定依据', count: 15 },
  { id: 'case', name: '历史案例', count: 23 },
  { id: 'dispute', name: '常见争议', count: 6 }
])

const docs = ref([\n${docItems}])

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

const favorites = computed(() => docs.value.filter(d => d.favorited))

const recentDocs = computed(() => docs.value.slice(0, 3))

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
  doc.lastView = '刚刚'
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
  doc.favorited = !doc.favorited
}

const resetFilters = () => {
  filters.value = { type: '', year: '', status: '' }
}
</script>`;

const newContent = beforeScript + newScript + afterScript;
fs.writeFileSync('src/views/expert/LibraryPage.vue', newContent, 'utf-8');
console.log('Rewrote LibraryPage.vue with', standards.standards.length, 'standards with docPath');
