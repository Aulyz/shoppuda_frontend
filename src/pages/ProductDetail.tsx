import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from 'react-query'
import { HeartIcon, ShoppingCartIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid'
import toast from 'react-hot-toast'
import { api } from '../services/api'
import { useAuthStore } from '../store/authStore'

function ProductDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const [quantity, setQuantity] = useState(1)
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState('')

  const { data: product, isLoading } = useQuery(
    ['product', id],
    () => api.getProduct(Number(id))
  )

  const addToCartMutation = useMutation(
    (data: any) => api.addToCart(data),
    {
      onSuccess: () => {
        toast.success('장바구니에 추가되었습니다!')
      },
      onError: () => {
        toast.error('장바구니 추가 실패')
      }
    }
  )

  const toggleWishlistMutation = useMutation(
    () => api.toggleWishlist(Number(id)),
    {
      onSuccess: () => {
        toast.success('위시리스트가 업데이트되었습니다!')
      }
    }
  )

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast.error('로그인이 필요합니다')
      navigate('/login')
      return
    }

    addToCartMutation.mutate({
      product_id: Number(id),
      quantity,
      size: selectedSize,
      color: selectedColor
    })
  }

  const handleToggleWishlist = () => {
    if (!isAuthenticated) {
      toast.error('로그인이 필요합니다')
      navigate('/login')
      return
    }

    toggleWishlistMutation.mutate()
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-200 h-96 rounded-lg"></div>
            <div>
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
              <div className="h-32 bg-gray-200 rounded mb-4"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <p>상품을 찾을 수 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Image */}
        <div>
          <img
            src={product.image || '/placeholder.png'}
            alt={product.name}
            className="w-full h-auto rounded-lg"
          />
        </div>

        {/* Product Info */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
          <p className="text-gray-600 mb-4">{product.brand}</p>
          
          <div className="mb-6">
            <span className="text-3xl font-bold text-gray-900">
              ₩{product.final_price?.toLocaleString()}
            </span>
            {product.discount_percentage > 0 && (
              <>
                <span className="ml-2 text-lg text-gray-500 line-through">
                  ₩{product.price?.toLocaleString()}
                </span>
                <span className="ml-2 text-lg text-red-600">
                  {product.discount_percentage}% 할인
                </span>
              </>
            )}
          </div>

          <p className="text-gray-700 mb-6">{product.description}</p>

          {/* Options */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                사이즈
              </label>
              <div className="flex space-x-2">
                {product.sizes.map((size: string) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 border rounded-lg ${
                      selectedSize === size
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-300'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {product.colors && product.colors.length > 0 && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                색상
              </label>
              <div className="flex space-x-2">
                {product.colors.map((color: string) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-4 py-2 border rounded-lg ${
                      selectedColor === color
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-300'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              수량
            </label>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-1 border rounded-lg hover:bg-gray-100"
              >
                -
              </button>
              <span className="px-4 py-1">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-3 py-1 border rounded-lg hover:bg-gray-100"
              >
                +
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-4">
            <button
              onClick={handleAddToCart}
              disabled={addToCartMutation.isLoading}
              className="flex-1 flex items-center justify-center space-x-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
            >
              <ShoppingCartIcon className="h-5 w-5" />
              <span>장바구니 담기</span>
            </button>
            <button
              onClick={handleToggleWishlist}
              className="p-3 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
            >
              {product.is_wishlisted ? (
                <HeartSolidIcon className="h-6 w-6 text-red-500" />
              ) : (
                <HeartIcon className="h-6 w-6" />
              )}
            </button>
          </div>

          {/* Product Details */}
          <div className="mt-8 border-t pt-8">
            <h3 className="text-lg font-semibold mb-4">상품 정보</h3>
            <dl className="space-y-2">
              <div className="flex">
                <dt className="w-24 text-gray-600">브랜드:</dt>
                <dd>{product.brand}</dd>
              </div>
              <div className="flex">
                <dt className="w-24 text-gray-600">카테고리:</dt>
                <dd>{product.category}</dd>
              </div>
              <div className="flex">
                <dt className="w-24 text-gray-600">재고:</dt>
                <dd>{product.stock > 0 ? `${product.stock}개` : '품절'}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetail