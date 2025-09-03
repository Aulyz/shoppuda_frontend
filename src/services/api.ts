import axios from "axios"
import { useAuthStore } from "../store/authStore"

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000/api"

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

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      try {
        const { refreshToken, updateTokens, logout } = useAuthStore.getState()
        if (refreshToken) {
          const res = await axios.post(`${API_BASE_URL}/token/refresh/`, {
            refresh: refreshToken,
          })
          const { access } = res.data
          updateTokens(access, refreshToken)

          originalRequest.headers.Authorization = `Bearer ${access}`
          return axiosInstance(originalRequest)
        }
        logout()
        window.location.href = "/login"
      } catch {
        useAuthStore.getState().logout()
        window.location.href = "/login"
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
    const params = new URLSearchParams()
    if (next_url) params.set("next", next_url)

    const formData = new FormData()
    formData.append("username", data.username)
    formData.append("password", data.password)
    if (data.remember_me) formData.append("remember_me", "true")

    return axiosInstance
      .post(
        `/account/login${params.toString() ? "?" + params.toString() : ""}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      )
      .then((res) => res.data)
  },

  logout: () =>
    axiosInstance.post(`/jwt/logout/`).then((res) => res.data),

  signup: (data: any) =>
    axiosInstance.post(`/account/signup/`, data).then((res) => res.data),

  checkIdDuplicate: (username: string) =>
    axiosInstance
      .get(`/account/check-username`, { params: { username } })
      .then((res) => res.data),

  refreshToken: (refresh: string) =>
    axiosInstance.post(`/token/refresh/`, { refresh }).then((res) => res.data),

  getProducts: (params?: any) =>
    axiosInstance.get(`/shop/products/`, { params }).then((res) => res.data),

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

  getCart: () => axiosInstance.get(`/shop/cart/`).then((res) => res.data),

  addToCart: (data: {
    product_id: number | string
    quantity: number
    size?: string
    color?: string
  }) => axiosInstance.post(`/shop/cart/add/`, data).then((res) => res.data),

  updateCartItem: (itemId: number, quantity: number) =>
    axiosInstance
      .patch(`/shop/cart/items/${itemId}/`, { quantity })
      .then((res) => res.data),

  removeFromCart: (itemId: number) =>
    axiosInstance.delete(`/shop/cart/items/${itemId}/`).then((res) => res.data),

  getWishlist: () => axiosInstance.get(`/shop/wishlist/`).then((res) => res.data),

  toggleWishlist: (productId: number | string) =>
    axiosInstance.post(`/shop/wishlist/toggle/${productId}/`).then((res) => res.data),

  getMyOrders: () => axiosInstance.get(`/shop/orders/`).then((res) => res.data),

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
}

export default api