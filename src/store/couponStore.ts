import { create } from 'zustand'
import { api } from '../services/api'

export interface UserCoupon {
  id: number
  status: 'ISSUED' | 'USED' | 'EXPIRED' | 'CANCELLED'
  issued_at: string
  used_at?: string
  expires_at: string
  discount_amount: number
  coupon: {
    code: string
    name: string
    description: string
    discount_type: 'FIXED' | 'PERCENTAGE' | 'FREE_SHIPPING'
    discount_value: number
    max_discount_amount?: number
    min_order_amount: number
  }
}

interface CouponState {
  userCoupons: UserCoupon[]
  ownedCouponCodes: string[]
  isLoading: boolean
  isInitialized: boolean
  
  // Actions
  fetchUserCoupons: () => Promise<void>
  claimCoupon: (couponCode: string) => Promise<{ success: boolean; message?: string; coupon?: any }>
  updateCouponStatus: (couponId: number, status: UserCoupon['status']) => void
  addClaimedCoupon: (couponCode: string, coupon?: any) => void
  clearCoupons: () => void
}

export const useCouponStore = create<CouponState>((set, get) => ({
  userCoupons: [],
  ownedCouponCodes: [],
  isLoading: false,
  isInitialized: false,

  fetchUserCoupons: async () => {
    try {
      set({ isLoading: true })
      const response = await api.getMyCoupons()
      
      let coupons: UserCoupon[] = []
      if (Array.isArray(response)) {
        coupons = response
      } else if (response && Array.isArray(response.user_coupons)) {
        coupons = response.user_coupons
      } else if (response && Array.isArray(response.results)) {
        coupons = response.results
      }
      
      const couponCodes = coupons
        .filter((coupon: UserCoupon) => coupon.status === 'ISSUED')
        .map((coupon: UserCoupon) => coupon.coupon?.code)
        .filter(Boolean)
      
      set({ 
        userCoupons: coupons, 
        ownedCouponCodes: couponCodes,
        isInitialized: true,
        isLoading: false 
      })
    } catch (error) {
      console.error('Failed to fetch user coupons:', error)
      set({ 
        userCoupons: [], 
        ownedCouponCodes: [],
        isInitialized: true,
        isLoading: false 
      })
    }
  },

  claimCoupon: async (couponCode: string) => {
    try {
      const response = await api.claimCoupon(couponCode)
      
      // 성공적으로 쿠폰을 발급받았으면 즉시 상태 업데이트
      const { addClaimedCoupon } = get()
      addClaimedCoupon(couponCode, response.coupon)
      
      // 백그라운드에서 최신 쿠폰 목록 동기화
      setTimeout(() => {
        get().fetchUserCoupons()
      }, 1000)
      
      return { 
        success: true, 
        message: `${response.coupon?.name || '쿠폰'}이 발급되었습니다.`,
        coupon: response.coupon 
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message ||
                          '쿠폰 발급에 실패했습니다.'
      
      return { success: false, message: errorMessage }
    }
  },

  updateCouponStatus: (couponId: number, status: UserCoupon['status']) => {
    set(state => ({
      userCoupons: state.userCoupons.map(coupon =>
        coupon.id === couponId ? { ...coupon, status } : coupon
      ),
      ownedCouponCodes: state.userCoupons
        .map(coupon => coupon.id === couponId ? { ...coupon, status } : coupon)
        .filter(coupon => coupon.status === 'ISSUED')
        .map(coupon => coupon.coupon?.code)
        .filter(Boolean)
    }))
  },

  addClaimedCoupon: (couponCode: string, _coupon?: any) => {
    set(state => {
      // 이미 보유중인 쿠폰인지 확인
      if (state.ownedCouponCodes.includes(couponCode)) {
        return state
      }
      
      return {
        ownedCouponCodes: [...state.ownedCouponCodes, couponCode]
      }
    })
  },

  clearCoupons: () => {
    set({ 
      userCoupons: [], 
      ownedCouponCodes: [],
      isInitialized: false 
    })
  }
}))