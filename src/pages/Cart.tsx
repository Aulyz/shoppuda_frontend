import { useQuery, useMutation, useQueryClient } from 'react-query'
import { Link } from 'react-router-dom'
import { TrashIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import { api } from '../services/api'

function Cart() {
  const queryClient = useQueryClient()
  
  const { data: cart, isLoading } = useQuery('cart', api.getCart)

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

  const removeItemMutation = useMutation(
    (itemId: number) => api.removeFromCart(itemId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('cart')
        toast.success('상품이 삭제되었습니다')
      }
    }
  )

  const handleQuantityChange = (itemId: number, quantity: number) => {
    if (quantity < 1) return
    updateQuantityMutation.mutate({ itemId, quantity })
  }

  const handleRemoveItem = (itemId: number) => {
    removeItemMutation.mutate(itemId)
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-gray-200 h-32 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const subtotal = cart?.items?.reduce(
    (sum: number, item: any) => sum + item.product.final_price * item.quantity,
    0
  ) || 0

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">장바구니</h1>

      {cart?.items?.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">장바구니가 비어있습니다</p>
          <Link
            to="/products"
            className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700"
          >
            쇼핑 계속하기
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              {cart?.items?.map((item: any) => (
                <div key={item.id} className="p-6 border-b last:border-b-0">
                  <div className="flex items-center">
                    <img
                      src={item.product.image || '/placeholder.png'}
                      alt={item.product.name}
                      className="w-24 h-24 object-cover rounded"
                    />
                    <div className="ml-4 flex-1">
                      <Link
                        to={`/products/${item.product.id}`}
                        className="text-lg font-medium text-gray-900 hover:text-primary-600"
                      >
                        {item.product.name}
                      </Link>
                      <p className="text-gray-500">
                        {item.size && `사이즈: ${item.size}`}
                        {item.color && ` / 색상: ${item.color}`}
                      </p>
                      <p className="text-lg font-semibold mt-1">
                        ₩{item.product.final_price?.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        className="px-2 py-1 border rounded hover:bg-gray-100"
                      >
                        -
                      </button>
                      <span className="px-3">{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        className="px-2 py-1 border rounded hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">주문 요약</h2>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span>상품 금액</span>
                  <span>₩{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>배송비</span>
                  <span>{subtotal >= 50000 ? '무료' : '₩3,000'}</span>
                </div>
              </div>
              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between text-lg font-semibold">
                  <span>총 금액</span>
                  <span>
                    ₩{(subtotal + (subtotal >= 50000 ? 0 : 3000)).toLocaleString()}
                  </span>
                </div>
              </div>
              <button className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700">
                결제하기
              </button>
              <Link
                to="/products"
                className="block text-center mt-4 text-primary-600 hover:text-primary-700"
              >
                쇼핑 계속하기
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Cart