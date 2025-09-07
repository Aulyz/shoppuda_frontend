import React, { useState, useEffect } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { useMutation, useQuery } from 'react-query'
import toast from 'react-hot-toast'
import { api } from '../services/api'

interface CheckoutModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  directPurchase?: {
    productId: number
    quantity: number
  }
}

function CheckoutModal({ isOpen, onClose, onSuccess, directPurchase }: CheckoutModalProps) {
  const [shippingAddress, setShippingAddress] = useState('')
  const [shippingZipcode, setShippingZipcode] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('card')
  
  // 결제 정보 조회
  const { data: checkoutInfo } = useQuery(
    'checkoutInfo',
    api.getCheckoutInfo,
    {
      enabled: isOpen && !directPurchase
    }
  )
  
  // 결제 처리 뮤테이션
  const checkoutMutation = useMutation(
    (data: any) => {
      if (directPurchase) {
        return api.directPurchase({
          product_id: directPurchase.productId,
          quantity: directPurchase.quantity,
          shipping_address: data.shipping_address,
          shipping_zipcode: data.shipping_zipcode,
          payment_method: data.payment_method
        })
      } else {
        return api.checkout(data)
      }
    },
    {
      onSuccess: () => {
        toast.success('주문이 성공적으로 완료되었습니다!')
        onSuccess()
        onClose()
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.error || '결제 처리 중 오류가 발생했습니다.')
      }
    }
  )
  
  // 사용자 정보로 초기값 설정
  useEffect(() => {
    if (checkoutInfo?.user_info) {
      setShippingAddress(checkoutInfo.user_info.address || '')
      setShippingZipcode(checkoutInfo.user_info.zipcode || '')
    }
  }, [checkoutInfo])
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!shippingAddress.trim()) {
      toast.error('배송 주소를 입력해주세요.')
      return
    }
    
    checkoutMutation.mutate({
      shipping_address: shippingAddress,
      shipping_zipcode: shippingZipcode,
      payment_method: paymentMethod
    })
  }
  
  if (!isOpen) return null
  
  const totalAmount = directPurchase 
    ? 0 // 직접 구매시에는 서버에서 계산
    : checkoutInfo?.total_amount || 0
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        {/* 오버레이 */}
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
        
        {/* 모달 */}
        <div className="relative bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">결제 정보 입력</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <XMarkIcon className="w-6 h-6 text-gray-500" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 주문 정보 요약 */}
            {checkoutInfo && !directPurchase && (
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-gray-900 mb-2">주문 요약</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">상품 금액</span>
                    <span>₩{checkoutInfo.subtotal?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">배송비</span>
                    <span>
                      {checkoutInfo.shipping_fee === 0 
                        ? '무료' 
                        : `₩${checkoutInfo.shipping_fee?.toLocaleString()}`}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-base pt-2 border-t">
                    <span>총 결제 금액</span>
                    <span className="text-orange-600">
                      ₩{checkoutInfo.total_amount?.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            {/* 배송 정보 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                배송 주소 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                rows={3}
                placeholder="배송받으실 주소를 입력해주세요"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                우편번호
              </label>
              <input
                type="text"
                value={shippingZipcode}
                onChange={(e) => setShippingZipcode(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="우편번호 (선택)"
              />
            </div>
            
            {/* 결제 방법 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                결제 방법
              </label>
              <div className="space-y-2">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="text-orange-600 focus:ring-orange-500"
                  />
                  <span>신용/체크카드</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    value="bank"
                    checked={paymentMethod === 'bank'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="text-orange-600 focus:ring-orange-500"
                  />
                  <span>계좌이체</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    value="kakao"
                    checked={paymentMethod === 'kakao'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="text-orange-600 focus:ring-orange-500"
                  />
                  <span>카카오페이</span>
                </label>
              </div>
            </div>
            
            {/* 버튼 */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={checkoutMutation.isLoading}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-400 to-pink-400 text-white rounded-lg font-semibold hover:from-orange-500 hover:to-pink-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {checkoutMutation.isLoading ? '처리 중...' : '결제하기'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CheckoutModal