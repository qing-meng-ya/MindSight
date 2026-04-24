const fs = require('fs');

// 读取并修改 LibraryPage.vue，添加查看功能
let content = fs.readFileSync('src/views/expert/LibraryPage.vue', 'utf-8');

// 在script setup中添加导入和辅助函数
const importInsert = `import { ref, computed } from 'vue'

function getDocUrl(relativePath) {
  if (!relativePath) return ''
  return '/docs/' + relativePath.split('/').map(encodeURIComponent).join('/')
}

function openDoc(relativePath) {
  const url = getDocUrl(relativePath)
  if (url) window.open(url, '_blank')
}
`;

// 替换原有的 import
content = content.replace(
  "import { ref, computed } from 'vue'\n\nconst activeCategory",
  importInsert + "const activeCategory"
);

// 检查是否有 viewDoc 方法，如果没有则添加
if (!content.includes('const viewDoc')) {
  const scriptEnd = content.lastIndexOf('</script>');
  const beforeEnd = content.substring(0, scriptEnd);
  const afterEnd = content.substring(scriptEnd);
  const viewDocFunc = `
const viewDoc = (doc) => {
  if (doc.docPath) {
    openDoc(doc.docPath)
  } else if (doc.path) {
    openDoc(doc.path)
  }
}
`;
  content = beforeEnd + viewDocFunc + afterEnd;
}

fs.writeFileSync('src/views/expert/LibraryPage.vue', content, 'utf-8');
console.log('Updated LibraryPage.vue with doc viewer support');
