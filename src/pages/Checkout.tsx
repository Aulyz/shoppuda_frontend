import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useQuery, useMutation } from 'react-query'
import { MapPinIcon, PhoneIcon, UserIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import { api } from '../services/api'

function Checkout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null)
  const [useNewAddress, setUseNewAddress] = useState(false)
  const [newAddress, setNewAddress] = useState({
    recipient_name: '',
    phone_number: '',
    postal_code: '',
    address: '',
    detail_address: '',
    save_address: false,
    nickname: ''
  })
  const [paymentMethod, setPaymentMethod] = useState('card')

  // 바로구매 여부 확인
  const isDirectPurchase = location.state?.directPurchase
  const directProduct = location.state?.product

  // 결제 정보 조회 (장바구니 구매일 때만)
  const { data: checkoutInfo, isLoading: checkoutLoading } = useQuery(
    'checkoutInfo',
    api.getCheckoutInfo,
    {
      enabled: !isDirectPurchase // 바로구매가 아닐 때만 조회
    }
  )

  // 바로구매일 때 배송지 목록만 조회
  const { data: shippingAddresses, isLoading: addressesLoading } = useQuery(
    'shippingAddresses',
    api.getShippingAddresses,
    {
      enabled: isDirectPurchase // 바로구매일 때만 조회
    }
  )

  const isLoading = isDirectPurchase ? addressesLoading : checkoutLoading

  // 바로구매용 데이터 구성
  const displayData = isDirectPurchase ? {
    shipping_addresses: shippingAddresses,
    items: directProduct ? [{
      id: 1,
      product: {
        id: directProduct.id,
        name: directProduct.name,
        price: directProduct.discount_price || directProduct.price,
        image: directProduct.image
      },
      quantity: directProduct.quantity,
      total: (directProduct.discount_price || directProduct.price) * directProduct.quantity
    }] : [],
    subtotal: directProduct ? (directProduct.discount_price || directProduct.price) * directProduct.quantity : 0,
    shipping_fee: 0,
    total_amount: directProduct ? (directProduct.discount_price || directProduct.price) * directProduct.quantity : 0
  } : checkoutInfo

  // 기본 배송지 선택
  useEffect(() => {
    const addresses = displayData?.shipping_addresses
    if (addresses && addresses.length > 0) {
      const defaultAddress = addresses.find((addr: any) => addr.is_default)
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id)
      } else {
        setSelectedAddressId(addresses[0].id)
      }
    } else {
      // 배송지가 없으면 새 주소 입력 모드로
      setUseNewAddress(true)
    }
  }, [displayData])

  // 결제 처리
  const checkoutMutation = useMutation(
    (data: any) => {
      if (isDirectPurchase && directProduct) {
        // 바로구매 API 호출
        return api.directPurchase({
          product_id: directProduct.id,
          quantity: directProduct.quantity,
          ...data
        })
      } else {
        // 장바구니 결제 API 호출
        return api.checkout(data)
      }
    },
    {
      onSuccess: (response) => {
        toast.success('주문이 성공적으로 완료되었습니다!')
        navigate('/orders')
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.error || '결제 처리 중 오류가 발생했습니다.')
      }
    }
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    let checkoutData: any = {
      payment_method: paymentMethod
    }

    if (useNewAddress) {
      // 새 주소 직접 입력
      if (!newAddress.recipient_name || !newAddress.phone_number || !newAddress.address) {
        toast.error('필수 배송 정보를 모두 입력해주세요.')
        return
      }
      
      checkoutData = {
        ...checkoutData,
        use_new_address: true,
        recipient_name: newAddress.recipient_name,
        phone_number: newAddress.phone_number,
        postal_code: newAddress.postal_code,
        address: newAddress.address,
        detail_address: newAddress.detail_address,
        save_address: newAddress.save_address,
        address_nickname: newAddress.nickname
      }
    } else {
      // 기존 배송지 선택
      if (!selectedAddressId) {
        toast.error('배송지를 선택해주세요.')
        return
      }
      checkoutData.shipping_address_id = selectedAddressId
    }

    checkoutMutation.mutate(checkoutData)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">결제 정보를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (!displayData || displayData.items?.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600">
            {isDirectPurchase ? '상품 정보를 불러올 수 없습니다.' : '장바구니가 비어있습니다.'}
          </p>
          <button
            onClick={() => navigate('/products')}
            className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            쇼핑 계속하기
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">주문/결제</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 왼쪽: 배송 정보 및 결제 수단 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 배송지 정보 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">배송지 정보</h2>
              
              {/* 배송지 선택 옵션 */}
              {displayData.shipping_addresses && displayData.shipping_addresses.length > 0 && (
                <div className="mb-4">
                  <label className="flex items-center space-x-2 mb-3">
                    <input
                      type="radio"
                      checked={!useNewAddress}
                      onChange={() => setUseNewAddress(false)}
                      className="text-orange-600 focus:ring-orange-500"
                    />
                    <span className="font-medium">등록된 배송지 선택</span>
                  </label>
                  
                  {!useNewAddress && (
                    <div className="space-y-2 pl-6">
                      {displayData.shipping_addresses.map((address: any) => (
                        <label
                          key={address.id}
                          className={`block p-4 border rounded-lg cursor-pointer transition-all ${
                            selectedAddressId === address.id
                              ? 'border-orange-500 bg-orange-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name="shipping_address"
                            value={address.id}
                            checked={selectedAddressId === address.id}
                            onChange={() => setSelectedAddressId(address.id)}
                            className="sr-only"
                          />
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium">{address.nickname}</span>
                                {address.is_default && (
                                  <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded">
                                    기본 배송지
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-900">{address.recipient_name}</p>
                              <p className="text-sm text-gray-600">{address.phone_number}</p>
                              <p className="text-sm text-gray-600">
                                [{address.postal_code}] {address.address} {address.detail_address}
                              </p>
                            </div>
                            <div className="ml-3">
                              <div className={`w-4 h-4 rounded-full border-2 ${
                                selectedAddressId === address.id
                                  ? 'border-orange-500 bg-orange-500'
                                  : 'border-gray-400'
                              }`}>
                                {selectedAddressId === address.id && (
                                  <div className="w-full h-full rounded-full bg-white scale-50"></div>
                                )}
                              </div>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 새 주소 입력 옵션 */}
              <label className="flex items-center space-x-2 mb-3">
                <input
                  type="radio"
                  checked={useNewAddress}
                  onChange={() => setUseNewAddress(true)}
                  className="text-orange-600 focus:ring-orange-500"
                />
                <span className="font-medium">새 배송지 입력</span>
              </label>

              {useNewAddress && (
                <div className="space-y-4 pl-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <UserIcon className="w-4 h-4 inline mr-1" />
                        수령인 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={newAddress.recipient_name}
                        onChange={(e) => setNewAddress({...newAddress, recipient_name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="받으실 분 성함"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <PhoneIcon className="w-4 h-4 inline mr-1" />
                        연락처 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        value={newAddress.phone_number}
                        onChange={(e) => setNewAddress({...newAddress, phone_number: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="010-0000-0000"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      우편번호
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newAddress.postal_code}
                        onChange={(e) => setNewAddress({...newAddress, postal_code: e.target.value})}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="12345"
                      />
                      <button
                        type="button"
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                        onClick={() => toast.info('우편번호 검색 기능은 준비 중입니다.')}
                      >
                        우편번호 찾기
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <MapPinIcon className="w-4 h-4 inline mr-1" />
                      주소 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newAddress.address}
                      onChange={(e) => setNewAddress({...newAddress, address: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="기본 주소"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      상세주소
                    </label>
                    <input
                      type="text"
                      value={newAddress.detail_address}
                      onChange={(e) => setNewAddress({...newAddress, detail_address: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="동/호수 등 상세주소"
                    />
                  </div>

                  <div className="pt-2 border-t">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={newAddress.save_address}
                        onChange={(e) => setNewAddress({...newAddress, save_address: e.target.checked})}
                        className="text-orange-600 focus:ring-orange-500 rounded"
                      />
                      <span className="text-sm">이 주소를 저장하기</span>
                    </label>
                    {newAddress.save_address && (
                      <div className="mt-2">
                        <input
                          type="text"
                          value={newAddress.nickname}
                          onChange={(e) => setNewAddress({...newAddress, nickname: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                          placeholder="배송지 별명 (예: 집, 회사)"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 결제 수단 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">결제 수단</h2>
              <div className="space-y-3">
                <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="text-orange-600 focus:ring-orange-500"
                  />
                  <span>신용/체크카드</span>
                </label>
                <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    value="bank"
                    checked={paymentMethod === 'bank'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="text-orange-600 focus:ring-orange-500"
                  />
                  <span>계좌이체</span>
                </label>
                <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
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
          </div>

          {/* 오른쪽: 주문 요약 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-4">
              <h2 className="text-lg font-semibold mb-4">주문 요약</h2>
              
              {/* 상품 목록 */}
              <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                {displayData.items?.map((item: any) => (
                  <div key={item.id} className="flex items-center space-x-3 pb-3 border-b">
                    {item.product.image && (
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.product.name}</p>
                      <p className="text-xs text-gray-500">
                        ₩{item.product.price?.toLocaleString()} × {item.quantity}
                      </p>
                    </div>
                    <p className="text-sm font-medium">
                      ₩{item.total?.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>

              {/* 금액 정보 */}
              <div className="space-y-2 py-4 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">상품 금액</span>
                  <span>₩{displayData.subtotal?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">배송비</span>
                  <span>
                    {displayData.shipping_fee === 0 
                      ? '무료' 
                      : `₩${displayData.shipping_fee?.toLocaleString()}`}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>총 결제 금액</span>
                  <span className="text-orange-600">
                    ₩{displayData.total_amount?.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* 결제 버튼 */}
              <button
                onClick={handleSubmit}
                disabled={checkoutMutation.isLoading}
                className="w-full py-3 bg-gradient-to-r from-orange-400 to-pink-400 text-white rounded-lg font-semibold hover:from-orange-500 hover:to-pink-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {checkoutMutation.isLoading ? '처리 중...' : `₩${displayData.total_amount?.toLocaleString()} 결제하기`}
              </button>

              <p className="text-xs text-gray-500 text-center mt-3">
                주문 내용을 확인하였으며, 정보 제공 등에 동의합니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout