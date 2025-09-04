import React from 'react';

interface KakaoLoginProps {
  onSuccess: (data: { status: string }) => void;
  onFailure?: (error: Error) => void;
}

const KAKAO_CLIENT_ID = import.meta.env.VITE_KAKAO_APP_KEY;
const KAKAO_REDIRECT_URI = 'http://localhost:3001/oauth/kakao/callback'; // URI 경로 수정

const KakaoLogin: React.FC<KakaoLoginProps> = ({ onSuccess, onFailure }) => {
  const handleLogin = () => {
    try {
      if (!KAKAO_CLIENT_ID) {
        throw new Error('Kakao Client ID is not configured');
      }

      // 카카오 인증 URL 생성
      const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${encodeURIComponent(KAKAO_REDIRECT_URI)}&response_type=code`;

      // 페이지 이동
      window.location.href = kakaoAuthUrl;
      
    } catch (error) {
      console.error('카카오 로그인 실패:', error);
      if (onFailure) onFailure(error instanceof Error ? error : new Error('카카오 로그인 실패'));
    }
  };

  return (
    <button 
      onClick={handleLogin}
      className="w-12 h-12 bg-[#FEE500] hover:bg-[#FEE500]/90 rounded-full flex items-center justify-center transition-colors duration-200"
      type="button"
      aria-label="카카오 로그인"
    >
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#000000">
        <path d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 0 1-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.866C1.5 6.665 6.201 3 12 3z"/>
      </svg>
    </button>
  );
};

export default KakaoLogin;