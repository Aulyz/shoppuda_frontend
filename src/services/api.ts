// src/services/api.ts
import axios from "axios"
import { useAuthStore } from "../store/authStore"

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000/api"

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
})

// Request interceptor: JWT 붙이기
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

// Response interceptor: 401 → 토큰 갱신
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
      } catch {
        useAuthStore.getState().logout()
        window.location.href = "/login"
      }
    }

    return Promise.reject(error)
  }
)

// 실제 API 호출 모듈
export const api = {
  // Auth
  login: (data: { username: string; password: string; remember_me?: boolean }, next_url?: string) => {
    const params = new URLSearchParams()
    if (next_url) params.set("next", next_url)

    const formData = new FormData()
    formData.append("username", data.username)
    formData.append("password", data.password)
    if (data.remember_me) formData.append("remember_me", "true")

    return axios
      .post(
        `${API_BASE_URL}/account/login${params.toString() ? "?" + params.toString() : ""}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" }, withCredentials: true }
      )
      .then((res) => res.data)
  },

  logout: () => axios.get(`${API_BASE_URL}/account/logout`, { withCredentials: true }).then((res) => res.data),

  signup: (data: any) =>
    axios.post(`${API_BASE_URL}/account/signup/`, data).then((res) => res.data),

  checkIdDuplicate: (username: string) =>
    axios
      .get(`${API_BASE_URL}/account/check-username`, { params: { username }, withCredentials: true })
      .then((res) => res.data),

  refreshToken: (refresh: string) =>
    axios.post(`${API_BASE_URL}/token/refresh/`, { refresh }).then((res) => res.data),

  // Products
  getProducts: (params?: any) => axiosInstance.get("/shop/products/", { params }).then((res) => res.data),

  getProduct: (id: number | string) => {
    if (typeof id === "string" && id.includes("-")) {
      return axiosInstance.get("/shop/products/").then((res) => {
        const products = res.data.products || []
        const product = products.find((p: any) => p.id === id)
        if (!product) throw new Error("Product not found")
        return product
      })
    }
    return axiosInstance.get(`/shop/products/${id}/`).then((res) => res.data)
  },

  // Cart
  getCart: () => axiosInstance.get("/shop/cart/").then((res) => res.data),
  addToCart: (data: any) => axiosInstance.post("/shop/cart/add/", data).then((res) => res.data),
  updateCartItem: (itemId: number, quantity: number) =>
    axiosInstance.patch(`/shop/cart/items/${itemId}/`, { quantity }).then((res) => res.data),
  removeFromCart: (itemId: number) => axiosInstance.delete(`/shop/cart/items/${itemId}/`).then((res) => res.data),

  // Wishlist
  getWishlist: () => axiosInstance.get("/shop/wishlist/").then((res) => res.data),
  toggleWishlist: (productId: number | string) => axiosInstance.post(`/shop/wishlist/toggle/${productId}/`).then((res) => res.data),

  // Orders
  getMyOrders: () => axiosInstance.get("/shop/orders/").then((res) => res.data),
  createOrder: (data: any) => axiosInstance.post("/shop/orders/", data).then((res) => res.data),
  getOrder: (id: number) => axiosInstance.get(`/shop/orders/${id}/`).then((res) => res.data),

  // User
  getProfile: () => axiosInstance.get("/shop/profile/").then((res) => res.data),
  updateProfile: (data: any) => axiosInstance.patch("/shop/profile/", data).then((res) => res.data),
}
