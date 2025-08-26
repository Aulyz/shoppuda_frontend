import { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// Heroicons 대신 SVG 인라인 사용 또는 다른 아이콘 라이브러리 사용 가능
// import { ShoppingCartIcon, UserIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
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
    <div className="min-h-screen flex flex-col font-[Pretendard]"> {/* body 태그의 font 클래스 적용 */}
      {/* Header - 디자이너 HTML 기반 */}
      <header className="bg-white border-b flex-shrink-0 w-full">
        {/* 상단 유틸리티 바 */}
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
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <ul className="absolute right-0 z-10 mt-0 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 hidden group-hover:block">
              <li><a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">공지사항</a></li>
              <li><a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">상품 사용후기</a></li>
              <li><a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">상품 Q&amp;A</a></li>
              <li><a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">자유게시판</a></li>
              <li><a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">갤러리</a></li>
            </ul>
          </div>
        </div>

        {/* 로고 및 메뉴 */}
        <div className="max-w-screen-xl mx-auto flex items-center justify-between py-2 px-4">
          <div className="flex-1"></div>
          <div className="flex flex-col items-center flex-shrink-0">
            <span className="text-3xl tracking-wide" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }} >SHOPPUDA</span>
            <div className="flex mt-1 space-x-1 font-semibold bg-orange-200" style={{ fontFamily: "'Playfair Display', serif" }} >
              <span className="text-orange-900 rounded px-2 py-0.5">해외 쇼핑, </span>
              <span className="text-orange-900 rounded px-2 py-0.5">클릭 한 번으로</span>
            </div>
          </div>
          <div className="flex-1 flex justify-end items-center space-x-6 text-gray-700">
            {/* Search Icon */}
            <a href="#" className="">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" className="icon" role="img">
                <path stroke="#000" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                  d="M11 19c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8z"></path>
                <path stroke="#000" strokeLinejoin="round" strokeWidth="1.5" d="M22 22l-5-5"></path>
              </svg>
            </a>
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
          </div>
        </div>
        {/* 하단 네비게이션 */}
        <nav className="max-w-screen-xl mx-auto">
          <ul className="flex justify-center space-x-8 text-gray-700 text-base font-medium py-2">
            <li><a href="#" className="hover:text-black">All</a></li>
            <li><a href="#" className="border-b-2 border-orange-400 text-black pb-2">Best</a></li>
            <li><a href="#" className="hover:text-black">New</a></li>
            <li><a href="#" className="hover:text-black">Sale</a></li>
            <li><a href="#" className="hover:text-black">Q&amp;A</a></li>
          </ul>
        </nav>
      </header>

      <main className="flex-1"> {/* bg-gray-50 제거, Home.tsx에서 배경 처리 */}
        {children}
      </main>

      {/* Footer - 디자이너 HTML 기반 */}
      <footer className="bg-[#fae6de] pt-14 pb-10 text-gray-800">
        <div className="max-w-screen-xl mx-auto px-8">
          <div className="flex flex-col md:flex-row justify-between gap-12 mb-10">
            <div className="flex-grow min-w-[320px]">
              <div className="mb-6">
                <div className="text-[2rem] font-serif font-semibold" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}>Shoppuda</div>
                <div className="inline-block mt-1 px-2 py-1 bg-orange-200 text-orange-900 rounded font-semibold text-base" style={{ fontFamily: "'Playfair Display', serif" }}>
                  해외 쇼핑, 클릭 한 번으로
                </div>
              </div>
              <nav className="mb-4">
                <ul className="flex flex-wrap gap-6 font-medium text-base">
                  <li><a href="#" className="hover:text-black">회사소개</a></li>
                  <li><a href="#" className="hover:text-black">이용약관</a></li>
                  <li><a href="#" className="hover:text-black font-semibold">개인정보처리방침</a></li>
                  <li><a href="#" className="hover:text-black">이용안내</a></li>
                </ul>
              </nav>
              <div className="mt-6">
                <div className="font-bold mb-2">쇼핑몰 기본정보</div>
                <div className="space-y-1 text-sm leading-6">
                  <p><span className="font-bold">상호명</span> Shoppuda</p>
                  <p><span className="font-bold">대표자명</span> 박수빈</p>
                  <p><span className="font-bold">사업장 주소</span> {/* 주소 입력 */}</p>
                  <p><span className="font-bold">대표 전화</span> 010-2474-0413</p>
                  <p><span className="font-bold">사업자 등록번호</span> {/* 번호 입력 */}</p>
                  <p><span className="font-bold">통신판매업 신고번호</span> {/* 번호 입력 */}</p>
                  <p><span className="font-bold">개인정보보호책임자</span> 박수빈</p>
                </div>
              </div>
            </div>
            <div className="flex-grow min-w-[220px] md:pl-4">
              <div className="font-bold mb-2">고객센터 정보</div>
              <div className="space-y-1 text-sm leading-6">
                <p><span className="font-bold">상담/주문 전화</span> <span className="ml-2">010-2474-0413</span></p>
                <p><span className="font-bold">상담/주문 이메일</span> <span className="ml-2">seri00413@naver.com</span></p>
                <p><span className="font-bold">CS운영시간</span> {/* 시간 입력 */}</p>
              </div>
            </div>
            <div className="flex-grow min-w-[220px] md:pl-4">
              <div className="font-bold mb-2">결제정보</div>
              <div className="space-y-1 text-sm leading-6">
                <p><span className="font-bold">무통장 계좌정보</span></p>
                <p><span>은행</span> <span className="ml-4">0000-000-00000</span> <span className="ml-4">예금주</span></p>
              </div>
            </div>
          </div>
          <div className="border-t border-[#ead8cc] pt-4 mt-10 flex flex-col md:flex-row justify-between items-center text-[#ae9284] text-xs ">
            <div className="mb-3 md:mb-0">
              Copyright © Shoppuda. All Rights Reserved. Hosting by Cafe24 Corp.
            </div>
            <div className="flex items-center gap-4">
              <span className="font-semibold text-gray-700 mr-2">SNS</span>
              <a href="#" aria-label="instagram" className="hover:text-orange-500"><i className="fab fa-instagram text-lg"></i></a>
              <a href="#" aria-label="youtube" className="hover:text-orange-500"><i className="fab fa-youtube text-lg"></i></a>
              <a href="#" aria-label="facebook" className="hover:text-orange-500"><i className="fab fa-facebook-f text-lg"></i></a>
              <a href="#" aria-label="kakao" className="hover:text-orange-500"><i className="fa fa-comment text-lg"></i></a>
              <a href="#" aria-label="twitter" className="hover:text-orange-500"><i className="fab fa-twitter text-lg"></i></a>
              <a href="#" aria-label="blog" className="hover:text-orange-500"><i className="fab fa-blogger-b text-lg"></i></a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Layout;