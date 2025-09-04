import React, { useEffect } from 'react'
import { useQuery } from 'react-query'
import { Link } from 'react-router-dom'
import { api } from '../services/api'
import { SparklesIcon } from '@heroicons/react/24/outline'

function ProductsNew() {
  // 페이지 진입 시 스크롤 맨 위로 이동
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // 신상품 데이터 패칭 (최신 순으로)
  const { data: newProductsData, isLoading: isNewLoading, isError: isNewError } = useQuery(
    ['products-new'],
    () => api.getProducts({ ordering: '-created_at', page: 1, limit: 12 }),
    {
      retry: 3,
      retryDelay: 1000,
      onSuccess: (data) => {
        console.log('신상품 데이터:', data)
      },
      onError: (error) => {
        console.error('신상품 로딩 에러:', error)
      }
    }
  )

  // 신상품이 없을 경우 전체 상품에서 랜덤하게 가져오기
  const { data: fallbackProductsData, isLoading: isFallbackLoading } = useQuery(
    ['products-fallback'],
    () => api.getProducts({ page: 1, limit: 50 }), // 더 많은 상품을 가져와서 랜덤 선택
    {
      enabled: !isNewLoading && (!newProductsData?.products?.length && !newProductsData?.results?.length),
      retry: 3,
      retryDelay: 1000,
      onSuccess: (data) => {
        console.log('대체 상품 데이터:', data)
      },
      onError: (error) => {
        console.error('대체 상품 로딩 에러:', error)
      }
    }
  )

  // 상품 데이터 처리 및 랜덤 선택
  const newProducts = newProductsData?.results || newProductsData?.products || newProductsData?.data || []
  const fallbackProducts = fallbackProductsData?.results || fallbackProductsData?.products || fallbackProductsData?.data || []

  // 신상품이 있으면 신상품을, 없으면 전체 상품에서 랜덤하게 선택
  let productsToShow: any[] = []
  let pageTitle = "상품 목록"
  let isUsingFallback = false

  if (Array.isArray(newProducts) && newProducts.length > 0) {
    productsToShow = newProducts
    pageTitle = "최신 신상품"
  } else if (Array.isArray(fallbackProducts) && fallbackProducts.length > 0) {
    // 랜덤하게 12개 선택
    const shuffled = [...fallbackProducts].sort(() => 0.5 - Math.random())
    productsToShow = shuffled.slice(0, 12)
    pageTitle = "추천 상품"
    isUsingFallback = true
  }

  // 유효한 상품만 필터링
  const validProducts = productsToShow.filter(product => product && product.id)

  console.log('신상품:', newProducts)
  console.log('대체 상품:', fallbackProducts)
  console.log('최종 표시 상품:', validProducts)
  console.log('대체 모드:', isUsingFallback)

  // 로딩 상태
  const isLoading = isNewLoading || isFallbackLoading
  const isError = isNewError && (!fallbackProductsData || fallbackProducts.length === 0)

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-blue-50 via-white to-pink-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col items-center text-center mb-12">
            <div className="flex items-center gap-3 mb-3">
              <SparklesIcon className="w-10 h-10 text-blue-400 animate-bounce" />
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-500 to-pink-400 bg-clip-text text-transparent">
                신상품 모아보기
              </h1>
            </div>
            <p className="text-gray-500 text-lg mt-2">
              매일 업데이트되는 새로운 상품을 가장 먼저 만나보세요!
            </p>
          </div>
          
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-gray-600">상품 정보를 불러오는 중입니다...</p>
          </div>
        </div>
      </div>
    )
  }

  // 에러 상태
  if (isError) {
    return (
      <div className="bg-gradient-to-br from-blue-50 via-white to-pink-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col items-center text-center mb-12">
            <div className="flex items-center gap-3 mb-3">
              <SparklesIcon className="w-10 h-10 text-blue-400" />
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-500 to-pink-400 bg-clip-text text-transparent">
                신상품 모아보기
              </h1>
            </div>
            <p className="text-gray-500 text-lg mt-2">
              매일 업데이트되는 새로운 상품을 가장 먼저 만나보세요!
            </p>
          </div>
          
          <div className="text-center py-12 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
            <div className="text-red-500 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">상품 정보를 불러오는데 실패했습니다</h3>
            <p className="text-gray-500 mb-4">일시적인 오류일 수 있습니다. 잠시 후 다시 시도해주세요.</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-blue-500 to-pink-400 hover:from-blue-600 hover:to-pink-500 text-white font-semibold py-2 px-6 rounded-full transition-all duration-200"
            >
              다시 시도
            </button>
          </div>
        </div>
      </div>
    )
  }


  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-pink-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* 상단 헤더 */}
        <div className="flex flex-col items-center text-center mb-12">
          <div className="flex items-center gap-3 mb-3">
            <SparklesIcon className="w-10 h-10 text-blue-400 animate-bounce" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-500 to-pink-400 bg-clip-text text-transparent">
              신상품 모아보기
            </h1>
          </div>
          <p className="text-gray-500 text-lg mt-2">
            매일 업데이트되는 새로운 상품을 가장 먼저 만나보세요!
          </p>
        </div>

        {/* 대체 상품 알림 */}
        {isUsingFallback && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  현재 신상품이 준비 중입니다. 대신 엄선된 추천 상품들을 보여드리고 있어요!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 상품 목록 */}
        <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {pageTitle}
          </h2>
          
          {validProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {validProducts.map((product: any) => (
                <Link
                  key={product.id}
                  to={`/products/${product.id}`}
                  className="group bg-white rounded-2xl shadow border border-gray-100 hover:shadow-xl transition-all duration-200"
                >
                  <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-t-2xl bg-gray-100 relative">
                    <img
                      src={product.image || product.thumbnail || '/placeholder.png'}
                      alt={product.name || product.title || '상품 이미지'}
                      className="h-56 w-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder.png'
                      }}
                    />
                    {(product.discount_price || product.sale_price) && product.price && (
                      <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        {Math.round(((parseFloat(product.price) - parseFloat(product.discount_price || product.sale_price)) / parseFloat(product.price)) * 100)}% OFF
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-base font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-500 transition-colors duration-200">
                      {product.name || product.title || '상품명'}
                    </h3>
                    <div className="flex items-center justify-between">
                      <div>
                        {product.discount_price || product.sale_price ? (
                          <div className="flex flex-col">
                            <p className="text-base font-bold text-red-500">
                              ₩{parseFloat(product.discount_price || product.sale_price).toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-500 line-through">
                              ₩{parseFloat(product.price).toLocaleString()}
                            </p>
                          </div>
                        ) : (
                          <p className="text-base font-bold text-gray-900">
                            ₩{parseFloat(product.price || '0').toLocaleString()}
                          </p>
                        )}
                      </div>
                      <span className={`text-xs text-white px-2 py-1 rounded-full font-semibold ml-2 ${
                        isUsingFallback 
                          ? 'bg-gradient-to-r from-green-400 to-blue-400' 
                          : 'bg-gradient-to-r from-blue-400 to-pink-400'
                      }`}>
                        {isUsingFallback ? '추천' : 'NEW'}
                      </span>
                    </div>
                    {product.description && (
                      <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                        {product.description}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 rounded-full mb-6">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">상품이 없습니다</h3>
              <p className="text-gray-500 mb-4">현재 등록된 상품이 없습니다. 곧 새로운 상품이 추가될 예정입니다.</p>
              <Link 
                to="/products" 
                className="inline-block bg-gradient-to-r from-blue-500 to-pink-400 hover:from-blue-600 hover:to-pink-500 text-white font-semibold py-2 px-6 rounded-full transition-all duration-200"
              >
                전체 상품 보기
              </Link>
            </div>
          )}
        </section>

        {/* 디버그 정보 */}
        <div className="mt-8 p-4 bg-gray-100 rounded-lg">
          <h3 className="font-bold mb-2">디버그 정보:</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="font-semibold">신상품 데이터:</p>
              <p>로딩: {isNewLoading ? 'Yes' : 'No'}</p>
              <p>에러: {isNewError ? 'Yes' : 'No'}</p>
              <p>상품 수: {newProducts.length}</p>
            </div>
            <div>
              <p className="font-semibold">대체 상품 데이터:</p>
              <p>로딩: {isFallbackLoading ? 'Yes' : 'No'}</p>
              <p>상품 수: {fallbackProducts.length}</p>
              <p>대체 모드: {isUsingFallback ? 'Yes' : 'No'}</p>
            </div>
          </div>
          <p>최종 표시 상품 수: {validProducts.length}</p>
          <p>페이지 제목: {pageTitle}</p>
          <details className="mt-2">
            <summary className="cursor-pointer font-semibold">전체 응답 데이터</summary>
            <pre className="text-xs overflow-auto max-h-32 mt-2 bg-white p-2 rounded">
              신상품: {JSON.stringify(newProductsData, null, 2)}
              {'\n\n'}
              대체상품: {JSON.stringify(fallbackProductsData, null, 2)}
            </pre>
          </details>
        </div>
      </div>
    </div>
  )
}

export default ProductsNew