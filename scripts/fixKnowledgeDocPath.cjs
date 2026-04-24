const fs = require('fs');
const standards = JSON.parse(fs.readFileSync('src/data/standards.json', 'utf-8'));
const docIndex = JSON.parse(fs.readFileSync('src/data/documentIndex.json', 'utf-8'));

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

let content = fs.readFileSync('src/views/learner/KnowledgePage.vue', 'utf-8');

// Replace docPath: s.filename with a lookup using the map
const mapJson = JSON.stringify(codeToPath);
const oldStr = `      docPath: s.filename,\n      category: 'law'`;
const newStr = `      docPath: (${mapJson})[s.code] || s.filename,\n      category: 'law'`;

content = content.replace(oldStr, newStr);

fs.writeFileSync('src/views/learner/KnowledgePage.vue', content, 'utf-8');
console.log('Fixed KnowledgePage.vue docPath');
