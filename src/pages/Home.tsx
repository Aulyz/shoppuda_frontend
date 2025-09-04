import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

// Swiper
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation, Pagination, Autoplay } from "swiper/modules";

/* ===============================
   Hero Slider (완전 반응형)
   =============================== */
const HeroSlider = () => {
  const slides = [
    { id: 1, image: "/Images/b2.jpg", alt: "메인 배너 1" },
    { id: 2, image: "/Images/banner2.jpg", alt: "메인 배너 2" },
    { id: 3, image: "/Images/banner3.jpg", alt: "메인 배너 3" },
  ];

  return (
    <section className="w-full bg-gradient-to-br from-orange-50 via-white to-pink-50">
      <div className="container-max px-0 sm:px-2 md:px-4">
        <div className="relative w-full overflow-hidden rounded-none sm:rounded-2xl">
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            slidesPerView={1}
            loop
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            navigation={{ enabled: window.innerWidth >= 768 }} // 모바일에서는 네비게이션 비활성화
            pagination={{ clickable: true }}
            className="w-full"
          >
            {slides.map((s) => (
              <SwiperSlide key={s.id}>
                <div className="w-full">
                  {/* 모바일: 고정 높이, 태블릿: 큰 높이, 데스크탑: 21:9 비율 */}
                  <div className="w-full h-48 xs:h-52 sm:h-60 md:h-72 lg:h-auto lg:aspect-[21/9]">
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
                --swiper-navigation-color: #fb923c; /* orange-400 */
                --swiper-pagination-color: #fb923c;
              }
              @media (max-width: 767px) {
                .swiper-button-prev, .swiper-button-next { display: none; }
              }
            `}
          </style>
        </div>
>>>>>>> origin/main
      </div>
    </section>
  );
};

/* ===============================
   Coupon Section (반응형 카드)
   =============================== */
const CouponSection = () => {
  const userName = "박민우";
  const coupons = [1, 2, 3];

  return (
    <section className="w-full py-10 sm:py-12 md:py-14">
      <div className="container-max">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-700 text-center">
          {userName} 님을 위한 혜택
        </h2>
        <ul className="mt-6 sm:mt-8 flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-8">
          {coupons.map((i) => (
            <li
              key={i}
              className="w-full xs:w-[300px] sm:w-[320px] bg-white/90 rounded-2xl shadow-lg ring-1 ring-black/[0.04] flex"
            >
              <div className="flex-1 px-4 py-4 sm:px-5 sm:py-5">
                <span className="text-[11px] sm:text-xs text-[#b47937] font-bold">
                  샵푸다
                </span>
                <div className="mt-1">
                  <span className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                    1,000
                  </span>
                  <span className="ml-1 text-sm sm:text-base text-gray-700">
                    원
                  </span>
                </div>
                <span className="block mt-1 text-[11px] sm:text-xs text-gray-500">
                  VIP 단골고객 할인쿠폰
                </span>
              </div>
              <div className="my-3 w-px bg-gray-200/80" />
              <div className="w-28 sm:w-32 flex items-center justify-center">
                <button
                  className="inline-flex flex-col items-center gap-1 px-3 py-2 rounded-xl border border-orange-300/70 text-orange-600 hover:bg-orange-50 text-xs font-semibold transition"
                  aria-label="쿠폰 다운로드"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      d="M12 3v12m0 0l-4-4m4 4l4-4M4 21h16"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                  </svg>
                  <span>다운로드</span>
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

/* ===============================
   Product Card (재사용 가능한 공용 컴포넌트)
   =============================== */
type Product = { id: number; name: string; price: number; image: string };

const ProductCard = ({ p }: { p: Product }) => {
  return (
    <li className="w-full max-w-[320px] mx-auto bg-white rounded-2xl shadow-md hover:shadow-lg transition overflow-hidden">
      <div className="relative w-full aspect-square">
        <img
          src={p.image}
          alt={p.name}
          loading="lazy"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 hidden md:flex items-center justify-center gap-2 opacity-0 hover:opacity-100 transition">
          <button className="bg-white/80 backdrop-blur px-3 py-1 rounded text-xs font-semibold">
            WISH
          </button>
          <button className="bg-white/80 backdrop-blur px-3 py-1 rounded text-xs font-semibold">
            ADD
          </button>
        </div>
        <div className="absolute left-2 bottom-2 text-[10px] text-white bg-black/40 px-1 rounded select-none">
          실제 판매되지 않는 상품입니다
        </div>
      </div>
      <div className="px-3 sm:px-4 py-3">
        <div className="text-sm sm:text-[15px] font-semibold text-gray-900 line-clamp-2">
          {p.name}
        </div>
        <div className="mt-1 text-base sm:text-lg font-extrabold">
          {p.price.toLocaleString()}원
        </div>
      </div>
    </li>
  );
};

/* ===============================
   Best Seller Section
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
    }));

  return (
    <section className="py-10 sm:py-12 md:py-14">
      <div className="container-max px-4">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-xl md:text-3xl font-extrabold text-gray-700 tracking-wide">
            BEST SELLER
          </h2>
          <p className="mt-2 text-gray-400 text-sm md:text-base">
            샵푸다 고객님들께 인정받은 추천 상품 !
          </p>
        </div>
        <ul className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5 sm:gap-6 md:gap-8">
          {mockProducts.slice(0, 5).map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </ul>
      </div>
    </section>
  );
};

/* ===============================
   Video Section (16:9 반응형)
   =============================== */
const VideoSection = () => {
  return (
    <section className="py-12 sm:py-14 md:py-16 bg-gradient-to-r from-orange-50 via-white to-pink-50">
      <div className="container-max px-4">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-700 text-center">
          오직 샵푸다에서만 !
        </h2>
        <p className="text-gray-400 text-sm md:text-base text-center mt-2">
          해외가 가까워지는 순간, 샵푸다를 위한 영상
        </p>
        <div className="mt-6 sm:mt-8 max-w-3xl mx-auto">
          <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-xl">
            <video
              src="https://m-img.cafe24.com/images/ec/sde/video/luminous_1366x720.mp4"
              controls
              className="w-full h-full"
              preload="metadata"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

/* ===============================
   New Items (탭 기반 반응형 그리드)
   =============================== */
const NewItemsSection = () => {
  const [activeTab, setActiveTab] = useState(0);
  const tabs = ["새로운 카테고리 1", "새로운 카테고리 2", "새로운 카테고리 3", "새로운 카테고리 4"];

  const mockNewProducts: Product[] = Array(10)
    .fill(null)
    .map((_, i) => ({
      id: i + 1,
      name: "클라리엘 딥클린 세탁세제",
      price: 12000,
      image:
        "//ecimg.cafe24img.com/pg2160b96498953088/seoa0413/web/product/medium/20250819/dc52e36d4287a69cc69ae0dd5b6e9117.jpg",
    }));

  return (
    <section className="py-10 sm:py-12 md:py-14">
      <div className="container-max px-4">
        <div className="text-center">
          <h2 className="text-xl md:text-2xl font-extrabold text-gray-700">
            New
          </h2>
          <p className="text-gray-400 text-sm md:text-base mt-1">
            샵푸다의 새로운 상품을 만나보세요
          </p>
        </div>

        {/* Tabs */}
        <ul
          className="mt-6 sm:mt-8 flex flex-wrap justify-center gap-3 sm:gap-5 border-b border-gray-200 pb-3"
          role="tablist"
        >
          {tabs.map((t, idx) => {
            const active = idx === activeTab;
            return (
              <li key={t} role="presentation">
                <button
                  type="button"
                  className={`px-2 sm:px-3 pb-2 border-b-2 text-sm sm:text-base font-semibold transition
                    ${active ? "border-orange-500 text-orange-600" : "border-transparent text-gray-500 hover:text-gray-900"}`}
                  role="tab"
                  aria-selected={active}
                  onClick={() => setActiveTab(idx)}
                >
                  {t}
                </button>
              </li>
            );
          })}
        </ul>

        {/* Grid */}
        <ul className="mt-6 sm:mt-8 grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5 sm:gap-6 md:gap-8">
          {mockNewProducts.slice(0, 5).map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </ul>
      </div>
    </section>
  );
};

/* ===============================
   Home (페이지 조립)
   =============================== */
export default function Home() {
  // body 배경 느낌을 섹션별 배경과 합쳐 자연스럽게
  useEffect(() => {
    const prev = document.body.className;
    document.body.classList.add("bg-[#eeeeee]");
    return () => (document.body.className = prev);
  }, []);

  return (
    <div className="min-h-screen">
      <HeroSlider />
      <CouponSection />
      <BestSellerSection />
      <VideoSection />
      <NewItemsSection />
    </div>
  );
}