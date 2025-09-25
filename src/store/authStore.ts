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
        console.log('AuthStore login 호출:', { accessToken: !!accessToken, refreshToken: !!refreshToken, user });

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

            console.log('JWT 토큰 디코딩 성공, 사용자 데이터:', userData);

            set({
              accessToken,
              refreshToken,
              user: userData,
              isAuthenticated: true,
            });
          } catch (error) {
            console.error('JWT 토큰 디코딩 실패:', error);
            // 토큰 디코딩 실패시에도 user 정보가 있으면 사용
            if (user) {
              console.log('사용자 정보로 로그인:', user);
              set({
                accessToken,
                refreshToken,
                user,
                isAuthenticated: true,
              });
            } else {
              console.error('토큰 디코딩 실패 및 사용자 정보 없음');
            }
          }
        } else if (user) {
          // 토큰 기반이 아닌 경우 (카카오 로그인 등)
          console.log('토큰 없이 사용자 정보로만 로그인:', user);
          set({
            accessToken,
            refreshToken,
            user,
            isAuthenticated: true,
          });
        } else {
          console.error('로그인 실패: 토큰과 사용자 정보가 모두 없음');
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
