import caseKnowledgeMap from '@/data/caseKnowledgeMap.json'
import { getAllTools, getStandardByCode } from './toolDataService.js'

const allTools = getAllTools()

/**
 * 根据案件类型和案情描述匹配相关资源
 * @param {string} caseType - 案件类型: traffic-accident / work-injury / personal-injury / medical-malpractice
 * @param {string} description - 案情描述
 * @returns {Object} 匹配结果
 */
export function matchCase(caseType, description) {
  const result = {
    matchedInjuries: [],
    standards: [],
    tools: [],
    cases: [],
    confidence: 0
  }

  if (!caseType || !description) return result

  const category = caseKnowledgeMap[caseType]
  if (!category) return result

  const desc = description.toLowerCase()
  let matchCount = 0

  for (const [injuryId, injury] of Object.entries(category.injuries)) {
    const matched = injury.keywords.some(k => desc.includes(k.toLowerCase()))
    if (matched) {
      result.matchedInjuries.push({
        id: injuryId,
        name: injury.name,
        keywords: injury.keywords.filter(k => desc.includes(k.toLowerCase()))
      })
      result.standards.push(...injury.standards)
      result.tools.push(...injury.tools)
      result.cases.push(...injury.cases)
      matchCount++
    }
  }

  // 去重
  result.standards = [...new Set(result.standards)]
  result.tools = [...new Set(result.tools)]
  result.cases = [...new Set(result.cases)]
  result.confidence = matchCount

  // 丰富标准信息
  result.standardDetails = result.standards
    .map(code => getStandardByCode(code))
    .filter(Boolean)

  // 丰富工具信息
  result.toolDetails = result.tools
    .map(id => allTools.find(t => t.id === id))
    .filter(Boolean)

  return result
}

/**
 * 获取所有案件类型选项
 */
export function getCaseTypeOptions() {
  return Object.entries(caseKnowledgeMap).map(([key, data]) => ({
    value: key,
    label: data.name
  }))
}

/**
 * 获取某案件类型下的所有损伤类型
 */
export function getInjuryOptions(caseType) {
  const category = caseKnowledgeMap[caseType]
  if (!category) return []
  return Object.entries(category.injuries).map(([key, data]) => ({
    value: key,
    label: data.name,
    keywords: data.keywords
  }))
}

export default {
  matchCase,
  getCaseTypeOptions,
  getInjuryOptions
}
