
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import BannerNotification from "./BannerNotification";
import MainNavigation from "./MainNavigation";
import { useAuthStore } from "../store/authStore";
import { api } from "../services/api";

const Header2 = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();

  const [showGif, setShowGif] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowGif(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      logout();
      navigate("/");
    }
  };

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-orange-100 z-50 shadow-sm flex-shrink-0 w-full">
      {/* 상단 배너 */}
      <BannerNotification />

      {/* ===== TopMenuBar (Desktop 전용) ===== */}
      <div className="hidden lg:flex container mx-auto justify-end items-center text-xs text-gray-600 py-1 gap-2">
        {!isAuthenticated ? (
          <>
            <Link to="/signup" className="hover:text-orange-600">회원가입</Link>
            <span>|</span>
            <Link to="/login" className="hover:text-orange-600">로그인</Link>
          </>
        ) : (
          <>
            <span className="text-gray-600">안녕하세요, {user?.username}님!</span>
            <span>|</span>
            <button onClick={handleLogout} className="hover:text-orange-600">로그아웃</button>
          </>
        )}
        <span>|</span>
        <Link to="/orders" className="hover:text-orange-600">주문조회</Link>
        <span>|</span>
        <Link to="/recent-products" className="hover:text-orange-600">최근본상품</Link>
        <span>|</span>
        <Link to="/customer" className="hover:text-orange-600">고객센터</Link>
      </div>

      {/* ===== 메인 헤더 ===== */}
      <div className="container mx-auto flex items-center justify-between py-2 px-4">
        {/* Left: 로고 */}
        <div className="flex items-center space-x-3">
          <Link to="/" className="flex-shrink-0">
            <img
              src={showGif ? "/Images/Logo_Shoppuda.gif" : "/Images/Shoppuda_logo.png"}
              alt="SHOPPUDA Logo"
              className="h-10 sm:h-12 w-auto"
            />
          </Link>
          <span className="hidden sm:inline px-3 py-1 rounded-full text-xs sm:text-sm font-semibold bg-gradient-to-r from-orange-200 to-pink-200 text-orange-800">
            해외 쇼핑, 클릭 한 번으로
          </span>
        </div>

        {/* Right: Desktop 아이콘 + 네비게이션 */}
        <div className="hidden lg:flex items-center gap-6">
          {/* Search */}
          <button aria-label="검색" className="hover:text-orange-600">
            <span className="text-xl">🔍</span>
          </button>
          {/* Wishlist */}
          <Link to="/wishlist" aria-label="위시리스트" className="hover:text-pink-600">
            <span className="text-xl">❤️</span>
          </Link>
          {/* Cart */}
          <Link to="/cart" aria-label="장바구니" className="relative hover:text-orange-600">
            <span className="text-xl">🛒</span>
            <span className="absolute -top-2 -right-2 bg-gradient-to-r from-pink-500 to-red-500 text-white text-xs rounded-full px-1">
              0
            </span>
          </Link>
          {/* Profile */}
          {isAuthenticated ? (
            <Link to="/profile" className="hover:text-gray-800">
              <span className="text-xl">👤</span>
            </Link>
          ) : (
            <Link to="/login" className="hover:text-gray-800">
              <span className="text-xl">👤</span>
            </Link>
          )}
        </div>

        {/* Right: Mobile 햄버거 버튼 */}
        <div className="flex lg:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-gray-700 hover:text-orange-600"
            aria-label="메뉴"
          >
            <span className="text-2xl">☰</span>
          </button>
        </div>
      </div>

      {/* ===== Desktop Navigation ===== */}
      <div className="hidden lg:block border-t border-orange-100">
        <MainNavigation />
      </div>

      {/* ===== Mobile Navigation (슬라이드) ===== */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white shadow-md absolute top-full left-0 w-full z-40">
          <nav className="flex flex-col items-start p-4 space-y-2 text-sm">
            <Link to="/" className="hover:text-orange-600 py-1">Home</Link>
            <Link to="/best" className="hover:text-orange-600 py-1">Best</Link>
            <Link to="/new" className="hover:text-orange-600 py-1">New</Link>
            <Link to="/sale" className="hover:text-orange-600 py-1">Sale</Link>
            <Link to="/qna" className="hover:text-orange-600 py-1">Q&A</Link>
            <hr className="w-full border-gray-200 my-2" />
            {!isAuthenticated ? (
              <>
                <Link to="/signup" className="hover:text-orange-600 py-1">회원가입</Link>
                <Link to="/login" className="hover:text-orange-600 py-1">로그인</Link>
              </>
            ) : (
              <>
                <Link to="/profile" className="hover:text-orange-600 py-1">프로필</Link>
                <button onClick={handleLogout} className="hover:text-orange-600 text-left w-full py-1">로그아웃</button>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header2;