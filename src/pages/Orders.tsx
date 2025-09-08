import React, { useState } from 'react'
import { useQuery } from 'react-query'
import { useNavigate } from 'react-router-dom'
import { 
  ClockIcon, 
  TruckIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  PackageIcon,
  CreditCardIcon,
  MapPinIcon
} from '@heroicons/react/24/outline'
import { api } from '../services/api'

interface OrderItem {
  id: number
  product: {
    id: number
    name: string
    image?: string
    price: number
  }
  quantity: number
  price: number
  total: number
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
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  created_at: string
  updated_at: string
  items: OrderItem[]
  total_amount: number
  shipping_fee: number
  payment_method: string
  shipping_address: ShippingAddress
  tracking_number?: string
  delivered_at?: string
  cancelled_at?: string
  cancellation_reason?: string
}

function Orders() {
  const navigate = useNavigate()
  const [expandedOrders, setExpandedOrders] = useState<Set<number>>(new Set())
  const [selectedStatus, setSelectedStatus] = useState<string>('all')

  // 주문 목록 조회
  const { data: orders, isLoading, error } = useQuery<Order[]>(
    ['orders', selectedStatus],
    async () => {
      const response = await api.getMyOrders()
      let ordersList = response.orders || response || []
      
      // 상태별 필터링
      if (selectedStatus !== 'all') {
        ordersList = ordersList.filter((order: Order) => order.status === selectedStatus)
      }
      
      return ordersList
    }
  )

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
      case 'pending':
        return <ClockIcon className="w-5 h-5 text-yellow-500" />
      case 'processing':
        return <PackageIcon className="w-5 h-5 text-blue-500" />
      case 'shipped':
        return <TruckIcon className="w-5 h-5 text-purple-500" />
      case 'delivered':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />
      case 'cancelled':
        return <XCircleIcon className="w-5 h-5 text-red-500" />
      default:
        return <ClockIcon className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return '주문 확인중'
      case 'processing':
        return '상품 준비중'
      case 'shipped':
        return '배송중'
      case 'delivered':
        return '배송완료'
      case 'cancelled':
        return '주문취소'
      default:
        return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      case 'shipped':
        return 'bg-purple-100 text-purple-800'
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
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
              onClick={() => setSelectedStatus('pending')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedStatus === 'pending'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              주문확인중
            </button>
            <button
              onClick={() => setSelectedStatus('processing')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedStatus === 'processing'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              상품준비중
            </button>
            <button
              onClick={() => setSelectedStatus('shipped')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedStatus === 'shipped'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              배송중
            </button>
            <button
              onClick={() => setSelectedStatus('delivered')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedStatus === 'delivered'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              배송완료
            </button>
            <button
              onClick={() => setSelectedStatus('cancelled')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedStatus === 'cancelled'
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
            <PackageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
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
                          {getStatusText(order.status)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        주문일시: {formatDate(order.created_at)}
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
                          ₩{order.total_amount?.toLocaleString()}
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
                  <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                    <PackageIcon className="w-4 h-4" />
                    {order.items.length === 1 ? (
                      <span>{order.items[0].product.name}</span>
                    ) : (
                      <span>{order.items[0].product.name} 외 {order.items.length - 1}개</span>
                    )}
                  </div>
                </div>

                {/* 주문 상세 (확장시) */}
                {expandedOrders.has(order.id) && (
                  <div className="border-t">
                    {/* 상품 목록 */}
                    <div className="p-4 sm:p-6 bg-gray-50">
                      <h4 className="font-medium text-gray-900 mb-4">주문 상품</h4>
                      <div className="space-y-3">
                        {order.items.map((item) => (
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
                                ₩{item.price?.toLocaleString()} × {item.quantity}개
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-gray-900">
                                ₩{item.total?.toLocaleString()}
                              </p>
                            </div>
                          </div>
                        ))}
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
                          <p className="text-sm">
                            <span className="text-gray-600">수령인:</span>{' '}
                            <span className="font-medium">{order.shipping_address.recipient_name}</span>
                          </p>
                          <p className="text-sm">
                            <span className="text-gray-600">연락처:</span>{' '}
                            <span className="font-medium">{order.shipping_address.phone_number}</span>
                          </p>
                          <p className="text-sm">
                            <span className="text-gray-600">주소:</span>{' '}
                            <span className="font-medium">
                              [{order.shipping_address.postal_code}] {order.shipping_address.address}
                              {order.shipping_address.detail_address && ` ${order.shipping_address.detail_address}`}
                            </span>
                          </p>
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
                              <span>₩{(order.total_amount - order.shipping_fee)?.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm mt-1">
                              <span className="text-gray-600">배송비</span>
                              <span>
                                {order.shipping_fee === 0 ? '무료' : `₩${order.shipping_fee?.toLocaleString()}`}
                              </span>
                            </div>
                            <div className="flex justify-between font-medium text-base mt-2 pt-2 border-t">
                              <span>총 결제금액</span>
                              <span className="text-orange-600">₩{order.total_amount?.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 주문 상태별 추가 정보 */}
                    {order.status === 'delivered' && order.delivered_at && (
                      <div className="px-4 sm:px-6 pb-4">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <p className="text-sm text-green-800">
                            <CheckCircleIcon className="w-4 h-4 inline mr-1" />
                            배송완료: {formatDate(order.delivered_at)}
                          </p>
                        </div>
                      </div>
                    )}

                    {order.status === 'cancelled' && (
                      <div className="px-4 sm:px-6 pb-4">
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                          <p className="text-sm text-red-800">
                            <XCircleIcon className="w-4 h-4 inline mr-1" />
                            취소일시: {order.cancelled_at && formatDate(order.cancelled_at)}
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
                      {order.status === 'shipped' && order.tracking_number && (
                        <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                          배송조회
                        </button>
                      )}
                      {order.status === 'delivered' && (
                        <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                          구매확정
                        </button>
                      )}
                      {(order.status === 'pending' || order.status === 'processing') && (
                        <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                          주문취소
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