import { useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useQuery } from 'react-query'
import { api } from '../services/api'
import { FunnelIcon } from '@heroicons/react/24/outline'

function Products() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [showFilters, setShowFilters] = useState(false)
  
  const category = searchParams.get('category') || ''
  const sort = searchParams.get('sort') || ''
  const page = parseInt(searchParams.get('page') || '1')

  const { data, isLoading } = useQuery(
    ['products', category, sort, page],
    () => api.getProducts({ category, ordering: sort, page })
  )

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

  const handleCategoryChange = (value: string) => {
    const newParams = new URLSearchParams(searchParams)
    if (value) {
      newParams.set('category', value)
    } else {
      newParams.delete('category')
    }
    newParams.set('page', '1')
    setSearchParams(newParams)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">상품</h1>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden flex items-center space-x-2 px-4 py-2 border rounded-lg"
          >
            <FunnelIcon className="h-5 w-5" />
            <span>필터</span>
          </button>
          <select
            value={sort}
            onChange={(e) => handleSortChange(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">정렬</option>
            <option value="-created_at">최신순</option>
            <option value="price">낮은 가격순</option>
            <option value="-price">높은 가격순</option>
            <option value="-sales_count">인기순</option>
          </select>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Filters Sidebar */}
        <aside className={`${showFilters ? 'block' : 'hidden'} md:block w-64 flex-shrink-0`}>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-semibold text-lg mb-4">카테고리</h3>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => handleCategoryChange('')}
                  className={`w-full text-left px-3 py-2 rounded ${!category ? 'bg-primary-100 text-primary-700' : 'hover:bg-gray-100'}`}
                >
                  전체
                </button>
              </li>
              {['패션', '전자제품', '홈&리빙', '뷰티', '스포츠', '도서', '식품', '완구'].map((cat) => (
                <li key={cat}>
                  <button
                    onClick={() => handleCategoryChange(cat)}
                    className={`w-full text-left px-3 py-2 rounded ${category === cat ? 'bg-primary-100 text-primary-700' : 'hover:bg-gray-100'}`}
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Products Grid */}
        <div className="flex-1">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 h-64 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {data?.products?.map((product: any) => (
                  <Link
                    key={product.id}
                    to={`/products/${product.id}`}
                    className="group bg-white rounded-lg shadow hover:shadow-lg transition"
                  >
                    <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-t-lg bg-gray-200">
                      <img
                        src={product.image || '/placeholder.png'}
                        alt={product.name}
                        className="h-64 w-full object-cover object-center group-hover:opacity-75 transition"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="text-sm text-gray-700">{product.name}</h3>
                      <p className="mt-1 text-lg font-medium text-gray-900">
                        ₩{parseFloat(product.price).toLocaleString()}
                      </p>
                      {product.discount_price && (
                        <p className="text-sm text-red-600">
                          {Math.round(((parseFloat(product.price) - parseFloat(product.discount_price)) / parseFloat(product.price)) * 100)}% 할인
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {data?.pagination?.total_items > 0 && (
                <div className="mt-8 flex justify-center">
                  <nav className="flex space-x-2">
                    {data.pagination.has_previous && (
                      <button
                        onClick={() => {
                          const newParams = new URLSearchParams(searchParams)
                          newParams.set('page', String(page - 1))
                          setSearchParams(newParams)
                        }}
                        className="px-4 py-2 border rounded-lg hover:bg-gray-100"
                      >
                        이전
                      </button>
                    )}
                    <span className="px-4 py-2">
                      {data.pagination.current_page} / {data.pagination.total_pages}
                    </span>
                    {data.pagination.has_next && (
                      <button
                        onClick={() => {
                          const newParams = new URLSearchParams(searchParams)
                          newParams.set('page', String(page + 1))
                          setSearchParams(newParams)
                        }}
                        className="px-4 py-2 border rounded-lg hover:bg-gray-100"
                      >
                        다음
                      </button>
                    )}
                  </nav>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default Products