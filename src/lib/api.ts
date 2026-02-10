import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.PROD 
    ? '/api'
    : 'http://localhost:8888/api',
  headers: {
    'Content-Type': 'application/json',
  },
})


/**
 * リクエストインターセプター
 * 全リクエストに自動でAuthorizationヘッダーを付与する
 * 
 * TODO: セキュリティ強化時はlocalStorageからHttpOnly Cookieに切り替える
 * Cookie方式に切り替えた場合、このインターセプターは不要になる
 */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api