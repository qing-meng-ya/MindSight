/**
 * 护理期/误工期/营养期计算模块
 * 依据: GA/T 1193-2014《人身损害误工期、护理期、营养期评定规范》
 * 注: 本模块基于标准中的常见损伤类型整理简化查表数据
 */

// 损伤类型查表数据 (天数范围)
const CARE_PERIOD_TABLE = {
  // 颅脑损伤
  'brain-concussion': {
    name: '脑震荡',
    category: '颅脑损伤',
    workDelay: { min: 30, max: 60 },
    carePeriod: { min: 7, max: 15 },
    nutritionPeriod: { min: 7, max: 15 },
    surgeryAdjustment: 0,
    note: '有意识障碍者适当延长'
  },
  'brain-contusion': {
    name: '脑挫裂伤',
    category: '颅脑损伤',
    workDelay: { min: 90, max: 180 },
    carePeriod: { min: 30, max: 60 },
    nutritionPeriod: { min: 30, max: 60 },
    surgeryAdjustment: 30,
    note: '伴有神经系统症状者适当延长'
  },
  'skull-fracture': {
    name: '颅骨骨折',
    category: '颅脑损伤',
    workDelay: { min: 90, max: 180 },
    carePeriod: { min: 15, max: 30 },
    nutritionPeriod: { min: 15, max: 30 },
    surgeryAdjustment: 30,
    note: '开放性骨折或凹陷性骨折需手术者延长'
  },
  // 面部损伤
  'jaw-fracture': {
    name: '颌骨骨折',
    category: '面部损伤',
    workDelay: { min: 90, max: 180 },
    carePeriod: { min: 15, max: 30 },
    nutritionPeriod: { min: 30, max: 60 },
    surgeryAdjustment: 30,
    note: '影响进食者营养期适当延长'
  },
  // 胸部损伤
  'rib-fracture-1-2': {
    name: '肋骨骨折(1-2根)',
    category: '胸部损伤',
    workDelay: { min: 30, max: 60 },
    carePeriod: { min: 7, max: 15 },
    nutritionPeriod: { min: 15, max: 30 },
    surgeryAdjustment: 15,
    note: ''
  },
  'rib-fracture-3-5': {
    name: '肋骨骨折(3-5根)',
    category: '胸部损伤',
    workDelay: { min: 60, max: 120 },
    carePeriod: { min: 15, max: 30 },
    nutritionPeriod: { min: 15, max: 30 },
    surgeryAdjustment: 15,
    note: '伴血气胸者适当延长'
  },
  'rib-fracture-6plus': {
    name: '肋骨骨折(6根以上)',
    category: '胸部损伤',
    workDelay: { min: 90, max: 180 },
    carePeriod: { min: 30, max: 60 },
    nutritionPeriod: { min: 30, max: 60 },
    surgeryAdjustment: 30,
    note: '伴胸廓畸形者适当延长'
  },
  // 腹部损伤
  'spleen-injury': {
    name: '脾破裂',
    category: '腹部损伤',
    workDelay: { min: 90, max: 180 },
    carePeriod: { min: 30, max: 60 },
    nutritionPeriod: { min: 30, max: 60 },
    surgeryAdjustment: 30,
    note: '保守治疗者适当缩短'
  },
  // 脊柱损伤
  'vertebra-fracture': {
    name: '椎体骨折',
    category: '脊柱损伤',
    workDelay: { min: 120, max: 240 },
    carePeriod: { min: 60, max: 90 },
    nutritionPeriod: { min: 60, max: 90 },
    surgeryAdjustment: 30,
    note: '伴脊髓损伤者参照相应条款'
  },
  // 上肢损伤
  'shoulder-fracture': {
    name: '肩关节骨折/脱位',
    category: '上肢损伤',
    workDelay: { min: 90, max: 180 },
    carePeriod: { min: 30, max: 60 },
    nutritionPeriod: { min: 30, max: 60 },
    surgeryAdjustment: 30,
    note: '肱骨近端骨折参照本条款'
  },
  'humerus-fracture': {
    name: '肱骨干骨折',
    category: '上肢损伤',
    workDelay: { min: 90, max: 180 },
    carePeriod: { min: 30, max: 60 },
    nutritionPeriod: { min: 30, max: 60 },
    surgeryAdjustment: 30,
    note: '伴桡神经损伤者延长'
  },
  'forearm-fracture': {
    name: '尺桡骨骨折',
    category: '上肢损伤',
    workDelay: { min: 90, max: 180 },
    carePeriod: { min: 30, max: 60 },
    nutritionPeriod: { min: 30, max: 60 },
    surgeryAdjustment: 30,
    note: '双骨折或开放性骨折延长'
  },
  'wrist-fracture': {
    name: '腕部骨折',
    category: '上肢损伤',
    workDelay: { min: 90, max: 180 },
    carePeriod: { min: 30, max: 60 },
    nutritionPeriod: { min: 30, max: 60 },
    surgeryAdjustment: 30,
    note: 'Colles骨折参照本条款'
  },
  'hand-fracture': {
    name: '掌指骨骨折',
    category: '上肢损伤',
    workDelay: { min: 30, max: 90 },
    carePeriod: { min: 15, max: 30 },
    nutritionPeriod: { min: 15, max: 30 },
    surgeryAdjustment: 15,
    note: '多发骨折适当延长'
  },
  // 下肢损伤
  'hip-fracture': {
    name: '髋部骨折',
    category: '下肢损伤',
    workDelay: { min: 180, max: 365 },
    carePeriod: { min: 90, max: 180 },
    nutritionPeriod: { min: 60, max: 90 },
    surgeryAdjustment: 30,
    note: '老年患者适当延长'
  },
  'femur-fracture': {
    name: '股骨干骨折',
    category: '下肢损伤',
    workDelay: { min: 120, max: 240 },
    carePeriod: { min: 60, max: 120 },
    nutritionPeriod: { min: 60, max: 90 },
    surgeryAdjustment: 30,
    note: '粉碎性骨折或开放性骨折延长'
  },
  'knee-fracture': {
    name: '膝关节骨折/韧带损伤',
    category: '下肢损伤',
    workDelay: { min: 90, max: 180 },
    carePeriod: { min: 60, max: 90 },
    nutritionPeriod: { min: 30, max: 60 },
    surgeryAdjustment: 30,
    note: '交叉韧带损伤参照本条款'
  },
  'tibia-fracture': {
    name: '胫腓骨骨折',
    category: '下肢损伤',
    workDelay: { min: 120, max: 240 },
    carePeriod: { min: 60, max: 90 },
    nutritionPeriod: { min: 60, max: 90 },
    surgeryAdjustment: 30,
    note: '胫骨平台骨折参照本条款'
  },
  'ankle-fracture': {
    name: '踝关节骨折',
    category: '下肢损伤',
    workDelay: { min: 90, max: 180 },
    carePeriod: { min: 30, max: 60 },
    nutritionPeriod: { min: 30, max: 60 },
    surgeryAdjustment: 30,
    note: '三踝骨折延长'
  },
  'foot-fracture': {
    name: '跖趾骨骨折',
    category: '下肢损伤',
    workDelay: { min: 60, max: 120 },
    carePeriod: { min: 15, max: 30 },
    nutritionPeriod: { min: 15, max: 30 },
    surgeryAdjustment: 15,
    note: '多发骨折适当延长'
  },
  // 其他
  'skin-burn-10': {
    name: '烧伤(浅II度,面积<10%)',
    category: '其他损伤',
    workDelay: { min: 30, max: 60 },
    carePeriod: { min: 15, max: 30 },
    nutritionPeriod: { min: 15, max: 30 },
    surgeryAdjustment: 15,
    note: '面部或手部烧伤适当延长'
  },
  'skin-burn-30': {
    name: '烧伤(深II度,面积10%-30%)',
    category: '其他损伤',
    workDelay: { min: 60, max: 120 },
    carePeriod: { min: 30, max: 60 },
    nutritionPeriod: { min: 30, max: 60 },
    surgeryAdjustment: 30,
    note: '需植皮者延长'
  }
}

