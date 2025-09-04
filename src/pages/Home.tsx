import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore'; // 상단에 추가
//import { useQuery } from 'react-query';
//import { api } from '../services/api';
// Swiper의 React 컴포넌트와 필요한 스타일, 모듈 임포트
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css'; // 기본 Swiper 스타일
import 'swiper/css/navigation'; // Navigation 모듈 스타일 (선택)
import 'swiper/css/pagination'; // Pagination 모듈 스타일 (선택)
import { Navigation, Pagination, Autoplay } from 'swiper/modules'; // 사용할 Swiper 모듈들

// 이미지 슬라이더 컴포넌트 (Swiper.js 사용)
const HeroSlider = () => {
  // 슬라이드에 사용할 이미지 목록 (실제 이미지 경로로 교체 필요)
  const slides = [
    { id: 1, image: '/Images/b2.jpg', alt: 'Banner 1' },
    { id: 2, image: '/Images/banner2.jpg', alt: 'Banner 2' }, // 예시 이미지
    { id: 3, image: '/Images/banner3.jpg', alt: 'Banner 3' }, // 예시 이미지
    //이미지 추가 가능
  ];  

  return (
    <section className="flex-grow flex w-full bg-gradient-to-br from-orange-50 via-white to-pink-50 h-auto">
      {/* Swiper 컴포넌트 사용 */}
      <Swiper
        modules={[Navigation, Pagination, Autoplay]} // 사용할 모듈들
        spaceBetween={0} // 슬라이드 간 간격
        slidesPerView={1} // 한 번에 보여줄 슬라이드 수
        loop={true} // 무한 루프
        autoplay={{ // 자동 재생 설정 (선택)
          delay: 5000, // 5초마다 슬라이드 변경
          disableOnInteraction: false, // 사용자 상호작용 후에도 자동 재생 계속
        }}
        navigation={true} // Navigation 화살표 표시 (선택)
        pagination={{ // Pagination 표시 (선택)
          clickable: true, // 페이지네이션 버튼 클릭 가능
        }}
        className="w-full" // Swiper 컨테이너 스타일
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div className="w-full flex justify-center items-start bg-gradient-to-br from-orange-100/30 via-white to-pink-100/30 relative">
              <div className="flex justify-center items-start w-full">
                <img src={slide.image} alt={slide.alt} className="w-full h-auto object-contain drop-shadow-2xl rounded-2xl" />
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};

// 쿠폰 섹션 컴포넌트
const CouponSection = () => {
  const { user } = useAuthStore();
  const userName = user ? user.username : '고객';

  return (
    <section className="w-full soft-section py-12 flex flex-col items-center mt-10 mb-10">
      <h2 className="soft-title text-center mb-4">{userName} 님을 위한 혜택</h2>
      <ul className="flex flex-wrap justify-center gap-6 w-full max-w-5xl mx-auto py-6">
        {/* 쿠폰 아이템 반복 (예시 3개) */}
        {[1, 2, 3].map((item) => (
          <li key={item} className="inline-block list-none soft-card w-[300px] min-h-[120px] relative flex">
            <div className="flex flex-col justify-center px-4 py-5 w-[70%]">
              <span className="text-xs text-[#b47937] font-bold mb-1">SHAMPUDA</span>
              <span className="text-3xl font-bold text-[#222] mb-1">
                1,000<span className="text-xl font-normal">원</span>
              </span>
              <span className="text-xs text-gray-500 block truncate">
                VIP 단골고객 할인쿠폰
              </span>
            </div>
            <div className="w-[1px] border-l border-dashed border-gray-300 my-2"></div>
            <div className="flex flex-col justify-center items-center w-[30%]">
              <button className="soft-button-outline flex flex-col items-center gap-2 px-4 py-2">
                <i className="fa-solid fa-download text-lg"></i>
                <span className="text-xs font-semibold">다운로드</span>
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
};

// 베스트 셀러 섹션 컴포넌트 - 비율 및 크기 신상품 섹션과 통일
const BestSellerSection = () => {
  // TODO: 실제 베스트 셀러 데이터를 API에서 가져오기
  const mockProducts = Array(5).fill(null).map((_, i) => ({
    id: i + 1,
    name: "Test용 문구 상품입니다",
    price: 12000,
    image: "//ecimg.cafe24img.com/pg2160b96498953088/seoa0413/web/product/medium/20250819/dc52e36d4287a69cc69ae0dd5b6e9117.jpg"
  }));

  return (
    <section className="soft-section">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-700 mb-2 tracking-wide">BEST SELLER</h2>
        <p className="text-gray-400 text-base">샵푸다 고객님들께 인정받은 추천 상품 !</p>
      </div>
      <div className="max-w-screen-xl mx-auto px-4 py-8">
        <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-10 gap-y-16">
          {mockProducts.map((product) => (
            <li
              key={product.id}
              className="w-full max-w-[270px] flex flex-col items-center shadow-xl rounded-2xl bg-white/90 transition-transform duration-200 hover:scale-105"
            >
              <div className="relative w-full aspect-square overflow-hidden mb-4 rounded-t-2xl">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex space-x-2 pointer-events-none">
                  <button className="bg-white/70 text-gray-700 text-xs font-semibold px-3 py-1 rounded shadow pointer-events-auto">WISH</button>
                  <button className="bg-white/70 text-gray-700 text-xs font-semibold px-3 py-1 rounded shadow pointer-events-auto">ADD</button>
                </div>
                <div className="absolute left-2 bottom-2 text-[10px] text-white bg-black bg-opacity-40 px-1 rounded select-none">
                  실제 판매되지 않는 상품입니다
                </div>
              </div>
              <div className="w-full text-left px-3 pb-4">
                <div className="text-gray-900 text-base font-semibold mb-1">{product.name}</div>
                <div className="font-bold text-black text-lg">{product.price.toLocaleString()}원</div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

// 유튜브 비디오 섹션 컴포넌트
const VideoSection = () => {
  return (
    <section className="py-20 bg-gradient-to-r from-orange-50 via-white to-pink-50">
      <div className="max-w-screen-lg mx-auto flex flex-col items-center">
        <h2 className="soft-title text-center mb-4">오직 샵푸다에서만 !</h2>
        <p className="soft-subtitle text-center mb-12">해외가 가까워지는 순간, 샵푸다를 위한 영상</p>
        <div className="w-full max-w-3xl mx-auto">
          {/* TODO: video 태그의 src와 poster를 실제 경로로 변경 */}
          <video
            src="https://m-img.cafe24.com/images/ec/sde/video/luminous_1366x720.mp4  "
            controls
            className="w-full h-auto rounded-2xl bg-black shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-105"
            poster=""
          ></video>
        </div>
      </div>
    </section>
  );
};

// 신상품 섹션 컴포넌트 (탭 네비게이션 포함)
const NewItemsSection = () => {
  // TODO: 실제 신상품 데이터와 탭 로직 구현
  const mockNewProducts = Array(5).fill(null).map((_, i) => ({
    id: i + 1,
    name: "클라리엘 딥클린 세탁세제",
    price: 12000,
    image: "//ecimg.cafe24img.com/pg2160b96498953088/seoa0413/web/product/medium/20250819/dc52e36d4287a69cc69ae0dd5b6e9117.jpg"
  }));

  return (
    <section className="soft-section">
      <div className="max-w-screen-xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-xl md:text-2xl font-bold text-gray-700 mb-1">New</h2>
          <p className="text-gray-400 text-sm">샵푸다의 새로운 상품을 만나보세요</p>
        </div>
        {/* 탭 네비게이션 (간단한 예시, 실제 구현 시 상태 관리 필요) */}
        <ul className="flex space-x-6 border-b border-gray-200 items-center flex justify-center mb-8" role="tablist">
          {['새로운 카테고리 1', '새로운 카테고리 2', '새로운 카테고리 3', '새로운 카테고리 4'].map((category, index) => (
            <li key={index} role="presentation">
              <button
                type="button"
                className={`pb-2 border-b-2 ${index === 0 ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-900'} font-semibold focus:outline-none`}
                // onClick={() => setActiveTab(index)} // 상태 변경 로직 필요
                role="tab"
                aria-selected={index === 0}
                // aria-controls={`tabContent${index + 1}`}
                // id={`tab${index + 1}`}
              >
                {category}
              </button>
            </li>
          ))}
        </ul>
        <div className="max-w-screen-xl mx-auto px-4 py-8">
          <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-8 gap-y-12">
            {mockNewProducts.map((product) => (
              <li key={product.id} className="w-full max-w-xs flex flex-col items-center">
                <div className="relative w-full aspect-square overflow-hidden mb-4">
                  <Link to="#" className="block">
                    <img
                      src={product.image}
                      alt={product.name}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  </Link>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex space-x-2 pointer-events-none">
                    <button className="bg-white/70 text-gray-700 text-xs font-semibold px-3 py-1 rounded shadow pointer-events-auto">WISH</button>
                    <button className="bg-white/70 text-gray-700 text-xs font-semibold px-3 py-1 rounded shadow pointer-events-auto">ADD</button>
                  </div>
                  <div className="absolute left-2 bottom-2 text-[10px] text-white bg-black bg-opacity-40 px-1 rounded select-none">
                    실제 판매되지 않는 상품입니다
                  </div>
                </div>
                <div className="w-full text-left">
                  <Link to="#" className="block text-gray-900 text-sm mb-1">{product.name}</Link>
                  <p className="font-bold text-black text-base">{product.price.toLocaleString()}원</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

// 메인 Home 컴포넌트
function Home() {
  // 기존의 추천 상품 로직은 유지하거나 제거 가능
  // const { data: featuredProducts, isLoading } = useQuery(...)

  return (
    <div className="bg-[#eeeeee]"> {/* body 태그의 클래스를 여기에 적용 */}
      <HeroSlider />
      <CouponSection />
      <BestSellerSection />
      <VideoSection />
      <NewItemsSection />
      {/* 기존의 featuredProducts, Categories 섹션은 제거하거나 수정 */}
    </div>
  );
}

export default Home;