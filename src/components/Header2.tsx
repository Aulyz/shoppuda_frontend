import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import BannerNotification from './BannerNotification';
import MainNavigation from './MainNavigation';
// import type { DropdownType } from '../types';

const Header2 = () => {
  const location = useLocation();
  const [showGif, setShowGif] = useState(true);
  const [isCustomerServiceOpen, setIsCustomerServiceOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowGif(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const logoSrc = showGif ? '/images/logo_shoppuda.gif' : '/images/logo_demo.png';
  
  const handleDropdownToggle = (type: string, isOpen: boolean) => {
    if (type === 'customer') {
      setIsCustomerServiceOpen(isOpen);
    } else {
      setIsProfileOpen(isOpen);
    }
  };

  // 홈페이지인지 확인
  const isHomePage = location.pathname === '/';

  return (
    <div className={`${isHomePage ? 'absolute top-0' : ''} bg-white/95 backdrop-blur-md border-b border-orange-100 relative z-50 shadow-sm`}>
      {/* BannerNotification - 최상단에 표시 */}
      <BannerNotification />

      {/* TopMenuBar - 배너 아래에 표시 */}
      <div className="container-max flex justify-end items-center text-sm text-gray-700 py-2 space-x-2">
        <Link to="/signup" className="nav-link">회원가입</Link>
        <span>|</span>
        <Link to="/login" className="nav-link">로그인</Link>
        <span>|</span>
        <Link to="/orders" className="nav-link">주문조회</Link>
        <span>|</span>
        <Link to="/recent-products" className="nav-link">최근본상품</Link>
        <span>|</span>
        
        {/* 고객센터 드롭다운 */}
        <div className="relative inline-block z-[100]"
             onMouseEnter={() => handleDropdownToggle('customer', true)}
             onMouseLeave={() => handleDropdownToggle('customer', false)}>
          <button className="nav-link focus:outline-none flex items-center">
            고객센터
            <svg className="w-4 h-4 ml-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <ul className={`dropdown-menu z-[100] ${
            isCustomerServiceOpen 
              ? 'scale-100 opacity-100 visible' 
              : 'scale-95 opacity-0 invisible'
          }`}>
            <li><Link to="/notice" className="dropdown-item">공지사항</Link></li>
            <li><Link to="/reviews" className="dropdown-item">상품 사용후기</Link></li>
            <li><Link to="/qna" className="dropdown-item">상품 Q&A</Link></li>
            <li><Link to="/board" className="dropdown-item">자유게시판</Link></li>
            <li><Link to="/gallery" className="dropdown-item">갤러리</Link></li>
          </ul>
        </div>
      </div>

      {/* 로고, 검색, 위시리스트, 장바구니, 프로필 메뉴, 네비게이션 */}
      <div className="container-max flex items-center justify-between py-2">
        <div className="flex-1"></div>

        {/* Logo + Home Link */}
        <div className="flex flex-col items-center flex-shrink-0">
          <Link to="/" className="cursor-pointer">
            <img 
              src={logoSrc} 
              alt="SHOPPUDA Logo" 
              className="h-20 w-auto transition-opacity duration-300"
            />
          </Link>
          <Link to="/" className="cursor-pointer mt-1">
            <div className="flex mt-1 space-x-1 font-semibold bg-gradient-to-r from-orange-200 to-pink-200 rounded-full px-4 py-2 shadow-md text-sm brand-font hover:shadow-lg transition-all duration-300">
              <span className="text-orange-800">해외 쇼핑, </span>
              <span className="text-pink-800">클릭 한 번으로</span>
            </div>
          </Link>
        </div>

        {/* SideMenu */}
        <div className="flex-1 flex justify-end items-center space-x-8 text-gray-600">
          {/* Search Icon */}
          <button className="p-2 rounded-full hover:bg-orange-50 transition-all duration-200 hover:scale-110 group">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" className="icon group-hover:stroke-orange-600 transition-colors" role="img">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                d="M11 19c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8z"></path>
              <path stroke="currentColor" strokeLinejoin="round" strokeWidth="1.5" d="M22 22l-5-5"></path>
            </svg>
          </button>

          {/* Wish List Icon */}
          <button className="relative p-2 rounded-full hover:bg-pink-50 transition-all duration-200 hover:scale-110 group">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24" className="icon text-gray-600 group-hover:text-pink-600 transition-colors" role="img">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </button>

          {/* Cart Icon */}
          <Link to="/cart" className="relative p-2 rounded-full hover:bg-orange-50 transition-all duration-200 hover:scale-110 group">
            <svg
              xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" className="icon"
              role="img">
              <path fill="currentColor" className="text-gray-600 group-hover:text-orange-600 transition-colors"
                d="M23.073 22.253l-1.946-14.31c-.04-.38-.368-.667-.758-.667h-3.656v-1.74c0-2.543-2.115-4.613-4.713-4.613-2.599 0-4.713 2.07-4.713 4.613v1.74H3.63c-.39 0-.717.288-.758.667L.927 22.253c-.022.21.047.42.192.577.144.157.35.247.566.247h20.63c.216 0 .421-.09.566-.247.145-.157.214-.366.192-.576zM8.81 5.537c0-1.72 1.431-3.122 3.19-3.122 1.758 0 3.19 1.401 3.19 3.122v1.74H8.81v-1.74zm-6.28 16.05l1.786-12.82h2.97v1.644c0 .412.342.746.762.746.421 0 .762-.334.762-.746V8.767h6.38v1.643c0 .412.34.746.761.746.42 0 .762-.334.762-.746V8.767h2.97l1.786 12.819H2.53z">
              </path>
            </svg>
            <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-gradient-to-r from-pink-500 to-red-500 rounded-full shadow-lg animate-pulse">
              0
            </span>
          </Link>

          {/* Profile Icon & Dropdown */}
          <div className="relative inline-block z-[90]"
               onMouseEnter={() => handleDropdownToggle('profile', true)}
               onMouseLeave={() => handleDropdownToggle('profile', false)}>
            <button className="flex items-center focus:outline-none p-2 rounded-full hover:bg-gray-50 transition-all duration-200 hover:scale-110 group">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                fill="none" viewBox="0 0 24 24" className="icon" role="img">
                <circle cx="11.5" cy="6.5" r="3.75" stroke="currentColor" strokeWidth="1.5" className="text-gray-600 group-hover:text-gray-800 transition-colors"></circle>
                <path stroke="currentColor" strokeWidth="1.5" className="text-gray-600 group-hover:text-gray-800 transition-colors"
                  d="M1.78 21.25c.382-4.758 4.364-8.5 9.22-8.5h1c4.856 0 8.838 3.742 9.22 8.5H1.78z"></path>
              </svg>
            </button>
            <div className={`dropdown-menu z-[90] mt-0 ${
              isProfileOpen 
                ? 'scale-100 opacity-100 visible' 
                : 'scale-95 opacity-0 invisible'
            }`}
                role="menu" aria-orientation="vertical" tabIndex={-1}>
              <Link to="/profile" className="dropdown-item"
                role="menuitem" tabIndex={-1}>Profile</Link>
              <Link to="/settings" className="dropdown-item"
                role="menuitem" tabIndex={-1}>Settings</Link>
              <button className="dropdown-item w-full text-left"
                role="menuitem" tabIndex={-1}>Sign out</button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <MainNavigation />
    </div>
  );
};

export default Header2;