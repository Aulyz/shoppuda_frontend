import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { jwtDecode } from 'jwt-decode'

interface User {
  id?: number
  username: string
  email?: string
  first_name?: string
  last_name?: string
  type?: 'CUSTOMER' | 'STAFF' | 'ADMIN'
  loginType?: 'normal' | 'kakao'
}

interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  user: User | null
  isAuthenticated: boolean
  login: (accessToken: string | null, refreshToken: string | null, user?: User) => void
  logout: () => void
  updateTokens: (accessToken: string, refreshToken: string) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,

      login: (accessToken, refreshToken, user) => {
        if (accessToken && refreshToken) {
          try {
            const decoded: any = jwtDecode(accessToken)
            const userData: User = {
              id: decoded.user_id,
              username: decoded.username || '',
              email: decoded.email || '',
              first_name: decoded.first_name,
              last_name: decoded.last_name,
            }
            
            set({
              accessToken,
              refreshToken,
              user: userData,
              isAuthenticated: true,
            })
          } catch (error) {
            console.error('Error decoding token:', error)
          }
        } else if (user) {
          // 토큰 기반이 아닌 로그인 처리 (백엔드 API 응답 기반)
          set({
            accessToken: null,
            refreshToken: null,
            user,
            isAuthenticated: true,
          })
        }
      },

      logout: () => {
        // 카카오 토큰 localStorage에서 제거
        localStorage.removeItem('kakao_access_token');
        localStorage.removeItem('kakao_refresh_token');
        
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          isAuthenticated: false,
        })
      },

      updateTokens: (accessToken, refreshToken) => {
        set({ accessToken, refreshToken })
      },
    }),
    {
      name: 'auth-storage',
    }
  )
)