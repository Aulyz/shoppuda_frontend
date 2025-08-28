import axios from 'axios'
import { useAuthStore } from '../store/authStore'

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
    const token = useAuthStore.getState().accessToken
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
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

    return axios.post(`${API_BASE_URL}/account/login/${params.toString() ? '?' + params.toString() : ''}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      withCredentials: true,
    }).then(res => res.data);
  },
  
  logout: () =>
    axios.get(`${API_BASE_URL}/account/logout/`, { withCredentials: true }).then(res => res.data),
  
  signup: (data: {
    username: string
    email: string
    password: string
    first_name: string
  }) => axios.post(`${API_BASE_URL}/signup/`, data).then(res => res.data),
  
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
  
  getProduct: (id: number) =>
    axiosInstance.get(`/shop/products/${id}/`).then(res => res.data),

  // Cart
  getCart: () => axiosInstance.get('/shop/cart/').then(res => res.data),
  
  addToCart: (data: {
    product_id: number
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
  
  toggleWishlist: (productId: number) =>
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