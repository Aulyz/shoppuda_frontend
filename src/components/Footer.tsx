import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-orange-100 via-pink-50 to-orange-50 pt-16 pb-12 text-gray-800">
      <div className="max-w-screen-xl mx-auto px-8">
        <div className="flex flex-col md:flex-row justify-between gap-16 mb-12">
          <div className="flex-grow min-w-[320px]">
            <div className="mb-8">
              <div className="text-[2.5rem] font-serif font-semibold brand-font bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent hover:scale-105 transition-transform duration-300 cursor-pointer">Shoppuda</div>
              <div className="inline-block mt-3 px-4 py-2 bg-gradient-to-r from-orange-200 to-pink-200 text-orange-800 rounded-full font-semibold text-base brand-font shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                해외 쇼핑, 클릭 한 번으로
              </div>
            </div>
            <nav className="mb-6">
              <ul className="flex flex-wrap gap-8 font-medium text-base">
                <li><Link to="/about" className="hover:text-orange-600 transition-all duration-200 hover:scale-105 relative group">
                  회사소개
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-orange-400 to-pink-400 group-hover:w-full transition-all duration-300"></span>
                </Link></li>
                <li><Link to="/terms" className="hover:text-orange-600 transition-all duration-200 hover:scale-105 relative group">
                  이용약관
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-orange-400 to-pink-400 group-hover:w-full transition-all duration-300"></span>
                </Link></li>
                <li><Link to="/privacy" className="hover:text-orange-600 font-semibold transition-all duration-200 hover:scale-105 relative group">
                  개인정보처리방침
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-orange-400 to-pink-400 group-hover:w-full transition-all duration-300"></span>
                </Link></li>
                <li><Link to="/guide" className="hover:text-orange-600 transition-all duration-200 hover:scale-105 relative group">
                  이용안내
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-orange-400 to-pink-400 group-hover:w-full transition-all duration-300"></span>
                </Link></li>
              </ul>
            </nav>
            <div className="mt-8">
              <div className="font-bold mb-4 text-lg text-gray-700">쇼핑몰 기본정보</div>
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
            <div className="font-bold mb-4 text-lg text-gray-700">고객센터 정보</div>
            <div className="space-y-1 text-sm leading-6">
              <p><span className="font-bold">상담/주문 전화</span> <span className="ml-2">010-2474-0413</span></p>
              <p><span className="font-bold">상담/주문 이메일</span> <span className="ml-2">seri00413@naver.com</span></p>
              <p><span className="font-bold">CS운영시간</span> {/* 시간 입력 */}</p>
            </div>
          </div>
          <div className="flex-grow min-w-[220px] md:pl-4">
            <div className="font-bold mb-4 text-lg text-gray-700">결제정보</div>
            <div className="space-y-1 text-sm leading-6">
              <p><span className="font-bold">무통장 계좌정보</span></p>
              <p><span>은행</span> <span className="ml-4">0000-000-00000</span> <span className="ml-4">예금주</span></p>
            </div>
          </div>
        </div>
        <div className="border-t-2 border-gradient-to-r from-orange-200 to-pink-200 pt-6 mt-12 flex flex-col md:flex-row justify-between items-center text-gray-500 text-sm">
          <div className="mb-3 md:mb-0">
            Copyright © Shoppuda. All Rights Reserved. Hosting by Cafe24 Corp.
          </div>
          <div className="flex items-center gap-4">
            <span className="font-semibold text-gray-700 mr-4 text-lg">SNS</span>
            <a href="#" aria-label="instagram" className="p-2 rounded-full hover:bg-gradient-to-r hover:from-orange-100 hover:to-pink-100 hover:text-pink-600 transition-all duration-300 hover:scale-110"><i className="fab fa-instagram text-xl"></i></a>
            <a href="#" aria-label="youtube" className="p-2 rounded-full hover:bg-gradient-to-r hover:from-orange-100 hover:to-pink-100 hover:text-red-600 transition-all duration-300 hover:scale-110"><i className="fab fa-youtube text-xl"></i></a>
            <a href="#" aria-label="facebook" className="p-2 rounded-full hover:bg-gradient-to-r hover:from-orange-100 hover:to-pink-100 hover:text-blue-600 transition-all duration-300 hover:scale-110"><i className="fab fa-facebook-f text-xl"></i></a>
            <a href="#" aria-label="kakao" className="p-2 rounded-full hover:bg-gradient-to-r hover:from-orange-100 hover:to-pink-100 hover:text-yellow-600 transition-all duration-300 hover:scale-110"><i className="fa fa-comment text-xl"></i></a>
            <a href="#" aria-label="twitter" className="p-2 rounded-full hover:bg-gradient-to-r hover:from-orange-100 hover:to-pink-100 hover:text-blue-400 transition-all duration-300 hover:scale-110"><i className="fab fa-twitter text-xl"></i></a>
            <a href="#" aria-label="blog" className="p-2 rounded-full hover:bg-gradient-to-r hover:from-orange-100 hover:to-pink-100 hover:text-orange-600 transition-all duration-300 hover:scale-110"><i className="fab fa-blogger-b text-xl"></i></a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;