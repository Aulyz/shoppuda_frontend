import { useState } from 'react'
import { useQuery } from 'react-query'
import { useNavigate } from 'react-router-dom'
import { UserIcon, ShoppingBagIcon, HeartIcon, CogIcon } from '@heroicons/react/24/outline'
import { api } from '../services/api'
import { useAuthStore } from '../store/authStore'

function MyPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [activeTab, setActiveTab] = useState('orders')

  const { data: orders } = useQuery('myOrders', api.getMyOrders, {
    enabled: activeTab === 'orders'
  })

  const { data: wishlist } = useQuery('myWishlist', api.getWishlist, {
    enabled: activeTab === 'wishlist'
  })

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  if (!user) {
    navigate('/login')
    return null
  }

  const tabs = [
    { id: 'orders', name: '주문 내역', icon: ShoppingBagIcon },
    { id: 'wishlist', name: '위시리스트', icon: HeartIcon },
    { id: 'profile', name: '프로필', icon: UserIcon },
    { id: 'settings', name: '설정', icon: CogIcon }
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b">
          <h1 className="text-2xl font-bold text-gray-900">마이페이지</h1>
          <p className="text-gray-600 mt-1">{user.username}님, 환영합니다!</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      activeTab === tab.id
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {tab.name}
                  </button>
                )
              })}
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md text-red-600 hover:bg-red-50"
              >
                로그아웃
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="md:col-span-3">
            {activeTab === 'orders' && (
              <div>
                <h2 className="text-lg font-semibold mb-4">주문 내역</h2>
                {orders?.length === 0 ? (
                  <p className="text-gray-500">주문 내역이 없습니다.</p>
                ) : (
                  <div className="space-y-4">
                    {orders?.map((order: any) => (
                      <div key={order.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium">주문번호: {order.order_number}</p>
                            <p className="text-sm text-gray-600">
                              {new Date(order.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-primary-100 text-primary-800">
                            {order.status}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          <p>상품 {order.items.length}개</p>
                          <p className="font-medium text-gray-900">
                            총 ₩{order.total_amount?.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'wishlist' && (
              <div>
                <h2 className="text-lg font-semibold mb-4">위시리스트</h2>
                {wishlist?.length === 0 ? (
                  <p className="text-gray-500">위시리스트가 비어있습니다.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {wishlist?.map((item: any) => (
                      <div
                        key={item.id}
                        className="border rounded-lg p-4 cursor-pointer hover:shadow-lg transition"
                        onClick={() => navigate(`/products/${item.product.id}`)}
                      >
                        <img
                          src={item.product.image || '/placeholder.png'}
                          alt={item.product.name}
                          className="w-full h-48 object-cover rounded mb-2"
                        />
                        <h3 className="font-medium text-gray-900">{item.product.name}</h3>
                        <p className="text-primary-600 font-semibold">
                          ₩{item.product.price?.toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'profile' && (
              <div>
                <h2 className="text-lg font-semibold mb-4">프로필</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">아이디</label>
                    <p className="mt-1 text-gray-900">{user.username}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">이메일</label>
                    <p className="mt-1 text-gray-900">{user.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">이름</label>
                    <p className="mt-1 text-gray-900">
                      {user.first_name} {user.last_name}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div>
                <h2 className="text-lg font-semibold mb-4">설정</h2>
                <div className="space-y-4">
                  <button className="w-full text-left px-4 py-3 border rounded-lg hover:bg-gray-50">
                    비밀번호 변경
                  </button>
                  <button className="w-full text-left px-4 py-3 border rounded-lg hover:bg-gray-50">
                    알림 설정
                  </button>
                  <button className="w-full text-left px-4 py-3 border rounded-lg hover:bg-gray-50">
                    배송지 관리
                  </button>
                  <button className="w-full text-left px-4 py-3 border rounded-lg hover:bg-gray-50 text-red-600">
                    회원 탈퇴
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MyPage