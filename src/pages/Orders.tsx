import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { 
  ClockIcon, 
  TruckIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  CubeIcon,
  CreditCardIcon,
  MapPinIcon
} from '@heroicons/react/24/outline'
import { api } from '../services/api'
import toast from 'react-hot-toast'

interface OrderItem {
  id: number
  product: {
    id: number | string
    name: string
    image?: string
    price: number
  }
  quantity: number
  unit_price: string | number
  total_price: string | number
}

interface ShippingAddress {
  recipient_name: string
  phone_number: string
  postal_code: string
  address: string
  detail_address?: string
}

interface Order {
  id: number
  order_number: string
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
  status_display?: string  // API에서 반환하는 한글 상태
  created_at: string
  updated_at: string
  order_date?: string  // API에서 반환
  items: OrderItem[]
  total_amount: number
  shipping_fee: number
  payment_method: string
  shipping_address: ShippingAddress | string  // API에서 문자열로도 올 수 있음
  shipping_recipient?: string
  customer_phone?: string
  tracking_number?: string
  delivered_date?: string  // API에서 delivered_date로 반환
  cancelled_date?: string  // API에서 cancelled_date로 반환
  notes?: string
  cancellation_reason?: string
  can_cancel?: boolean  // API에서 반환하는 취소 가능 여부
}

// 금액 포맷팅 함수 - .00은 제거
const formatPrice = (price: string | number | undefined | null): string => {
  if (price === undefined || price === null) return '0'
  
  const numPrice = typeof price === 'string' ? parseFloat(price) : price
  
  // NaN 체크
  if (isNaN(numPrice)) return '0'
  
  // 정수인지 확인 (소수점 이하가 0인지)
  if (numPrice % 1 === 0) {
    return Math.round(numPrice).toLocaleString()
  }
  // 소수점이 있는 경우 그대로 표시
  return numPrice.toLocaleString()
}

