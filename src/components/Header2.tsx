import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useQueryClient } from "react-query";
import BannerNotification from "./BannerNotification";
import MainNavigation from "./MainNavigation";
import SearchSuggestions from "./SearchSuggestions";
import { useAuthStore } from "../store/authStore";
import { useCouponStore } from "../store/couponStore";
import { api } from "../services/api";
import OptimizedImage from "./OptimizedImage";
import { 
  MagnifyingGlassIcon, 
  HeartIcon, 
  ShoppingBagIcon, 
  UserIcon,
  Bars3Icon,
  XMarkIcon
} from "@heroicons/react/24/outline";

const Header2 = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { clearCoupons } = useCouponStore();

  const [showGif, setShowGif] = useState(true);
  const [logoLoaded, setLogoLoaded] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartCount] = useState(0);
  
  // 검색 관련 상태
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 이미지 사전 로드
    const img = new Image();
    img.src = "/Images/logo/Shoppuda_logo.png";
    img.onload = () => setLogoLoaded(true);

    const timer = setTimeout(() => setShowGif(false), 1500);  // 1초 → 1.5초로 증가
    return () => clearTimeout(timer);
  }, []);

  // 모바일 메뉴가 열렸을 때 body 스크롤 방지
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }

    // 컴포넌트 언마운트시 스타일 초기화
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [mobileMenuOpen]);

  // 검색 관련 이벤트 핸들러
  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowSuggestions(false);
      setSearchQuery("");
      setMobileSearchOpen(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setShowSuggestions(true);
  };

  const handleSearchFocus = () => {
    setShowSuggestions(true);
  };

  // 검색창 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
      if (mobileSearchRef.current && !mobileSearchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // React Query 캐시 전체 초기화
      queryClient.clear();
      
      // 쿠폰 상태 초기화
      clearCoupons();
      
      // zustand store 로그아웃
      logout();
      
      // 페이지 새로고침 (F5와 동일한 효과)
      window.location.reload();
    }
  };

  // 프로필 아이콘 클릭 핸들러
  const handleProfileClick = () => {
    if (!isAuthenticated) {
      // 비인증 사용자는 로그인 페이지로 리디렉션
      const currentPath = location.pathname + location.search;
      navigate(`/login?redirect=${encodeURIComponent(currentPath)}`);
    } else {
      // 인증된 사용자는 마이페이지로 이동
      navigate('/mypage');
    }
  };

  return (
    <header className="bg-white flex-shrink-0 w-full sticky top-0 z-50 shadow-sm">
      {/* 상단 배너 */}
      <BannerNotification />

      {/* ===== TopMenuBar (Desktop 전용) ===== */}
      <div className="hidden md:block bg-gray-50 border-b">
        <div className="max-w-7xl mx-auto flex justify-end items-center text-xs text-gray-600 py-2 px-4 space-x-4">
          {!isAuthenticated ? (
            <>
              <Link to="/signup" className="hover:text-gray-900 transition-colors">회원가입</Link>
              <span className="text-gray-300">|</span>
              <Link to="/login" className="hover:text-gray-900 transition-colors">로그인</Link>
            </>
          ) : (
            <>
              <span className="text-gray-700">안녕하세요, <span className="font-semibold">{user?.first_name || user?.username}</span>님!</span>
              <span className="text-gray-300">|</span>
              <button onClick={handleLogout} className="hover:text-gray-900 transition-colors">로그아웃</button>
            </>
          )}
          <span className="text-gray-300">|</span>
          <Link to="/orders" className="hover:text-gray-900 transition-colors">주문조회</Link>
          <span className="text-gray-300">|</span>
          <Link to="/recently-viewed" className="hover:text-gray-900 transition-colors">최근본상품</Link>
          <span className="text-gray-300">|</span>
          <Link to="/support" className="hover:text-gray-900 transition-colors">고객센터</Link>
        </div>
      </div>

      {/* ===== 메인 헤더 ===== */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto flex items-center justify-between py-3 md:py-4 px-4 sm:px-6 lg:px-8">
          
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="메뉴"
          >
            {mobileMenuOpen ? (
              <XMarkIcon className="h-6 w-6 text-gray-700" />
            ) : (
              <Bars3Icon className="h-6 w-6 text-gray-700" />
            )}
          </button>

          {/* Logo - 로고 클릭시 메인페이지로 이동 (새로고침 제거) */}
          <div className="flex-1 md:flex-none flex justify-center md:justify-start">
            <Link to="/" className="flex flex-col items-center">
              <div className="relative w-32 sm:w-36 md:w-44 lg:w-48 h-12 sm:h-14 md:h-16 lg:h-[72px]">
                {/* GIF 로고 */}
                <img
                  src="/Images/logo/Logo_Shoppuda.gif"
                  alt="SHOPPUDA Logo"
                  className={`absolute inset-0 w-full h-full object-contain transition-all duration-700 ${
                    showGif ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                  }`}
                  style={{ display: showGif ? 'block' : 'none' }}
                />
                {/* 정적 이미지 로고 */}
                <img
                  src="/Images/logo/Shoppuda_logo.png"
                  alt="SHOPPUDA Logo"
                  className={`absolute inset-0 w-full h-full object-contain transition-all duration-1000 ${
                    !showGif && logoLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
                  }`}
                  style={{ 
                    display: !showGif ? 'block' : 'none',
                    animation: !showGif && logoLoaded ? 'fadeInScale 1s ease-out' : 'none'
                  }}
                  onLoad={() => setLogoLoaded(true)}
                />
              </div>
              <span className="text-base font-medium text-gray-700 mt-2 tracking-wide">해외 쇼핑, 클릭 한 번으로</span>
            </Link>
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden lg:flex flex-1 max-w-2xl mx-8" ref={searchRef}>
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={handleSearchFocus}
                placeholder="상품을 검색해보세요"
                className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-full focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
              />
              <button 
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-gray-100 rounded-full transition-colors"
              >
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-600" />
              </button>
              <SearchSuggestions
                isVisible={showSuggestions}
                searchQuery={searchQuery}
                onClose={() => setShowSuggestions(false)}
                onSearch={(query) => {
                  setSearchQuery(query);
                  handleSearchSubmit();
                }}
              />
            </form>
          </div>

          {/* Icons Section */}
          <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4">
            {/* Mobile Search Icon */}
            <button 
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-full transition-colors" 
              aria-label="Search"
            >
              <MagnifyingGlassIcon className="h-5 w-5 sm:h-6 sm:w-6 text-gray-700" />
            </button>

            {/* Wish List Icon */}
            <Link to="/wishlist" className="relative p-2 hover:bg-gray-100 rounded-full transition-colors hidden sm:block" aria-label="Wish List">
              <HeartIcon className="h-5 w-5 sm:h-6 sm:w-6 text-gray-700" />
            </Link>

            {/* Cart Icon */}
            <Link to="/cart" className="relative p-2 hover:bg-gray-100 rounded-full transition-colors" aria-label="Cart">
              <ShoppingBagIcon className="h-5 w-5 sm:h-6 sm:w-6 text-gray-700" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-orange-500 rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Profile Dropdown */}
            <div className="relative group hidden sm:block">
              <button 
                onClick={handleProfileClick}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors" 
                aria-label="Profile menu"
              >
                <UserIcon className="h-5 w-5 sm:h-6 sm:w-6 text-gray-700" />
              </button>
              {/* DropDownMenu - mt-2를 제거하고 top으로 위치 조정 */}
              <div className="absolute right-0 z-50 top-full w-48 origin-top-right rounded-lg bg-white py-2 shadow-xl ring-1 ring-black ring-opacity-5 hidden group-hover:block">
                {isAuthenticated ? (
                  <>
                    <Link to="/mypage" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      마이페이지
                    </Link>
                    <Link to="/orders" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      주문내역
                    </Link>
                    <Link to="/wishlist" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      위시리스트
                    </Link>
                    <hr className="my-2 border-gray-100" />
                    <button 
                      onClick={handleLogout} 
                      className="block w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      로그아웃
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      로그인
                    </Link>
                    <Link to="/signup" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      회원가입
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {mobileSearchOpen && (
          <div className="lg:hidden px-4 pb-3" ref={mobileSearchRef}>
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={handleSearchFocus}
                placeholder="상품을 검색해보세요"
                className="w-full px-4 py-2 pr-10 text-sm border border-gray-300 rounded-full focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
                autoFocus
              />
              <button 
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5"
              >
                <MagnifyingGlassIcon className="h-4 w-4 text-gray-600" />
              </button>
              <SearchSuggestions
                isVisible={showSuggestions}
                searchQuery={searchQuery}
                onClose={() => setShowSuggestions(false)}
                onSearch={(query) => {
                  setSearchQuery(query);
                  handleSearchSubmit();
                }}
              />
            </form>
          </div>
        )}
      </div>

      {/* ===== Desktop Navigation ===== */}
      <div className="hidden md:block border-t border-gray-100 bg-white">
        <MainNavigation />
      </div>

      {/* ===== Mobile Navigation (슬라이드) ===== */}
      <div className={`md:hidden fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl transform transition-transform duration-300 flex flex-col ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between p-4 border-b bg-white flex-shrink-0">
          <h2 className="text-lg font-semibold text-gray-900">메뉴</h2>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-5 w-5 text-gray-700" />
          </button>
        </div>
        
        <nav className="flex-1 overflow-y-auto p-4" style={{ maxHeight: 'calc(100vh - 64px)' }}>
          {/* User Info */}
          {isAuthenticated && (
            <div className="mb-4 pb-4 border-b">
              <p className="text-sm text-gray-600">안녕하세요!</p>
              <p className="text-base font-semibold text-gray-900">{user?.first_name || user?.username}님</p>
            </div>
          )}

          {/* Main Menu */}
          <div className="space-y-1">
            <Link 
              to="/" 
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 text-base font-medium text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all"
            >
              홈
            </Link>
            <Link 
              to="/products/best" 
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 text-base font-medium text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all"
            >
              베스트
            </Link>
            <Link 
              to="/products/new" 
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 text-base font-medium text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all"
            >
              신상품
            </Link>
            <Link 
              to="/products/sale" 
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 text-base font-medium text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all"
            >
              세일
            </Link>
            <Link 
              to="/products" 
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 text-base font-medium text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all"
            >
              전체상품
            </Link>
          </div>

          {/* User Menu */}
          <div className="mt-6 pt-6 border-t space-y-1">
            {isAuthenticated ? (
              <>
                <Link 
                  to="/mypage" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2.5 text-base text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all"
                >
                  마이페이지
                </Link>
                <Link 
                  to="/orders" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2.5 text-base text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all"
                >
                  주문내역
                </Link>
                <Link 
                  to="/wishlist" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2.5 text-base text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all"
                >
                  위시리스트
                </Link>
                <Link 
                  to="/cart" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2.5 text-base text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all"
                >
                  장바구니
                </Link>
                <button 
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2.5 text-base text-red-600 hover:bg-red-50 rounded-lg transition-all"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2.5 text-base text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all"
                >
                  로그인
                </Link>
                <Link 
                  to="/signup" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2.5 text-base text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all"
                >
                  회원가입
                </Link>
              </>
            )}
          </div>

          {/* Customer Service */}
          <div className="mt-6 pt-6 border-t space-y-1">
            <Link 
              to="/support" 
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 text-base text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all"
            >
              고객센터
            </Link>
            <Link 
              to="/qna" 
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 text-base text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all"
            >
              Q&A
            </Link>
          </div>
        </nav>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40 overflow-hidden"
          onClick={() => setMobileMenuOpen(false)}
          style={{ 
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            touchAction: 'none'  // 배경 스크롤 방지
          }}
        />
      )}
    </header>
  );
};

export default Header2;