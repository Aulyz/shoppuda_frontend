import React, { useState, useEffect, useMemo } from 'react'
import { useQuery } from 'react-query'
import { api } from '../services/api'
import { 
  FunnelIcon, 
  ChevronRightIcon,
  TagIcon
} from '@heroicons/react/24/outline'
import ProductCard from '../components/ProductCard'
import { ProductGridSkeleton } from '../components/Skeleton'

interface Category {
  id: number
  name: string
  code: string
  parent: number | null
  full_path: string
  icon: string
  children: Category[]
  product_count?: number
}

interface Product {
  id: number
  name: string
  price: string
  category: {
    id: number
    name: string
    code: string
  }
  brand: string | null
  brand_name?: string
  thumbnail?: string
  image?: string
  discount_price: string | null
  is_new?: boolean
  is_best?: boolean
  is_featured?: boolean
  stock: number
  stock_quantity?: number
  short_description: string
  slug?: string
}

function ProductsAll() {
  const [hoveredCategory, setHoveredCategory] = useState<number | null>(null)
  const [selectedSort, setSelectedSort] = useState('newest')
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)
  
  // 페이지 접속 시 맨 위로 스크롤
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // 카테고리 목록 조회
  const { data: categoriesData, isLoading: categoriesLoading } = useQuery(
    'categories',
    () => api.getCategories()
  )

  const allCategories = categoriesData?.categories || []

  // 상품 목록 조회
  const { data: productsData, isLoading: productsLoading } = useQuery(
    ['products', selectedSort],
    async () => {
      const response = await api.getProducts({ 
        ordering: selectedSort === 'newest' ? '-created_at' : 
                  selectedSort === 'price_low' ? 'selling_price' : 
                  selectedSort === 'price_high' ? '-selling_price' : 
                  selectedSort === 'best' ? '-is_best' : '',
        page_size: 1000 // 충분히 큰 수로 설정
      })
      return response
    }
  )

  // 선택된 카테고리와 그 하위 카테고리의 ID 수집
  const getCategoryAndDescendantIds = (category: Category): number[] => {
    const ids = [category.id]
    if (category.children) {
      category.children.forEach(child => {
        ids.push(...getCategoryAndDescendantIds(child))
      })
    }
    return ids
  }

  // 카테고리별 상품 필터링
  const filteredProducts = useMemo(() => {
    if (!productsData?.products) return []
    
    if (!selectedCategoryId) {
      return productsData.products
    }
    
    const selectedCategory = allCategories.find((cat: Category) => cat.id === selectedCategoryId)
    if (!selectedCategory) return productsData.products
    
    const categoryIds = getCategoryAndDescendantIds(selectedCategory)
    
    return productsData.products.filter((product: Product) => 
      categoryIds.includes(product.category.id)
    )
  }, [productsData, selectedCategoryId, allCategories])

  // 카테고리 필터 선택
  const handleCategoryFilter = (categoryId: number | null) => {
    setSelectedCategoryId(categoryId)
    setHoveredCategory(null)
  }

  // 하위 카테고리 드롭다운 렌더링
  const renderSubcategoryDropdown = (category: Category, level: number = 0) => {
    if (!category.children || category.children.length === 0) return null
    
    return (
      <>
        {/* 보이지 않는 브릿지 - hover 유지용 */}
        <div className={`absolute ${level === 0 ? 'left-full' : 'left-full'} top-0 w-2 h-full z-40`} />
        <div 
          className={`absolute ${level === 0 ? 'left-full' : 'left-full'} top-0 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50`}
          onMouseEnter={(e) => e.stopPropagation()}
        >
        {category.children.map(child => (
          <div
            key={child.id}
            className="relative"
            onMouseEnter={() => setHoveredCategory(child.id)}
            onMouseLeave={() => setHoveredCategory(null)}
          >
            <div
              className={`px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center justify-between ${
                selectedCategoryId === child.id ? 'bg-orange-50 text-orange-600' : ''
              }`}
              onClick={(e) => {
                e.stopPropagation()
                handleCategoryFilter(child.id)
              }}
            >
              <span className="text-sm">{child.name}</span>
              {child.children && child.children.length > 0 && (
                <ChevronRightIcon className="h-3 w-3 text-gray-400" />
              )}
            </div>
            {hoveredCategory === child.id && renderSubcategoryDropdown(child, level + 1)}
          </div>
        ))}
        </div>
      </>
    )
  }

  if (categoriesLoading || productsLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        {/* 페이지 타이틀 스켈레톤 */}
        <div className="mb-8">
          <div className="h-10 w-48 bg-gray-300 rounded-lg mb-2 animate-pulse"></div>
          <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
        </div>

        <div className="flex gap-8">
          {/* 왼쪽 사이드바 스켈레톤 */}
          <aside className="w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="h-6 w-24 bg-gray-300 rounded mb-4 animate-pulse"></div>
              <div className="space-y-4">
                <div className="h-10 w-full bg-gray-200 rounded-lg animate-pulse"></div>
              </div>
            </div>
          </aside>

          {/* 오른쪽 상품 목록 스켈레톤 */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <ProductGridSkeleton count={12} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 페이지 타이틀 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          전체 상품
        </h1>
        <p className="text-gray-600">
          모든 카테고리의 상품을 확인하세요
        </p>
      </div>

      <div className="flex gap-8">
        {/* 왼쪽 사이드바 - 필터만 */}
        <aside className="w-64 flex-shrink-0">
          {/* 필터 섹션 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="font-semibold text-lg mb-4 flex items-center">
              <FunnelIcon className="h-5 w-5 mr-2" />
              필터
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  정렬
                </label>
                <select 
                  value={selectedSort}
                  onChange={(e) => setSelectedSort(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="newest">최신순</option>
                  <option value="best">인기순</option>
                  <option value="price_low">낮은 가격순</option>
                  <option value="price_high">높은 가격순</option>
                </select>
              </div>
            </div>
          </div>
        </aside>

        {/* 오른쪽 상품 목록 */}
        <div className="flex-1">
          {/* 상품 개수 및 정렬 */}
          <div className="flex justify-between items-center mb-6">
            <p className="text-gray-600">
              총 <span className="font-semibold text-orange-500">{filteredProducts.length}</span>개의 상품
            </p>
          </div>

          {/* 상품 그리드 */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product: Product) => (
                <ProductCard 
                  key={product.id} 
                  product={product}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <TagIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                상품이 없습니다.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductsAll