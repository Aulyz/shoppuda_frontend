import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { jwtDecode } from 'jwt-decode'

interface User {
  id: number
  username: string
  email: string
  first_name?: string
  last_name?: string
}

interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  user: User | null
  isAuthenticated: boolean
  login: (accessToken: string, refreshToken: string) => void
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

      login: (accessToken, refreshToken) => {
        try {
          const decoded: any = jwtDecode(accessToken)
          const user: User = {
            id: decoded.user_id,
            username: decoded.username || '',
            email: decoded.email || '',
            first_name: decoded.first_name,
            last_name: decoded.last_name,
          }
          
          set({
            accessToken,
            refreshToken,
            user,
            isAuthenticated: true,
          })
        } catch (error) {
          console.error('Error decoding token:', error)
        }
      },

      logout: () => {
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