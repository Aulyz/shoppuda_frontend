import { useState } from 'react';

const BannerNotification = () => {
  const [isHidden, setIsHidden] = useState(false);

  const handleCloseBanner = () => {
    // 로컬 스토리지에 저장하여 오늘 하루 동안 다시 안 보이도록 함
    localStorage.setItem('bannerHidden', 'true');
    setIsHidden(true);
  };

  // 로컬 스토리지에 저장된 값 확인하여 배너 표시 여부 결정
  if (localStorage.getItem('bannerHidden') === 'true') return null;

  return (
    <div className="bg-white border-b z-40"> {/* z-40으로 낮은 우선순위 */}
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
            <input type="checkbox" id="close_today" className="mr-1" onChange={() => handleCloseBanner()} />
            오늘 하루 보지 않기
          </label>
          <button className="text-gray-600 hover:text-black" onClick={handleCloseBanner}>✕</button>
        </div>
      </div>
    </div>
  );
};

export default BannerNotification;