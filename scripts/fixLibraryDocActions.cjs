const fs = require('fs');

let content = fs.readFileSync('src/views/expert/LibraryPage.vue', 'utf-8');

// 1. 替换 viewDoc 方法
const oldViewDoc = `const viewDoc = (doc) => {
  console.log('查看文档:', doc.title)
  doc.lastView = '刚刚'
}`;

const newViewDoc = `const viewDoc = (doc) => {
  const path = doc.docPath || doc.path
  if (path) {
    const url = getDocUrl(path)
    window.open(url, '_blank')
  } else {
    console.log('暂无文档路径:', doc.title)
  }
  doc.lastView = '刚刚'
}`;

content = content.replace(oldViewDoc, newViewDoc);

// 2. 替换 downloadDoc 方法
const oldDownloadDoc = `const downloadDoc = (doc) => {
  console.log('下载文档:', doc.title)
}`;

const newDownloadDoc = `const downloadDoc = (doc) => {
  const path = doc.docPath || doc.path
  if (path) {
    const url = getDocUrl(path)
    const a = document.createElement('a')
    a.href = url
    a.download = doc.title + '.pdf'
    a.click()
  }
}`;

content = content.replace(oldDownloadDoc, newDownloadDoc);

fs.writeFileSync('src/views/expert/LibraryPage.vue', content, 'utf-8');
console.log('Updated viewDoc and downloadDoc');
