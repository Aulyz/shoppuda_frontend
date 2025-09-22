import React, { useState, useEffect } from 'react'
import { api } from '../services/api'
import { useToastStore } from '../store/toastStore'

interface UserCoupon {
  id: number
  status: 'ISSUED' | 'USED' | 'EXPIRED' | 'CANCELLED'
  expires_at: string
  coupon: {
    id: number
    code: string
    name: string
    description: string
    discount_type: 'FIXED' | 'PERCENTAGE' | 'FREE_SHIPPING'
    discount_value: number
    max_discount_amount?: number
    min_order_amount: number
  }
}

interface CouponCodeInputProps {
  orderAmount: number
  onCouponApplied: (userCoupon: UserCoupon, discountAmount: number) => void
  onCouponRemoved: () => void
  appliedCoupon?: UserCoupon | null
}

const CouponCodeInput: React.FC<CouponCodeInputProps> = ({
  orderAmount,
  onCouponApplied,
  onCouponRemoved,
  appliedCoupon
}) => {
  const [couponCode, setCouponCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [availableCoupons, setAvailableCoupons] = useState<UserCoupon[]>([])
  const [showAvailableCoupons, setShowAvailableCoupons] = useState(false)
  const [loadingAvailable, setLoadingAvailable] = useState(false)
  const { addToast } = useToastStore()

  useEffect(() => {
    if (showAvailableCoupons && availableCoupons.length === 0) {
      fetchAvailableCoupons()
    }
  }, [showAvailableCoupons])

  const fetchAvailableCoupons = async () => {
    try {
      setLoadingAvailable(true)
      const response = await api.getAvailableCoupons(orderAmount)
      setAvailableCoupons(response.available_coupons || response || [])
    } catch (error: any) {
      console.error('Failed to fetch available coupons:', error)
    } finally {
      setLoadingAvailable(false)
    }
  }

  const applyCouponByCode = async () => {
    if (!couponCode.trim()) {
      addToast({
        type: 'warning',
        message: '쿠폰 코드를 입력해주세요.',
      })
      return
    }

    setIsLoading(true)
    try {
      // 먼저 쿠폰 발급 시도
      const claimResponse = await api.claimCoupon(couponCode.trim().toUpperCase())
      
      // 발급된 쿠폰 정보 가져오기
      const availableResponse = await api.getAvailableCoupons(orderAmount)
      const coupons = availableResponse.available_coupons || availableResponse || []
      
      // 방금 발급된 쿠폰 찾기
      const newCoupon = coupons.find((uc: UserCoupon) => 
        uc.coupon.code.toUpperCase() === couponCode.trim().toUpperCase()
      )
      
      if (newCoupon) {
        await applyCoupon(newCoupon)
        addToast({
          type: 'success',
          title: '쿠폰 발급 및 적용 완료!',
          message: `${newCoupon.coupon.name} 쿠폰이 적용되었습니다.`,
        })
      } else {
        addToast({
          type: 'warning',
          message: '쿠폰이 발급되었지만 현재 주문에는 적용할 수 없습니다.',
        })
      }
      
      setCouponCode('')
      
    } catch (error: any) {
      // 이미 발급된 쿠폰인 경우, 적용 시도
      if (error.response?.status === 400) {
        try {
          const availableResponse = await api.getAvailableCoupons(orderAmount)
          const coupons = availableResponse.available_coupons || availableResponse || []
          
          const existingCoupon = coupons.find((uc: UserCoupon) => 
            uc.coupon.code.toUpperCase() === couponCode.trim().toUpperCase()
          )
          
          if (existingCoupon) {
            await applyCoupon(existingCoupon)
            addToast({
              type: 'success',
              title: '쿠폰 적용 완료!',
              message: `${existingCoupon.coupon.name} 쿠폰이 적용되었습니다.`,
            })
            setCouponCode('')
          } else {
            throw error
          }
        } catch (applyError) {
          const errorMessage = error.response?.data?.message || 
                              error.response?.data?.error || 
                              '쿠폰 코드를 확인해주세요.'
          addToast({
            type: 'error',
            message: errorMessage,
          })
        }
      } else {
        const errorMessage = error.response?.data?.message || 
                            error.response?.data?.error || 
                            '쿠폰 적용에 실패했습니다.'
        addToast({
          type: 'error',
          message: errorMessage,
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const applyCoupon = async (userCoupon: UserCoupon) => {
    try {
      // 쿠폰 유효성 검증
      const validationResponse = await api.validateCoupon(userCoupon.id, orderAmount)
      
      if (!validationResponse.valid) {
        addToast({
          type: 'error',
          message: validationResponse.message || '쿠폰을 사용할 수 없습니다.',
        })
        return
      }

      // 할인 금액 계산
      const discountResponse = await api.calculateDiscount(userCoupon.id, orderAmount)
      const discountAmount = discountResponse.discount || 0

      onCouponApplied(userCoupon, discountAmount)
      setShowAvailableCoupons(false)
      
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          '쿠폰 적용에 실패했습니다.'
      addToast({
        type: 'error',
        message: errorMessage,
      })
    }
  }

  const removeCoupon = () => {
    onCouponRemoved()
    addToast({
      type: 'info',
      message: '쿠폰이 제거되었습니다.',
    })
  }

  const getDiscountText = (coupon: UserCoupon['coupon']) => {
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

  return (
    <div className="bg-white rounded-lg border p-4 space-y-4">
      <h3 className="text-lg font-semibold">쿠폰 할인</h3>
      
      {/* 적용된 쿠폰 표시 */}
      {appliedCoupon ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-medium text-green-800">{appliedCoupon.coupon.name}</h4>
              <p className="text-sm text-green-600">
                {getDiscountText(appliedCoupon.coupon)}
              </p>
              {appliedCoupon.coupon.description && (
                <p className="text-xs text-green-600 mt-1">{appliedCoupon.coupon.description}</p>
              )}
            </div>
            <button
              onClick={removeCoupon}
              className="text-green-600 hover:text-green-800 text-sm font-medium"
            >
              제거
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* 쿠폰 코드 입력 */}
          <div className="space-y-3">
            <div className="flex space-x-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="쿠폰 코드를 입력하세요"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
                onKeyPress={(e) => e.key === 'Enter' && applyCouponByCode()}
              />
              <button
                onClick={applyCouponByCode}
                disabled={isLoading || !couponCode.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? '적용 중...' : '적용'}
              </button>
            </div>
            
            {/* 사용 가능한 쿠폰 보기 버튼 */}
            <button
              onClick={() => setShowAvailableCoupons(!showAvailableCoupons)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              {showAvailableCoupons ? '숨기기' : '사용 가능한 쿠폰 보기'}
            </button>
          </div>

          {/* 사용 가능한 쿠폰 목록 */}
          {showAvailableCoupons && (
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">사용 가능한 쿠폰</h4>
              
              {loadingAvailable ? (
                <div className="space-y-2">
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="bg-gray-50 rounded-lg p-3 animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : availableCoupons.length > 0 ? (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {availableCoupons.map((userCoupon) => (
                    <div
                      key={userCoupon.id}
                      className="bg-gray-50 hover:bg-gray-100 rounded-lg p-3 cursor-pointer transition-colors"
                      onClick={() => applyCoupon(userCoupon)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="font-medium text-gray-900">{userCoupon.coupon.name}</h5>
                          <p className="text-sm text-blue-600 font-medium">
                            {getDiscountText(userCoupon.coupon)}
                          </p>
                          {userCoupon.coupon.min_order_amount > 0 && (
                            <p className="text-xs text-gray-500">
                              {Number(userCoupon.coupon.min_order_amount).toLocaleString()}원 이상 구매 시
                            </p>
                          )}
                        </div>
                        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                          적용
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm py-4 text-center">
                  현재 주문에 사용할 수 있는 쿠폰이 없습니다.
                </p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default CouponCodeInput