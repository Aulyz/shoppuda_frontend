import axios from "axios"
import { useAuthStore } from "../store/authStore"

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://192.168.0.5:8000/api"

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
})

// Request interceptor: JWT(또는 Kakao) 붙이기
axiosInstance.interceptors.request.use(
  (config) => {
    const { accessToken, user } = useAuthStore.getState()

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }
    if (user?.loginType === "kakao") {
      const kakaoToken = localStorage.getItem("kakao_access_token")
      if (kakaoToken) {
        config.headers["X-Kakao-Token"] = kakaoToken
      }
    }
    return config
  },
  (error) => Promise.reject(error)
)

// JWT 토큰 갱신 중복 방지를 위한 플래그
let isRefreshing = false
let failedQueue: Array<{resolve: Function, reject: Function}> = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  
  failedQueue = []
}

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // 쿠폰 API에서 401 오류 시 강제 로그아웃 방지
    if (originalRequest.url?.includes('/coupons/')) {
      return Promise.reject(error)
    }

    // 401 에러이고 JWT 토큰이 있는 경우에만 리프레시 시도
    if (error.response?.status === 401 && !originalRequest._retry) {
      const { refreshToken, accessToken } = useAuthStore.getState()
      
      // JWT 토큰이 있는 경우에만 리프레시 시도
      if (refreshToken && accessToken) {
        if (isRefreshing) {
          // 이미 리프레시 중인 경우 대기열에 추가
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject })
          }).then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return axiosInstance(originalRequest)
          }).catch(err => {
            return Promise.reject(err)
          })
        }

        originalRequest._retry = true
        isRefreshing = true

        try {
          const res = await axios.post(`${API_BASE_URL}/accounts/api/jwt/refresh/`, {
            refresh: refreshToken,
          })
          const { access, refresh } = res.data
          
          const { updateTokens } = useAuthStore.getState()
          updateTokens(access, refresh || refreshToken)
          
          processQueue(null, access)
          
          originalRequest.headers.Authorization = `Bearer ${access}`
          return axiosInstance(originalRequest)
          
        } catch (refreshError) {
          processQueue(refreshError, null)
          
          // 리프레시 실패 시 로그아웃
          useAuthStore.getState().logout()
          window.location.href = "/login"
          return Promise.reject(refreshError)
        } finally {
          isRefreshing = false
        }
      }
    }

    return Promise.reject(error)
  }
)

