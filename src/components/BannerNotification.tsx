
import { useEffect, useState } from 'react';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const STORAGE_KEY = 'bannerHiddenUntil';

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function getHiddenUntil() {
  if (!canUseStorage()) return 0;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return 0;
  const n = Number(raw);
  return Number.isFinite(n) ? n : 0;
}

function setHiddenForOneDay() {
  if (!canUseStorage()) return;
  const until = Date.now() + ONE_DAY_MS;
  localStorage.setItem(STORAGE_KEY, String(until));
}

const BannerNotification = () => {
  const [isHidden, setIsHidden] = useState(true);

  useEffect(() => {
    const until = getHiddenUntil();
    setIsHidden(until > Date.now());
  }, []);

  const handleCloseForToday = () => {
    setHiddenForOneDay();
    setIsHidden(true);
  };

  if (isHidden) return null;

  return (
    <div className="bg-gradient-to-r from-orange-100 to-pink-100 border-b border-orange-200 z-40">
      <div className="container mx-auto relative flex items-center justify-center py-3 px-4">
        {/* 메시지 */}
        <div className="text-sm sm:text-base text-center">
          <a href="#" className="text-orange-800 hover:text-pink-800 transition-colors duration-200 font-medium">
            🎉 신규 회원 가입 시 10% 할인 쿠폰 증정! 🎉
          </a>
        </div>

        {/* 닫기 */}
        <div className="absolute right-0 pr-4 flex items-center space-x-3">
          <label htmlFor="close_today" className="flex items-center text-xs sm:text-sm text-gray-600 cursor-pointer select-none">
            <input
              type="checkbox"
              id="close_today"
              className="mr-1"
              onChange={handleCloseForToday}
            />
            오늘 하루 보지 않기
          </label>
          <button
            className="text-gray-500 hover:text-orange-600 hover:scale-110 transition-all duration-200 p-1 rounded-full hover:bg-white/50"
            onClick={handleCloseForToday}
            aria-label="배너 닫기"
            title="오늘 하루 보지 않기"
          >
            <span className="text-lg">✕</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default BannerNotification;