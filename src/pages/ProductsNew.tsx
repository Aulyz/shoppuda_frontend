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

  // 신상품 데이터 패칭
  const { data: newProductsData, isLoading: isNewLoading, isError: isNewError } = useQuery(
    ['products-new'],
    () => api.getProducts({ ordering: '-created_at', page: 1, limit: 8 }),
    {
      onSuccess: (data) => {
        console.log('신상품 데이터:', data)
      },
      onError: (error) => {
        console.error('신상품 로딩 에러:', error)
      }
    }
  )

  // 신상품이 없을 경우 기존 제품 패칭 (인기순으로 정렬)
  const { data: existingProductsData, isLoading: isExistingLoading, isError: isExistingError } = useQuery(
    ['products-existing'],
    () => api.getProducts({ ordering: '-view_count', page: 1, limit: 8 }),
    {
      enabled: !isNewLoading && (!newProductsData?.products || newProductsData.products?.length === 0),
      onSuccess: (data) => {
        console.log('기존 제품 데이터:', data)
      },
      onError: (error) => {
        console.error('기존 제품 로딩 에러:', error)
      }
    }
  )

  // 최종 표시할 제품 데이터
  const productsToShow = newProductsData?.products?.length > 0 
    ? newProductsData.products 
    : existingProductsData?.products || []

  console.log('productsToShow:', productsToShow)
  console.log('newProductsData:', newProductsData)
  console.log('existingProductsData:', existingProductsData)

  const isLoading = isNewLoading || (isExistingLoading && (!newProductsData?.products || newProductsData.products?.length === 0))
  const isError = isNewError && isExistingError

  // 단일 제품과 블랜딩 소개 섹션
  const { data: singleProductData, isLoading: isSingleLoading } = useQuery(
    ['product-single'],
    () => api.getProducts({ ordering: '-created_at', page: 1, limit: 1 }),
    {
      staleTime: 1000 * 60 * 5, // 5분간 캐시 유지
      onSuccess: (data) => {
        console.log('단일 제품 데이터:', data)
      },
      onError: (error) => {
        console.error('단일 제품 로딩 에러:', error)
      }
    }
  )

  const singleProduct = singleProductData?.products?.[0]

  // 로딩 상태 표시
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

  // 에러 상태 표시
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

        {/* 단일 제품 + 블랜딩 소개 섹션 */}
        {!isSingleLoading && singleProduct && (
          <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 mb-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              {/* 제품 이미지 */}
              <div className="flex justify-center">
                <div className="relative group">
                  <img
                    src={singleProduct.image || '/placeholder.png'}
                    alt={singleProduct.name}
                    className="rounded-2xl shadow-lg w-full max-w-md h-auto object-cover"
                  />
                  {singleProduct.discount_price && (
                    <div className="absolute top-4 right-4 bg-blue-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                      {Math.round(((parseFloat(singleProduct.price) - parseFloat(singleProduct.discount_price)) / parseFloat(singleProduct.price)) * 100)}% OFF
                    </div>
                  )}
                </div>
              </div>

              {/* 제품 소개 및 블랜딩 */}
              <div className="space-y-6">
                <div>
                  <span className="inline-block bg-gradient-to-r from-blue-400 to-pink-400 text-white text-xs font-bold px-3 py-1 rounded-full mb-3">
                    오늘의 추천
                  </span>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {singleProduct.name}
                  </h2>
                  <p className="text-gray-600 leading-relaxed">
                    {singleProduct.description || '이 제품은 특별한 재료와 정성으로 만들어진 제품입니다. 당신의 일상에 특별한 순간을 선사할 것입니다.'}
                  </p>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">✨ 제품 특징</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      <span>고급 소재 사용으로 내구성이 뛰어남</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      <span>세련된 디자인으로 어떤 공간에도 잘 어울림</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      <span>사용이 간편하고 관리가 쉬움</span>
                    </li>
                  </ul>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    {singleProduct.discount_price ? (
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-blue-500">
                          ₩{parseFloat(singleProduct.discount_price).toLocaleString()}
                        </span>
                        <span className="text-lg text-gray-500 line-through">
                          ₩{parseFloat(singleProduct.price).toLocaleString()}
                        </span>
                      </div>
                    ) : (
                      <span className="text-2xl font-bold text-gray-900">
                        ₩{parseFloat(singleProduct.price).toLocaleString()}
                      </span>
                    )}
                  </div>
                  
                  {singleProduct.id ? (
                    <Link
                      to={`/products/${singleProduct.id}`}
                      className="bg-gradient-to-r from-blue-500 to-pink-400 hover:from-blue-600 hover:to-pink-500 text-white font-semibold py-3 px-6 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      자세히 보기
                    </Link>
                  ) : (
                    <span className="bg-gray-400 text-white font-semibold py-3 px-6 rounded-full">
                      상품 정보 없음
                    </span>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 신상품 리스트 */}
        <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {newProductsData?.products?.length > 0 ? '최신 신상품' : '인기 제품'}
          </h2>
          
          {productsToShow.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {productsToShow.map((product: any) => (
                product.id ? (
                  <Link
                    key={product.id}
                    to={`/products/${product.id}`}
                    className="group bg-white rounded-2xl shadow border border-gray-100 hover:shadow-xl transition-all duration-200 relative"
                  >
                  <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-t-2xl bg-gray-100 relative">
                    <img
                      src={product.image || '/placeholder.png'}
                      alt={product.name}
                      className="h-56 w-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                    />
                    {product.discount_price && (
                      <div className="absolute top-3 right-3 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        {Math.round(((parseFloat(product.price) - parseFloat(product.discount_price)) / parseFloat(product.price)) * 100)}% OFF
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-base font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-blue-500 transition-colors duration-200">
                      {product.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <div>
                        {product.discount_price ? (
                          <div className="flex flex-col">
                            <p className="text-base font-bold text-blue-500">
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
                      {product.created_at && (
                        <span className="text-xs text-white bg-gradient-to-r from-blue-400 to-pink-400 px-2 py-1 rounded-full font-semibold ml-2">
                          NEW
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
                ) : (
                  <div key={Math.random()} className="bg-white rounded-2xl shadow border border-gray-100 p-4">
                    <div className="text-center text-gray-500">
                      <p>상품 정보를 불러올 수 없습니다</p>
                    </div>
                  </div>
                )
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
      </div>
    </div>
  )
}

export default ProductsNew