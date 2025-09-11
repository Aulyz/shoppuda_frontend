import React, { useEffect, useState } from 'react'
import { useQuery } from 'react-query'
import { Link } from 'react-router-dom'
import { api } from '../services/api'
import { 
  FireIcon, 
  TagIcon, 
  BoltIcon, 
  GiftIcon, 
  SparklesIcon, 
  ClockIcon 
} from '@heroicons/react/24/solid'

function ProductsSale() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  })

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    const targetDate = new Date()
    targetDate.setDate(targetDate.getDate() + 3)
    targetDate.setHours(23, 59, 59, 999)

    const updateTimer = () => {
      const now = new Date().getTime()
      const distance = targetDate.getTime() - now

      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        })
      }
    }

    updateTimer()
    const timer = setInterval(updateTimer, 5000)

    return () => clearInterval(timer)
  }, [])

  const { data: saleProductsData, isLoading: isSaleLoading } = useQuery(
    ['products-sale'],
    () => api.getProducts({ page: 1, limit: 20 }),
    {
      retry: 3,
      retryDelay: 1000,
      onSuccess: (data) => {
        console.log('세일 상품 데이터:', data)
      },
      onError: (error) => {
        console.error('세일 상품 로딩 에러:', error)
      }
    }
  )

  const saleProducts = (saleProductsData?.results || saleProductsData?.products || saleProductsData?.data || [])
    .filter((product: any) => product && product.id)
    .map((product: any) => ({
      ...product,
      originalPrice: product.price || Math.floor(Math.random() * 100000) + 10000,
      discountRate: Math.floor(Math.random() * 70) + 10,
      isFlashSale: Math.random() > 0.7,
      isBestDeal: Math.random() > 0.8,
      badge: ['HOT', 'NEW', 'BEST', '인기', '특가'][Math.floor(Math.random() * 5)]
    }))
    .map((product: any) => ({
      ...product,
      salePrice: Math.floor(product.originalPrice * (100 - product.discountRate) / 100)
    }))

  const flashSaleProducts = saleProducts.filter((product: any) => product.isFlashSale).slice(0, 4)
  const bestDeals = saleProducts.filter((product: any) => product.isBestDeal).slice(0, 6)
  const regularSaleProducts = saleProducts.slice(0, 12)

  if (isSaleLoading) {
    return (
      <div className="bg-gradient-to-br from-red-50 via-pink-50 to-orange-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
            <p className="mt-4 text-gray-600">세일 상품을 불러오는 중입니다...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-red-50 via-pink-50 to-orange-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* 메인 배너 */}
        <div className="relative overflow-hidden bg-gradient-to-r from-red-600 via-pink-600 to-orange-600 rounded-3xl shadow-2xl mb-12">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-r from-red-600/90 via-pink-600/90 to-orange-600/90"></div>
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full animate-pulse"></div>
            <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-white/5 rounded-full animate-bounce"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <SparklesIcon className="w-20 h-20 text-white/20 animate-spin" />
            </div>
          </div>
          
          <div className="relative z-10 p-12 text-center text-white">
            <div className="flex items-center justify-center mb-6">
              <FireIcon className="w-12 h-12 text-yellow-400 animate-bounce mr-4" />
              <h1 className="text-5xl md:text-7xl font-black bg-gradient-to-r from-yellow-300 to-white bg-clip-text text-transparent">
                MEGA SALE
              </h1>
              <FireIcon className="w-12 h-12 text-yellow-400 animate-bounce ml-4" />
            </div>
            
            <div className="mb-8">
              <p className="text-2xl md:text-3xl font-bold mb-2">최대 80% 할인 특가 행사</p>
              <p className="text-lg opacity-90">지금 바로 놓치지 마세요!</p>
            </div>

            <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-6 max-w-2xl mx-auto">
              <div className="flex items-center justify-center mb-4">
                <ClockIcon className="w-6 h-6 text-yellow-400 mr-2" />
                <span className="text-xl font-bold">특가 종료까지</span>
              </div>
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: '일', value: timeLeft.days },
                  { label: '시간', value: timeLeft.hours },
                  { label: '분', value: timeLeft.minutes },
                  { label: '초', value: timeLeft.seconds }
                ].map((item) => (
                  <div key={item.label} className="bg-white/10 backdrop-blur rounded-xl p-4">
                    <div className="text-3xl font-black">{item.value.toString().padStart(2, '0')}</div>
                    <div className="text-sm opacity-80">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 플래시 세일 섹션 */}
        {flashSaleProducts.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center justify-center mb-8">
              <BoltIcon className="w-8 h-8 text-yellow-500 mr-3" />
              <h2 className="text-4xl font-black text-gray-900 bg-gradient-to-r from-yellow-600 to-red-600 bg-clip-text text-transparent">
                번개 세일
              </h2>
              <BoltIcon className="w-8 h-8 text-yellow-500 ml-3" />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {flashSaleProducts.map((product: any) => (
                <Link
                  key={product.id}
                  to={`/products/${product.id}`}
                  className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden border-2 border-yellow-400"
                >
                  <div className="absolute top-3 left-3 z-10">
                    <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs font-black px-3 py-1 rounded-full animate-pulse">
                      ⚡ FLASH
                    </div>
                  </div>
                  
                  <div className="absolute top-3 right-3 z-10">
                    <div className="bg-red-500 text-white text-lg font-black px-3 py-2 rounded-full shadow-lg">
                      -{product.discountRate}%
                    </div>
                  </div>

                  <div className="aspect-square overflow-hidden">
                    <img
                      src={product.image || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk0YTNiOCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuyggeygge2DnOydtOyngDwvdGV4dD48L3N2Zz4='}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk0YTNiOCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuyggeygge2DnOydtOyngDwvdGV4dD48L3N2Zz4='
                      }}
                    />
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-red-600 transition-colors">
                      {product.name || '상품명'}
                    </h3>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-black text-red-600">
                          ₩{product.salePrice.toLocaleString()}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 line-through">
                        정가: ₩{product.originalPrice.toLocaleString()}
                      </div>
                      <div className="text-sm text-green-600 font-semibold">
                        절약 {(product.originalPrice - product.salePrice).toLocaleString()}원!
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* 베스트 딜 섹션 */}
        {bestDeals.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center justify-center mb-8">
              <GiftIcon className="w-8 h-8 text-purple-600 mr-3" />
              <h2 className="text-3xl font-black text-gray-900">오늘의 베스트 딜</h2>
              <GiftIcon className="w-8 h-8 text-purple-600 ml-3" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {bestDeals.map((product: any) => (
                <Link
                  key={product.id}
                  to={`/products/${product.id}`}
                  className="group relative bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden border border-purple-200"
                >
                  <div className="absolute top-3 left-3 z-10">
                    <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                      👑 BEST
                    </div>
                  </div>
                  
                  <div className="absolute top-3 right-3 z-10">
                    <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-sm font-bold px-2 py-1 rounded-lg">
                      -{product.discountRate}%
                    </div>
                  </div>

                  <div className="aspect-square overflow-hidden">
                    <img
                      src={product.image || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk0YTNiOCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuyggeygge2DnOydtOyngDwvdGV4dD48L3N2Zz4='}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk0YTNiOCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuyggeygge2DnOydtOyngDwvdGV4dD48L3N2Zz4='
                      }}
                    />
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                      {product.name || '상품 이름'}
                    </h3>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-lg font-bold text-purple-600">
                          ₩{product.salePrice.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500 line-through">
                          ₩{product.originalPrice.toLocaleString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                          {product.badge}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* 일반 세일 상품 */}
        <section className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8 mb-12">
          <div className="text-center mb-8">
            <TagIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-3xl font-black text-gray-900 mb-2">🔥 전체 세일 상품 🔥</h2>
            <p className="text-gray-600">최고의 가격으로 만나는 특가 상품들!</p>
          </div>
          
          {regularSaleProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {regularSaleProducts.map((product: any) => (
                <Link
                  key={product.id}
                  to={`/products/${product.id}`}
                  className="group bg-white rounded-xl shadow hover:shadow-lg transition-all duration-200 overflow-hidden border border-gray-100 hover:border-red-200"
                >
                  <div className="relative">
                    <img
                      src={product.image || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk0YTNiOCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuyggeygge2DnOydtOyngDwvdGV4dD48L3N2Zz4='}
                      alt={product.name}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk0YTNiOCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuyggeygge2DnOydtOyngDwvdGV4dD48L3N2Zz4='
                      }}
                    />
                    <div className="absolute top-2 right-2">
                      <div className="bg-red-500 text-white text-sm font-bold px-2 py-1 rounded-lg shadow">
                        -{product.discountRate}%
                      </div>
                    </div>
                    {product.badge && (
                      <div className="absolute top-2 left-2">
                        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                          {product.badge}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-red-600 transition-colors">
                      {product.name || '세일 상품'}
                    </h3>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold text-red-600">
                          ₩{product.salePrice.toLocaleString()}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 line-through">
                        ₩{product.originalPrice.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🛍️</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">세일 상품이 준비중입니다</h3>
              <p className="text-gray-500 mb-4">곧 멋진 할인 상품들이 업데이트됩니다!</p>
              <Link 
                to="/products" 
                className="inline-block bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold py-2 px-6 rounded-full transition-all duration-200"
              >
                전체 상품 보기
              </Link>
            </div>
          )}
        </section>

        {/* 하단 CTA 섹션 */}
        <section className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl shadow-2xl p-8 text-center text-white">
          <SparklesIcon className="w-16 h-16 mx-auto mb-4 animate-spin" />
          <h3 className="text-3xl font-black mb-4">더 많은 할인 상품이 기다려요!</h3>
          <p className="text-lg mb-6 opacity-90">한정 수량과 기간 특가! 지금 바로 둘러보세요 💎</p>
          <div className="space-x-4">
            <Link
              to="/products"
              className="inline-block bg-white text-red-600 font-bold py-3 px-8 rounded-full hover:bg-gray-100 transition-colors duration-200"
            >
              전체 상품 보기
            </Link>
            <Link
              to="/cart"
              className="inline-block bg-yellow-400 text-black font-bold py-3 px-8 rounded-full hover:bg-yellow-500 transition-colors duration-200"
            >
              장바구니 보기
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}

export default ProductsSale