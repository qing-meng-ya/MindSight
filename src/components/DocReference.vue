<template>
  <div v-if="docInfo" class="doc-reference">
    <div class="doc-header">
      <span class="doc-icon">📄</span>
      <span class="doc-title">关联文档</span>
    </div>
    <div class="doc-list">
      <div v-for="doc in docInfo" :key="doc.id" class="doc-item">
        <span class="doc-name">{{ doc.title }}</span>
        <span class="doc-path">{{ doc.path }}</span>
        <span class="doc-size">{{ doc.size }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import documentIndex from '../data/documentIndex.json'

const props = defineProps({
  standardCodes: {
    type: Array,
    default: () => []
  },
  docPaths: {
    type: Array,
    default: () => []
  }
})

const docInfo = computed(() => {
  const docs = documentIndex.documents || []
  const result = []
  
  // Find docs matching standard codes in filename
  props.standardCodes.forEach(code => {
    const matched = docs.filter(d => 
      d.filename && d.filename.includes(code.replace('/', ''))
    )
    matched.forEach(d => {
      result.push({
        id: d.id,
        title: d.title,
        path: d.relativePath,
        size: d.sizeHuman
      })
    })
  })
  
  // Find docs matching explicit paths
  props.docPaths.forEach(path => {
    const matched = docs.filter(d => 
      d.relativePath && d.relativePath.includes(path)
    )
    matched.forEach(d => {
      if (!result.find(r => r.id === d.id)) {
        result.push({
          id: d.id,
          title: d.title,
          path: d.relativePath,
          size: d.sizeHuman
        })
      }
    })
  })
  
  return result
})
</script>

<style scoped>
.doc-reference {
  padding: 12px;
  background: rgba(64, 216, 197, 0.05);
  border: 1px solid rgba(64, 216, 197, 0.2);
  border-radius: var(--radius-sm);
  margin-top: 12px;
}

.doc-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 500;
}

.doc-icon {
  font-size: 14px;
}

.doc-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.doc-item {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  padding: 6px 10px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 4px;
  font-size: 12px;
}

.doc-name {
  color: var(--accent);
}

.doc-path {
  color: var(--text-muted);
  font-size: 11px;
}

.doc-size {
  color: var(--text-muted);
  font-size: 11px;
  margin-left: auto;
}
</style>
