// src/store/authStore.ts
import { create } from "zustand"
import { persist } from "zustand/middleware"
import { jwtDecode } from "jwt-decode"

interface User {
  id?: number
  username: string
  email?: string
  first_name?: string
  last_name?: string
  type?: "CUSTOMER" | "STAFF" | "ADMIN"
  loginType?: "normal" | "kakao"
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
              id: user?.id || decoded.user_id,
              username: user?.username || decoded.username || "",
              email: user?.email || decoded.email || "",
              first_name: user?.first_name || decoded.first_name || "",
              last_name: user?.last_name || decoded.last_name || "",
              loginType: user?.loginType || decoded.loginType || "normal",
            }

            set({
              accessToken,
              refreshToken,
              user: userData,
              isAuthenticated: true,
            })
          } catch (error) {
            // Silently handle token decode errors
            // 토큰 디코딩 실패시에도 user 정보가 있으면 사용
            if (user) {
              set({
                accessToken,
                refreshToken,
                user,
                isAuthenticated: true,
              })
              console.log("Login with user data:", user);
            }
          }
        } else if (user) {
          // 토큰 기반이 아닌 경우 (카카오 로그인 등)
          set({
            accessToken: null,
            refreshToken: null,
            user,
            isAuthenticated: true,
          })
          console.log("Login without token, user data:", user);
        }
      },

      logout: () => {
        localStorage.removeItem("kakao_access_token")
        localStorage.removeItem("kakao_refresh_token")

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
      name: "auth-storage", // localStorage key
    }
  )
)