// 年龄调整系数
const AGE_ADJUSTMENT = {
  child: { min: 14, factor: 0.8, label: '儿童(<14岁)' },
  adult: { min: 14, max: 60, factor: 1.0, label: '成年人(14-60岁)' },
  elderly: { min: 60, factor: 1.2, label: '老年人(≥60岁)' }
}

/**
 * 计算护理期/误工期/营养期
 * @param {Object} params
 * @param {string} params.injuryType - 损伤类型key
 * @param {boolean} params.hasSurgery - 是否手术
 * @param {boolean} params.hasComplication - 是否有并发症
 * @param {number} params.age - 年龄
 */
export function calculateCarePeriod(params) {
  const { injuryType, hasSurgery, hasComplication, age } = params

  const data = CARE_PERIOD_TABLE[injuryType]
  if (!data) {
    return { error: '未找到该损伤类型的查表数据' }
  }

  // 确定年龄调整系数
  let ageFactor = 1.0
  if (age < 14) ageFactor = AGE_ADJUSTMENT.child.factor
  else if (age >= 60) ageFactor = AGE_ADJUSTMENT.elderly.factor

  // 计算各期限
  const calcPeriod = (period) => {
    let min = period.min * ageFactor
    let max = period.max * ageFactor

    // 手术调整
    if (hasSurgery) {
      min += data.surgeryAdjustment * ageFactor
      max += data.surgeryAdjustment * ageFactor
    }

    // 并发症调整 (+20%)
    if (hasComplication) {
      min = Math.round(min * 1.2)
      max = Math.round(max * 1.2)
    }

    return { min: Math.round(min), max: Math.round(max) }
  }

  const workDelay = calcPeriod(data.workDelay)
  const carePeriod = calcPeriod(data.carePeriod)
  const nutritionPeriod = calcPeriod(data.nutritionPeriod)

  // 生成建议
  const suggestions = []
  if (hasSurgery) suggestions.push('已考虑手术治疗延长')
  if (hasComplication) suggestions.push('已考虑并发症影响')
  if (age >= 60) suggestions.push('老年人恢复期较长，已做适当延长')
  if (age < 14) suggestions.push('儿童恢复能力较强，已做适当缩短')

  return {
    injuryName: data.name,
    category: data.category,
    workDelay,
    carePeriod,
    nutritionPeriod,
    hasSurgery,
    hasComplication,
    age,
    ageFactor,
    standardNote: data.note,
    suggestions
  }
}

