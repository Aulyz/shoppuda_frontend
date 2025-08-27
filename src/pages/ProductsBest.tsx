import React, { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useQuery } from 'react-query'
import { api } from '../services/api'
import { FunnelIcon, FireIcon } from '@heroicons/react/24/outline'

function ProductsBest() {
  // URL 파라미터
  const [searchParams, setSearchParams] = useSearchParams()
  const [showFilters, setShowFilters] = useState(false)
  
  // 페이지 진입 시 스크롤 맨 위로 이동
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])
  
  // URL 파라미터 (카테고리, 정렬, 페이지)
  const category = searchParams.get('category') || ''
  const sort = searchParams.get('sort') || '-sales_count'
  const page = parseInt(searchParams.get('page') || '1')

  // 상품 데이터 패칭 (카테고리, 정렬, 페이지)
  const { data, isLoading } = useQuery(
    ['products-best', category, sort, page],
    () => api.getProducts({ category, ordering: sort, page })
  )

  // 정렬 변경 핸들러
  const handleSortChange = (value: string) => {
    const newParams = new URLSearchParams(searchParams)
    if (value) {
      newParams.set('sort', value)
    } else {
      newParams.delete('sort')
    }
    newParams.set('page', '1') // 정렬 변경 시 페이지 초기화
    setSearchParams(newParams)
  }

  // 카테고리 변경 핸들러
  const handleCategoryChange = (value: string) => {
    const newParams = new URLSearchParams(searchParams)
    if (value) {
      newParams.set('category', value)
    } else {
      newParams.delete('category')
    }
    newParams.set('page', '1') // 카테고리 변경 시 페이지 초기화
    setSearchParams(newParams)
  }

  // 페이지 변경 핸들러
  const handlePageChange = (newPage: number) => {
    const newParams = new URLSearchParams(searchParams)
    newParams.set('page', String(newPage))
    setSearchParams(newParams)
  }

  return (
    <div className="bg-gradient-to-br from-orange-50 via-white to-pink-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* 상단 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                베스트
              </h1>
            </div>
            <p className="text-gray-500 mt-2">많이 팔린 인기 상품을 한눈에 확인해보세요</p>
          </div>
          
          {/* 정렬 및 필터 버튼 */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors duration-200"
            >
              <FunnelIcon className="h-5 w-5" />
              <span>필터</span>
            </button>
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
          </div>
        </div>

        <div className="flex gap-8">
          
          {/* 사이드 - 카테고리 필터 */}
          <aside className={`${showFilters ? 'block' : 'hidden'} md:block w-64 flex-shrink-0`}>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 sticky top-8">
              <h3 className="font-bold text-xl text-gray-900 mb-6">카테고리</h3>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => handleCategoryChange('')}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                      !category 
                        ? 'bg-gradient-to-r from-red-100 to-orange-100 text-red-700 font-semibold' 
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    전체 상품
                  </button>
                </li>
                {['패션', '뷰티', '식품', '가전', '생활', '도서', '스포츠', '기타'].map((cat) => (
                  <li key={cat}>
                    <button
                      onClick={() => handleCategoryChange(cat)}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                        category === cat 
                          ? 'bg-gradient-to-r from-red-100 to-orange-100 text-red-700 font-semibold' 
                          : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      {cat}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* 상품 리스트 */}
          <div className="flex-1">
            {isLoading ? (
              /* 로딩 스켈레톤 */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-200 h-64 rounded-2xl mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                {/* 상품 목록 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {data?.products?.map((product: any, index: number) => (
                    <Link
                      key={product.id}
                      to={`/products/${product.id}`}
                      className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:z-10 relative"
                    >
                      {/* 상품 이미지 */}
                      <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-t-2xl bg-gray-100 relative">
                        <img
                          src={product.image || '/placeholder.png'}
                          alt={product.name}
                          className="h-64 w-full object-cover object-center group-hover:scale-110 transition-transform duration-300"
                        />
                        
                        {/* 베스트 뱃지 */}
                        {index < 3 && (
                          <div className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-orange-500 text-white text-sm font-bold px-3 py-1 rounded-full flex items-center gap-1">
                            <FireIcon className="w-4 h-4" />
                            {index + 1}위
                          </div>
                        )}
                        
                        {/* 할인율 뱃지 */}
                        {product.discount_price && (
                          <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                            {Math.round(((parseFloat(product.price) - parseFloat(product.discount_price)) / parseFloat(product.price)) * 100)}% OFF
                          </div>
                        )}
                      </div>
                      
                      {/* 상품 정보 */}
                      <div className="p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-red-600 transition-colors duration-200">
                          {product.name}
                        </h3>
                        <div className="flex items-center justify-between">
                          <div>
                            {product.discount_price ? (
                              <div className="flex flex-col">
                                <p className="text-lg font-bold text-red-600">
                                  ₩{parseFloat(product.discount_price).toLocaleString()}
                                </p>
                                <p className="text-sm text-gray-500 line-through">
                                  ₩{parseFloat(product.price).toLocaleString()}
                                </p>
                              </div>
                            ) : (
                              <p className="text-lg font-bold text-gray-900">
                                ₩{parseFloat(product.price).toLocaleString()}
                              </p>
                            )}
                          </div>
                          
                          {/* 판매수량 뱃지 */}
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

                {/* 페이지네이션 */}
                {data?.pagination?.total_items > 0 && (
                  <div className="flex justify-center">
                    <nav className="flex items-center space-x-2">
                      {/* 이전 페이지 버튼 */}
                      {data.pagination.has_previous && (
                        <button
                          onClick={() => handlePageChange(page - 1)}
                          className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-red-50 hover:border-red-300 transition-colors duration-200"
                        >
                          이전
                        </button>
                      )}
                      
                      {/* 현재 페이지 */}
                      <div className="px-4 py-2 bg-gradient-to-r from-red-100 to-orange-100 border border-red-200 rounded-lg font-semibold text-red-700">
                        {data.pagination.current_page} / {data.pagination.total_pages}
                      </div>
                      
                      {/* 다음 페이지 버튼 */}
                      {data.pagination.has_next && (
                        <button
                          onClick={() => handlePageChange(page + 1)}
                          className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-red-50 hover:border-red-300 transition-colors duration-200"
                        >
                          다음
                        </button>
                      )}
                    </nav>
                  </div>
                )}

                {/* 상품 없음 안내 */}
                {data?.products?.length === 0 && (
                  <div className="text-center py-16">
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 rounded-full mb-6">
                      <FireIcon className="w-12 h-12 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">상품이 없습니다</h3>
                    <p className="text-gray-500">선택한 카테고리에 상품이 없습니다</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductsBest