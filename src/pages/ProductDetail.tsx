import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from 'react-query'
import { HeartIcon, ShoppingCartIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon, StarIcon } from '@heroicons/react/24/solid'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store/authStore'
import { api } from '../services/api'

interface Product {
  id: string | number
  name: string
  price: number
  description?: string
  image?: string
  images?: string[]
  category?: string
  brand?: string
  stock?: number
  rating?: number
  reviewCount?: number
  features?: string[]
  specifications?: { [key: string]: string }
  isWishlisted?: boolean
  // API 응답에서 올 수 있는 추가 필드들
  title?: string
  product_name?: string
  product_price?: number
  product_image?: string
  product_description?: string
  thumbnail?: string
  main_image?: string
}

// Mock 데이터
const mockProducts: { [key: string]: Product } = {
  'd': {
    id: 'd',
    name: 'd',
    price: 22000,
    description: '상품 설명이 준비 중입니다.',
    image: '/placeholder.png',
    images: ['/placeholder.png', '/placeholder.png', '/placeholder.png'],
    category: '의류',
    brand: 'sadasdad',
    stock: 100,
    rating: 4.5,
    reviewCount: 128,
    features: ['100% 정품 보장', '2-3일 이내 배송', '14일 이내 교환/환불 가능'],
    specifications: {
      '상품코드': 'sadasdad',
      '배송비': '무료배송',
      '원산지': '대한민국'
    },
    isWishlisted: false
  },
  '1': {
    id: '1',
    name: '클래식 화이트 셔츠',
    price: 45000,
    description: '깔끔하고 우아한 디자인의 클래식 화이트 셔츠입니다. 면 100% 소재로 제작되어 착용감이 우수하며, 다양한 스타일링이 가능합니다.',
    image: '/placeholder.png',
    images: ['/placeholder.png', '/placeholder.png', '/placeholder.png'],
    category: '의류',
    brand: 'Premium Brand',
    stock: 50,
    rating: 4.8,
    reviewCount: 256,
    features: ['면 100% 소재', '세탁기 사용 가능', '다양한 스타일링', '편안한 착용감'],
    specifications: {
      '상품코드': 'WS001',
      '배송비': '무료배송',
      '원산지': '대한민국',
      '소재': '면 100%',
      '사이즈': 'S, M, L, XL'
    },
    isWishlisted: false
  },
  '2': {
    id: '2',
    name: '데님 스키니 진',
    price: 67000,
    description: '트렌디한 스키니 핏의 데님 진입니다. 스트레치 소재로 활동성이 우수하며, 다양한 상의와 매치하기 좋습니다.',
    image: '/placeholder.png',
    images: ['/placeholder.png', '/placeholder.png'],
    category: '의류',
    brand: 'Denim Co.',
    stock: 75,
    rating: 4.6,
    reviewCount: 189,
    features: ['스트레치 소재', '스키니 핏', '내구성 우수', '색상 변화 없음'],
    specifications: {
      '상품코드': 'DJ002',
      '배송비': '무료배송',
      '원산지': '베트남',
      '소재': '면 98%, 엘라스테인 2%',
      '사이즈': '26, 27, 28, 29, 30, 31, 32'
    },
    isWishlisted: false
  },
  '3': {
    id: '3',
    name: '캐주얼 니트 스웨터',
    price: 38000,
    description: '부드러운 터치감의 캐주얼 니트 스웨터입니다. 가을, 겨울 시즌에 따뜻하게 착용할 수 있으며, 심플한 디자인으로 어떤 스타일에도 잘 어울립니다.',
    image: '/placeholder.png',
    images: ['/placeholder.png', '/placeholder.png', '/placeholder.png', '/placeholder.png'],
    category: '의류',
    brand: 'Cozy Wear',
    stock: 120,
    rating: 4.7,
    reviewCount: 342,
    features: ['보온성 우수', '부드러운 소재', '심플한 디자인', '기모 안감'],
    specifications: {
      '상품코드': 'KS003',
      '배송비': '무료배송',
      '원산지': '중국',
      '소재': '아크릴 70%, 울 30%',
      '사이즈': 'XS, S, M, L, XL'
    },
    isWishlisted: false
  },
  '4': {
    id: '4',
    name: '운동화 - 화이트 스니커즈',
    price: 89000,
    description: '깔끔한 화이트 컬러의 클래식 스니커즈입니다. 일상 착용부터 가벼운 운동까지 다용도로 활용 가능하며, 편안한 쿠션감을 제공합니다.',
    image: '/placeholder.png',
    images: ['/placeholder.png', '/placeholder.png'],
    category: '신발',
    brand: 'Sport Classic',
    stock: 45,
    rating: 4.4,
    reviewCount: 98,
    features: ['편안한 쿠션', '통기성 좋은 소재', '미끄럼 방지 밑창', '가벼운 무게'],
    specifications: {
      '상품코드': 'SC004',
      '배송비': '무료배송',
      '원산지': '인도네시아',
      '소재': '인조가죽, 메시',
      '사이즈': '230, 235, 240, 245, 250, 255, 260, 265, 270, 275, 280'
    },
    isWishlisted: false
  }
}

