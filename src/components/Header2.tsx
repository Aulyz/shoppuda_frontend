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
    <header className="bg-[#FDFAF6] flex-shrink-0 w-full sticky top-0 z-50 border-b-2 rounded-br-xl rounded-bl-xl">
      {/* 상단 배너 */}
      <BannerNotification />

      {/* ===== TopMenuBar (Desktop 전용) ===== */}
      <div className="max-w-screen-xl mx-auto flex justify-end items-center text-sm text-gray-700 py-2 px-4 space-x-2 relative">
        {!isAuthenticated ? (
          <>
            <Link to="/signup" className="hover:text-black">회원가입</Link>
            <span>|</span>
            <Link to="/login" className="hover:text-black">로그인</Link>
          </>
        ) : (
          <>
            <span className="text-gray-700">안녕하세요, {user?.username}님!</span>
            <span>|</span>
            <button onClick={handleLogout} className="hover:text-black">로그아웃</button>
          </>
        )}
        <span>|</span>
        <Link to="/orders" className="hover:text-black">주문조회</Link>
        <span>|</span>
        <Link to="/recent-products" className="hover:text-black">최근본상품</Link>
        <span>|</span>
        <Link to="/customer" className="hover:text-black">고객센터</Link>
      </div>

      {/* ===== 메인 헤더 ===== */}
      <div className="max-w-screen-xl mx-auto flex items-center justify-between py-1 px-4">
        <div className="flex-1"></div>
        {/* Logo */}
        <div className="flex flex-col items-center flex-shrink-0">
          <Link to="/" onClick={() => window.location.reload()}>
            <img 
              src={showGif ? "/Images/Logo_Shoppuda.gif" : "/Images/Shoppuda_logo.png"}
              alt="SHOPPUDA Logo" 
              className="w-48 h-auto" // 로고 크기 수정
            />
          </Link>
          <div className="flex justify-center items-center w-48"> {/* 로고 아래 문구 컨테이너 수정 */}
            <img 
              src="/Images/Logo_bt.png" 
              alt="Brand Message" 
              className="h-4 w-auto" // 크기 조정
            />
          </div>
        </div>

        {/* SideMenu */}
        <div className="flex-1 flex justify-end items-center space-x-6 text-gray-700">
          {/* Search Icon */}
          <Link to="#" aria-label="Search">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" className="icon" role="img">
              <path stroke="#000" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11 19c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8z"></path>
              <path stroke="#000" strokeLinejoin="round" strokeWidth="1.5" d="M22 22l-5-5"></path>
            </svg>
          </Link>

          {/* Wish List Icon */}
          <Link to="#" className="relative inline-block" aria-label="Wish List">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="black" strokeWidth="1" width="30" height="30">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"></path>
            </svg>
          </Link>

          {/* Cart Icon */}
          <Link to="/cart" className="relative inline-block" aria-label="Cart">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" className="icon" role="img">
              <path fill="#000" d="M23.073 22.253l-1.946-14.31c-.04-.38-.368-.667-.758-.667h-3.656v-1.74c0-2.543-2.115-4.613-4.713-4.613-2.599 0-4.713 2.07-4.713 4.613v1.74H3.63c-.39 0-.717.288-.758.667L.927 22.253c-.022.21.047.42.192.577.144.157.35.247.566.247h20.63c.216 0 .421-.09.566-.247.145-.157.214-.366.192-.576zM8.81 5.537c0-1.72 1.431-3.122 3.19-3.122 1.758 0 3.19 1.401 3.19 3.122v1.74H8.81v-1.74zm-6.28 16.05l1.786-12.82h2.97v1.644c0 .412.342.746.762.746.421 0 .762-.334.762-.746V8.767h6.38v1.643c0 .412.34.746.761.746.42 0 .762-.334.762-.746V8.767h2.97l1.786 12.819H2.53z"></path>
            </svg>
            <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full transform translate-x-1/2 -translate-y-1/2">
              0
            </span>
          </Link>

          {/* Profile Dropdown */}
          <div className="relative inline-block group">
            <button className="flex items-center focus:outline-none" aria-haspopup="true" aria-expanded="false" aria-label="Profile menu">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" className="icon" role="img">
                <circle cx="11.5" cy="6.5" r="3.75" stroke="#000" strokeWidth="1.5"></circle>
                <path stroke="#000" strokeWidth="1.5" d="M1.78 21.25c.382-4.758 4.364-8.5 9.22-8.5h1c4.856 0 8.838 3.742 9.22 8.5H1.78z"></path>
              </svg>
            </button>
            {/* DropDownMenu */}
            <div className="absolute right-0 z-[100] mt-0 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 hidden group-hover:block" role="menu" aria-orientation="vertical" tabIndex={-1}>
              {isAuthenticated ? (
                <>
                  <Link to="/mypage" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">마이페이지</Link>
                  <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">로그아웃</button>
                </>
              ) : (
                <>
                  <Link to="/login" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">로그인</Link>
                  <Link to="/signup" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">회원가입</Link>
                </>
              )}
            </div>
          </div>
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