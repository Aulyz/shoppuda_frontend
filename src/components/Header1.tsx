import { useState } from 'react';

const Header1 = () => {
  const [isPopupVisible, setIsPopupVisible] = useState(true);

  const handleClosePopup = () => {
    setIsPopupVisible(false);
  };

  const handleClosePopupForToday = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      // TODO: "오늘 하루 보지 않기" 기능 구현 (로컬 스토리지 등 사용)
      setIsPopupVisible(false);
    }
  };

  if (!isPopupVisible) return null;

  return (
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
              <input type="checkbox" id="close_today" className="mr-1" onChange={handleClosePopupForToday} />
              오늘 하루 보지 않기
            </label>
            <button className="text-gray-600 hover:text-black" onClick={handleClosePopup}>✕</button>
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
  );
};

export default Header1;