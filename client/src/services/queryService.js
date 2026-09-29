import api from './api'

export async function fetchSchema() {
  const { data } = await api.get('/schema')
  return data
}

export async function runQuery(question) {
  const { data } = await api.post('/query', { question })
  return data
}

export async function fetchHistory() {
  const { data } = await api.get('/query/history')
  return data
}
