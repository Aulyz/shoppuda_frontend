import axios from 'axios'
import { useAuthStore } from '../store/authStore'
import { getKakaoToken } from '../utils/kakaoAuth'

const API_BASE_URL = 'http://shoppuda.kro.kr/api'

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

// Request interceptor to add auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore.getState()
    const token = authStore.accessToken
    const kakaoToken = getKakaoToken()
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    } else if (kakaoToken && authStore.user?.loginType === 'kakao') {
      config.headers['X-Kakao-Token'] = kakaoToken
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle token refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      try {
        const refreshToken = useAuthStore.getState().refreshToken
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/token/refresh/`, {
            refresh: refreshToken
          })
          
          const { access } = response.data
          useAuthStore.getState().updateTokens(access, refreshToken)
          
          originalRequest.headers.Authorization = `Bearer ${access}`
          return axiosInstance(originalRequest)
        }
      } catch {
        useAuthStore.getState().logout()
        window.location.href = '/login'
      }
    }
    
    return Promise.reject(error)
  }
)

export const api = {
  // Auth
  login: (data: { username: string; password: string; remember_me?: boolean }, next_url?: string) => {
    const params = new URLSearchParams();
    if (next_url) {
      params.set('next', next_url);
    }
    
    const formData = new FormData();
    formData.append('username', data.username);
    formData.append('password', data.password);
    if (data.remember_me) {
      formData.append('remember_me', 'true');
    }

    return axios.post(`${API_BASE_URL}/account/login${params.toString() ? '?' + params.toString() : ''}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      withCredentials: true,
    }).then(res => res.data);
  },
  
  logout: () =>
    axios.get(`${API_BASE_URL}/account/logout`, { withCredentials: true }).then(res => res.data),
  
  signup: (data: {
    username: string
    email: string
    password1: string
    password2: string
    first_name: string
    phone_number: string
    birth_date?: string
    gender?: string
    postal_code?: string
    address?: string
    detail_address?: string
    terms_agreed: boolean
    privacy_agreed: boolean
    marketing_agreed: boolean
  }) => axios.post(`${API_BASE_URL}/account/signup/`, data).then(res => res.data),
  
  checkIdDuplicate: (username: string) =>
    axios.get(`${API_BASE_URL}/account/check-username`, { 
      params: { username },
      withCredentials: true 
    }).then(res => res.data),
  
  refreshToken: (refresh: string) =>
    axios.post(`${API_BASE_URL}/token/refresh/`, { refresh }).then(res => res.data),

  // Products
  getProducts: (params?: {
    category?: string
    search?: string
    ordering?: string
    page?: number
    featured?: boolean
    limit?: number
  }) => axiosInstance.get('/shop/products/', { params }).then(res => res.data),
  
  getProduct: (id: number | string) => {
    // UUID인 경우 백엔드 API 이슈로 인해 product list에서 찾기
    if (typeof id === 'string' && id.includes('-')) {
      // UUID 형태인 경우 products list에서 해당 상품 찾기
      return axiosInstance.get('/shop/products/').then(res => {
        const products = res.data.products || []
        const product = products.find((p: any) => p.id === id)
        if (!product) {
          throw new Error('Product not found')
        }
        return product
      })
    }
    // 정수 ID인 경우 기존 방식 사용
    return axiosInstance.get(`/shop/products/${id}/`).then(res => res.data)
  },

  // Cart
  getCart: () => axiosInstance.get('/shop/cart/').then(res => res.data),
  
  addToCart: (data: {
    product_id: number | string
    quantity: number
    size?: string
    color?: string
  }) => axiosInstance.post('/shop/cart/add/', data).then(res => res.data),
  
  updateCartItem: (itemId: number, quantity: number) =>
    axiosInstance.patch(`/shop/cart/items/${itemId}/`, { quantity }).then(res => res.data),
  
  removeFromCart: (itemId: number) =>
    axiosInstance.delete(`/shop/cart/items/${itemId}/`).then(res => res.data),

  // Wishlist
  getWishlist: () => axiosInstance.get('/shop/wishlist/').then(res => res.data),
  
  toggleWishlist: (productId: number | string) =>
    axiosInstance.post(`/shop/wishlist/toggle/${productId}/`).then(res => res.data),

  // Orders
  getMyOrders: () => axiosInstance.get('/shop/orders/').then(res => res.data),
  
  createOrder: (data: {
    shipping_address: string
    billing_address?: string
    payment_method: string
  }) => axiosInstance.post('/shop/orders/', data).then(res => res.data),
  
  getOrder: (id: number) =>
    axiosInstance.get(`/shop/orders/${id}/`).then(res => res.data),

  // User
  getProfile: () => axiosInstance.get('/shop/profile/').then(res => res.data),
  
  updateProfile: (data: {
    email?: string
    first_name?: string
    last_name?: string
  }) => axiosInstance.patch('/shop/profile/', data).then(res => res.data),
}