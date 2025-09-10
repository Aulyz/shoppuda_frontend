import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from 'react-query'
import { api } from '../services/api'
import { FunnelIcon, ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import ProductCard from '../components/ProductCard'

interface Category {
  id: number
  name: string
  code: string
  parent: number | null
  full_path: string
  icon: string
  children: Category[]
}

function ProductsAll() {
  // URL 파라미터 관리
  const [searchParams, setSearchParams] = useSearchParams()
  const [showFilters, setShowFilters] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState<number[]>([])
  
  // 페이지 접속 시 맨 위로 스크롤
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])
  
  // URL 파라미터 추출
  const category = searchParams.get('category') || ''
  const sort = searchParams.get('sort') || ''
  const page = parseInt(searchParams.get('page') || '1')

  // 상품 목록 조회 (전체 상품 - 카테고리 필터 없음)
  const { data, isLoading } = useQuery(
    ['products', sort, page], // category 제거
    () => api.getProducts({ ordering: sort, page }) // category 파라미터 제거
  )

  // 카테고리 목록 조회
  const { data: categoriesData } = useQuery(
    'categories',
    () => api.getCategories()
  )

  // 정렬 변경 핸들러
  const handleSortChange = (value: string) => {
    const newParams = new URLSearchParams(searchParams)
    if (value) {
      newParams.set('sort', value)
    } else {
      newParams.delete('sort')
    }
    newParams.set('page', '1') // 정렬 변경 시 첫 페이지로 이동
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
    newParams.set('page', '1') // 카테고리 변경 시 첫 페이지로 이동
    setSearchParams(newParams)
  }

  // 페이지 변경 핸들러
  const handlePageChange = (newPage: number) => {
    const newParams = new URLSearchParams(searchParams)
    newParams.set('page', String(newPage))
    setSearchParams(newParams)
  }

  // 카테고리 확장/축소 토글
  const toggleCategoryExpand = (categoryId: number) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  // 카테고리 렌더링 함수
  const renderCategory = (cat: Category, level: number = 0) => {
    const hasChildren = cat.children && cat.children.length > 0
    const isExpanded = expandedCategories.includes(cat.id)
    const isSelected = category === cat.name

    return (
      <div key={cat.id}>
        <button
          onClick={() => {
            if (hasChildren && level === 0) {
              toggleCategoryExpand(cat.id)
            }
            handleCategoryChange(cat.name)
          }}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 ${
            isSelected
              ? 'bg-gradient-to-r from-orange-100 to-pink-100 text-orange-700 font-semibold' 
              : 'hover:bg-gray-50 text-gray-700'
          }`}
          style={{ paddingLeft: `${(level * 16) + 16}px` }}
        >
          <div className="flex items-center space-x-2">
            <i className={`${cat.icon} text-sm`}></i>
            <span>{cat.name}</span>
          </div>
          {hasChildren && level === 0 && (
            <span onClick={(e) => {
              e.stopPropagation()
              toggleCategoryExpand(cat.id)
            }}>
              {isExpanded ? (
                <ChevronDownIcon className="h-4 w-4" />
              ) : (
                <ChevronRightIcon className="h-4 w-4" />
              )}
            </span>
          )}
        </button>
        {hasChildren && isExpanded && (
          <div className="mt-1">
            {cat.children.map(child => renderCategory(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-orange-50 via-white to-pink-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* 페이지 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
              상품
            </h1>
            <p className="text-gray-500 mt-2">쇼푸다의 다양한 상품을 만나보세요</p>
          </div>
          
          {/* 정렬 및 필터 컨트롤 */}
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
              className="px-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all duration-200"
            >
              <option value="">정렬 기준</option>
              <option value="-created_at">최신순</option>
              <option value="price">낮은 가격순</option>
              <option value="-price">높은 가격순</option>
              <option value="-sales_count">인기순</option>
            </select>
          </div>
        </div>

        {/* 상품 그리드 - 전체 너비 사용 */}
        <div>
          {isLoading ? (
            /* 로딩 스켈레톤 */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                  {data?.products?.map((product: any) => (
                    <ProductCard key={product.id} product={product} />
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
                          className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-orange-50 hover:border-orange-300 transition-colors duration-200"
                        >
                          이전
                        </button>
                      )}
                      
                      {/* 페이지 정보 */}
                      <div className="px-4 py-2 bg-gradient-to-r from-orange-100 to-pink-100 border border-orange-200 rounded-lg font-semibold text-orange-700">
                        {data.pagination.current_page} / {data.pagination.total_pages}
                      </div>
                      
                      {/* 다음 페이지 버튼 */}
                      {data.pagination.has_next && (
                        <button
                          onClick={() => handlePageChange(page + 1)}
                          className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-orange-50 hover:border-orange-300 transition-colors duration-200"
                        >
                          다음
                        </button>
                      )}
                    </nav>
                  </div>
                )}

              {/* 상품이 없을 때 */}
              {data?.products?.length === 0 && (
                <div className="text-center py-16">
                  <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 rounded-full mb-6">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">상품이 없습니다</h3>
                  <p className="text-gray-500">검색어를 변경하거나 다른 조건으로 검색해 보세요</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductsAll