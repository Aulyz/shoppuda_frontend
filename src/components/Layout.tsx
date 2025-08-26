import { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface LayoutProps {
  children: ReactNode;
}

function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col font-[Pretendard]">
      {/* Header1 - 상단 팝업 및 유틸리티 메뉴 */}
      <header className="bg-white flex-shrink-0 w-full">
        {/* TopPopup */}
        <div className="w-full bg-gray-100 border-b">
          <div className="mx-auto relative flex items-center justify-center py-2 px-4">
            {/* BannerMsg */}
            <div className="text-sm sm:text-base text-center">
              <a href="#" className="text-black hover:underline">
                🎉 신규 회원 가입 시 10% 할인 쿠폰 증정! 🎉
              </a>
            </div>

            {/* Close */}
            <div className="absolute right-0 pr-4 flex items-center space-x-3">
              <label htmlFor="close_today" className="flex items-center text-xs sm:text-sm text-gray-600 cursor-pointer">
                <input type="checkbox" id="close_today" className="mr-1" />
                오늘 하루 보지 않기
              </label>
              <button className="text-gray-600 hover:text-black">✕</button>
            </div>
          </div>
        </div>

        {/* TopMenuBar */}
        <div className="max-w-screen-xl mx-auto flex justify-end items-center text-sm text-gray-700 py-4 px-4 space-x-2">
          <a href="#" className="hover:text-black">회원가입</a>
          <span>|</span>
          <a href="#" className="hover:text-black">로그인</a>
          <span>|</span>
          <a href="#" className="hover:text-black">주문조회</a>
          <span>|</span>
          <a href="#" className="hover:text-black">최근본상품</a>
          <span>|</span>
          {/* 고객센터 드롭다운 */}
          <div className="relative inline-block group">
            <button className="hover:text-black focus:outline-none flex items-center">
              고객센터
              <svg className="w-4 h-4 ml-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <ul className="absolute right-0 z-60 mt-0 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 hidden group-hover:block">
              <li><a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">공지사항</a></li>
              <li><a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">상품 사용후기</a></li>
              <li><a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">상품 Q&amp;A</a></li>
              <li><a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">자유게시판</a></li>
              <li><a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">갤러리</a></li>
            </ul>
          </div>
        </div>
      </header>

      {/* Header2 - 로고 & 주요 메뉴 */}
      <div className="sticky top-0 z-50 bg-white border-b">
        <div className="max-w-screen-xl mx-auto flex items-center justify-between py-2 px-4">
          <div className="flex-1"></div>
          {/* Logo */}
          <div className="flex flex-col items-center flex-shrink-0">
            <span className="text-3xl tracking-wide" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }} >SHOPPUDA</span>
            <div className="flex mt-1 space-x-1 font-semibold bg-orange-200" style={{ fontFamily: "'Playfair Display', serif" }} >
              <span className="text-orange-900 rounded px-2 py-0.5">해외 쇼핑, </span>
              <span className="text-orange-900 rounded px-2 py-0.5">클릭 한 번으로</span>
            </div>
          </div>

          {/* SideMenu */}
          <div className="flex-1 flex justify-end items-center space-x-6 text-gray-700">
            {/* Search Icon */}
            <a href="#" className="">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" className="icon" role="img">
                <path stroke="#000" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                  d="M11 19c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8z"></path>
                <path stroke="#000" strokeLinejoin="round" strokeWidth="1.5" d="M22 22l-5-5"></path>
              </svg>
            </a>

            {/* Wish List Icon */}
            <a href="#" className="relative inline-block">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#333333" viewBox="0 0 24 24" className="icon" role="img">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </a>

            {/* Cart Icon */}
            <Link to="/cart" className="relative inline-block">
              <svg
                xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" className="icon"
                role="img">
                <path fill="#000"
                  d="M23.073 22.253l-1.946-14.31c-.04-.38-.368-.667-.758-.667h-3.656v-1.74c0-2.543-2.115-4.613-4.713-4.613-2.599 0-4.713 2.07-4.713 4.613v1.74H3.63c-.39 0-.717.288-.758.667L.927 22.253c-.022.21.047.42.192.577.144.157.35.247.566.247h20.63c.216 0 .421-.09.566-.247.145-.157.214-.366.192-.576zM8.81 5.537c0-1.72 1.431-3.122 3.19-3.122 1.758 0 3.19 1.401 3.19 3.122v1.74H8.81v-1.74zm-6.28 16.05l1.786-12.82h2.97v1.644c0 .412.342.746.762.746.421 0 .762-.334.762-.746V8.767h6.38v1.643c0 .412.34.746.761.746.42 0 .762-.334.762-.746V8.767h2.97l1.786 12.819H2.53z">
                </path>
              </svg>
              <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full transform translate-x-1/2 -translate-y-1/2">
                0 {/* TODO: 실제 장바구니 수량 표시 로직 필요 */}
              </span>
            </Link>

            {/* Profile Icon & Dropdown */}
            <div className="relative inline-block group">
              <button className="flex items-center focus:outline-none">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                  fill="none" viewBox="0 0 24 24" className="icon" role="img">
                  <circle cx="11.5" cy="6.5" r="3.75" stroke="#000" strokeWidth="1.5"></circle>
                  <path stroke="#000" strokeWidth="1.5"
                    d="M1.78 21.25c.382-4.758 4.364-8.5 9.22-8.5h1c4.856 0 8.838 3.742 9.22 8.5H1.78z"></path>
                </svg>
              </button>
              <div className="absolute right-0 z-10 mt-0 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 hidden group-hover:block"
                  role="menu" aria-orientation="vertical" tabIndex={-1}>
                <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  role="menuitem" tabIndex={-1}>Profile</a>
                <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  role="menuitem" tabIndex={-1}>Settings</a>
                <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  role="menuitem" tabIndex={-1}>Sign out</a>
              </div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="max-w-screen-xl mx-auto">
          <ul className="flex justify-center space-x-8 text-gray-700 text-base font-medium py-2">
            <li><a href="#" className="hover:text-black">All</a></li>
            <li><a href="#" className="border-b-2 border-orange-400 text-black pb-2">Best</a></li>
            <li><a href="#" className="hover:text-black">New</a></li>
            <li><a href="#" className="hover:text-black">Sale</a></li>
            <li><a href="#" className="hover:text-black">Q&amp;A</a></li>
          </ul>
        </nav>
      </div>

      <main className="flex-1">
        {children}
      </main>

      {/* Footer - 기존 Footer 코드 유지 */}
      <footer className="bg-[#fae6de] pt-14 pb-10 text-gray-800">
        {/* ... (Footer 내용은 변경 없음) ... */}
      </footer>
    </div>
  );
}

export default Layout;