import React, { useState, useEffect, useMemo } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { useQuery } from 'react-query'
import { api } from '../services/api'
import { 
  FunnelIcon, 
  ChevronRightIcon,
  HomeIcon,
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

function CategoryProducts() {
  const location = useLocation()
  const navigate = useNavigate()
  const [hoveredCategory, setHoveredCategory] = useState<number | null>(null)
  const [selectedSort, setSelectedSort] = useState('newest')
  const [currentPage, setCurrentPage] = useState(1)

  // URL 파싱: /category/신발/남성신발/운동화 형태를 처리
  const pathSegments = location.pathname.split('/').filter(segment => segment && segment !== 'category')
  
  // 카테고리 목록 조회
  const { data: categoriesData, isLoading: categoriesLoading } = useQuery(
    'categories',
    () => api.getCategories()
  )

  // API 응답 구조에 따라 카테고리 데이터 처리
  const allCategories = Array.isArray(categoriesData) ? categoriesData : (categoriesData?.categories || [])

  // 카테고리 경로에서 현재 카테고리 찾기
  const findCategoryByPath = (categories: Category[], path: string[]): Category | null => {
    if (path.length === 0) return null
    
    let currentLevel = categories
    let foundCategory: Category | null = null
    
    for (const segment of path) {
      const decodedSegment = decodeURIComponent(segment)
      const category = currentLevel.find(cat => 
        cat.name === decodedSegment || 
        cat.code === decodedSegment
      )
      
      if (category) {
        foundCategory = category
        currentLevel = category.children || []
      } else {
        break
      }
    }
    
    return foundCategory
  }

  const currentCategory = findCategoryByPath(allCategories, pathSegments)

  // 디버깅용 로그
  useEffect(() => {
    console.log('Path segments:', pathSegments);
    console.log('All categories:', allCategories);
    console.log('Current category:', currentCategory);
  }, [pathSegments, allCategories, currentCategory])

  // 현재 카테고리와 모든 하위 카테고리의 ID 수집
  const getCategoryAndDescendantIds = (category: Category): number[] => {
    const ids = [category.id]
    if (category.children) {
      category.children.forEach(child => {
        ids.push(...getCategoryAndDescendantIds(child))
      })
    }
    return ids
  }

  const categoryIds = currentCategory ? getCategoryAndDescendantIds(currentCategory) : []

  // 상품 조회 - 모든 상품을 가져와서 클라이언트에서 필터링
  const { data: productsData, isLoading: productsLoading } = useQuery(
    ['products', selectedSort],
    async () => {
      // 모든 상품을 가져옴
      const response = await api.getProducts({ 
        ordering: selectedSort === 'newest' ? '-created_at' : 
                  selectedSort === 'price_low' ? 'price' : 
                  selectedSort === 'price_high' ? '-price' : 
                  selectedSort === 'best' ? '-is_best' : '',
        page_size: 1000 // 충분히 큰 수로 설정
      })
      return response
    }
  )

  // 필터링된 상품 - 클라이언트에서 카테고리별로 필터링
  const filteredProducts = useMemo(() => {
    if (!productsData?.products) return []
    
    if (!currentCategory) {
      return []
    }
    
    // 현재 카테고리와 하위 카테고리의 ID들 수집
    const categoryIds = getCategoryAndDescendantIds(currentCategory)
    
    // 카테고리 ID로 상품 필터링
    return productsData.products.filter((product: Product) => 
      categoryIds.includes(product.category.id)
    )
  }, [productsData, currentCategory])

  // 빵부스러기 네비게이션 생성
  const getBreadcrumbs = (): { name: string; path: string }[] => {
    const breadcrumbs = [{ name: '홈', path: '/' }]
    
    if (!currentCategory) return breadcrumbs
    
    // 카테고리 경로를 구축
    const buildBreadcrumbPath = (cat: Category): { name: string; path: string }[] => {
      const paths: { name: string; path: string }[] = []
      
      // 부모 카테고리가 있으면 먼저 처리
      if (cat.parent) {
        const parentCat = allCategories.find((c: Category) => c.id === cat.parent)
        if (parentCat) {
          paths.push(...buildBreadcrumbPath(parentCat))
        }
      }
      
      // 현재 카테고리의 경로 추가
      const urlSafeName = cat.name.toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-가-힣]/g, '')
        .replace(/^-+|-+$/g, '')
      
      const fullPath = paths.length > 0 
        ? `/category/${paths.map(p => p.path.split('/').pop()).join('/')}/${encodeURIComponent(urlSafeName)}`
        : `/category/${encodeURIComponent(urlSafeName)}`
      
      paths.push({
        name: cat.name,
        path: fullPath
      })
      
      return paths
    }
    
    breadcrumbs.push(...buildBreadcrumbPath(currentCategory))
    
    return breadcrumbs
  }

  // 카테고리 클릭 핸들러
  const handleCategoryClick = (category: Category) => {
    // 카테고리의 전체 경로를 생성
    const buildCategoryPath = (cat: Category): string => {
      const paths: string[] = []
      
      // 현재 카테고리가 최상위가 아니면 부모 경로 먼저 추가
      if (cat.parent) {
        const parentCat = allCategories.find((c: Category) => c.id === cat.parent)
        if (parentCat) {
          const parentPath = buildCategoryPath(parentCat)
          if (parentPath) paths.push(parentPath)
        }
      }
      
      // 현재 카테고리 이름을 URL-safe하게 변환
      const urlSafeName = cat.name.toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-가-힣]/g, '')
        .replace(/^-+|-+$/g, '')
      
      paths.push(encodeURIComponent(urlSafeName))
      
      return paths.join('/')
    }
    
    const categoryPath = buildCategoryPath(category)
    navigate(`/category/${categoryPath}`)
    setHoveredCategory(null)
  }

  // 현재 카테고리가 최상위인지 확인
  const isTopLevelCategory = currentCategory && !currentCategory.parent

  // 현재 카테고리의 최상위 카테고리 찾기
  const getRootCategory = (cat: Category | null): Category | null => {
    if (!cat) return null
    let rootCategory = cat
    while (rootCategory.parent) {
      const parent = allCategories.find((c: Category) => c.id === rootCategory.parent)
      if (parent) {
        rootCategory = parent
      } else {
        break
      }
    }
    return rootCategory
  }

  const rootCategory = getRootCategory(currentCategory)

  // 사이드바에 표시할 카테고리 목록 결정
  const getSidebarCategories = (): Category[] => {
    if (!currentCategory) {
      // 카테고리가 선택되지 않은 경우 최상위 카테고리 표시
      return allCategories.filter((cat: Category) => !cat.parent)
    }
    
    // 현재 카테고리의 최상위 카테고리 찾기
    let rootCategory = currentCategory
    while (rootCategory.parent) {
      const parent = allCategories.find((cat: Category) => cat.id === rootCategory.parent)
      if (parent) {
        rootCategory = parent
      } else {
        break
      }
    }
    
    // 최상위 카테고리의 모든 하위 카테고리 표시
    return rootCategory.children || []
  }

  const sidebarCategories = getSidebarCategories()

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
                currentCategory?.id === child.id ? 'bg-orange-50 text-orange-600' : ''
              }`}
              onClick={(e) => {
                e.stopPropagation()
                handleCategoryClick(child)
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

  // 페이지 로드 시 스크롤 초기화
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  // 페이지 로드 시 hover 초기화
  useEffect(() => {
    setHoveredCategory(null)
  }, [location.pathname])

  if (categoriesLoading || productsLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        {/* 빵부스러기 네비게이션 스켈레톤 */}
        <nav className="flex items-center space-x-2 text-sm mb-6">
          <div className="h-4 w-4 bg-gray-300 rounded animate-pulse"></div>
          <div className="h-4 w-8 bg-gray-300 rounded animate-pulse"></div>
          <div className="h-4 w-20 bg-gray-300 rounded animate-pulse"></div>
        </nav>

        {/* 카테고리 타이틀 스켈레톤 */}
        <div className="mb-8">
          <div className="h-10 w-48 bg-gray-300 rounded-lg mb-2 animate-pulse"></div>
          <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
        </div>

        <div className="flex gap-8">
          {/* 왼쪽 사이드바 스켈레톤 */}
          <aside className="w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="h-6 w-24 bg-gray-300 rounded mb-4 animate-pulse"></div>
              <div className="space-y-2">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-8 w-full bg-gray-200 rounded-lg animate-pulse"></div>
                ))}
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
      {/* 빵부스러기 네비게이션 */}
      <nav className="flex items-center space-x-2 text-sm mb-6">
        {getBreadcrumbs().map((crumb, index) => (
          <React.Fragment key={index}>
            {index > 0 && <ChevronRightIcon className="h-4 w-4 text-gray-400" />}
            <Link 
              to={crumb.path}
              className={`hover:text-orange-500 ${
                index === getBreadcrumbs().length - 1 ? 'font-semibold text-orange-500' : 'text-gray-600'
              }`}
            >
              {index === 0 ? <HomeIcon className="h-4 w-4" /> : crumb.name}
            </Link>
          </React.Fragment>
        ))}
      </nav>

      {/* 카테고리 타이틀 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {currentCategory?.name || '전체 상품'}
        </h1>
        <p className="text-gray-600">
          {currentCategory?.full_path || '모든 카테고리의 상품을 확인하세요'}
        </p>
      </div>

      <div className="flex gap-8">
        {/* 왼쪽 사이드바 - 카테고리 네비게이션 (전체 상품 페이지가 아닐 때만 표시) */}
        {currentCategory && (
          <aside className="w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="font-semibold text-lg mb-4 flex items-center">
                <TagIcon className="h-5 w-5 mr-2" />
                {rootCategory?.name || '카테고리'}
              </h3>
              <div className="space-y-1">
                {/* 전체보기 항목 - 항상 표시 */}
                {rootCategory && (
                  <div
                    className={`px-3 py-2 rounded-lg cursor-pointer flex items-center justify-between ${
                      isTopLevelCategory ? 'bg-orange-100 text-orange-600 font-semibold' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleCategoryClick(rootCategory)}
                  >
                    <span>{rootCategory.name} 전체보기</span>
                  </div>
                )}
                {/* 하위 카테고리 목록 */}
                {sidebarCategories.map(category => (
                <div
                  key={category.id}
                  className="relative"
                  onMouseEnter={() => setHoveredCategory(category.id)}
                  onMouseLeave={() => setHoveredCategory(null)}
                >
                  <div
                    className={`px-3 py-2 rounded-lg hover:bg-gray-50 cursor-pointer flex items-center justify-between ${
                      currentCategory?.id === category.id ? 'bg-orange-100 text-orange-600 font-semibold' : ''
                    }`}
                    onClick={() => handleCategoryClick(category)}
                  >
                    <span>{category.name}</span>
                    {category.children && category.children.length > 0 && (
                      <ChevronRightIcon className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                  {hoveredCategory === category.id && renderSubcategoryDropdown(category)}
                </div>
              ))}
            </div>
          </div>
          </aside>
        )}

        {/* 필터 섹션 - 전체 상품 페이지일 때는 사이드바로 표시 */}
        {!currentCategory && (
          <aside className="w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="font-semibold text-lg mb-4 flex items-center">
              <FunnelIcon className="h-5 w-5 mr-2" />
              필터
            </h3>
            {/* 추가 필터 옵션들을 여기에 구현 */}
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
        )}
        
        {/* 카테고리가 있을 때의 필터 섹션 */}
        {currentCategory && (
          <div className="fixed bottom-4 right-4 z-20">
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-3">
              <select 
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="newest">최신순</option>
                <option value="best">인기순</option>
                <option value="price_low">낮은 가격순</option>
                <option value="price_high">높은 가격순</option>
              </select>
            </div>
          </div>
        )}

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
                {currentCategory ? 
                  `"${currentCategory.name}" 카테고리에 상품이 없습니다.` : 
                  '상품이 없습니다.'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CategoryProducts