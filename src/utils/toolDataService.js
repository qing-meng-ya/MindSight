import standardsData from '../data/standards.json'
import knowledgeTreeData from '../data/knowledgeTree.json'

// Build standard lookup map
const standardMap = {}
standardsData.standards.forEach(s => {
  standardMap[s.code] = s
})

// Build tools array with enriched info
const allTools = []
knowledgeTreeData.subjects.forEach(subject => {
  subject.tools.forEach(tool => {
    const relatedStandards = tool.standardCodes
      .map(code => standardMap[code])
      .filter(Boolean)
    
    // Determine category for expert page
    let category = 'other'
    if (subject.id === 'compensation-calc') category = 'compensation'
    else if (subject.id === 'forensic-pathology' || subject.id === 'forensic-toxicology' || subject.id === 'forensic-anthropology') category = 'forensic'
    else if (subject.id === 'forensic-clinical') category = 'clinical'
    else if (subject.id === 'traffic-accident') category = 'traffic'
    else if (subject.id === 'forensic-evidence') category = 'evidence'
    
    // Determine tool type for learner page
    let toolType = 'calc'
    if (tool.formulaType.includes('predict') || tool.formulaType.includes('estimation') || tool.formulaType.includes('inference')) {
      toolType = 'predict'
    }
    
    allTools.push({
      ...tool,
      subjectId: subject.id,
      subjectName: subject.name,
      subjectIcon: subject.icon,
      subjectDescription: subject.description,
      standards: relatedStandards,
      standardNames: relatedStandards.map(s => s.code).join('、'),
      standardDesc: relatedStandards.map(s => s.name).join('；'),
      category,
      toolType,
      // Mock data for UI compatibility
      desc: relatedStandards.length > 0 ? relatedStandards[0].applicable[0] || tool.name : tool.name,
      inputs: Math.max(3, tool.standardCodes.length * 3 + 2),
      scenario: subject.description.split('、')[0] || subject.name,
      supportBatch: ['joint-range', 'disability-grade', 'care-period', 'height-estimate', 'traffic-compensation', 'injury-compensation', 'work-injury-comp'].includes(tool.id),
      favorited: false,
      updateTime: '2024-01',
      goal: `掌握${tool.name}方法`,
      duration: `${Math.max(5, tool.standardCodes.length * 5)}分钟`,
      hasExercise: tool.difficulty === 'C' || tool.difficulty === 'B'
    })
  })
})

export function getAllTools() {
  return allTools
}

export function getToolsByCategory(category) {
  return allTools.filter(t => t.category === category)
}

export function getToolsBySubject(subjectId) {
  return allTools.filter(t => t.subjectId === subjectId)
}

export function getToolsByType(type) {
  return allTools.filter(t => t.toolType === type)
}

export function getToolsByDifficulty(difficulty) {
  return allTools.filter(t => t.difficulty === difficulty)
}

export function getStandards() {
  return standardsData.standards
}

export function getStandardByCode(code) {
  return standardMap[code]
}

export function getSubjects() {
  return knowledgeTreeData.subjects
}

export function getSubjectById(id) {
  return knowledgeTreeData.subjects.find(s => s.id === id)
}

export function searchTools(keyword) {
  if (!keyword) return allTools
  const lower = keyword.toLowerCase()
  return allTools.filter(t => 
    t.name.includes(keyword) ||
    t.subjectName.includes(keyword) ||
    t.standardNames.includes(keyword) ||
    t.standardDesc.includes(keyword) ||
    t.desc.includes(keyword)
  )
}

export default {
  getAllTools,
  getToolsByCategory,
  getToolsBySubject,
  getToolsByType,
  getToolsByDifficulty,
  getStandards,
  getStandardByCode,
  getSubjects,
  getSubjectById,
  searchTools
}
