import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import RecentlyViewed from "../components/RecentlyViewed";
import OptimizedImage from "../components/OptimizedImage";
import { api } from "../services/api";
import { useToastStore } from "../store/toastStore";
import { useAuthStore } from "../store/authStore";
import { useRecentProductsStore } from "../store/recentProductsStore";

// Swiper
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation, Pagination, Autoplay } from "swiper/modules";

/* ===============================
   Hero Slider (개선된 반응형)
   =============================== */
const HeroSlider = () => {
  const slides = [
    { id: 1, image: "/Images/banner/home_banner1.png", alt: "메인 배너 1" },
    { id: 2, image: "/Images/banner2.jpg", alt: "메인 배너 2" },
    { id: 3, image: "/Images/banner3.jpg", alt: "메인 배너 3" },
  ];

  return (
    <section className="w-full bg-gradient-to-br from-orange-50 via-white to-pink-50">
      <div className="w-full">
        <div className="relative w-full overflow-hidden">
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            slidesPerView={1}
            loop
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            navigation
            pagination={{ clickable: true, dynamicBullets: true }}
            className="w-full"
          >
            {slides.map((s) => (
              <SwiperSlide key={s.id}>
                <div className="w-full">
                  {/* 개선된 반응형 높이 */}
                  <div className="w-full h-[200px] xs:h-[250px] sm:h-[350px] md:h-[450px] lg:h-[550px] xl:h-[600px] 2xl:aspect-[21/9]">
                    <img
                      src={s.image}
                      alt={s.alt}
                      loading="eager"
                      className="w-full h-full object-cover select-none"
                      draggable={false}
                    />
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
          <style>
            {`
              .swiper {
                --swiper-navigation-color: #fb923c;
                --swiper-pagination-color: #fb923c;
              }
              .swiper-button-next, .swiper-button-prev {
                background: rgba(255, 255, 255, 0.8);
                width: 40px;
                height: 40px;
                border-radius: 50%;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
              }
              .swiper-button-next:after, .swiper-button-prev:after {
                font-size: 18px !important;
                color: #fb923c;
              }
              @media (max-width: 640px) {
                .swiper-button-prev, .swiper-button-next { 
                  width: 35px;
                  height: 35px;
                }
                .swiper-button-next:after, .swiper-button-prev:after {
                  font-size: 14px !important;
                }
              }
              .swiper-pagination-bullet-active {
                background: #fb923c !important;
              }
            `}
          </style>
        </div>
      </div>
    </section>
  );
};

/* ===============================
   Coupon Section (개선된 반응형 카드)
   =============================== */
const CouponSection = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [ownedCoupons, setOwnedCoupons] = useState<string[]>([])
  const { addToast } = useToastStore()
  const { isAuthenticated, user } = useAuthStore()

  // 사용자 보유 쿠폰 가져오기
  useEffect(() => {
    if (isAuthenticated) {
      fetchOwnedCoupons()
    }
  }, [isAuthenticated])

  const fetchOwnedCoupons = async () => {
    try {
      const response = await api.getMyCoupons()
      
      // 응답 데이터 안전하게 처리
      let coupons = []
      if (Array.isArray(response)) {
        coupons = response
      } else if (response && Array.isArray(response.user_coupons)) {
        coupons = response.user_coupons
      } else if (response && Array.isArray(response.results)) {
        coupons = response.results
      } else {
        coupons = []
      }
      
      const couponCodes = coupons
        .filter((coupon: any) => coupon.status === 'ISSUED')
        .map((coupon: any) => coupon.coupon?.code)
        .filter(Boolean)
      
      setOwnedCoupons(couponCodes)
    } catch (error: any) {
      // 쿠폰 조회 실패는 조용히 처리
      setOwnedCoupons([])
    }
  }

  const handleClaimCoupon = async (e: React.MouseEvent, couponCode: string, couponName: string) => {
    e.preventDefault()
    
    if (!isAuthenticated) {
      addToast({
        type: 'warning',
        title: '로그인 필요',
        message: '쿠폰을 받으려면 먼저 로그인해주세요.',
      })
      return
    }

    if (isLoading) return

    setIsLoading(true)
    
    try {
      const response = await api.claimCoupon(couponCode)
      
      addToast({
        type: 'success',
        title: '쿠폰 발급 완료!',
        message: `${couponName}이 발급되었습니다. 마이페이지에서 확인하세요.`,
        duration: 5000,
      })
      
      // 보유 쿠폰 목록 업데이트
      setOwnedCoupons(prev => [...prev, couponCode])
      
      // 최신 쿠폰 목록 다시 조회
      setTimeout(() => {
        fetchOwnedCoupons()
      }, 1000)
      
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message ||
                          '쿠폰 발급에 실패했습니다.'
      
      addToast({
        type: 'error',
        title: '쿠폰 발급 실패',
        message: errorMessage,
      })
    } finally {
      setIsLoading(false)
    }
  }

  // 사용자명 표시 함수
  const getDisplayName = () => {
    if (isAuthenticated && user) {
      // 우선순위: first_name > last_name > username
      if (user.first_name) {
        return user.first_name
      }
      if (user.last_name) {
        return user.last_name
      }
      if (user.username && !user.username.startsWith('kakao_')) {
        return user.username
      }
    }
    return '고객'
  }

  const coupons = [
    {
      code: 'WELCOME10',
      name: '신규 회원 1000원 할인 쿠폰',
      value: '1,000',
      unit: '원',
      description: 'VIP 신규고객 할인쿠폰'
    },
    {
      code: 'FIRSTBUY15',
      name: '첫 구매 3000원 할인 쿠폰',
      value: '3,000',
      unit: '원',
      description: '첫 구매 특별 할인쿠폰'
    },
    {
      code: 'FREESHIP',
      name: '5000원 할인 쿠폰',
      value: '5,000',
      unit: '원',
      description: '특별 할인 혜택쿠폰'
    }
  ];

  return (
    <section className="w-full py-8 sm:py-10 md:py-12 lg:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-700 text-center mb-6 sm:mb-8">
          {getDisplayName()} 님을 위한 혜택
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
          {coupons.map((coupon) => {
            const isOwned = ownedCoupons.includes(coupon.code)
            
            return (
              <div
                key={coupon.code}
                className={`bg-white rounded-2xl shadow-lg transition-shadow duration-300 overflow-hidden ${
                  isOwned ? 'opacity-75' : 'hover:shadow-xl'
                }`}
              >
                <div className="flex">
                  <div className="flex-1 px-5 py-5 sm:px-6 sm:py-6">
                    <span className={`text-xs sm:text-sm font-bold ${
                      isOwned ? 'text-gray-500' : 'text-orange-600'
                    }`}>
                      샵푸다
                    </span>
                    <div className="mt-2">
                      <span className={`text-2xl sm:text-3xl font-extrabold ${
                        isOwned ? 'text-gray-600' : 'text-gray-900'
                      }`}>
                        {coupon.value}
                      </span>
                      <span className={`ml-1 text-sm sm:text-base ${
                        isOwned ? 'text-gray-500' : 'text-gray-700'
                      }`}>
                        {coupon.unit}
                      </span>
                    </div>
                    <span className={`block mt-2 text-xs sm:text-sm ${
                      isOwned ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {coupon.description}
                    </span>
                  </div>
                  <div className={`my-4 w-px ${isOwned ? 'bg-gray-300' : 'bg-gray-200'}`} />
                  <div className="w-32 sm:w-36 flex items-center justify-center">
                    <button
                      onClick={(e) => !isOwned ? handleClaimCoupon(e, coupon.code, coupon.name) : undefined}
                      disabled={isLoading || isOwned}
                      className={`inline-flex flex-col items-center gap-1 px-4 py-3 rounded-xl border-2 text-xs sm:text-sm font-semibold transition-colors duration-200 ${
                        isOwned 
                          ? 'border-gray-400 text-gray-500 cursor-default bg-gray-50' 
                          : isLoading 
                            ? 'border-orange-400 text-orange-600 opacity-60 cursor-not-allowed' 
                            : 'border-orange-400 text-orange-600 hover:bg-orange-50'
                      }`}
                      aria-label={isOwned ? "수령완료" : "쿠폰 다운로드"}
                    >
                      {isOwned ? (
                        <>
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                          >
                            <path
                              d="M20 6 9 17l-5-5"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              fill="none"
                            />
                          </svg>
                          <span>수령완료</span>
                        </>
                      ) : isLoading ? (
                        <>
                          <div className="animate-spin w-5 h-5 border-2 border-orange-600 border-t-transparent rounded-full"></div>
                          <span>발급중...</span>
                        </>
                      ) : (
                        <>
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                          >
                            <path
                              d="M12 3v12m0 0l-4-4m4 4l4-4M4 21h16"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              fill="none"
                            />
                          </svg>
                          <span>다운로드</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  );
};

/* ===============================
   Product Card (개선된 공용 컴포넌트)
   =============================== */
type Product = { 
  id: number | string; 
  name: string; 
  price: number | string; // 백엔드에서 문자열로 반환
  sale_price?: number | string;
  regular_price?: number | string;
  discount_price?: number | string | null; // 백엔드 필드
  image?: string;
  images?: Array<{url: string}>;
  main_image?: string;
  isNew?: boolean;
  discount?: number;
  category?: {
    id: number;
    name: string;
    code: string;
  };
  brand?: {
    id: number;
    name: string;
    code: string;
  } | null;
  stock?: number;
  status?: string;
  is_featured?: boolean;
  created_at?: string;
};

const ProductCard = ({ p }: { p: Product }) => {
  const { addProduct } = useRecentProductsStore()

  // 이미지 URL 처리
  const getImageUrl = () => {
    if (p.main_image) return p.main_image
    if (p.images && p.images.length > 0) return p.images[0].url
    if (p.image) return p.image
    return '/placeholder-image.jpg'
  }

  // 가격 처리 (백엔드 문자열 → 숫자 변환)
  const getDisplayPrice = () => {
    // 백엔드의 discount_price 확인 (할인가)
    const discountPrice = typeof p.discount_price === 'string' ? parseFloat(p.discount_price) : p.discount_price
    if (discountPrice && discountPrice > 0) {
      return discountPrice
    }
    
    // sale_price가 있고 0보다 크면 sale_price 사용
    const salePrice = typeof p.sale_price === 'string' ? parseFloat(p.sale_price) : p.sale_price
    if (salePrice && salePrice > 0) {
      return salePrice
    }
    
    // regular_price가 있으면 사용
    const regularPrice = typeof p.regular_price === 'string' ? parseFloat(p.regular_price) : p.regular_price
    if (regularPrice) {
      return regularPrice
    }
    
    // 기본적으로 price 사용
    const price = typeof p.price === 'string' ? parseFloat(p.price) : p.price
    return price || 0
  }

  const displayPrice = getDisplayPrice()

  // 상품 클릭 시 최근 본 상품에 추가
  const handleProductClick = () => {
    addProduct({
      id: p.id,
      name: p.name,
      image: getImageUrl(),
      main_image: p.main_image,
      images: p.images,
      price: typeof p.price === 'string' ? parseFloat(p.price) : p.price,
      sale_price: typeof p.sale_price === 'string' ? parseFloat(p.sale_price) : p.sale_price,
      regular_price: typeof p.regular_price === 'string' ? parseFloat(p.regular_price) : p.regular_price,
      discount_price: typeof p.discount_price === 'string' ? parseFloat(p.discount_price) : p.discount_price
    })
  }

  return (
    <Link to={`/product/${p.id}`} onClick={handleProductClick}>
      <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group">
        <div className="relative w-full aspect-square bg-gray-50">
          {p.isNew && (
            <span className="absolute top-2 left-2 z-10 px-2 py-1 bg-green-500 text-white text-xs font-bold rounded">
              NEW
            </span>
          )}
          {p.discount && (
            <span className="absolute top-2 right-2 z-10 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded">
              -{p.discount}%
            </span>
          )}
          <OptimizedImage
            src={getImageUrl()}
            alt={p.name}
            className="w-full h-full group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
          <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex justify-center gap-2">
              <button 
                className="bg-white/90 backdrop-blur px-3 py-1 rounded text-xs font-semibold hover:bg-white transition-colors"
                onClick={(e) => e.preventDefault()}
              >
                WISH
              </button>
              <button 
                className="bg-white/90 backdrop-blur px-3 py-1 rounded text-xs font-semibold hover:bg-white transition-colors"
                onClick={(e) => e.preventDefault()}
              >
                ADD
              </button>
            </div>
          </div>
        </div>
        <div className="px-3 sm:px-4 py-3 sm:py-4">
          <h3 className="text-sm sm:text-base font-semibold text-gray-900 line-clamp-2 min-h-[2.5rem]">
            {p.name}
          </h3>
          <div className="mt-2 text-base sm:text-lg font-bold text-gray-900">
            {displayPrice.toLocaleString()}원
          </div>
        </div>
      </div>
    </Link>
  );
};

/* ===============================
   Best Seller Section (개선된 반응형)
   =============================== */
const BestSellerSection = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await api.getProducts({ limit: 5 })
        
        // 백엔드 응답 구조: { products: [...], pagination: {...} }
        const productData = response.products || []
        setProducts(productData.slice(0, 5))
      } catch (error: any) {
        console.error('❌ 베스트셀러 API 실패:', error)
        setError(error.message || '상품을 불러오는데 실패했습니다.')
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  return (
    <section className="py-8 sm:py-10 md:py-12 lg:py-14 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6 sm:mb-8 md:mb-10">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-800 tracking-tight">
            BEST SELLER
          </h2>
          <p className="mt-2 text-gray-500 text-sm sm:text-base">
            샵푸다 고객님들께 인정받은 추천 상품 !
          </p>
        </div>
        {loading ? (
          <div className="grid grid-cols-5 gap-4 sm:gap-5 md:gap-6">
            {Array(5).fill(null).map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
                <div className="w-full aspect-square bg-gray-300"></div>
                <div className="px-3 py-3">
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <div className="text-red-500 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-gray-600 font-semibold">베스트셀러 상품을 불러올 수 없습니다</p>
            <p className="text-gray-500 text-sm mt-1">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              다시 시도
            </button>
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
            {products.map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <p className="text-gray-500">베스트셀러 상품이 없습니다.</p>
          </div>
        )}
      </div>
    </section>
  );
};

/* ===============================
   Video Section (복원 및 개선)
   =============================== */
const VideoSection = () => {
  return (
    <section className="py-10 sm:py-12 md:py-14 lg:py-16 bg-gradient-to-br from-orange-50 via-white to-pink-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-800">
            오직 샵푸다에서만 !
          </h2>
          <p className="text-gray-500 text-sm sm:text-base mt-2">
            해외가 가까워지는 순간, 샵푸다를 위한 영상
          </p>
        </div>
        <div className="max-w-5xl mx-auto">
          <div className="relative w-full aspect-video rounded-xl sm:rounded-2xl overflow-hidden shadow-xl">
            <video
              src="https://m-img.cafe24.com/images/ec/sde/video/luminous_1366x720.mp4"
              controls
              className="w-full h-full object-cover"
              preload="metadata"
              poster="//ecimg.cafe24img.com/pg2160b96498953088/seoa0413/web/product/medium/20250819/dc52e36d4287a69cc69ae0dd5b6e9117.jpg"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

/* ===============================
   New Items (탭 기반 개선된 반응형)
   =============================== */
const NewItemsSection = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const tabs = ["전체", "신상품", "베스트", "세일"];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await api.getProducts({ limit: 10 })
        
        // 백엔드 응답 구조: { products: [...], pagination: {...} }
        const productData = response.products || []
        setProducts(productData.slice(0, 10))
      } catch (error: any) {
        console.error('❌ 신상품 API 실패:', error)
        setError(error.message || '신상품을 불러오는데 실패했습니다.')
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  return (
    <section className="py-8 sm:py-10 md:py-12 lg:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-800">
            New Items
          </h2>
          <p className="text-gray-500 text-sm sm:text-base mt-2">
            샵푸다의 새로운 상품을 만나보세요
          </p>
        </div>

        {/* Tabs - 개선된 반응형 */}
        <div className="mb-6 sm:mb-8">
          <div className="flex justify-center">
            <div className="inline-flex border-b-2 border-gray-200">
              {tabs.map((t, idx) => {
                const active = idx === activeTab;
                return (
                  <button
                    key={t}
                    type="button"
                    className={`px-3 sm:px-5 md:px-6 py-2 sm:py-3 text-sm sm:text-base font-semibold transition-all duration-200 border-b-2 -mb-[2px]
                      ${active 
                        ? "border-orange-500 text-orange-600" 
                        : "border-transparent text-gray-500 hover:text-gray-700"}`}
                    onClick={() => setActiveTab(idx)}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Grid - 개선된 반응형 */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
            {Array(10).fill(null).map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
                <div className="w-full aspect-square bg-gray-300"></div>
                <div className="px-3 py-3">
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <div className="text-red-500 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-gray-600 font-semibold">신상품을 불러올 수 없습니다</p>
            <p className="text-gray-500 text-sm mt-1">{error}</p>
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
            {products.map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">신상품이 없습니다.</p>
          </div>
        )}

        {/* 더보기 버튼 */}
        <div className="text-center mt-8 sm:mt-10">
          <Link
            to="/products/new"
            className="inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 bg-gray-800 text-white rounded-full font-semibold hover:bg-gray-900 transition-colors duration-200"
          >
            더 많은 상품 보기
            <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
};

/* ===============================
   Sale Banner Section (새로 추가)
   =============================== */
const SaleBannerSection = () => {
  return (
    <section className="py-8 sm:py-10 md:py-12 bg-gradient-to-r from-orange-400 to-pink-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center text-white">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3">
            SPECIAL SALE
          </h2>
          <p className="text-base sm:text-lg md:text-xl mb-4 sm:mb-6 opacity-95">
            최대 70% 할인! 놓치지 마세요
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
            <Link
              to="/products/sale"
              className="inline-flex items-center justify-center px-6 sm:px-8 py-3 bg-white text-orange-600 rounded-full font-bold hover:bg-gray-100 transition-colors duration-200"
            >
              세일 상품 보기
            </Link>
            <button className="inline-flex items-center justify-center px-6 sm:px-8 py-3 bg-transparent border-2 border-white text-white rounded-full font-bold hover:bg-white/10 transition-colors duration-200">
              쿠폰 받기
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ===============================
   Instagram Feed (간단한 버전)
   =============================== */
const InstagramSection = () => {
  const images = Array(6).fill(
    "//ecimg.cafe24img.com/pg2160b96498953088/seoa0413/web/product/medium/20250819/dc52e36d4287a69cc69ae0dd5b6e9117.jpg"
  );

  return (
    <section className="py-8 sm:py-10 md:py-12 lg:py-14 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            @shoppuda_official
          </h2>
          <p className="text-gray-500 text-sm sm:text-base">
            인스타그램에서 더 많은 소식을 만나보세요
          </p>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
          {images.map((img, idx) => (
            <div key={idx} className="relative aspect-square overflow-hidden rounded-lg group cursor-pointer">
              <OptimizedImage
                src={img}
                alt={`Instagram ${idx + 1}`}
                className="w-full h-full group-hover:scale-110 transition-transform duration-500"
                sizes="(max-width: 640px) 33vw, (max-width: 768px) 33vw, 16vw"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300" />
            </div>
          ))}
        </div>
        <div className="text-center mt-6 sm:mt-8">
          <a
            href="https://www.instagram.com/shop_puda/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-5 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-semibold hover:shadow-lg transition-all duration-200"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 110-8 4 4 0 010 8zm4.965-10.405a1.44 1.44 0 112.881.001 1.44 1.44 0 01-2.881-.001z"/>
            </svg>
            팔로우하기
          </a>
        </div>
      </div>
    </section>
  );
};

/* ===============================
   Home (페이지 조립)
   =============================== */
export default function Home() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <HeroSlider />
      <CouponSection />
      <BestSellerSection />
      <RecentlyViewed />
      <VideoSection />
      <SaleBannerSection />
      <NewItemsSection />
      <InstagramSection />
    </div>
  );
}