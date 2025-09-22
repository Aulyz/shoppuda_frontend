import React, { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { Link, useNavigate } from 'react-router-dom'
import { TrashIcon, PlusIcon, MinusIcon, TicketIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import { api } from '../services/api'

function Cart() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  
  // 쿠폰 관련 상태
  const [selectedCoupon, setSelectedCoupon] = useState<any>(null)
  const [showCouponList, setShowCouponList] = useState(false)
  const [couponDiscount, setCouponDiscount] = useState(0)
  
  // 페이지 접속 시 맨 위로 스크롤
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])
  
  // 장바구니 데이터 조회
  const { data: cart, isLoading } = useQuery('cart', api.getCart)
  
  // 내 쿠폰 조회
  const { data: myCoupons } = useQuery('myCoupons', api.getMyCoupons)

  // 총 상품 금액 계산
  const subtotal = cart?.items?.reduce(
    (sum: number, item: any) => {
      // sale_price가 0이거나 null/undefined인 경우 price 사용
      const salePrice = parseFloat(item.product.sale_price || '0');
      const regularPrice = parseFloat(item.product.price || '0');
      const price = salePrice > 0 ? salePrice : regularPrice;
      return sum + price * item.quantity;
    },
    0
  ) || 0

  const shippingFee = subtotal >= 30000 ? 0 : 3000
  const discountedSubtotal = Math.max(0, subtotal - couponDiscount) // 0보다 작아지지 않도록
  const totalAmount = discountedSubtotal + shippingFee

  // 장바구니 금액이 변경될 때 쿠폰 할인 금액 다시 계산
  useEffect(() => {
    if (selectedCoupon && subtotal > 0) {
      const recalculateDiscount = async () => {
        try {
          const response = await api.calculateDiscount(selectedCoupon.id, subtotal)
          if (response.success) {
            setCouponDiscount(response.discount_amount || 0)
          }
        } catch (error) {
          // 오류 발생 시 쿠폰 해제
          setSelectedCoupon(null)
          setCouponDiscount(0)
        }
      }
      recalculateDiscount()
    }
  }, [subtotal, selectedCoupon])

  // 수량 변경 뮤테이션
  const updateQuantityMutation = useMutation(
    ({ itemId, quantity }: { itemId: number; quantity: number }) =>
      api.updateCartItem(itemId, quantity),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('cart')
        toast.success('수량이 변경되었습니다')
      }
    }
  )

  // 상품 삭제 뮤테이션
  const removeItemMutation = useMutation(
    (itemId: number) => api.removeFromCart(itemId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('cart')
        toast.success('상품이 삭제되었습니다')
      }
    }
  )

  // 수량 변경 핸들러
  const handleQuantityChange = (itemId: number, quantity: number) => {
    if (quantity < 1) return
    updateQuantityMutation.mutate({ itemId, quantity })
  }

  // 상품 삭제 핸들러
  const handleRemoveItem = (itemId: number) => {
    removeItemMutation.mutate(itemId)
  }

  // 쿠폰 선택 핸들러
  const handleSelectCoupon = async (coupon: any) => {
    try {
      if (coupon.id === selectedCoupon?.id) {
        // 같은 쿠폰을 다시 클릭하면 선택 해제
        setSelectedCoupon(null)
        setCouponDiscount(0)
        setShowCouponList(false)
        return
      }

      // 쿠폰 변경 시 알림
      if (selectedCoupon) {
        toast(`기존 쿠폰을 해제하고 ${coupon.coupon?.name || coupon.name}으로 변경합니다`, {
          icon: '🔄'
        })
      }

      // 쿠폰 할인 금액 계산
      const response = await api.calculateDiscount(coupon.id, subtotal)
      if (response.success) {
        // 새로운 쿠폰 적용
        setSelectedCoupon(coupon)
        setCouponDiscount(response.discount_amount || 0)
        setShowCouponList(false)
        toast.success(`${coupon.coupon?.name || coupon.name} 쿠폰이 적용되었습니다`)
      } else {
        // API 응답이 실패인 경우
        setSelectedCoupon(null)
        setCouponDiscount(0)
        toast.error(response.message || '쿠폰을 적용할 수 없습니다')
      }
    } catch (error: any) {
      console.error('쿠폰 적용 오류:', error)
      // 에러 발생 시 상태 초기화
      setSelectedCoupon(null)
      setCouponDiscount(0)
      
      if (error.message) {
        toast.error(error.message)
      } else {
        toast.error(error.response?.data?.message || '쿠폰 적용 중 오류가 발생했습니다')
      }
    }
  }

  // 쿠폰 적용 해제
  const handleRemoveCoupon = () => {
    setSelectedCoupon(null)
    setCouponDiscount(0)
    toast.success('쿠폰이 해제되었습니다')
  }

  // 로딩 상태 렌더링
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-32 mb-8"></div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white h-32 rounded-lg shadow"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">장바구니</h1>
        
        {/* 빈 장바구니 */}
        {!cart?.items || cart.items.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 sm:p-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-full mb-4 sm:mb-6">
              <svg className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">장바구니가 비어있습니다</h2>
            <p className="text-gray-600 mb-6 sm:mb-8">원하는 상품을 장바구니에 담아보세요!</p>
            <Link
              to="/products"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-400 to-pink-400 text-white rounded-lg font-semibold hover:from-orange-500 hover:to-pink-500 transition-all duration-200"
            >
              쇼핑 시작하기
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
            {/* 장바구니 아이템 목록 - 모바일에서 전체 너비 */}
            <div className="lg:col-span-2 space-y-4">
              {cart.items.map((item: any) => (
                <div key={item.id} className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* 상품 이미지 */}
                    {item.product.image && (
                      <div className="mx-auto sm:mx-0 flex-shrink-0">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-lg"
                        />
                      </div>
                    )}
                    
                    {/* 상품 정보 */}
                    <div className="flex-1 text-center sm:text-left">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                        {item.product.name}
                      </h3>
                      
                      {/* 가격 정보 - 모바일에서 가로 정렬 */}
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-3">
                        {item.product.sale_price && parseFloat(item.product.sale_price) > 0 ? (
                          <>
                            <span className="text-lg sm:text-xl font-bold text-orange-600">
                              ₩{parseFloat(item.product.sale_price).toLocaleString()}
                            </span>
                            <span className="text-sm sm:text-base text-gray-400 line-through">
                              ₩{parseFloat(item.product.price).toLocaleString()}
                            </span>
                          </>
                        ) : (
                          <span className="text-lg sm:text-xl font-bold text-gray-900">
                            ₩{parseFloat(item.product.price).toLocaleString()}
                          </span>
                        )}
                      </div>
                      
                      {/* 수량 조절 및 삭제 - 모바일 최적화 */}
                      <div className="flex flex-col sm:flex-row items-center gap-3">
                        {/* 수량 조절 */}
                        <div className="flex items-center border border-gray-300 rounded-lg">
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            className="p-2 hover:bg-gray-100 transition-colors"
                            disabled={item.quantity <= 1}
                          >
                            <MinusIcon className="w-4 h-4 text-gray-600" />
                          </button>
                          <span className="px-4 py-2 min-w-[50px] text-center font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            className="p-2 hover:bg-gray-100 transition-colors"
                          >
                            <PlusIcon className="w-4 h-4 text-gray-600" />
                          </button>
                        </div>
                        
                        {/* 소계 */}
                        <div className="text-center sm:text-left">
                          <span className="text-sm text-gray-500">소계: </span>
                          <span className="font-semibold text-gray-900">
                            ₩{(() => {
                              const salePrice = parseFloat(item.product.sale_price || '0');
                              const regularPrice = parseFloat(item.product.price || '0');
                              const price = salePrice > 0 ? salePrice : regularPrice;
                              return (price * item.quantity).toLocaleString();
                            })()}
                          </span>
                        </div>
                        
                        {/* 삭제 버튼 */}
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors sm:ml-auto"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* 주문 요약 - 모바일에서 하단 고정 또는 일반 플로우 */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 sticky top-4">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">주문 요약</h2>
                
                {/* 금액 계산 */}
                <div className="space-y-3 mb-4 sm:mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">상품 금액</span>
                    <span className="font-semibold">₩{subtotal.toLocaleString()}</span>
                  </div>
                  
                  {/* 쿠폰 선택 섹션 */}
                  <div className="border-t border-b py-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 flex items-center">
                        <TicketIcon className="w-4 h-4 mr-1" />
                        할인쿠폰
                      </span>
                      <button
                        onClick={() => setShowCouponList(!showCouponList)}
                        className="text-sm text-orange-600 hover:text-pink-600 font-medium"
                      >
                        {selectedCoupon ? '변경' : '선택'}
                      </button>
                    </div>
                    
                    {/* 선택된 쿠폰 표시 */}
                    {selectedCoupon && (
                      <div className="bg-orange-50 p-3 rounded-lg">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium text-orange-800">
                              {selectedCoupon.coupon?.name || selectedCoupon.name || 'Unknown Coupon'}
                            </p>
                            <p className="text-sm text-orange-600">
                              {selectedCoupon.coupon?.description || selectedCoupon.description || 'No description'}
                            </p>
                          </div>
                          <button
                            onClick={handleRemoveCoupon}
                            className="text-red-500 hover:text-red-700"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {/* 쿠폰 목록 */}
                    {showCouponList && (
                      <div className="max-h-40 overflow-y-auto space-y-2">
                        {myCoupons?.user_coupons?.length > 0 ? (
                          myCoupons.user_coupons
                            .filter((userCoupon: any) => !userCoupon.is_used && !userCoupon.is_expired)
                            .map((userCoupon: any) => (
                            <div
                              key={userCoupon.id}
                              onClick={() => handleSelectCoupon(userCoupon)}
                              className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                                selectedCoupon?.id === userCoupon.id
                                  ? 'border-orange-400 bg-orange-50'
                                  : 'border-gray-200 hover:border-orange-300 hover:bg-orange-25'
                              }`}
                            >
                              <p className="font-medium text-sm">
                                {userCoupon.coupon?.name || userCoupon.name || 'Unknown Coupon'}
                              </p>
                              <p className="text-xs text-gray-600">
                                {userCoupon.coupon?.description || userCoupon.description || 'No description'}
                              </p>
                              <div className="flex justify-between items-center mt-1">
                                <p className="text-xs text-green-600">사용 가능</p>
                                {userCoupon.expired_at && (
                                  <p className="text-xs text-gray-500">
                                    {new Date(userCoupon.expired_at).toLocaleDateString()}까지
                                  </p>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500 text-center py-3">
                            사용 가능한 쿠폰이 없습니다
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* 할인 금액 표시 */}
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-orange-600">
                      <span>쿠폰 할인</span>
                      <span className="font-semibold">-₩{couponDiscount.toLocaleString()}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">배송비</span>
                    <span className={`font-semibold ${shippingFee === 0 ? 'text-green-600' : ''}`}>
                      {shippingFee === 0 ? '무료' : `₩${shippingFee.toLocaleString()}`}
                    </span>
                  </div>
                  
                  {/* 무료배송 안내 */}
                  {subtotal > 0 && subtotal < 30000 && (
                    <p className="text-xs sm:text-sm text-gray-500 bg-gray-50 p-2 sm:p-3 rounded-lg">
                      ₩{(30000 - subtotal).toLocaleString()} 더 주문하시면 무료배송!
                    </p>
                  )}
                </div>
                
                {/* 총 결제 금액 */}
                <div className="border-t pt-4 mb-4 sm:mb-6">
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-sm text-gray-500 mb-2">
                      <span>할인 전 금액</span>
                      <span className="line-through">₩{(subtotal + shippingFee).toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg sm:text-xl font-bold">
                    <span>총 결제 금액</span>
                    <span className={couponDiscount > 0 ? "text-red-600" : "text-orange-600"}>
                      ₩{totalAmount.toLocaleString()}
                    </span>
                  </div>
                  {couponDiscount > 0 && (
                    <p className="text-sm text-red-600 mt-1 text-right">
                      ₩{couponDiscount.toLocaleString()} 할인 적용됨!
                    </p>
                  )}
                </div>
                
                {/* 버튼들 */}
                <div className="space-y-3">
                  <button 
                    onClick={() => navigate('/checkout')}
                    className="w-full py-3 sm:py-4 bg-gradient-to-r from-orange-400 to-pink-400 text-white rounded-lg font-bold hover:from-orange-500 hover:to-pink-500 transition-all duration-200 text-sm sm:text-base"
                  >
                    결제하기
                  </button>
                  
                  <Link
                    to="/products"
                    className="block w-full py-2 sm:py-3 text-center text-orange-600 hover:text-pink-600 font-semibold transition-colors text-sm sm:text-base"
                  >
                    쇼핑 계속하기
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Cart