import api from '@/lib/api'

/**
 * 認証関連のAPI通信
 * 
 * TODO: セキュリティ強化時はlocalStorageからHttpOnly Cookieに切り替える
 * Cookie方式では、トークンの保存・削除はサーバー側で行うため
 * localStorage.setItem / removeItem の処理は不要になる
 */
export const authRepository = {
  async signup(username: string, email: string, password: string) {
    const response = await api.post('/users', {
      name: username,
      email,
      password,
    })
    return response.data
  },

  async signin(email: string, password: string) {
    const response = await api.post('/auth/login', {
      email,
      password,
    })
    // トークンをlocalStorageに保存
    localStorage.setItem('token', response.data.token)
    return response.data
  },

  async getMe() {
    const response = await api.get('/auth/me')
    return response.data
  },

  logout() {
    localStorage.removeItem('token')
  },

  getToken() {
    return localStorage.getItem('token')
  },

  isAuthenticated() {
    return !!localStorage.getItem('token')
  },
}