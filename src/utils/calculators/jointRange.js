/**
 * 关节活动度计算模块
 * 依据: GA/T 1661-2019《法医学 关节活动度检验规范》
 */

// 各关节正常活动度参考值 (度)
export const NORMAL_RANGE = {
  shoulder: { name: '肩关节', flexion: 180, extension: 50, abduction: 180, adduction: 50, internalRotation: 70, externalRotation: 90 },
  elbow: { name: '肘关节', flexion: 150, extension: 0, pronation: 80, supination: 80 },
  wrist: { name: '腕关节', flexion: 80, extension: 70, radialDeviation: 20, ulnarDeviation: 30 },
  hip: { name: '髋关节', flexion: 125, extension: 15, abduction: 45, adduction: 30, internalRotation: 45, externalRotation: 45 },
  knee: { name: '膝关节', flexion: 135, extension: 0 },
  ankle: { name: '踝关节', dorsiflexion: 20, plantarflexion: 50, inversion: 35, eversion: 15 }
}

// 功能丧失等级划分 (简化版，基于常见标准)
// 实际GA/T 1661-2019中各关节/方向有不同的等级阈值
const DISABILITY_LEVELS = [
  { threshold: 0.25, level: '十级', desc: '功能丧失10%-25%' },
  { threshold: 0.50, level: '九级', desc: '功能丧失25%-50%' },
  { threshold: 0.75, level: '八级', desc: '功能丧失50%-75%' },
  { threshold: 1.00, level: '七级', desc: '功能丧失75%以上' }
]

/**
 * 计算关节活动度丧失百分比
 * @param {Object} params
 * @param {string} params.joint - 关节部位
 * @param {string} params.direction - 测量方向
 * @param {number} params.healthySide - 健侧角度
 * @param {number} params.affectedSide - 患侧角度
 * @param {string} params.measureMethod - 测量方式
 */
export function calculateJointRange(params) {
  const { joint, direction, healthySide, affectedSide, measureMethod } = params

  // 获取正常参考值
  const jointData = NORMAL_RANGE[joint]
  const normalAngle = jointData?.[direction] || healthySide

  // 计算丧失角度
  const lostAngle = Math.max(0, healthySide - affectedSide)

  // 计算丧失百分比
  const lossPercentage = lostAngle / healthySide

  // 判断等级
  let level = '不构成伤残等级'
  let levelCode = 'none'
  for (const item of DISABILITY_LEVELS) {
    if (lossPercentage >= item.threshold) {
      level = item.level
      levelCode = item.level
    }
  }

  // 备注
  const notes = []
  if (lossPercentage > 1) {
    notes.push('患侧角度大于健侧，请检查测量数据是否正确')
  }
  if (measureMethod === 'passive' && affectedSide > healthySide * 0.8) {
    notes.push('被动活动度接近健侧，提示可能为功能性障碍而非器质性损伤')
  }
  if (lossPercentage >= 0.25) {
    notes.push('建议结合影像学检查综合评定伤残等级')
  }

  return {
    jointName: jointData?.name || joint,
    direction,
    normalAngle,
    healthySide,
    affectedSide,
    lostAngle: round(lostAngle),
    lossPercentage: round(lossPercentage * 100),
    level,
    levelCode,
    measureMethod,
    notes
  }
}

/**
 * 获取计算步骤说明
 */
export function getCalculationSteps(result) {
  return [
    {
      step: 1,
      title: '确定正常参考值',
      formula: '健侧活动度或标准参考值',
      calculation: `${result.jointName} ${result.direction}: ${result.normalAngle}°`
    },
    {
      step: 2,
      title: '计算丧失角度',
      formula: '健侧角度 - 患侧角度',
      calculation: `${result.healthySide}° - ${result.affectedSide}° = ${result.lostAngle}°`
    },
    {
      step: 3,
      title: '计算功能丧失百分比',
      formula: '(丧失角度 / 健侧角度) × 100%',
      calculation: `(${result.lostAngle} / ${result.healthySide}) × 100% = ${result.lossPercentage}%`
    },
    {
      step: 4,
      title: '对照标准评定等级',
      formula: '参照 GA/T 1661-2019 条款',
      calculation: `功能丧失 ${result.lossPercentage}% → ${result.level}`
    }
  ]
}

/**
 * 获取风险提示
 */
export function getRiskWarnings(result) {
  const warnings = []
  if (result.lossPercentage > 100) {
    warnings.push('计算结果异常：患侧角度大于健侧，请重新测量')
  }
  warnings.push('本计算仅基于活动度数据，实际伤残评定需结合影像学、肌力检查等综合判断')
  warnings.push('GA/T 1661-2019 规定：测量应在相同体位、相同条件下进行')
  warnings.push('关节强直或畸形时，功能丧失百分比可能超过100%，需特别注明')
  return warnings
}

/**
 * 获取可用的关节列表
 */
export function getJointOptions() {
  return Object.entries(NORMAL_RANGE).map(([key, data]) => ({
    value: key,
    label: data.name,
    directions: Object.keys(data).filter(k => k !== 'name')
  }))
}

/**
 * 获取方向中文名
 */
export function getDirectionLabel(direction) {
  const map = {
    flexion: '屈曲',
    extension: '伸展',
    abduction: '外展',
    adduction: '内收',
    internalRotation: '内旋',
    externalRotation: '外旋',
    pronation: '旋前',
    supination: '旋后',
    radialDeviation: '桡偏',
    ulnarDeviation: '尺偏',
    dorsiflexion: '背屈',
    plantarflexion: '跖屈',
    inversion: '内翻',
    eversion: '外翻'
  }
  return map[direction] || direction
}

function round(value, decimals = 2) {
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals)
}

export default {
  calculateJointRange,
  getCalculationSteps,
  getRiskWarnings,
  getJointOptions,
  getDirectionLabel,
}

