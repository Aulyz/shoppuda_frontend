import React, { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { Link, useNavigate } from 'react-router-dom'
import { TrashIcon, PlusIcon, MinusIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import { api } from '../services/api'

function Cart() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  
  // 페이지 접속 시 맨 위로 스크롤
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])
  
  // 장바구니 데이터 조회
  const { data: cart, isLoading } = useQuery('cart', api.getCart)

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

  // 총 상품 금액 계산
  const subtotal = cart?.items?.reduce(
    (sum: number, item: any) => {
      const price = item.product.sale_price || item.product.price;
      return sum + parseFloat(price) * item.quantity;
    },
    0
  ) || 0

  const shippingFee = subtotal >= 30000 ? 0 : 3000
  const totalAmount = subtotal + shippingFee

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
                        {item.product.sale_price ? (
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
                            ₩{(parseFloat(item.product.sale_price || item.product.price) * item.quantity).toLocaleString()}
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
                  <div className="flex justify-between text-lg sm:text-xl font-bold">
                    <span>총 결제 금액</span>
                    <span className="text-orange-600">
                      ₩{totalAmount.toLocaleString()}
                    </span>
                  </div>
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