import { create } from 'zustand'

type User = {
  id: string
  name: string
  email: string
  role: string
}

type AuthState = {
  user: User | null
  isAuthenticated: boolean
  setAuth: (user: User) => void
  clearAuth: () => void
}

/**
 * 認証状態を一元管理するストア
 * 
 * TODO: セキュリティ強化時はlocalStorageからHttpOnly Cookieに切り替える
 * Cookie方式ではisAuthenticatedの判定を
 * localStorageのトークン有無ではなく、getMe APIの成否で行うようにする
 */
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: !!localStorage.getItem('token'),

  setAuth: (user: User) =>
    set({
      user,
      isAuthenticated: true,
    }),

  clearAuth: () => {
    localStorage.removeItem('token')
    set({
      user: null,
      isAuthenticated: false,
    })
  },
}))