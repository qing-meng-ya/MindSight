/**
 * YOLO Prediction API Client
 * Communicates with the FastAPI backend at localhost:8000
 */

const API_BASE = 'http://localhost:8000'

/**
 * Check if the backend is healthy and model is loaded.
 */
export async function checkHealth() {
  const res = await fetch(`${API_BASE}/health`)
  if (!res.ok) throw new Error('后端服务未响应')
  return res.json()
}

/**
 * Send a single image for prediction.
 * @param {File} file - Image file
 * @returns {Promise<import('../data/yoloClasses.json')>} prediction result
 */
export async function predictImage(file) {
  const formData = new FormData()
  formData.append('image', file)

  const res = await fetch(`${API_BASE}/predict`, {
    method: 'POST',
    body: formData,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: '请求失败' }))
    throw new Error(err.detail || '预测请求失败')
  }
  return res.json()
}

/**
 * Send multiple images for batch prediction.
 * @param {File[]} files
 */
export async function predictBatch(files) {
  const formData = new FormData()
  files.forEach(f => formData.append('images', f))

  const res = await fetch(`${API_BASE}/predict_batch`, {
    method: 'POST',
    body: formData,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: '请求失败' }))
    throw new Error(err.detail || '批量预测请求失败')
  }
  return res.json()
}