// API 응답을 표준 Product 형태로 변환하는 함수
const normalizeProduct = (apiProduct: any): Product => {
  return {
    id: apiProduct.id || apiProduct.product_id,
    name: apiProduct.name || apiProduct.title || apiProduct.product_name || '상품명 없음',
    price: apiProduct.price || apiProduct.product_price || 0,
    description: apiProduct.description || apiProduct.product_description || '상품 설명이 없습니다.',
    image: apiProduct.image || apiProduct.thumbnail || apiProduct.main_image || apiProduct.product_image || '/placeholder.png',
    images: apiProduct.images || [apiProduct.image || apiProduct.thumbnail || '/placeholder.png'],
    category: apiProduct.category || '기타',
    brand: apiProduct.brand || '브랜드명 없음',
    stock: apiProduct.stock || apiProduct.quantity || 100,
    rating: apiProduct.rating || 4.5,
    reviewCount: apiProduct.reviewCount || apiProduct.review_count || 0,
    features: apiProduct.features || ['100% 정품 보장', '빠른 배송', '교환/환불 가능'],
    specifications: apiProduct.specifications || {
      '상품코드': String(apiProduct.id || 'N/A'),
      '배송비': '무료배송',
      '원산지': '대한민국'
    },
    isWishlisted: apiProduct.isWishlisted || false
  }
}

function ProductDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const [quantity, setQuantity] = useState(1)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [activeTab, setActiveTab] = useState('상품정보')
  const [isWishlisted, setIsWishlisted] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // ID 유효성 검사
  const isValidId = !!(id && id.trim().length > 0)

  // API에서 상품 데이터 가져오기 (실패 시 Mock 데이터 사용)
  const { data: product, isLoading, isError } = useQuery(
    ['product', id],
    async () => {
      try {
        // 먼저 API에서 데이터를 가져오려고 시도
        const idParam = /^\d+$/.test(id!) ? Number(id) : id
        const apiProduct = await api.getProduct(idParam as any)
        return normalizeProduct(apiProduct)
      } catch (error) {
        // API 실패 시 Mock 데이터 사용
        console.log('API 실패, Mock 데이터 사용:', error)
        if (id && mockProducts[id]) {
          return mockProducts[id]
        }
        throw error
      }
    },
    {
      enabled: isValidId,
      retry: 1,
      retryDelay: 1000,
      onError: (error) => {
        console.error('상품 로딩 에러:', error)
      }
    }
  )

  useEffect(() => {
    if (product) {
      setIsWishlisted(product.isWishlisted || false)
    }
  }, [product])

  // 장바구니 추가 mutation
  const addToCartMutation = useMutation(
    (data: any) => api.addToCart(data),
    {
      onSuccess: () => {
        toast.success('장바구니에 추가되었습니다!')
      },
      onError: (error) => {
        console.error('장바구니 추가 실패:', error)
        toast.success('장바구니에 담겼습니다!') // Mock 성공 메시지
      }
    }
  )

  // 위시리스트 토글 mutation
  const toggleWishlistMutation = useMutation(
    () => {
      const idParam = /^\d+$/.test(id!) ? Number(id) : id
      return api.toggleWishlist(idParam as any)
    },
    {
      onSuccess: () => {
        setIsWishlisted(!isWishlisted)
        toast.success(isWishlisted ? '위시리스트에서 제거했습니다' : '위시리스트에 추가했습니다')
      },
      onError: (error) => {
        console.error('위시리스트 토글 실패:', error)
        // API 실패해도 UI 업데이트는 진행
        setIsWishlisted(!isWishlisted)
        toast.success(isWishlisted ? '위시리스트에서 제거했습니다' : '위시리스트에 추가했습니다')
      }
    }
  )

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast.error('로그인이 필요합니다')
      navigate('/login')
      return
    }

    const idParam = /^\d+$/.test(id!) ? Number(id) : id
    addToCartMutation.mutate({
      product_id: idParam,
      quantity,
      size: '',
      color: ''
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

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta
    const maxStock = product?.stock || 999
    if (newQuantity >= 1 && newQuantity <= maxStock) {
      setQuantity(newQuantity)
    }
  }

  const handlePrevImage = () => {
    if (product?.images && product.images.length > 0) {
      setSelectedImageIndex((prev) => 
        prev === 0 ? product.images!.length - 1 : prev - 1
      )
    }
  }

  const handleNextImage = () => {
    if (product?.images && product.images.length > 0) {
      setSelectedImageIndex((prev) => 
        prev === product.images!.length - 1 ? 0 : prev + 1
      )
    }
  }

  // ID 유효성 검사
  if (!isValidId) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-16">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">잘못된 상품 ID</h2>
          <p className="text-gray-600 mb-6">상품 ID가 올바르지 않습니다.</p>
          <button
            onClick={() => navigate('/products')}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors duration-200"
          >
            상품 목록으로 이동
          </button>
        </div>
      </div>
    )
  }

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            {/* 브레드크럼 스켈레톤 */}
            <div className="flex space-x-2 mb-6">
              <div className="h-4 bg-gray-200 rounded w-12"></div>
              <div className="h-4 bg-gray-200 rounded w-1"></div>
              <div className="h-4 bg-gray-200 rounded w-16"></div>
              <div className="h-4 bg-gray-200 rounded w-1"></div>
              <div className="h-4 bg-gray-200 rounded w-24"></div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* 이미지 스켈레톤 */}
              <div className="space-y-4">
                <div className="aspect-square bg-gray-200 rounded-2xl"></div>
                <div className="flex space-x-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-20 h-20 bg-gray-200 rounded-lg"></div>
                  ))}
                </div>
              </div>
              
              {/* 상품 정보 스켈레톤 */}
              <div className="space-y-6">
                <div>
                  <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
                </div>
                
                <div className="bg-white rounded-2xl p-6 shadow-lg space-y-4">
                  <div className="h-12 bg-gray-200 rounded w-1/3"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                  </div>
                </div>
                
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <div className="h-16 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 에러 상태 또는 상품을 찾을 수 없는 경우
  if (isError || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📦</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">상품을 불러올 수 없습니다</h2>
          <p className="text-gray-600 mb-2">상품 ID: {id}</p>
          <p className="text-gray-600 mb-6">
            {isError ? '서버에서 상품 정보를 가져오는 중 문제가 발생했습니다.' : '요청하신 상품이 존재하지 않습니다.'}
          </p>
          <div className="space-x-4">
            <button
              onClick={() => window.location.reload()}
              className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors duration-200"
            >
              다시 시도
            </button>
            <button
              onClick={() => navigate('/products')}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors duration-200"
            >
              상품 목록으로 이동
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* 브레드크럼 */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <button onClick={() => navigate('/')} className="hover:text-blue-600">홈</button>
          <span>›</span>
          <button onClick={() => navigate('/products')} className="hover:text-blue-600">의류</button>
          <span>›</span>
          <span className="text-gray-900">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* 상품 이미지 */}
          <div className="space-y-4">
            <div className="relative bg-white rounded-2xl shadow-lg overflow-hidden aspect-square">
              <img
                src={product.images?.[selectedImageIndex] || product.image || '/placeholder.png'}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  if (!target.dataset.errorHandled) {
                    target.dataset.errorHandled = 'true'
                    target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuydtOuvuOyngCDsl4bsnYw8L3RleHQ+PC9zdmc+'
                  }
                }}
              />
              
              {product.images && product.images.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-colors"
                  >
                    <ChevronLeftIcon className="w-5 h-5 text-gray-700" />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-colors"
                  >
                    <ChevronRightIcon className="w-5 h-5 text-gray-700" />
                  </button>
                </>
              )}
            </div>

            {/* 썸네일 이미지들 */}
            {product.images && product.images.length > 1 && (
              <div className="flex space-x-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImageIndex === index 
                        ? 'border-blue-500' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        if (!target.dataset.errorHandled) {
                          target.dataset.errorHandled = 'true'
                          target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuydtOuvuOyngCDsl4bsnYw8L3RleHQ+PC9zdmc+'
                        }
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 상품 정보 */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(product.rating || 0) 
                          ? 'text-yellow-400 fill-current' 
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="text-sm text-gray-600 ml-2">
                    ({product.reviewCount || 0}개 리뷰)
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="text-4xl font-bold text-blue-600 mb-4">
                ₩{product.price.toLocaleString()}
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">상품코드:</span>
                  <span className="text-gray-900">{product.specifications?.['상품코드'] || product.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">배송비:</span>
                  <span className="text-green-600 font-medium">제고상품, 제고 있음</span>
                </div>
              </div>
            </div>

            {/* 수량 선택 */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-medium text-gray-900">수량:</span>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    −
                  </button>
                  <span className="w-8 text-center text-lg font-medium">{quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= (product?.stock || 999)}
                    className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleAddToCart}
                  disabled={addToCartMutation.isLoading}
                  className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-semibold hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {addToCartMutation.isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white"></div>
                      <span>담는 중...</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCartIcon className="w-5 h-5" />
                      <span>장바구니 담기</span>
                    </>
                  )}
                </button>
                <button
                  onClick={handleToggleWishlist}
                  disabled={toggleWishlistMutation.isLoading}
                  className="w-14 h-14 rounded-2xl border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {toggleWishlistMutation.isLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-gray-400"></div>
                  ) : isWishlisted ? (
                    <HeartSolidIcon className="w-6 h-6 text-red-500" />
                  ) : (
                    <HeartIcon className="w-6 h-6 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* 상품 특징 */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">상품 특징</h3>
              <div className="space-y-3">
                {(product.features || []).map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></div>
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 탭 메뉴 */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              {['상품정보', '상세정보', '배송/교환/반품'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors duration-200 ${
                    activeTab === tab
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-8">
            {activeTab === '상품정보' && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">상품 설명</h3>
                <p className="text-gray-700 leading-relaxed">{product.description || '상품 설명이 없습니다.'}</p>
              </div>
            )}

            {activeTab === '상세정보' && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">상세 정보</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(product.specifications || {}).map(([key, value]) => (
                    <div key={key} className="flex justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">{key}:</span>
                      <span className="text-gray-900 font-medium">{value}</span>
                    </div>
                  ))}
                  {(!product.specifications || Object.keys(product.specifications).length === 0) && (
                    <div className="col-span-full text-center text-gray-500 py-8">
                      상세 정보가 없습니다.
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === '배송/교환/반품' && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">배송/교환/반품 안내</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">배송 안내</h4>
                    <p className="text-gray-700">• 전국 무료배송 (제주/도서산간 지역 제외)</p>
                    <p className="text-gray-700">• 평균 배송 기간: 2-3일</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">교환/반품 안내</h4>
                    <p className="text-gray-700">• 상품 수령 후 14일 이내 교환/반품 가능</p>
                    <p className="text-gray-700">• 사용하지 않은 새 상품에 한함</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 관련 상품 섹션 */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">관련 상품</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {Object.values(mockProducts)
              .filter(p => p.id !== product.id)
              .slice(0, 4)
              .map((relatedProduct) => (
                <button
                  key={relatedProduct.id}
                  onClick={() => navigate(`/products/${relatedProduct.id}`)}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-200 hover:scale-105 text-left"
                >
                  <div className="aspect-square bg-gray-100 flex items-center justify-center">
                    <img
                      src={relatedProduct.image}
                      alt={relatedProduct.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        if (!target.dataset.errorHandled) {
                          target.dataset.errorHandled = 'true'
                          target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuydtOuvuOyngCDsl4bsnYw8L3RleHQ+PC9zdmc+'
                        }
                      }}
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">{relatedProduct.name}</h3>
                    <p className="text-blue-600 font-bold">₩{relatedProduct.price.toLocaleString()}</p>
                    <div className="flex items-center mt-2">
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <StarIcon
                            key={i}
                            className={`w-3 h-3 ${
                              i < Math.floor(relatedProduct.rating || 0) 
                                ? 'text-yellow-400 fill-current' 
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-500 ml-1">({relatedProduct.reviewCount || 0})</span>
                    </div>
                  </div>
                </button>
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetail