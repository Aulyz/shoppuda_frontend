import React, { useEffect, useState } from 'react'
import { api } from '../services/api'
import { useToastStore } from '../store/toastStore'

interface Coupon {
  id: number
  name: string
  description: string
  discount_type: 'FIXED' | 'PERCENTAGE' | 'FREE_SHIPPING'
  discount_value: number
  max_discount_amount?: number
  min_order_amount: number
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

interface UserCoupon {
  id: number
  status: 'ISSUED' | 'USED' | 'EXPIRED' | 'CANCELLED'
  issued_at: string
  used_at?: string
  expires_at: string
  discount_amount: number
  coupon: Coupon['coupon']
}

const CouponList: React.FC = () => {
  const [userCoupons, setUserCoupons] = useState<UserCoupon[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { addToast } = useToastStore()

  useEffect(() => {
    fetchMyCoupons()
  }, [])

  const fetchMyCoupons = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.getMyCoupons()
      
      // 응답 데이터 안전하게 처리
      let coupons = []
      if (Array.isArray(response)) {
        coupons = response
      } else if (response && Array.isArray(response.user_coupons)) {
        coupons = response.user_coupons
      } else if (response && Array.isArray(response.results)) {
        coupons = response.results
      } else {
        console.warn('Unexpected API response format:', response)
        coupons = []
      }
      
      setUserCoupons(coupons)
    } catch (err: any) {
      // 401/403 에러 (인증 필요) 처리
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError('로그인이 필요합니다.')
        addToast({
          type: 'warning',
          message: '로그인 후 이용해주세요.',
        })
      } else {
        const errorMessage = err.response?.data?.message || '쿠폰 목록을 불러오는데 실패했습니다.'
        setError(errorMessage)
        addToast({
          type: 'error',
          message: errorMessage,
        })
      }
      setUserCoupons([]) // 에러 시 빈 배열로 설정
    } finally {
      setLoading(false)
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ISSUED':
        return '사용 가능'
      case 'USED':
        return '사용 완료'
      case 'EXPIRED':
        return '만료됨'
      case 'CANCELLED':
        return '취소됨'
      default:
        return status
    }
  }

  const getStatusColor = (status: string, expiresAt: string) => {
    if (status === 'USED') return 'text-gray-500 bg-gray-100'
    if (status === 'EXPIRED' || status === 'CANCELLED') return 'text-red-500 bg-red-100'
    
    // 만료 3일 이내인지 확인
    const expiryDate = new Date(expiresAt)
    const now = new Date()
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)
    
    if (expiryDate <= threeDaysFromNow) {
      return 'text-red-600 bg-red-100 animate-pulse'
    }
    
    return 'text-green-600 bg-green-100'
  }

  const getDiscountText = (coupon: Coupon['coupon']) => {
    switch (coupon.discount_type) {
      case 'FIXED':
        return `${Number(coupon.discount_value).toLocaleString()}원 할인`
      case 'PERCENTAGE':
        return `${coupon.discount_value}% 할인${
          coupon.max_discount_amount ? ` (최대 ${Number(coupon.max_discount_amount).toLocaleString()}원)` : ''
        }`
      case 'FREE_SHIPPING':
        return '무료 배송'
      default:
        return '할인'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getExpiryText = (expiresAt: string) => {
    const expiryDate = new Date(expiresAt)
    const now = new Date()
    const diffTime = expiryDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return '만료됨'
    if (diffDays === 0) return '오늘 만료'
    if (diffDays <= 3) return `${diffDays}일 후 만료`
    
    return formatDate(expiresAt)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg border p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/4"></div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-4">
          {error.includes('로그인') ? '🔐' : '❌'}
        </div>
        <p className="text-red-600 mb-4">{error}</p>
        {error.includes('로그인') ? (
          <div className="space-y-2">
            <p className="text-gray-600 text-sm">로그인 후 쿠폰을 확인할 수 있습니다.</p>
            <button
              onClick={() => window.location.href = '/login'}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              로그인하기
            </button>
          </div>
        ) : (
          <button
            onClick={fetchMyCoupons}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            다시 시도
          </button>
        )}
      </div>
    )
  }

  if (userCoupons.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🎫</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">보유한 쿠폰이 없습니다</h3>
        <p className="text-gray-600">쿠폰 코드를 입력하거나 이벤트에 참여해서 쿠폰을 받아보세요!</p>
      </div>
    )
  }

  // 배열인지 확인 후 filter 사용
  const safeUserCoupons = Array.isArray(userCoupons) ? userCoupons : []
  const availableCoupons = safeUserCoupons.filter(uc => uc.status === 'ISSUED' && new Date(uc.expires_at) > new Date())
  const usedCoupons = safeUserCoupons.filter(uc => uc.status === 'USED')
  const expiredCoupons = safeUserCoupons.filter(uc => uc.status === 'EXPIRED' || new Date(uc.expires_at) <= new Date())

  return (
    <div className="space-y-6">
      {/* 통계 */}
      <div className="bg-white rounded-lg border p-4">
        <h2 className="text-lg font-semibold mb-4">쿠폰 현황</h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-green-600">{availableCoupons.length}</div>
            <div className="text-sm text-gray-600">사용 가능</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-500">{usedCoupons.length}</div>
            <div className="text-sm text-gray-600">사용 완료</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-500">{expiredCoupons.length}</div>
            <div className="text-sm text-gray-600">만료됨</div>
          </div>
        </div>
      </div>

      {/* 사용 가능한 쿠폰 */}
      {availableCoupons.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3 text-green-700">사용 가능한 쿠폰</h3>
          <div className="space-y-3">
            {availableCoupons.map((userCoupon) => (
              <CouponCard key={userCoupon.id} userCoupon={userCoupon} />
            ))}
          </div>
        </div>
      )}

      {/* 사용 완료된 쿠폰 */}
      {usedCoupons.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3 text-gray-700">사용 완료된 쿠폰</h3>
          <div className="space-y-3">
            {usedCoupons.map((userCoupon) => (
              <CouponCard key={userCoupon.id} userCoupon={userCoupon} />
            ))}
          </div>
        </div>
      )}

      {/* 만료된 쿠폰 */}
      {expiredCoupons.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3 text-red-700">만료된 쿠폰</h3>
          <div className="space-y-3">
            {expiredCoupons.map((userCoupon) => (
              <CouponCard key={userCoupon.id} userCoupon={userCoupon} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

const CouponCard: React.FC<{ userCoupon: UserCoupon }> = ({ userCoupon }) => {
  const { coupon, status, expires_at, used_at } = userCoupon

  const getDiscountText = (coupon: Coupon['coupon']) => {
    switch (coupon.discount_type) {
      case 'FIXED':
        return `${Number(coupon.discount_value).toLocaleString()}원 할인`
      case 'PERCENTAGE':
        return `${coupon.discount_value}% 할인${
          coupon.max_discount_amount ? ` (최대 ${Number(coupon.max_discount_amount).toLocaleString()}원)` : ''
        }`
      case 'FREE_SHIPPING':
        return '무료 배송'
      default:
        return '할인'
    }
  }

  const getStatusColor = (status: string, expiresAt: string) => {
    if (status === 'USED') return 'text-gray-500 bg-gray-100'
    if (status === 'EXPIRED') return 'text-red-500 bg-red-100'
    
    const expiryDate = new Date(expiresAt)
    const now = new Date()
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)
    
    if (expiryDate <= threeDaysFromNow) {
      return 'text-red-600 bg-red-100 animate-pulse'
    }
    
    return 'text-green-600 bg-green-100'
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ISSUED':
        return '사용 가능'
      case 'USED':
        return '사용 완료'
      case 'EXPIRED':
        return '만료됨'
      case 'CANCELLED':
        return '취소됨'
      default:
        return status
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getExpiryText = (expiresAt: string) => {
    const expiryDate = new Date(expiresAt)
    const now = new Date()
    const diffTime = expiryDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return '만료됨'
    if (diffDays === 0) return '오늘 만료'
    if (diffDays <= 3) return `${diffDays}일 후 만료`
    
    return `${formatDate(expiresAt)}까지`
  }

  return (
    <div className={`bg-white rounded-lg border p-4 ${status === 'USED' ? 'opacity-60' : ''}`}>
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900">{coupon.name}</h4>
          {coupon.description && (
            <p className="text-sm text-gray-600 mt-1">{coupon.description}</p>
          )}
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status, expires_at)}`}>
          {getStatusText(status)}
        </span>
      </div>
      
      <div className="flex justify-between items-end">
        <div>
          <div className="text-lg font-bold text-blue-600">
            {getDiscountText(coupon)}
          </div>
          {coupon.min_order_amount > 0 && (
            <div className="text-xs text-gray-500">
              {Number(coupon.min_order_amount).toLocaleString()}원 이상 구매 시
            </div>
          )}
        </div>
        
        <div className="text-right text-sm">
          {status === 'USED' && used_at ? (
            <div className="text-gray-500">
              {formatDate(used_at)} 사용
            </div>
          ) : status === 'ISSUED' ? (
            <div className={`${new Date(expires_at).getTime() - new Date().getTime() <= 3 * 24 * 60 * 60 * 1000 ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>
              {getExpiryText(expires_at)}
            </div>
          ) : (
            <div className="text-red-500">
              {formatDate(expires_at)} 만료
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CouponList