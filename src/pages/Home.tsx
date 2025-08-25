import { Link } from 'react-router-dom'
import { useQuery } from 'react-query'
import { api } from '../services/api'

function Home() {
  const { data: featuredProducts, isLoading } = useQuery(
    'featuredProducts',
    () => api.getProducts({ featured: true, limit: 8 })
  )

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Welcome to Shopuda
            </h1>
            <p className="text-xl mb-8">온라인 쇼핑의 새로운 경험을 만나보세요</p>
            <Link
              to="/products"
              className="inline-block bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              쇼핑 시작하기
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">추천 상품</h2>
          
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 h-64 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts?.results?.map((product: any) => (
                <Link
                  key={product.id}
                  to={`/products/${product.id}`}
                  className="group"
                >
                  <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-200">
                    <img
                      src={product.image || '/placeholder.png'}
                      alt={product.name}
                      className="h-64 w-full object-cover object-center group-hover:opacity-75 transition"
                    />
                  </div>
                  <h3 className="mt-4 text-sm text-gray-700">{product.name}</h3>
                  <p className="mt-1 text-lg font-medium text-gray-900">
                    ₩{product.price?.toLocaleString()}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">카테고리</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['패션', '전자제품', '홈&리빙', '뷰티', '스포츠', '도서', '식품', '완구'].map((category) => (
              <Link
                key={category}
                to={`/products?category=${category}`}
                className="bg-white p-6 rounded-lg text-center hover:shadow-lg transition"
              >
                <h3 className="font-semibold text-gray-800">{category}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home