import { Link } from 'react-router-dom';
import BannerNotification from './BannerNotification';
import TopMenuBar from './TopMenuBar';
import MainNavigation from './MainNavigation';

const Header2 = () => {
  return (
    <div className="sticky top-0 z-50 bg-white border-b">
      {/* BannerNotification - 최상단에 표시 */}
      <BannerNotification />

      {/* TopMenuBar - 배너 아래에 표시 */}
      <TopMenuBar />

      {/* 로고, 검색, 위시리스트, 장바구니, 프로필 메뉴, 네비게이션 */}
      <div className="max-w-screen-xl mx-auto flex items-center justify-between py-2 px-4">
        <div className="flex-1"></div>

        {/* Logo + Home Link */}
        <Link to="/" className="flex flex-col items-center flex-shrink-0 cursor-pointer">
          <span className="text-3xl tracking-wide" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}>
            SHOPPUDA
          </span>
          <div className="flex mt-1 space-x-1 font-semibold bg-orange-200" style={{ fontFamily: "'Playfair Display', serif" }}>
            <span className="text-orange-900 rounded px-2 py-0.5">해외 쇼핑, </span>
            <span className="text-orange-900 rounded px-2 py-0.5">클릭 한 번으로</span>
          </div>
        </Link>

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

      {/* Main Navigation - 컴포넌트 사용 */}
      <MainNavigation /> {/* 이 코드는 이제 정상 작동 */}
    </div>
  );
};

export default Header2;