/**
 * 获取损伤类型选项列表
 */
export function getInjuryOptions() {
  const categories = {}
  Object.entries(CARE_PERIOD_TABLE).forEach(([key, data]) => {
    if (!categories[data.category]) {
      categories[data.category] = []
    }
    categories[data.category].push({ value: key, label: data.name })
  })
  return Object.entries(categories).map(([category, items]) => ({
    category,
    items
  }))
}

/**
 * 获取计算步骤说明
 */
export function getCalculationSteps(result) {
  const steps = [
    {
      step: 1,
      title: '确定基准期限',
      formula: '查 GA/T 1193-2014 表',
      calculation: `${result.injuryName}: 误工期 ${result.workDelay.min}-${result.workDelay.max}天`
    }
  ]

  if (result.hasSurgery) {
    steps.push({
      step: 2,
      title: '手术调整',
      formula: '基准期限 + 手术延长天数',
      calculation: '已增加手术恢复期'
    })
  }

  if (result.age >= 60 || result.age < 14) {
    steps.push({
      step: steps.length + 1,
      title: '年龄调整',
      formula: '期限 × 年龄系数',
      calculation: `年龄系数: ${result.ageFactor}`
    })
  }

  if (result.hasComplication) {
    steps.push({
      step: steps.length + 1,
      title: '并发症调整',
      formula: '期限 × 1.2',
      calculation: '已考虑并发症影响'
    })
  }

  return steps
}

/**
 * 获取风险提示
 */
export function getRiskWarnings(result) {
  const warnings = []
  warnings.push('计算结果基于 GA/T 1193-2014 标准的一般性规定，实际评定应结合临床具体情况')
  warnings.push('多处损伤时，误工期、护理期、营养期应以"最长一处"为原则确定')
  warnings.push('本结果为参考范围，最终期限由鉴定人根据临床实际综合判断')
  if (result.workDelay.max > 365) {
    warnings.push('误工期超过365天，建议按"休息至定残前一日"原则处理')
  }
  return warnings
}

export default {
  calculateCarePeriod,
  getInjuryOptions,
  getCalculationSteps,
  getRiskWarnings,
  CARE_PERIOD_TABLE
}
