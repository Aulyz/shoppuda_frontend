const Footer = () => {
  return (
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
  );
};

export default Footer;