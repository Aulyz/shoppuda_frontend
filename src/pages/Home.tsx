import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import RecentlyViewed from "../components/RecentlyViewed";
import OptimizedImage from "../components/OptimizedImage";

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
  const userName = "박민우";
  const coupons = [1, 2, 3];

  return (
    <section className="w-full py-8 sm:py-10 md:py-12 lg:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-700 text-center mb-6 sm:mb-8">
          {userName} 님을 위한 혜택
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
          {coupons.map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden"
            >
              <div className="flex">
                <div className="flex-1 px-5 py-5 sm:px-6 sm:py-6">
                  <span className="text-xs sm:text-sm text-orange-600 font-bold">
                    샵푸다
                  </span>
                  <div className="mt-2">
                    <span className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                      1,000
                    </span>
                    <span className="ml-1 text-sm sm:text-base text-gray-700">
                      원
                    </span>
                  </div>
                  <span className="block mt-2 text-xs sm:text-sm text-gray-500">
                    VIP 단골고객 할인쿠폰
                  </span>
                </div>
                <div className="my-4 w-px bg-gray-200" />
                <div className="w-32 sm:w-36 flex items-center justify-center">
                  <button
                    className="inline-flex flex-col items-center gap-1 px-4 py-3 rounded-xl border-2 border-orange-400 text-orange-600 hover:bg-orange-50 text-xs sm:text-sm font-semibold transition-colors duration-200"
                    aria-label="쿠폰 다운로드"
                  >
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
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ===============================
   Product Card (개선된 공용 컴포넌트)
   =============================== */
type Product = { 
  id: number; 
  name: string; 
  price: number; 
  image: string;
  isNew?: boolean;
  discount?: number;
};

const ProductCard = ({ p }: { p: Product }) => {
  return (
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
          src={p.image}
          alt={p.name}
          className="w-full h-full group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex justify-center gap-2">
            <button className="bg-white/90 backdrop-blur px-3 py-1 rounded text-xs font-semibold hover:bg-white transition-colors">
              WISH
            </button>
            <button className="bg-white/90 backdrop-blur px-3 py-1 rounded text-xs font-semibold hover:bg-white transition-colors">
              ADD
            </button>
          </div>
        </div>
        <div className="absolute left-2 bottom-2 text-[10px] text-white bg-black/40 px-1 rounded select-none md:hidden">
          실제 판매되지 않는 상품입니다
        </div>
      </div>
      <div className="px-3 sm:px-4 py-3 sm:py-4">
        <h3 className="text-sm sm:text-base font-semibold text-gray-900 line-clamp-2 min-h-[2.5rem]">
          {p.name}
        </h3>
        <div className="mt-2 text-base sm:text-lg font-bold text-gray-900">
          {p.price.toLocaleString()}원
        </div>
      </div>
    </div>
  );
};

/* ===============================
   Best Seller Section (개선된 반응형)
   =============================== */
const BestSellerSection = () => {
  const mockProducts: Product[] = Array(10)
    .fill(null)
    .map((_, i) => ({
      id: i + 1,
      name: "Test용 문구 상품입니다",
      price: 12000,
      image:
        "//ecimg.cafe24img.com/pg2160b96498953088/seoa0413/web/product/medium/20250819/dc52e36d4287a69cc69ae0dd5b6e9117.jpg",
      discount: i % 3 === 0 ? 20 : undefined,
    }));

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
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
          {mockProducts.slice(0, 10).map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
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
  const tabs = ["전체", "신상품", "베스트", "세일"];

  const mockNewProducts: Product[] = Array(10)
    .fill(null)
    .map((_, i) => ({
      id: i + 1,
      name: "클라리엘 딥클린 세탁세제",
      price: 12000,
      image:
        "//ecimg.cafe24img.com/pg2160b96498953088/seoa0413/web/product/medium/20250819/dc52e36d4287a69cc69ae0dd5b6e9117.jpg",
      isNew: i % 2 === 0,
    }));

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
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
          {mockNewProducts.slice(0, 10).map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>

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