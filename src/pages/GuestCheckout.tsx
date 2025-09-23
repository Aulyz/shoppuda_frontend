import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useQuery, useMutation } from 'react-query'
import { MapPinIcon, PhoneIcon, UserIcon, EnvelopeIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import DaumPostcode from '../components/DaumPostcode'
import { api } from '../services/api'
import { useAuthStore } from '../store/authStore'

interface GuestOrderInfo {
  // 주문자 정보
  customerName: string
  customerPhone: string
  customerEmail: string
  guestPassword: string
  confirmPassword: string
  
  // 배송지 정보
  recipientName: string
  recipientPhone: string
  postalCode: string
  address: string
  detailAddress: string
  deliveryRequest: string
  
  // 결제 정보
  paymentMethod: 'card' | 'bank'
}

interface TermsAgreement {
  all: boolean
  age: boolean
  privacy: boolean
  thirdParty: boolean
  electronic: boolean
  purchase: boolean
}

function GuestCheckout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated } = useAuthStore()
  
  // 주문 정보 상태
  const [orderInfo, setOrderInfo] = useState<GuestOrderInfo>({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    guestPassword: '',
    confirmPassword: '',
    recipientName: '',
    recipientPhone: '',
    postalCode: '',
    address: '',
    detailAddress: '',
    deliveryRequest: '',
    paymentMethod: 'card'
  })
  
  // 약관 동의 상태
  const [terms, setTerms] = useState<TermsAgreement>({
    all: false,
    age: false,
    privacy: false,
    thirdParty: false,
    electronic: false,
    purchase: false
  })
  
  // UI 상태
  const [showPostcode, setShowPostcode] = useState(false)
  const [sameAsCustomer, setSameAsCustomer] = useState(true)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedPaymentType, setSelectedPaymentType] = useState<'card' | 'bank'>('card')
  const [selectedCard, setSelectedCard] = useState('')
  const [bankTransferInfo, setBankTransferInfo] = useState({
    depositorName: '',
    selectedBank: ''
  })
  
  // 게스트 장바구니 데이터 조회
  const getGuestCart = () => {
    try {
      const guestCart = localStorage.getItem('guestCart')
      return guestCart ? JSON.parse(guestCart) : { items: [] }
    } catch {
      return { items: [] }
    }
  }

  const [guestCart] = useState(getGuestCart())
  const cartItems = guestCart.items || []
  
  // 설정 정보 조회 (배송비 정책 등)
  const { data: settings } = useQuery('settings', api.getSettings)
  
  // 장바구니 금액 계산 (Cart.tsx와 동일한 로직)
  const subtotal = cartItems.reduce((sum, item) => {
    const salePrice = parseFloat(item.product?.sale_price || '0')
    const regularPrice = parseFloat(item.product?.price || '0')
    const price = salePrice > 0 ? salePrice : regularPrice
    return sum + price * item.quantity
  }, 0)

  // 동적 배송비 계산
  const freeShippingThreshold = settings?.free_shipping_threshold || 30000
  const shippingFee = subtotal >= freeShippingThreshold ? 0 : (settings?.shipping_fee || 3000)
  const totalAmount = subtotal + shippingFee

  // 페이지 접속 시 맨 위로 스크롤 및 접근 권한 확인
  useEffect(() => {
    window.scrollTo(0, 0)
    
    // 인증된 사용자는 일반 체크아웃으로 리다이렉트
    if (isAuthenticated) {
      toast.error('로그인된 사용자는 일반 주문을 이용해주세요.')
      navigate('/checkout')
      return
    }
    
    // 게스트 장바구니가 비어있으면 장바구니로 리다이렉트
    if (!cartItems || cartItems.length === 0) {
      toast.error('장바구니가 비어있습니다.')
      navigate('/cart')
      return
    }
  }, [isAuthenticated, cartItems, navigate])

  // 주문자 정보와 배송지 정보 동일하게 설정
  useEffect(() => {
    if (sameAsCustomer) {
      setOrderInfo(prev => ({
        ...prev,
        recipientName: prev.customerName,
        recipientPhone: prev.customerPhone
      }))
    }
  }, [sameAsCustomer, orderInfo.customerName, orderInfo.customerPhone])

  // 주소 검색 완료 핸들러
  const handlePostcodeComplete = (data: { address: string; zonecode: string }) => {
    setOrderInfo(prev => ({
      ...prev,
      postalCode: data.zonecode,
      address: data.address
    }))
    setShowPostcode(false)
  }

  // 전체 동의 핸들러
  const handleAllTermsChange = (checked: boolean) => {
    setTerms({
      all: checked,
      age: checked,
      privacy: checked,
      thirdParty: checked,
      electronic: checked,
      purchase: checked
    })
  }

  // 개별 약관 동의 핸들러
  const handleTermChange = (key: keyof TermsAgreement, checked: boolean) => {
    const newTerms = { ...terms, [key]: checked }
    
    // 전체 동의 상태 업데이트
    const allChecked = newTerms.age && newTerms.privacy && newTerms.thirdParty && 
                      newTerms.electronic && newTerms.purchase
    newTerms.all = allChecked
    
    setTerms(newTerms)
  }

  // 은행 정보 조회
  const { data: bankInfo } = useQuery('bankInfo', api.getBankInfo)

  // 게스트 주문 생성 뮤테이션
  const createGuestOrderMutation = useMutation(api.createGuestOrder, {
    onSuccess: (response) => {
      toast.success('주문이 완료되었습니다!')
      setShowPaymentModal(false)
      // 주문 완료 후 장바구니 비우기
      localStorage.removeItem('guestCart')
      // 주문 상세 페이지로 이동 (guest order tracking page)
      navigate(`/orders/guest/${response.order_id}?email=${orderInfo.customerEmail}`)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || '주문 처리 중 오류가 발생했습니다.')
    }
  })

  // 필수 약관 체크 여부
  const requiredTermsChecked = terms.age && terms.privacy && terms.thirdParty && 
                              terms.electronic && terms.purchase

  // 결제하기 버튼 핸들러
  const handlePayment = () => {
    // 비회원 장바구니 비어있는지 확인
    if (!cartItems || cartItems.length === 0) {
      toast.error('장바구니가 비어있습니다.')
      return
    }
    
    // 필수 정보 검증
    if (!orderInfo.customerName || !orderInfo.customerPhone || !orderInfo.customerEmail) {
      toast.error('주문자 정보를 모두 입력해주세요.')
      return
    }
    
    // 비밀번호 검증
    if (!orderInfo.guestPassword || orderInfo.guestPassword.length < 4) {
      toast.error('비회원 주문 비밀번호를 4자리 이상 입력해주세요.')
      return
    }
    
    if (orderInfo.guestPassword !== orderInfo.confirmPassword) {
      toast.error('비밀번호가 일치하지 않습니다.')
      return
    }
    
    // 이메일 유효성 검사
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(orderInfo.customerEmail)) {
      toast.error('올바른 이메일 주소를 입력해주세요.')
      return
    }
    
    // 휴대폰 번호 유효성 검사
    const phoneRegex = /^01[0-9]-?[0-9]{4}-?[0-9]{4}$/
    if (!phoneRegex.test(orderInfo.customerPhone.replace(/-/g, ''))) {
      toast.error('올바른 휴대폰 번호를 입력해주세요.')
      return
    }
    
    if (!orderInfo.recipientName || !orderInfo.recipientPhone || !orderInfo.address) {
      toast.error('배송지 정보를 모두 입력해주세요.')
      return
    }
    
    if (!requiredTermsChecked) {
      toast.error('필수 약관에 동의해주세요.')
      return
    }
    
    setShowPaymentModal(true)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">비회원 주문</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
          {/* 왼쪽: 주문 정보 입력 */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 주문자 정보 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">주문자 정보</h2>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <UserIcon className="w-4 h-4 inline mr-1" />
                    주문자 이름 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={orderInfo.customerName}
                    onChange={(e) => setOrderInfo(prev => ({ ...prev, customerName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="이름을 입력하세요"
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
                    value={orderInfo.customerPhone}
                    onChange={(e) => setOrderInfo(prev => ({ ...prev, customerPhone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="010-0000-0000"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <EnvelopeIcon className="w-4 h-4 inline mr-1" />
                    이메일 주소 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={orderInfo.customerEmail}
                    onChange={(e) => setOrderInfo(prev => ({ ...prev, customerEmail: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="example@email.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    비회원 주문 비밀번호 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={orderInfo.guestPassword}
                    onChange={(e) => setOrderInfo(prev => ({ ...prev, guestPassword: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="주문 조회 시 사용할 비밀번호 (4자리 이상)"
                    minLength={4}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    주문 조회 시 사용됩니다. 4자리 이상 입력해주세요.
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    비밀번호 재확인 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={orderInfo.confirmPassword}
                    onChange={(e) => setOrderInfo(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      orderInfo.confirmPassword && orderInfo.guestPassword !== orderInfo.confirmPassword
                        ? 'border-red-300 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-orange-500'
                    }`}
                    placeholder="비밀번호를 다시 입력하세요"
                    minLength={4}
                    required
                  />
                  {orderInfo.confirmPassword && orderInfo.guestPassword !== orderInfo.confirmPassword && (
                    <p className="text-xs text-red-500 mt-1">
                      비밀번호가 일치하지 않습니다.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* 배송지 정보 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">배송지 정보</h2>
              
              {/* 주문자와 동일 체크박스 */}
              <div className="mb-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={sameAsCustomer}
                    onChange={(e) => setSameAsCustomer(e.target.checked)}
                    className="text-orange-600 focus:ring-orange-500 rounded"
                  />
                  <span className="text-sm">주문자 정보와 동일</span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    수령인 이름 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={orderInfo.recipientName}
                    onChange={(e) => setOrderInfo(prev => ({ ...prev, recipientName: e.target.value }))}
                    disabled={sameAsCustomer}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100"
                    placeholder="수령인 이름"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    연락처 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={orderInfo.recipientPhone}
                    onChange={(e) => setOrderInfo(prev => ({ ...prev, recipientPhone: e.target.value }))}
                    disabled={sameAsCustomer}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100"
                    placeholder="010-0000-0000"
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  우편번호 <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={orderInfo.postalCode}
                    onChange={(e) => setOrderInfo(prev => ({ ...prev, postalCode: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="12345"
                    readOnly
                  />
                  <button
                    type="button"
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                    onClick={() => setShowPostcode(true)}
                  >
                    우편번호 찾기
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <MapPinIcon className="w-4 h-4 inline mr-1" />
                  주소 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={orderInfo.address}
                  onChange={(e) => setOrderInfo(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="기본 주소"
                  readOnly
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  상세주소
                </label>
                <input
                  type="text"
                  value={orderInfo.detailAddress}
                  onChange={(e) => setOrderInfo(prev => ({ ...prev, detailAddress: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="동/호수 등 상세주소"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  배송 요청사항
                </label>
                <select
                  value={orderInfo.deliveryRequest}
                  onChange={(e) => setOrderInfo(prev => ({ ...prev, deliveryRequest: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">배송 요청사항을 선택하세요</option>
                  <option value="부재시 문앞에 놓아주세요">부재시 문앞에 놓아주세요</option>
                  <option value="부재시 경비실에 맡겨주세요">부재시 경비실에 맡겨주세요</option>
                  <option value="배송 전 연락바랍니다">배송 전 연락바랍니다</option>
                  <option value="빠른 배송 부탁드립니다">빠른 배송 부탁드립니다</option>
                  <option value="직접입력">직접입력</option>
                </select>
                {orderInfo.deliveryRequest === '직접입력' && (
                  <input
                    type="text"
                    className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="배송 요청사항을 입력하세요"
                    onChange={(e) => setOrderInfo(prev => ({ ...prev, deliveryRequest: e.target.value }))}
                  />
                )}
              </div>
            </div>

            {/* 주문 상품 정보 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">주문 상품</h2>
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 pb-4 border-b last:border-b-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg bg-gray-100"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-500">
                        ₩{(item.product?.sale_price > 0 ? item.product.sale_price : item.product?.price || 0).toLocaleString()} × {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        ₩{((item.product?.sale_price > 0 ? item.product.sale_price : item.product?.price || 0) * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 오른쪽: 결제 정보 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <h2 className="text-lg font-semibold mb-4">결제 정보</h2>
              
              {/* 금액 정보 */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">상품 금액</span>
                  <span className="font-semibold">₩{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">배송비 
                    {freeShippingThreshold && (
                      <span className="text-xs text-gray-400">
                        (₩{freeShippingThreshold.toLocaleString()} 이상 무료)
                      </span>
                    )}
                  </span>
                  <span className={`font-semibold ${shippingFee === 0 ? 'text-green-600' : ''}`}>
                    {shippingFee === 0 ? '무료' : `₩${shippingFee.toLocaleString()}`}
                  </span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>총 결제 금액</span>
                    <span className="text-orange-600">₩{totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* 약관 동의 */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-900 mb-3">약관 동의</h3>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={terms.all}
                      onChange={(e) => handleAllTermsChange(e.target.checked)}
                      className="text-orange-600 focus:ring-orange-500 rounded"
                    />
                    <span className="text-sm font-medium">전체 동의</span>
                  </label>
                  <div className="ml-6 space-y-1">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={terms.age}
                        onChange={(e) => handleTermChange('age', e.target.checked)}
                        className="text-orange-600 focus:ring-orange-500 rounded"
                      />
                      <span className="text-xs">만 14세 이상입니다 (필수)</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={terms.privacy}
                        onChange={(e) => handleTermChange('privacy', e.target.checked)}
                        className="text-orange-600 focus:ring-orange-500 rounded"
                      />
                      <span className="text-xs">개인정보 수집 및 이용 동의 (필수)</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={terms.thirdParty}
                        onChange={(e) => handleTermChange('thirdParty', e.target.checked)}
                        className="text-orange-600 focus:ring-orange-500 rounded"
                      />
                      <span className="text-xs">개인정보 제3자 제공 동의 (필수)</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={terms.electronic}
                        onChange={(e) => handleTermChange('electronic', e.target.checked)}
                        className="text-orange-600 focus:ring-orange-500 rounded"
                      />
                      <span className="text-xs">전자금융거래 약관 동의 (필수)</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={terms.purchase}
                        onChange={(e) => handleTermChange('purchase', e.target.checked)}
                        className="text-orange-600 focus:ring-orange-500 rounded"
                      />
                      <span className="text-xs">구매 약관 동의 (필수)</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* 결제 버튼 */}
              <button
                onClick={handlePayment}
                disabled={!requiredTermsChecked}
                className="w-full py-3 bg-gradient-to-r from-orange-400 to-pink-400 text-white rounded-lg font-semibold hover:from-orange-500 hover:to-pink-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ₩{totalAmount.toLocaleString()} 결제하기
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* 우편번호 찾기 모달 */}
      {showPostcode && (
        <DaumPostcode
          onComplete={handlePostcodeComplete}
          onClose={() => setShowPostcode(false)}
        />
      )}

      {/* 결제 수단 선택 모달 */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">결제 수단 선택</h3>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* 결제 방법 탭 */}
              <div className="mb-6">
                <div className="flex border-b">
                  <button
                    onClick={() => setSelectedPaymentType('card')}
                    className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                      selectedPaymentType === 'card'
                        ? 'border-orange-500 text-orange-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    신용/체크카드
                  </button>
                  <button
                    onClick={() => setSelectedPaymentType('bank')}
                    className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                      selectedPaymentType === 'bank'
                        ? 'border-orange-500 text-orange-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    무통장 입금
                  </button>
                </div>
              </div>

              {/* 신용카드 선택 */}
              {selectedPaymentType === 'card' && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold mb-4">신용/체크카드 선택</h4>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                    {[
                      { name: '삼성카드', color: 'bg-blue-600' },
                      { name: '신한카드', color: 'bg-blue-700' },
                      { name: '현대카드', color: 'bg-black' },
                      { name: '롯데카드', color: 'bg-red-600' },
                      { name: '국민카드', color: 'bg-brown-600' },
                      { name: '하나카드', color: 'bg-green-600' },
                      { name: 'NH농협카드', color: 'bg-green-700' },
                      { name: '우리카드', color: 'bg-blue-800' },
                      { name: 'BC카드', color: 'bg-red-700' },
                      { name: 'KB카드', color: 'bg-yellow-600' },
                      { name: '카카오뱅크', color: 'bg-yellow-400' },
                      { name: '토스뱅크', color: 'bg-blue-500' },
                      { name: '케이뱅크', color: 'bg-purple-600' },
                      { name: '씨티카드', color: 'bg-blue-900' },
                      { name: '기업은행', color: 'bg-gray-700' },
                      { name: '수협은행', color: 'bg-blue-600' },
                      { name: '우체국', color: 'bg-red-500' },
                      { name: '새마을금고', color: 'bg-green-500' }
                    ].map((card) => (
                      <button
                        key={card.name}
                        onClick={() => setSelectedCard(card.name)}
                        className={`p-3 rounded-lg border-2 transition-all text-center ${
                          selectedCard === card.name
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className={`w-full h-8 ${card.color} rounded mb-2 flex items-center justify-center`}>
                          <span className="text-white text-xs font-bold">
                            {card.name === '카카오뱅크' ? 'KAKAO' : 
                             card.name === '토스뱅크' ? 'toss' :
                             card.name === '케이뱅크' ? 'K' : 
                             card.name.slice(0, 2)}
                          </span>
                        </div>
                        <span className="text-xs text-gray-700">{card.name}</span>
                      </button>
                    ))}
                  </div>
                  
                  {selectedCard && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">{selectedCard}</span>가 선택되었습니다.
                        결제를 진행하시겠습니까?
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* 무통장 입금 */}
              {selectedPaymentType === 'bank' && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold mb-4">무통장 입금 정보</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        입금자명 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={bankTransferInfo.depositorName}
                        onChange={(e) => setBankTransferInfo(prev => ({ 
                          ...prev, 
                          depositorName: e.target.value 
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="입금자명을 입력하세요"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        입금 은행 선택 <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={bankTransferInfo.selectedBank}
                        onChange={(e) => setBankTransferInfo(prev => ({ 
                          ...prev, 
                          selectedBank: e.target.value 
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        required
                      >
                        <option value="">은행을 선택하세요</option>
                        <option value="kb">KB국민은행</option>
                        <option value="sinhan">신한은행</option>
                        <option value="woori">우리은행</option>
                        <option value="hana">하나은행</option>
                        <option value="nh">NH농협은행</option>
                        <option value="ibk">기업은행</option>
                        <option value="keb">외환은행</option>
                        <option value="sc">SC제일은행</option>
                        <option value="citi">씨티은행</option>
                        <option value="kakao">카카오뱅크</option>
                        <option value="toss">토스뱅크</option>
                        <option value="kbank">케이뱅크</option>
                      </select>
                    </div>
                  </div>

                  {bankTransferInfo.selectedBank && bankInfo && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h5 className="font-medium text-blue-800 mb-2">입금 계좌 정보</h5>
                      <div className="space-y-1 text-sm text-blue-700">
                        <p><span className="font-medium">은행:</span> {bankInfo.bank_name}</p>
                        <p><span className="font-medium">계좌번호:</span> {bankInfo.account_number}</p>
                        <p><span className="font-medium">예금주:</span> {bankInfo.account_holder}</p>
                        <p><span className="font-medium">입금 금액:</span> ₩{totalAmount.toLocaleString()}</p>
                      </div>
                      <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                        <p className="text-xs text-yellow-800">
                          <strong>입금 시 주의사항:</strong><br/>
                          • 입금자명을 정확히 입력해주세요<br/>
                          • 주문일로부터 3일 이내 입금하지 않으면 주문이 자동 취소됩니다<br/>
                          • 입금 확인 후 상품이 발송됩니다
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 결제 금액 확인 */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-semibold mb-2">결제 금액</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>상품 금액</span>
                    <span>₩{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>배송비</span>
                    <span>{shippingFee === 0 ? '무료' : `₩${shippingFee.toLocaleString()}`}</span>
                  </div>
                  <div className="border-t pt-2 mt-2 flex justify-between font-bold text-lg">
                    <span>총 결제 금액</span>
                    <span className="text-orange-600">₩{totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              
              {/* 결제 버튼 */}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                >
                  취소
                </button>
                <button
                  onClick={() => {
                    if (selectedPaymentType === 'card' && !selectedCard) {
                      toast.error('카드를 선택해주세요.')
                      return
                    }
                    if (selectedPaymentType === 'bank' && (!bankTransferInfo.depositorName || !bankTransferInfo.selectedBank)) {
                      toast.error('입금자명과 은행을 선택해주세요.')
                      return
                    }
                    
                    // 게스트 주문 생성
                    const guestOrderData = {
                      customer_name: orderInfo.customerName,
                      customer_phone: orderInfo.customerPhone,
                      customer_email: orderInfo.customerEmail,
                      guest_password: orderInfo.guestPassword,
                      recipient_name: orderInfo.recipientName,
                      recipient_phone: orderInfo.recipientPhone,
                      postal_code: orderInfo.postalCode,
                      address: orderInfo.address,
                      detail_address: orderInfo.detailAddress,
                      delivery_request: orderInfo.deliveryRequest,
                      payment_method: selectedPaymentType,
                      payment_details: selectedPaymentType === 'card' 
                        ? { card_company: selectedCard }
                        : { depositor_name: bankTransferInfo.depositorName, bank: bankTransferInfo.selectedBank },
                      cart_items: cartItems.map(item => ({
                        product_id: item.product.id,
                        quantity: item.quantity,
                        price: item.product?.sale_price > 0 ? item.product.sale_price : item.product?.price || 0
                      }))
                    }
                    
                    createGuestOrderMutation.mutate(guestOrderData)
                  }}
                  disabled={
                    createGuestOrderMutation.isLoading ||
                    (selectedPaymentType === 'card' && !selectedCard) ||
                    (selectedPaymentType === 'bank' && (!bankTransferInfo.depositorName || !bankTransferInfo.selectedBank))
                  }
                  className="px-6 py-3 bg-gradient-to-r from-orange-400 to-pink-400 text-white rounded-lg font-medium hover:from-orange-500 hover:to-pink-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createGuestOrderMutation.isLoading ? '처리 중...' : `₩${totalAmount.toLocaleString()} 결제하기`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default GuestCheckout