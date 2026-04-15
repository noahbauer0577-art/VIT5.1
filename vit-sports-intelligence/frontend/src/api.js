// frontend/src/api.js
// VIT Sports Intelligence Network — v2.3.0
// Added: model status, reload, data source health, manual match,
//        CSV upload, accumulator candidates/generate/send

const API_BASE_URL = import.meta.env.VITE_API_URL || ''
console.log('[API] Base URL:', API_BASE_URL || '(using relative URLs)')
export const API_KEY = ''
export function getApiKey() { return localStorage.getItem('vit_api_key') || '' }
export function setApiKey(value) { localStorage.setItem('vit_api_key', value || '') }

function defaultHeaders(extra = {}) {
  const key = getApiKey()
  return { 'Content-Type': 'application/json', ...(key ? { 'x-api-key': key } : {}), ...extra }
}

function authHeaders(apiKey, extra = {}) {
  const key = apiKey || getApiKey()
  return { 'Content-Type': 'application/json', ...(key ? { 'x-api-key': key } : {}), ...extra }
}

async function apiFetch(path, options = {}) {
  const url = `${API_BASE_URL}${path}`
  try {
    const res = await fetch(url, {
      headers: defaultHeaders(),
      ...options,
    })
    if (!res.ok) {
      const text = await res.text()
      console.error(`[API] Error at ${url}:`, res.status, text)
      throw new Error(text || res.statusText || 'Request failed')
    }
    const data = await res.json()
    return data
  } catch (error) {
    console.error(`[API] Fetch failed for ${url}:`, error.message)
    throw error
  }
}

// ── Existing ──────────────────────────────────────────────────────────
export async function fetchHealth()               { return apiFetch('/health') }
export async function fetchHistory(limit=10, offset=0) { return apiFetch(`/history?limit=${limit}&offset=${offset}`) }
export async function fetchMatchDetail(matchId)   { return apiFetch(`/history/${matchId}`) }
export async function fetchPicks()                { return apiFetch('/history/picks') }
export async function clearHistory(apiKey)       { return apiFetch(`/history/clear-all`, { method: 'DELETE', headers: authHeaders(apiKey) }) }
export async function predictMatch(matchData)     { return apiFetch('/predict', { method: 'POST', body: JSON.stringify(matchData) }) }
export async function fetchFixturesByDate(apiKey, date, count=25) { return apiFetch(`/admin/fixtures/by-date?date=${encodeURIComponent(date)}&count=${count}`) }
export async function fetchFixtureById(fixtureId) { return apiFetch(`/admin/fixtures/by-id/${encodeURIComponent(fixtureId)}`) }

// ── v2.2.0 — Model Management ─────────────────────────────────────────
export async function fetchModelStatus(apiKey) {
  return apiFetch(`/admin/models/status`)
}

export async function reloadModels(apiKey, modelKey = null) {
  return apiFetch(`/admin/models/reload`, {
    method: 'POST',
    headers: authHeaders(apiKey),
    body: JSON.stringify({ model_key: modelKey }),
  })
}

// ── v2.2.0 — Data Source Health ──────────────────────────────────────
export async function fetchDataSourceStatus(apiKey) {
  return apiFetch(`/admin/data-sources/status`)
}

// ── v2.2.0 — Manual Match Entry ──────────────────────────────────────
export async function addManualMatch(apiKey, matchData) {
  return apiFetch(`/admin/matches/manual`, {
    method: 'POST',
    headers: authHeaders(apiKey),
    body: JSON.stringify(matchData),
  })
}

// ── v2.2.0 — CSV Upload ──────────────────────────────────────────────
export async function uploadCSVFixtures(apiKey, file) {
  const formData = new FormData()
  formData.append('file', file)
  const res = await fetch(
    `${API_BASE_URL}/admin/upload/csv`,
    { method: 'POST', headers: apiKey ? { 'x-api-key': apiKey } : {}, body: formData }
  )
  if (!res.ok) throw new Error(await res.text() || 'Upload failed')
  return res.json()
}

// ── v3.1.0 — Model Weights Upload ────────────────────────────────────
export async function uploadModelWeights(apiKey, file) {
  const formData = new FormData()
  formData.append('file', file)
  const res = await fetch(
    `${API_BASE_URL}/admin/upload/models`,
    { method: 'POST', headers: apiKey ? { 'x-api-key': apiKey } : {}, body: formData }
  )
  if (!res.ok) throw new Error(await res.text() || 'Upload failed')
  return res.json()
}

// ── v2.3.0 — Accumulator ─────────────────────────────────────────────
export async function fetchAccumulatorCandidates(apiKey, { minConfidence = 0.60, minEdge = 0.01, count = 15 } = {}) {
  return apiFetch(
    `/admin/accumulator/candidates?min_confidence=${minConfidence}&min_edge=${minEdge}&count=${count}`
  )
}

export async function generateAccumulators(apiKey, { candidates, minLegs = 2, maxLegs = 6, topN = 10 }) {
  return apiFetch(`/admin/accumulator/generate`, {
    method: 'POST',
    headers: authHeaders(apiKey),
    body: JSON.stringify({ candidates, min_legs: minLegs, max_legs: maxLegs, top_n: topN }),
  })
}

export async function sendAccumulatorToTelegram(apiKey, accumulator, channelNote = '') {
  return apiFetch(`/admin/accumulator/send`, {
    method: 'POST',
    headers: authHeaders(apiKey),
    body: JSON.stringify({ accumulator, channel_note: channelNote }),
  })
}

// ── Results Settlement & Live Fixtures ───────────────────────────────
export async function settleResults(apiKey, daysBack = 2) {
  return apiFetch(`/admin/settle-results?days_back=${daysBack}`, { method: 'POST', headers: authHeaders(apiKey) })
}

// ── API Key Management ────────────────────────────────────────────────
export async function fetchApiKeys(apiKey) {
  return apiFetch(`/admin/api-keys`)
}

export async function updateApiKey(apiKey, keyName, newValue) {
  return apiFetch(`/admin/api-keys/update`, {
    method: 'POST',
    headers: authHeaders(apiKey),
    body: JSON.stringify({ updates: { [keyName]: newValue } }),
  })
}

// ── Bankroll ──────────────────────────────────────────────────────────
export async function fetchBankroll(apiKey) {
  return apiFetch(`/admin/bankroll`)
}

// ── Decision Log ──────────────────────────────────────────────────────
export async function fetchDecisionLog(apiKey, limit = 50) {
  return apiFetch(`/admin/decision-log?limit=${limit}`)
}

// ── Gemini AI Insights ────────────────────────────────────────────────
export async function fetchGeminiInsights(matchId) {
  return apiFetch(`/predict/${matchId}/insights`)
}

// ── Multi-AI Insights ─────────────────────────────────────────────────
export async function fetchMultiAIInsights(matchId, sources = ['gemini', 'claude', 'grok']) {
  const q = sources.join(',')
  return apiFetch(`/ai/multi-insights/${matchId}?sources=${encodeURIComponent(q)}`)
}