export const api = {
  login: (
    data: { username: string; password: string; remember_me?: boolean },
    next_url?: string
  ) => {
    return axiosInstance
      .post("/account/login", {
        username: data.username,
        password: data.password,
      })
      .then((res) => res.data)
  },

  kakaoLogin: (data: { kakao_id: string; email: string; nickname: string }) =>
    axiosInstance.post("/accounts/api/jwt/kakao-login/", data).then((res) => res.data),

  logout: () =>
    axiosInstance.post(`/account/logout`).then((res) => res.data),

  signup: (data: any) =>
    axiosInstance.post(`/account/signup/`, data).then((res) => res.data),

  checkIdDuplicate: (username: string) =>
    axiosInstance
      .get(`/account/check-username`, { params: { username } })
      .then((res) => res.data),

  refreshToken: (refresh: string) =>
    axiosInstance.post(`/accounts/api/jwt/refresh/`, { refresh }).then((res) => res.data),

  getProducts: (params?: any) =>
    axiosInstance.get(`/shop/products/`, { params }).then((res) => res.data),

  getCategories: () =>
    axiosInstance.get(`/shop/categories/`).then((res) => {
      // API 응답 구조 확인
      if (res.data.status && res.data.categories) {
        return res.data.categories;
      }
      return res.data;
    }),

  getProduct: (id: number | string) => {
    if (typeof id === "string" && id.includes("-")) {
      // UUID 특수 처리(백엔드 이슈 우회 로직 유지)
      return axiosInstance.get(`/shop/products/`).then((res) => {
        const products = res.data.products || []
        const product = products.find((p: any) => p.id === id)
        if (!product) throw new Error("Product not found")
        return product
      })
    }
    return axiosInstance.get(`/shop/products/${id}/`).then((res) => res.data)
  },

  getCart: () => axiosInstance.get(`/cart/`).then((res) => res.data),

  addToCart: (data: {
    product_id: number | string
    quantity: number
    size?: string
    color?: string
  }) => axiosInstance.post(`/cart/`, data).then((res) => res.data),

  updateCartItem: (itemId: number, quantity: number) =>
    axiosInstance
      .patch(`/cart/items/${itemId}/`, { quantity })
      .then((res) => res.data),

  removeFromCart: (itemId: number) =>
    axiosInstance.delete(`/cart/items/${itemId}/`).then((res) => res.data),
  
  getCartCount: () => axiosInstance.get(`/cart/count/`).then((res) => res.data),

  getWishlist: () => axiosInstance.get(`/wishlist/`).then((res) => res.data),

  toggleWishlist: (productId: number | string) =>
    axiosInstance.post(`/wishlist/toggle/`, { product_id: productId }).then((res) => res.data),
  
  checkWishlist: (productId: number | string) =>
    axiosInstance.get(`/wishlist/check/${productId}/`).then((res) => res.data),

  getMyOrders: () => axiosInstance.get(`/mypage/orders/`).then((res) => res.data),

  createOrder: (data: {
    shipping_address: string
    billing_address?: string
    payment_method: string
  }) => axiosInstance.post(`/shop/orders/`, data).then((res) => res.data),

  getOrder: (id: number) =>
    axiosInstance.get(`/shop/orders/${id}/`).then((res) => res.data),

  getProfile: () => axiosInstance.get(`/user/profile/`).then((res) => res.data),

  updateProfile: (data: {
    email?: string
    first_name?: string
    last_name?: string
  }) => axiosInstance.patch(`/user/profile/`, data).then((res) => res.data),

  // MyPage APIs
  getMyPageProfile: () => 
    axiosInstance.get(`/mypage/profile/`).then((res) => res.data),
  
  updateMyPageProfile: (data: any) =>
    axiosInstance.patch(`/mypage/profile/`, data).then((res) => res.data),
  
  getShippingAddresses: () =>
    axiosInstance.get(`/mypage/shipping-addresses/`).then((res) => res.data),
  
  createShippingAddress: (data: any) =>
    axiosInstance.post(`/mypage/shipping-addresses/`, data).then((res) => res.data),
  
  updateShippingAddress: (id: number, data: any) =>
    axiosInstance.patch(`/mypage/shipping-addresses/${id}/`, data).then((res) => res.data),
  
  deleteShippingAddress: (id: number) =>
    axiosInstance.delete(`/mypage/shipping-addresses/${id}/`).then((res) => res.data),
  
  changePassword: (data: { current_password: string; new_password: string }) =>
    axiosInstance.post(`/mypage/change-password/`, data).then((res) => res.data),

  // 비밀번호 재설정 요청 (인증 코드 발송)
  resetPassword: (data: { email: string }) =>
    axios.post(`http://192.168.0.5:8000/accounts/api/password-reset/`, data).then((res) => res.data),
  
  // 인증 코드 확인
  verifyResetCode: (data: { email: string; code: string }) =>
    axios.post(`http://192.168.0.5:8000/accounts/api/password-reset/verify/`, data).then((res) => res.data),
  
  // 비밀번호 재설정 확인 (새 비밀번호 설정)
  resetPasswordConfirm: (data: { uid: string; token: string; new_password: string; confirm_password: string }) =>
    axios.post(`http://192.168.0.5:8000/accounts/api/password-reset/confirm/`, data).then((res) => res.data),
  
  // 인증 코드 재발송
  resendVerificationCode: (data: { email: string }) =>
    axios.post(`http://192.168.0.5:8000/accounts/api/password-reset/resend/`, data).then((res) => res.data),

  // Search APIs
  searchProducts: (query: string, params?: any) =>
    axiosInstance.get(`/shop/products/search/`, { 
      params: { q: query, ...params } 
    }).then((res) => res.data),
  
  getSearchSuggestions: (query: string) =>
    axiosInstance.get(`/shop/products/suggestions/`, { 
      params: { q: query } 
    }).then((res) => res.data),
  
  getPopularSearches: () =>
    axiosInstance.get(`/shop/products/popular-searches/`).then((res) => res.data),

  // Django 모델 그대로 가져오기
  getSettings: () => axiosInstance.get(`/core/get-settings`).then((res) => {
    return res.data
  }),
  
  // Checkout APIs
  getCheckoutInfo: () => 
    axiosInstance.get(`/checkout/info/`).then((res) => res.data),
  
  checkout: (data: {
    shipping_address_id: number
    payment_method: string
  }) => axiosInstance.post(`/checkout/`, data).then((res) => res.data),
  
  directPurchase: (data: {
    product_id: number
    quantity: number
    shipping_address_id: number
    payment_method: string
  }) => axiosInstance.post(`/checkout/direct/`, data).then((res) => res.data),
  
  // Order APIs
  getUserOrders: () => 
    axiosInstance.get(`/orders/`).then((res) => res.data),
  
  cancelOrder: (orderId: number) =>
    axiosInstance.post(`/orders/${orderId}/cancel/`).then((res) => res.data),

  // Coupon APIs
  getMyCoupons: () =>
    axiosInstance.get(`/coupons/api/my/`).then((res) => res.data),

  getCsrfToken: () =>
    axiosInstance.get(`/coupons/api/csrf-token/`).then((res) => res.data),

  claimCoupon: async (code: string) => {
    // CSRF 토큰과 함께 요청 (보안 강화)
    try {
      const csrfResponse = await axiosInstance.get(`/coupons/api/csrf-token/`)
      const csrfToken = csrfResponse.data.csrfToken
      
      return axiosInstance.post(`/coupons/api/claim/`, { code }, {
        headers: {
          'X-CSRFToken': csrfToken
        }
      }).then((res) => res.data)
    } catch (error: any) {
      // CSRF 토큰 가져오기 실패 시에도 에러 반환
      throw new Error('쿠폰 발급에 실패했습니다: ' + (error.response?.data?.message || error.message))
    }
  },

  getAvailableCoupons: (orderAmount?: number) =>
    axiosInstance.get(`/coupons/available/`, { 
      params: orderAmount ? { amount: orderAmount } : {} 
    }).then((res) => res.data),

  validateCoupon: async (userCouponId: number, orderAmount: number) => {
    return axiosInstance.post(`/coupons/api/validate/`, {
      user_coupon_id: userCouponId,
      order_amount: orderAmount
    }).then((res) => res.data)
  },

  calculateDiscount: async (userCouponId: number, orderAmount: number) => {
    try {
      const response = await axiosInstance.post(`/coupons/api/calculate-discount/`, {
        user_coupon_id: userCouponId,
        order_amount: orderAmount
      })
      return response.data
    } catch (error: any) {
      // 쿠폰 API 전용 에러 처리 - 강제 로그아웃 방지
      if (error.response?.status === 401) {
        throw new Error('로그인이 필요합니다. 다시 로그인해주세요.')
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message)
      } else {
        throw new Error('쿠폰 적용 중 오류가 발생했습니다.')
      }
    }
  },

  // Instagram API (추후 구현 예정)
  // getInstagramFeed: () =>
  //   axiosInstance.get(`/instagram/feed/`).then((res) => res.data),
}

export default api