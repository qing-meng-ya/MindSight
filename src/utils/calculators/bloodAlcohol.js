/**
 * 血液酒精浓度计算模块 (Blood Alcohol Concentration)
 * 依据: Widmark公式 + GA/T 1073-2013 / GA/T 842
 */

// 酒精密度: 0.789 g/ml
const ALCOHOL_DENSITY = 0.789

// 酒精分布系数
const DISTRIBUTION_RATIO = {
  male: 0.68,
  female: 0.55
}

// 代谢率: mg/100ml 每小时
const METABOLISM_RATE = 17

// 中国法律标准 (mg/100ml)
const LEGAL_LIMITS = {
  normal: 20,     // <20: 正常
  drunkDriving: 80, // ≥20 && <80: 酒驾
  // ≥80: 醉驾
}

/**
 * 计算血液酒精浓度
 * @param {Object} params
 * @param {number} params.volume - 饮酒量 (ml)
 * @param {number} params.alcoholContent - 酒精度数 (%)
 * @param {number} params.weight - 体重 (kg)
 * @param {'male'|'female'} params.gender - 性别
 * @param {number} params.drinkingDuration - 饮酒时长 (小时)
 * @param {number} params.timeSinceDrinking - 距检测时间 (小时)
 */
export function calculateBAC(params) {
  const { volume, alcoholContent, weight, gender, drinkingDuration, timeSinceDrinking } = params

  // 1. 计算摄入酒精总量 (克)
  const pureAlcoholGrams = volume * (alcoholContent / 100) * ALCOHOL_DENSITY

  // 2. 计算分布体积
  const r = DISTRIBUTION_RATIO[gender] || DISTRIBUTION_RATIO.male
  const distributionVolume = weight * r

  // 3. 理论峰值BAC (不考虑代谢)
  const peakBAC = (pureAlcoholGrams / distributionVolume) * 100

  // 4. 考虑代谢后的当前BAC
  // 假设从开始饮酒到检测时间一直在代谢
  const totalMetabolism = timeSinceDrinking * METABOLISM_RATE
  let currentBAC = peakBAC - totalMetabolism
  if (currentBAC < 0) currentBAC = 0

  // 5. 法律判定
  let legalStatus = '正常'
  let legalStatusClass = 'normal'
  if (currentBAC >= LEGAL_LIMITS.drunkDriving) {
    legalStatus = '醉驾'
    legalStatusClass = 'severely-drunk'
  } else if (currentBAC >= LEGAL_LIMITS.normal) {
    legalStatus = '酒驾'
    legalStatusClass = 'drunk-driving'
  }

  // 6. 完全代谢所需时间
  const hoursToSober = peakBAC / METABOLISM_RATE

  // 7. 峰值时间（通常饮酒后30-90分钟达到峰值，简化处理）
  const peakTime = Math.min(drinkingDuration * 0.5, 1.5)

  return {
    pureAlcoholGrams: round(pureAlcoholGrams),
    peakBAC: round(peakBAC),
    currentBAC: round(currentBAC),
    legalStatus,
    legalStatusClass,
    hoursToSober: round(hoursToSober, 1),
    peakTime: round(peakTime, 1),
    metabolismRate: METABOLISM_RATE,
    params: { ...params }
  }
}

/**
 * 获取详细计算步骤说明
 */
export function getCalculationSteps(result) {
  const { params, pureAlcoholGrams, peakBAC, currentBAC, hoursToSober } = result
  const r = DISTRIBUTION_RATIO[params.gender] || DISTRIBUTION_RATIO.male

  return [
    {
      step: 1,
      title: '计算摄入纯酒精量',
      formula: `饮酒量 × 酒精度数 × 酒精密度`,
      calculation: `${params.volume}ml × ${params.alcoholContent}% × ${ALCOHOL_DENSITY} = ${pureAlcoholGrams}g`
    },
    {
      step: 2,
      title: '计算酒精分布体积',
      formula: `体重 × 分布系数(r)`,
      calculation: `${params.weight}kg × ${r} = ${round(params.weight * r)}`
    },
    {
      step: 3,
      title: '计算理论峰值BAC',
      formula: `(纯酒精量 / 分布体积) × 100`,
      calculation: `(${pureAlcoholGrams} / ${round(params.weight * r)}) × 100 = ${peakBAC} mg/100ml`
    },
    {
      step: 4,
      title: '扣除代谢量',
      formula: `峰值BAC - (代谢率 × 时间)`,
      calculation: `${peakBAC} - (${METABOLISM_RATE} × ${params.timeSinceDrinking}) = ${currentBAC} mg/100ml`
    },
    {
      step: 5,
      title: '估算完全代谢时间',
      formula: `峰值BAC / 代谢率`,
      calculation: `${peakBAC} / ${METABOLISM_RATE} = ${hoursToSober} 小时`
    }
  ]
}

/**
 * 获取风险提示
 */
export function getRiskWarnings(result) {
  const warnings = []
  const { currentBAC, peakBAC, hoursToSober } = result

  if (currentBAC >= 80) {
    warnings.push('血液酒精浓度已达到醉驾标准，严禁驾驶机动车')
    warnings.push('根据《刑法》第一百三十三条之一，醉驾构成危险驾驶罪')
  } else if (currentBAC >= 20) {
    warnings.push('血液酒精浓度已达到酒驾标准，不得驾驶机动车')
    warnings.push('根据《道路交通安全法》第九十一条，酒驾处暂扣驾驶证并罚款')
  }

  if (peakBAC >= 200) {
    warnings.push('峰值BAC极高，存在急性酒精中毒风险，建议就医')
  } else if (peakBAC >= 150) {
    warnings.push('饮酒量较大，可能出现明显的运动协调障碍和判断力下降')
  }

  warnings.push('计算结果仅供参考，实际BAC受个体代谢差异、进食情况、肝功能等多种因素影响')
  warnings.push('如需法律用途，请以 GA/T 1073-2013 标准的气相色谱检测结果为准')

  return warnings
}

function round(value, decimals = 2) {
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals)
}

export default {
  calculateBAC,
  getCalculationSteps,
  getRiskWarnings,
  LEGAL_LIMITS,
  METABOLISM_RATE
}
