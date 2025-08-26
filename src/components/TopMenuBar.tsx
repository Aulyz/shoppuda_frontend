import { Link } from 'react-router-dom';

const TopMenuBar = () => {
  return (
    <div className="max-w-screen-xl mx-auto flex justify-end items-center text-sm text-gray-700 py-2 px-4 space-x-2">
      <Link to="/signup" className="hover:text-black">회원가입</Link>
      <span>|</span>
      <Link to="/login" className="hover:text-black">로그인</Link>
      <span>|</span>
      <Link to="/orders" className="hover:text-black">주문조회</Link>
      <span>|</span>
      <Link to="/recent-products" className="hover:text-black">최근본상품</Link>
      <span>|</span>
      
      {/* 고객센터 드롭다운 */}
      <div className="relative inline-block group">
        <button className="hover:text-black focus:outline-none flex items-center">
          고객센터
          <svg className="w-4 h-4 ml-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <ul className="absolute right-0 z-60 mt-1 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 hidden group-hover:block">
          <li><a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">공지사항</a></li>
          <li><a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">상품 사용후기</a></li>
          <li><a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">상품 Q&amp;A</a></li>
          <li><a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">자유게시판</a></li>
          <li><a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">갤러리</a></li>
        </ul>
      </div>
    </div>
  );
};

export default TopMenuBar;