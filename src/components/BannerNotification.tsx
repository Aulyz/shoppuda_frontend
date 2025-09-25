
import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useToastStore } from '../store/toastStore'
import { useAuthStore } from '../store/authStore'
import { useCouponStore } from '../store/couponStore'

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
  const [isHidden, setIsHidden] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { addToast } = useToastStore()
  const { isAuthenticated, user } = useAuthStore()
  const { ownedCouponCodes, fetchUserCoupons, claimCoupon, isInitialized } = useCouponStore()

  useEffect(() => {
    const until = getHiddenUntil()
    setIsHidden(until > Date.now())
  }, [])

  // 사용자 로그인 시 쿠폰 정보 초기화
  useEffect(() => {
    if (isAuthenticated && !isInitialized) {
      fetchUserCoupons()
    }
  }, [isAuthenticated, isInitialized, fetchUserCoupons])

  const handleCloseForToday = () => {
    setHiddenForOneDay()
    setIsHidden(true)
  }

  const handleClaimCoupon = async (e: React.MouseEvent, couponCode: string) => {
    e.preventDefault()

    console.log('배너 쿠폰 클레임 시도:', { isAuthenticated, user, couponCode })

    // 로그인 상태를 더 엄격하게 체크
    if (!isAuthenticated || !user) {
      console.log('비로그인 상태 감지 - 로그인 페이지로 리디렉션')
      addToast({
        type: 'warning',
        title: '로그인 필요',
        message: '쿠폰 혜택은 회원 전용입니다. 로그인 후 이용해주세요.',
      })
      const currentPath = location.pathname + location.search
      navigate(`/login?redirect=${encodeURIComponent(currentPath)}`)
      return
    }

    if (isLoading) return

    setIsLoading(true)
    
    try {
      const result = await claimCoupon(couponCode)
      
      if (result.success) {
        addToast({
          type: 'success',
          title: '쿠폰 발급 완료!',
          message: result.message || '쿠폰이 발급되었습니다. 마이페이지에서 확인하세요.',
          duration: 5000,
        })
      } else {
        addToast({
          type: 'error',
          title: '쿠폰 발급 실패',
          message: result.message || '쿠폰 발급에 실패했습니다.',
        })
      }
    } catch (error: any) {
      addToast({
        type: 'error',
        title: '쿠폰 발급 실패',
        message: '쿠폰 발급 중 오류가 발생했습니다.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  // 사용자명 표시 함수
  const getDisplayName = () => {
    if (isAuthenticated && user) {
      // 우선순위: first_name > last_name > username
      if (user.first_name) {
        return user.first_name
      }
      if (user.last_name) {
        return user.last_name
      }
      if (user.username && !user.username.startsWith('kakao_')) {
        return user.username
      }
    }
    return '고객'
  }

  if (isHidden) return null

  // 배너 쿠폰 리스트
  const bannerCoupons = [
    {
      code: 'WELCOME10',
      name: '신규 회원 1000원 할인 쿠폰',
      emoji: '🎉',
      description: '신규 회원 가입 시'
    },
    {
      code: 'FIRSTBUY15',
      name: '첫 구매 3000원 할인 쿠폰',
      emoji: '🛍️',
      description: '첫 구매 시'
    },
    {
      code: 'FREESHIP',
      name: '5000원 할인 쿠폰',
      emoji: '💰',
      description: '특별 할인 혜택'
    }
  ]

  return (
    <div className="bg-gradient-to-r from-orange-100 to-pink-100 border-b border-orange-200 z-40">
      <div className="container mx-auto relative py-4 px-4">
        {/* 헤더 */}
        <div className="text-center mb-3">
          <h3 className="text-lg font-bold text-orange-800 mb-1">
            {getDisplayName()} 님을 위한 혜택
          </h3>
          <p className="text-sm text-orange-700">
            지금 바로 쿠폰을 받아보세요!
          </p>
        </div>

        {/* 쿠폰 리스트 */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-2">
          {bannerCoupons.map((coupon) => {
            const isOwned = ownedCouponCodes.includes(coupon.code)
            
            return (
              <button
                key={coupon.code}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  if (!isOwned) {
                    handleClaimCoupon(e, coupon.code)
                  }
                }}
                disabled={isLoading}
                className={`bg-white rounded-lg shadow-sm border px-3 py-2
                  text-xs sm:text-sm transition-all duration-200 min-h-[44px] flex items-center
                  ${isOwned
                    ? 'border-gray-300 bg-gray-50 cursor-default opacity-75'
                    : isLoading
                      ? 'border-orange-200 opacity-60 cursor-not-allowed'
                      : 'border-orange-200 cursor-pointer hover:shadow-md hover:scale-105 hover:bg-orange-50'
                  }`}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{coupon.emoji}</span>
                  <div className="text-left">
                    <div className={`font-semibold ${isOwned ? 'text-gray-600' : 'text-orange-800'}`}>
                      {coupon.name}
                    </div>
                    <div className={`text-xs ${isOwned ? 'text-gray-500' : 'text-orange-600'}`}>
                      {isOwned ? '수령완료' : coupon.description}
                    </div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {/* 로딩 상태 */}
        {isLoading && (
          <div className="text-center">
            <span className="inline-block animate-spin mr-2">⚪</span>
            <span className="text-sm text-orange-700">쿠폰 발급 중...</span>
          </div>
        )}

        {/* 닫기 버튼 */}
        <div className="absolute top-2 right-2 flex items-center space-x-2">
          <label htmlFor="close_today" className="hidden sm:flex items-center text-xs text-gray-600 cursor-pointer select-none">
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
}

export default BannerNotification