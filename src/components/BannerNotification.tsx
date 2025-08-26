import { useState, useEffect } from 'react';

const BannerNotification = () => {
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    const bannerHidden = localStorage.getItem('bannerHidden');
    if (bannerHidden === 'true') {
      setIsHidden(true);
    }
  }, []);

  const handleCloseBanner = () => {
    localStorage.setItem('bannerHidden', 'true');
    setIsHidden(true);
  };

  if (isHidden) return null;

  return (
    <div className="bg-gradient-to-r from-orange-100 to-pink-100 border-b border-orange-200 z-40"> {/* z-40으로 낮은 우선순위 */}
      <div className="mx-auto relative flex items-center justify-center py-3 px-4">
        {/* BannerMsg */}
        <div className="text-sm sm:text-base text-center">
          <a href="#" className="text-orange-800 hover:text-pink-800 transition-colors duration-200 font-medium">
            🎉 신규 회원 가입 시 10% 할인 쿠폰 증정! 🎉
          </a>
        </div>

        {/* Close */}
        <div className="absolute right-0 pr-4 flex items-center space-x-3">
          <label htmlFor="close_today" className="flex items-center text-xs sm:text-sm text-gray-600 cursor-pointer">
            <input type="checkbox" id="close_today" className="mr-1" onChange={() => handleCloseBanner()} />
            오늘 하루 보지 않기
          </label>
          <button className="text-gray-500 hover:text-orange-600 hover:scale-110 transition-all duration-200 p-1 rounded-full hover:bg-white/50" onClick={handleCloseBanner}>✕</button>
        </div>
      </div>
    </div>
  );
};

export default BannerNotification;