function Orders() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  const [expandedOrders, setExpandedOrders] = useState<Set<number>>(new Set())
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [cancellingOrderId, setCancellingOrderId] = useState<number | null>(null)
  
  // 사용자가 변경되면 주문 데이터 캐시 무효화
  useEffect(() => {
    queryClient.invalidateQueries(['orders'])
  }, [user?.id, queryClient])

  // 주문 목록 조회
  const { data: orders, isLoading, error } = useQuery<Order[]>(
    ['orders', selectedStatus],
    async () => {
      const response = await api.getMyOrders()  // getMyOrders 사용
      
      // response 구조에 따라 orders 추출
      let ordersList = []
      if (response && response.orders) {
        ordersList = response.orders
      } else if (response && response.status && response.orders) {
        ordersList = response.orders
      } else if (Array.isArray(response)) {
        ordersList = response
      }
      
      // 상태별 필터링
      if (selectedStatus !== 'all' && ordersList.length > 0) {
        ordersList = ordersList.filter((order: Order) => order.status === selectedStatus)
      }
      
      return ordersList
    }
  )

  // 주문 취소 mutation
  const cancelOrderMutation = useMutation(
    (orderId: number) => api.cancelOrder(orderId),
    {
      onSuccess: () => {
        toast.success('주문이 취소되었습니다.')
        queryClient.invalidateQueries(['orders'])
        setCancellingOrderId(null)
      },
      onError: (error: any) => {
        const errorMessage = error.response?.data?.error || '주문 취소에 실패했습니다.'
        toast.error(errorMessage)
        setCancellingOrderId(null)
      }
    }
  )

  const handleCancelOrder = (orderId: number) => {
    if (window.confirm('정말로 이 주문을 취소하시겠습니까?')) {
      setCancellingOrderId(orderId)
      cancelOrderMutation.mutate(orderId)
    }
  }

  const toggleOrderExpansion = (orderId: number) => {
    const newExpanded = new Set(expandedOrders)
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId)
    } else {
      newExpanded.add(orderId)
    }
    setExpandedOrders(newExpanded)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <ClockIcon className="w-5 h-5 text-yellow-500" />
      case 'PROCESSING':
        return <CubeIcon className="w-5 h-5 text-blue-500" />
      case 'SHIPPED':
        return <TruckIcon className="w-5 h-5 text-purple-500" />
      case 'DELIVERED':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />
      case 'CANCELLED':
        return <XCircleIcon className="w-5 h-5 text-red-500" />
      default:
        return <ClockIcon className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return '주문 확인중'
      case 'PROCESSING':
        return '상품 준비중'
      case 'SHIPPED':
        return '배송중'
      case 'DELIVERED':
        return '배송완료'
      case 'CANCELLED':
        return '주문취소'
      default:
        return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800'
      case 'SHIPPED':
        return 'bg-purple-100 text-purple-800'
      case 'DELIVERED':
        return 'bg-green-100 text-green-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">주문 내역을 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <XCircleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-xl text-gray-600">주문 내역을 불러오는데 실패했습니다.</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            다시 시도
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">주문 내역</h1>
          <p className="mt-2 text-gray-600">주문하신 상품의 배송 상태를 확인하실 수 있습니다.</p>
        </div>

        {/* 필터 탭 */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="flex flex-wrap gap-2 p-4 border-b">
            <button
              onClick={() => setSelectedStatus('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedStatus === 'all'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              전체
            </button>
            <button
              onClick={() => setSelectedStatus('PENDING')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedStatus === 'PENDING'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              주문확인중
            </button>
            <button
              onClick={() => setSelectedStatus('PROCESSING')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedStatus === 'PROCESSING'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              상품준비중
            </button>
            <button
              onClick={() => setSelectedStatus('SHIPPED')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedStatus === 'SHIPPED'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              배송중
            </button>
            <button
              onClick={() => setSelectedStatus('DELIVERED')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedStatus === 'DELIVERED'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              배송완료
            </button>
            <button
              onClick={() => setSelectedStatus('CANCELLED')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedStatus === 'CANCELLED'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              주문취소
            </button>
          </div>
        </div>

        {/* 주문 목록 */}
        {!orders || orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <CubeIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-xl text-gray-600 mb-2">주문 내역이 없습니다.</p>
            <p className="text-gray-500 mb-6">새로운 상품을 둘러보시겠어요?</p>
            <button
              onClick={() => navigate('/products')}
              className="px-6 py-3 bg-gradient-to-r from-orange-400 to-pink-400 text-white rounded-lg font-semibold hover:from-orange-500 hover:to-pink-500 transition-all duration-200"
            >
              쇼핑하러 가기
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow overflow-hidden">
                {/* 주문 헤더 */}
                <div 
                  className="p-4 sm:p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleOrderExpansion(order.id)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          주문번호: {order.order_number}
                        </h3>
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          {order.status_display || getStatusText(order.status)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        주문일시: {formatDate(order.order_date || order.created_at)}
                      </p>
                      {order.tracking_number && (
                        <p className="text-sm text-gray-600">
                          운송장번호: {order.tracking_number}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm text-gray-600">결제금액</p>
                        <p className="text-xl font-bold text-orange-600">
                          ₩{formatPrice(order.total_amount)}
                        </p>
                      </div>
                      <div className="transition-transform duration-200">
                        {expandedOrders.has(order.id) ? (
                          <ChevronDownIcon className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 모바일에서 간단한 상품 정보 표시 */}
                  {order.items && order.items.length > 0 && (
                    <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                      <CubeIcon className="w-4 h-4" />
                      {order.items.length === 1 ? (
                        <span>{order.items[0].product.name}</span>
                      ) : (
                        <span>{order.items[0].product.name} 외 {order.items.length - 1}개</span>
                      )}
                    </div>
                  )}
                </div>

                {/* 주문 상세 (확장시) */}
                {expandedOrders.has(order.id) && (
                  <div className="border-t">
                    {/* 상품 목록 */}
                    <div className="p-4 sm:p-6 bg-gray-50">
                      <h4 className="font-medium text-gray-900 mb-4">주문 상품</h4>
                      <div className="space-y-3">
                        {order.items && order.items.length > 0 ? (
                          order.items.map((item) => (
                            <div key={item.id} className="flex gap-4 bg-white p-3 rounded-lg">
                              {item.product.image && (
                                <img
                                  src={item.product.image}
                                  alt={item.product.name}
                                  className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded"
                                />
                              )}
                              <div className="flex-1">
                                <h5 className="font-medium text-gray-900">{item.product.name}</h5>
                                <p className="text-sm text-gray-600 mt-1">
                                  ₩{formatPrice(item.unit_price)} × {item.quantity}개
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-medium text-gray-900">
                                  ₩{formatPrice(item.total_price)}
                                </p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-500 text-center py-4">주문 상품 정보가 없습니다.</p>
                        )}
                      </div>
                    </div>

                    {/* 배송 및 결제 정보 */}
                    <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* 배송 정보 */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                          <MapPinIcon className="w-5 h-5 text-gray-400" />
                          배송 정보
                        </h4>
                        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                          {!order.shipping_address || typeof order.shipping_address === 'string' ? (
                            <>
                              <p className="text-sm">
                                <span className="text-gray-600">수령인:</span>{' '}
                                <span className="font-medium">{order.shipping_recipient || '정보 없음'}</span>
                              </p>
                              <p className="text-sm">
                                <span className="text-gray-600">연락처:</span>{' '}
                                <span className="font-medium">{order.customer_phone || '정보 없음'}</span>
                              </p>
                              <p className="text-sm">
                                <span className="text-gray-600">주소:</span>{' '}
                                <span className="font-medium">{order.shipping_address || '정보 없음'}</span>
                              </p>
                            </>
                          ) : order.shipping_address && typeof order.shipping_address === 'object' ? (
                            <>
                              <p className="text-sm">
                                <span className="text-gray-600">수령인:</span>{' '}
                                <span className="font-medium">{order.shipping_address.recipient_name || '정보 없음'}</span>
                              </p>
                              <p className="text-sm">
                                <span className="text-gray-600">연락처:</span>{' '}
                                <span className="font-medium">{order.shipping_address.phone_number || '정보 없음'}</span>
                              </p>
                              <p className="text-sm">
                                <span className="text-gray-600">주소:</span>{' '}
                                <span className="font-medium">
                                  {order.shipping_address.postal_code && `[${order.shipping_address.postal_code}] `}
                                  {order.shipping_address.address || ''}
                                  {order.shipping_address.detail_address && ` ${order.shipping_address.detail_address}`}
                                </span>
                              </p>
                            </>
                          ) : (
                            <p className="text-sm text-gray-500">배송 정보가 없습니다.</p>
                          )}
                        </div>
                      </div>

                      {/* 결제 정보 */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                          <CreditCardIcon className="w-5 h-5 text-gray-400" />
                          결제 정보
                        </h4>
                        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                          <p className="text-sm">
                            <span className="text-gray-600">결제수단:</span>{' '}
                            <span className="font-medium">
                              {order.payment_method === 'card' ? '신용/체크카드' :
                               order.payment_method === 'bank' ? '계좌이체' :
                               order.payment_method === 'kakao' ? '카카오페이' : order.payment_method}
                            </span>
                          </p>
                          <div className="pt-2 border-t">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">상품금액</span>
                              <span>₩{formatPrice(parseFloat(String(order.total_amount)) - parseFloat(String(order.shipping_fee)))}</span>
                            </div>
                            <div className="flex justify-between text-sm mt-1">
                              <span className="text-gray-600">배송비</span>
                              <span>
                                {parseFloat(String(order.shipping_fee)) === 0 ? '무료' : `₩${formatPrice(order.shipping_fee)}`}
                              </span>
                            </div>
                            <div className="flex justify-between font-medium text-base mt-2 pt-2 border-t">
                              <span>총 결제금액</span>
                              <span className="text-orange-600">₩{formatPrice(order.total_amount)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 주문 상태별 추가 정보 */}
                    {order.status === 'DELIVERED' && order.delivered_date && (
                      <div className="px-4 sm:px-6 pb-4">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <p className="text-sm text-green-800">
                            <CheckCircleIcon className="w-4 h-4 inline mr-1" />
                            배송완료: {formatDate(order.delivered_date)}
                          </p>
                        </div>
                      </div>
                    )}

                    {order.status === 'CANCELLED' && (
                      <div className="px-4 sm:px-6 pb-4">
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                          <p className="text-sm text-red-800">
                            <XCircleIcon className="w-4 h-4 inline mr-1" />
                            취소일시: {order.cancelled_date && formatDate(order.cancelled_date)}
                          </p>
                          {order.cancellation_reason && (
                            <p className="text-sm text-red-800 mt-1">
                              취소사유: {order.cancellation_reason}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* 액션 버튼 */}
                    <div className="px-4 sm:px-6 pb-4 flex flex-wrap gap-2">
                      {order.status === 'SHIPPED' && order.tracking_number && (
                        <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                          배송조회
                        </button>
                      )}
                      {order.status === 'DELIVERED' && (
                        <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                          구매확정
                        </button>
                      )}
                      {(order.status === 'PENDING' || order.status === 'PROCESSING') && (
                        <button 
                          onClick={() => handleCancelOrder(order.id)}
                          disabled={cancellingOrderId === order.id}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {cancellingOrderId === order.id ? '취소 중...' : '주문취소'}
                        </button>
                      )}
                      <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                        문의하기
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Orders