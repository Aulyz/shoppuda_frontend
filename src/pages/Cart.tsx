import React, { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { Link } from 'react-router-dom'
import { TrashIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import { api } from '../services/api'

function Cart() {
  const queryClient = useQueryClient()
  
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
      <div className="bg-gradient-to-br from-orange-50 via-white to-pink-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8 mx-auto"></div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-gray-200 h-32 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 총 상품 금액 계산
  const subtotal = cart?.items?.reduce(
    (sum: number, item: any) => sum + item.product.final_price * item.quantity,
    0
  ) || 0

  return (
    <div className="bg-gradient-to-br from-orange-50 via-white to-pink-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* 빈 장바구니 상태 */}
        {!cart?.items || cart.items.length === 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 빈 장바구니 메시지 */}
            <div className="lg:col-span-2">
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 rounded-full mb-6">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">상품이 없습니다</h3>
                <p className="text-gray-500 mb-6">원하시는 상품을 장바구니에 담아보세요</p>
                <Link
                  to="/products"
                  className="inline-block bg-gradient-to-r from-orange-400 to-pink-400 text-white px-8 py-3 rounded-lg font-semibold hover:from-orange-500 hover:to-pink-500 transition-all duration-200 transform hover:scale-105"
                >
                  쇼핑하러 가기
                </Link>
              </div>
            </div>

            {/* 빈 장바구니 상태의 주문 요약 */}
            <div className="lg:col-span-1">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 sticky top-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6">주문 요약</h2>
                
                {/* 금액 계산 */}
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">상품 금액</span>
                    <span className="font-semibold">₩0</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">배송비</span>
                    <span className="font-semibold">₩0</span>
                  </div>
                </div>
                
                {/* 총 결제 금액 */}
                <div className="border-t border-gray-200 pt-4 mb-6">
                  <div className="flex justify-between text-xl font-bold">
                    <span>총 결제 금액</span>
                    <span className="text-orange-600">₩0</span>
                  </div>
                </div>
                
                {/* 결제하기 버튼 (비활성화) */}
                <button 
                  disabled
                  className="w-full bg-gray-300 text-gray-500 py-4 rounded-xl font-bold mb-4 cursor-not-allowed"
                >
                  결제하기
                </button>
                
                {/* 쇼핑 계속하기 링크 */}
                <Link
                  to="/products"
                  className="block text-center py-2 text-orange-600 hover:text-pink-600 font-semibold transition-colors duration-200"
                >
                  쇼핑하러 가기
                </Link>
              </div>
            </div>
          </div>
        ) : (
          /* 장바구니 내용 */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* 장바구니 상품 목록 */}
            <div className="lg:col-span-2">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20">
                {cart?.items?.map((item: any) => (
                  <div key={item.id} className="p-6 border-b border-gray-100 last:border-b-0">
                    <div className="flex items-center">
                      
                      {/* 상품 이미지 */}
                      <div className="relative">
                        <img
                          src={item.product.image || '/placeholder.png'}
                          alt={item.product.name}
                          className="w-24 h-24 object-cover rounded-xl shadow-md"
                        />
                      </div>
                      
                      {/* 상품 정보 */}
                      <div className="ml-6 flex-1">
                        <Link
                          to={`/products/${item.product.id}`}
                          className="text-lg font-semibold text-gray-900 hover:text-orange-600 transition-colors duration-200"
                        >
                          {item.product.name}
                        </Link>
                        <p className="text-sm text-gray-500 mt-1">
                          {item.size && `사이즈: ${item.size}`}
                          {item.color && ` / 색상: ${item.color}`}
                        </p>
                        <div className="flex items-center mt-2">
                          <p className="text-xl font-bold text-orange-600">
                            ₩{item.product.final_price?.toLocaleString()}
                          </p>
                          <span className="text-sm text-gray-400 ml-2">개당 가격</span>
                        </div>
                      </div>
                      
                      {/* 수량 조절 및 삭제 버튼 */}
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            className="px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors duration-200"
                          >
                            −
                          </button>
                          <span className="px-4 py-2 bg-white font-semibold min-w-[3rem] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            className="px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors duration-200"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 주문 요약 */}
            <div className="lg:col-span-1">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 sticky top-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6">주문 요약</h2>
                
                {/* 금액 계산 */}
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">상품 금액</span>
                    <span className="font-semibold">₩{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">배송비</span>
                    <span className={`font-semibold ${subtotal >= 30000 ? 'text-green-600' : ''}`}>
                      {subtotal >= 30000 ? '무료' : '₩3,000'}
                    </span>
                  </div>
                  
                  {/* 무료배송 안내 메시지 */}
                  {subtotal > 0 && subtotal < 30000 && (
                    <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded-lg">
                      ₩{(30000 - subtotal).toLocaleString()} 더 주문하시면 무료배송!
                    </p>
                  )}
                </div>
                
                {/* 총 결제 금액 */}
                <div className="border-t border-gray-200 pt-4 mb-6">
                  <div className="flex justify-between text-xl font-bold">
                    <span>총 결제 금액</span>
                    <span className="text-orange-600">
                      ₩{(subtotal + (subtotal >= 30000 ? 0 : 3000)).toLocaleString()}
                    </span>
                  </div>
                </div>
                
                {/* 결제하기 버튼 */}
                <button className="w-full bg-gradient-to-r from-orange-400 to-pink-400 text-white py-4 rounded-xl font-bold hover:from-orange-500 hover:to-pink-500 transition-all duration-200 transform hover:scale-105 shadow-lg mb-4">
                  결제하기
                </button>
                
                {/* 쇼핑 계속하기 링크 */}
                <Link
                  to="/products"
                  className="block text-center py-2 text-orange-600 hover:text-pink-600 font-semibold transition-colors duration-200"
                >
                  쇼핑 계속하기
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Cart