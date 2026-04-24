const fs = require('fs');
const standards = JSON.parse(fs.readFileSync('src/data/standards.json', 'utf-8'));
const docs = JSON.parse(fs.readFileSync('src/data/documentIndex.json', 'utf-8'));

const content = fs.readFileSync('src/views/expert/LibraryPage.vue', 'utf-8');

// Find the docs array definition
const docsStart = content.indexOf('const docs = ref([');
const docsEnd = content.indexOf('])\n\nconst filteredDocs', docsStart);

const beforeDocs = content.substring(0, docsStart);
const afterDocs = content.substring(docsEnd + 2);

// Build real docs array
let docItems = '';
let id = 1;

// Standards from standards.json
standards.standards.forEach(s => {
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
    favorited: false 
  },\n`;
});

// Keep some original items for other categories
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

const newDocs = `const docs = ref([\n${docItems}])`;

const newContent = beforeDocs + newDocs + afterDocs;
fs.writeFileSync('src/views/expert/LibraryPage.vue', newContent, 'utf-8');
console.log('Updated LibraryPage.vue with', standards.standards.length, 'standards');
