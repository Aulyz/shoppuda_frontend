import { create } from "zustand"
import { persist } from "zustand/middleware"

interface RecentProduct {
  id: string | number
  name: string
  image: string
  main_image?: string
  images?: Array<{url: string}>
  price: number
  sale_price?: number
  regular_price?: number
  viewedAt: number
}

interface RecentProductsState {
  recentProducts: RecentProduct[]
  addProduct: (product: Omit<RecentProduct, 'viewedAt'>) => void
  getRecentProducts: () => RecentProduct[]
  clearExpiredProducts: () => void
  clearAllProducts: () => void
}

// 시크릿 모드 감지
const isIncognito = (): boolean => {
  try {
    // localStorage 접근 테스트
    localStorage.setItem('__test__', 'test')
    localStorage.removeItem('__test__')
    console.log('시크릿 모드 감지: false (정상 모드)')
    return false
  } catch (error) {
    console.log('시크릿 모드 감지: true (시크릿 모드)', error)
    return true
  }
}

// 30일 = 30 * 24 * 60 * 60 * 1000 milliseconds
const EXPIRY_TIME = 30 * 24 * 60 * 60 * 1000
const MAX_PRODUCTS = 10

export const useRecentProductsStore = create<RecentProductsState>()(
  persist(
    (set, get) => ({
      recentProducts: [],
      
      addProduct: (product) => {
        console.log('🛍️ 상품 추가:', product.name, '(ID:', product.id + ')')
        
        // 시크릿 모드에서는 저장하지 않음
        if (isIncognito()) {
          console.log('❌ 시크릿 모드로 인해 저장하지 않음')
          return
        }
        
        const current = get().recentProducts
        const now = Date.now()
        
        // 기존 상품 제거 (중복 방지)
        const filtered = current.filter(p => p.id !== product.id)
        
        // 새 상품을 맨 앞에 추가
        const newProduct: RecentProduct = {
          ...product,
          viewedAt: now
        }
        
        const updated = [newProduct, ...filtered]
          .slice(0, MAX_PRODUCTS) // 최대 10개로 제한
        
        set({ recentProducts: updated })
        console.log('✅ 최근 본 상품 저장 완료! 총', updated.length, '개')
      },
      
      getRecentProducts: () => {
        const products = get().recentProducts
        const now = Date.now()
        
        // 만료된 상품 필터링 (30일 이전 상품 제거)
        const validProducts = products.filter(
          product => (now - product.viewedAt) < EXPIRY_TIME
        )
        
        // 만료된 상품이 있다면 스토어 업데이트
        if (validProducts.length !== products.length) {
          set({ recentProducts: validProducts })
        }
        
        return validProducts
      },
      
      clearExpiredProducts: () => {
        const current = get().recentProducts
        const now = Date.now()
        
        const validProducts = current.filter(
          product => (now - product.viewedAt) < EXPIRY_TIME
        )
        
        set({ recentProducts: validProducts })
      },
      
      clearAllProducts: () => {
        set({ recentProducts: [] })
      }
    }),
    {
      name: 'recent-products-storage',
      // localStorage 사용 가능한지 확인하고 persist 설정
      storage: {
        getItem: (name) => {
          try {
            const value = localStorage.getItem(name)
            return value
          } catch (error) {
            console.log('❌ localStorage 읽기 실패:', error)
            return null
          }
        },
        setItem: (name, value) => {
          try {
            localStorage.setItem(name, value)
            console.log('💾 localStorage 저장 완료')
          } catch (error) {
            console.log('❌ localStorage 저장 실패:', error)
          }
        },
        removeItem: (name) => {
          try {
            localStorage.removeItem(name)
          } catch (error) {
            console.log('❌ localStorage 삭제 실패:', error)
          }
        }
      }
    }
  )
)

// 초기화 시 만료된 상품 정리
if (!isIncognito()) {
  useRecentProductsStore.getState().clearExpiredProducts()
}