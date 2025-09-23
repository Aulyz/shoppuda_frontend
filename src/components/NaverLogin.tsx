import React from 'react';

interface NaverLoginProps {
  onSuccess?: (data: { status: string }) => void;
  onFailure?: (error: Error) => void;
}

const NAVER_CLIENT_ID = import.meta.env.VITE_NAVER_CLIENT_ID;

const NaverLogin: React.FC<NaverLoginProps> = ({ onFailure }) => {
  const handleLogin = () => {
    try {
      if (!NAVER_CLIENT_ID) {
        throw new Error('Naver Client ID is not configured');
      }

      // 현재 URL에서 redirect 파라미터 추출
      const currentUrl = new URL(window.location.href);
      const redirectParam = currentUrl.searchParams.get('redirect') || currentUrl.searchParams.get('next');
      
      // 네이버 로그인 state 생성 (CSRF 방지)
      const state = Math.random().toString(36).substring(2, 15);
      
      // 네이버 리다이렉트 URI에 redirect 파라미터 추가
      let redirectUri = 'http://192.168.0.5/naver/callback';
      if (redirectParam) {
        redirectUri += `?redirect=${encodeURIComponent(redirectParam)}`;
      }
      
      // 네이버 인증 URL 생성 (카카오와 동일한 패턴)
      const naverAuthUrl = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${NAVER_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`;

      // 페이지 이동
      window.location.href = naverAuthUrl;
      
    } catch (error) {
      if (onFailure) onFailure(error instanceof Error ? error : new Error('네이버 로그인 실패'));
    }
  };

  return (
    <button 
      onClick={handleLogin}
      className="w-12 h-12 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center transition-colors duration-200"
      type="button"
      aria-label="네이버 로그인"
    >
      <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
        <path d="M16.273 12.845L7.376 0H0v24h7.727V11.155L16.624 24H24V0h-7.727v12.845z"/>
      </svg>
    </button>
  );
};

export default NaverLogin;