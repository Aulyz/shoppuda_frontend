import React, { useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useQuery } from 'react-query'
import { api } from '../services/api'
import { FireIcon, GlobeAltIcon } from '@heroicons/react/24/outline' // GlobeAltIcon 추가

function ProductsBest() {
  // URL 파라미터
  const [searchParams, setSearchParams] = useSearchParams()
  // 페이지 진입 시 스크롤 맨 위로 이동
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])
  
  // 정렬 및 페이지 파라미터
  const sort = searchParams.get('sort') || '-sales_count'
  const page = parseInt(searchParams.get('page') || '1')

  // 쇼프다 인기 상품 데이터 패칭
  const { data: bestData, isLoading: isBestLoading } = useQuery(
    ['products-best', sort, page],
    () => api.getProducts({ ordering: sort, page })
  )

  // 해외 인기 상품 데이터 패칭 (예시: ordering: '-global_trend')
  const { data: globalData, isLoading: isGlobalLoading } = useQuery(
    ['products-global-best', page],
    () => api.getProducts({ ordering: '-global_trend', page })
  )

  // 정렬 변경 핸들러
  const handleSortChange = (value: string) => {
    const newParams = new URLSearchParams(searchParams)
    if (value) {
      newParams.set('sort', value)
    } else {
      newParams.delete('sort')
    }
    newParams.set('page', '1')
    setSearchParams(newParams)
  }

  return (
    <div className="bg-gradient-to-br from-orange-50 via-white to-pink-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 상단 헤더 */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-2">
              베스트
            </h1>
            <p className="text-gray-500 mt-2">많이 팔린 인기 상품을 한눈에 확인해보세요</p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={sort}
              onChange={(e) => handleSortChange(e.target.value)}
              className="px-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-all duration-200"
            >
              <option value="-sales_count">판매순</option>
              <option value="-created_at">신상품순</option>
              <option value="price">낮은가격순</option>
              <option value="-price">높은가격순</option>
            </select>
            {/* 전체상품 보러가기 버튼 */}
            <Link
              to="/products"
              className="ml-2 px-6 py-2 bg-gradient-to-r from-orange-400 to-red-400 text-white font-bold text-base rounded-2xl shadow-lg hover:scale-105 hover:shadow-2xl transition-all duration-200"
            >
              전체상품 보러가기
            </Link>
          </div>
        </div>

        {/* 쇼프다 인기 상품 섹션 */}
        <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 mb-16">
          <div className="flex items-center gap-2 mb-6">
            <FireIcon className="w-7 h-7 text-red-500" />
            <h2 className="text-2xl font-bold text-gray-900">쇼프다 인기 상품</h2>
          </div>
          {isBestLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 h-48 rounded-2xl mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {bestData?.products?.slice(0, 5).map((product: any, index: number) => (
                <Link
                  key={product.id}
                  to={`/products/${product.id}`}
                  className="group bg-white rounded-2xl shadow border border-gray-100 hover:shadow-lg transition-all duration-200 relative"
                >
                  <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-t-2xl bg-gray-100 relative">
                    <img
                      src={product.image || '/placeholder.png'}
                      alt={product.name}
                      className="h-48 w-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                    />
                    {index < 3 && (
                      <div className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                        <FireIcon className="w-4 h-4" />
                        {index + 1}위
                      </div>
                    )}
                    {product.discount_price && (
                      <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        {Math.round(((parseFloat(product.price) - parseFloat(product.discount_price)) / parseFloat(product.price)) * 100)}% OFF
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-base font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-red-600 transition-colors duration-200">
                      {product.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <div>
                        {product.discount_price ? (
                          <div className="flex flex-col">
                            <p className="text-base font-bold text-red-600">
                              ₩{parseFloat(product.discount_price).toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-500 line-through">
                              ₩{parseFloat(product.price).toLocaleString()}
                            </p>
                          </div>
                        ) : (
                          <p className="text-base font-bold text-gray-900">
                            ₩{parseFloat(product.price).toLocaleString()}
                          </p>
                        )}
                      </div>
                      {product.sales_count && (
                        <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                          {product.sales_count}개 판매
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* 가로 구분선 */}
        <div className="w-full flex justify-center my-12">
          <div className="h-px w-2/3 bg-gray-300 rounded-full" />
        </div>

        {/* 해외 인기 상품 섹션 */}
        <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
          <div className="flex items-center gap-2 mb-6">
            <GlobeAltIcon className="w-7 h-7 text-blue-500" />
            <h2 className="text-2xl font-bold text-gray-900">현재 해외에서 주목받는 상품!</h2>
          </div>
          {isGlobalLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 h-48 rounded-2xl mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {globalData?.products?.slice(0, 5).map((product: any, _index: number) => (
                <Link
                  key={product.id}
                  to={`/products/${product.id}`}
                  className="group bg-white rounded-2xl shadow border border-gray-100 hover:shadow-lg transition-all duration-200 relative"
                >
                  <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-t-2xl bg-gray-100 relative">
                    <img
                      src={product.image || '/placeholder.png'}
                      alt={product.name}
                      className="h-48 w-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                    />
                    {product.discount_price && (
                      <div className="absolute top-3 right-3 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        {Math.round(((parseFloat(product.price) - parseFloat(product.discount_price)) / parseFloat(product.price)) * 100)}% OFF
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-base font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200">
                      {product.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <div>
                        {product.discount_price ? (
                          <div className="flex flex-col">
                            <p className="text-base font-bold text-blue-600">
                              ₩{parseFloat(product.discount_price).toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-500 line-through">
                              ₩{parseFloat(product.price).toLocaleString()}
                            </p>
                          </div>
                        ) : (
                          <p className="text-base font-bold text-gray-900">
                            ₩{parseFloat(product.price).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default ProductsBest