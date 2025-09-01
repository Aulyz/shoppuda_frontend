import React, { useEffect } from 'react';

declare global {
  interface Window {
    Kakao: any;
  }
}

interface KakaoLoginProps {
  onSuccess: (data: any) => void;
  onFailure?: (error: any) => void;
}

const KakaoLogin: React.FC<KakaoLoginProps> = ({ onSuccess, onFailure }) => {
  useEffect(() => {
    const initKakao = () => {
      // SDK 로드를 기다리는 함수
      const waitForKakao = (attempts = 0) => {
        if (window.Kakao) {
          if (!window.Kakao.isInitialized()) {
            const appKey = import.meta.env.VITE_KAKAO_APP_KEY;
            if (appKey && appKey !== 'YOUR_KAKAO_APP_KEY') {
              try {
                window.Kakao.init(appKey);
                console.log('Kakao SDK 초기화 완료', appKey);
                
                // 초기화 완료 후 URL 파라미터 확인
                checkForAuthCode();
              } catch (error) {
                console.error('Kakao SDK 초기화 실패:', error);
              }
            } else {
              console.error('Kakao App Key가 설정되지 않았습니다.');
            }
          } else {
            console.log('Kakao SDK 이미 초기화됨');
            checkForAuthCode();
          }
        } else if (attempts < 50) { // 최대 5초 대기
          setTimeout(() => waitForKakao(attempts + 1), 100);
        } else {
          console.error('Kakao SDK 로드 타임아웃');
        }
      };

      waitForKakao();
    };

    const checkForAuthCode = () => {
      console.log('=== checkForAuthCode 함수 실행됨 ===');
      console.log('현재 URL:', window.location.href);
      console.log('URL search:', window.location.search);
      
      // 여러 방법으로 code 확인
      const fullUrl = window.location.href;
      const codeMatch = fullUrl.match(/[?&]code=([^&]+)/);
      const errorMatch = fullUrl.match(/[?&]error=([^&]+)/);
      
      const code = codeMatch ? decodeURIComponent(codeMatch[1]) : null;
      const error = errorMatch ? decodeURIComponent(errorMatch[1]) : null;
      
      console.log('정규식으로 추출된 code:', code ? code.substring(0, 20) + '...' : 'null');
      console.log('정규식으로 추출된 error:', error);
      
      // URLSearchParams도 시도
      const urlParams = new URLSearchParams(window.location.search);
      const urlParamsCode = urlParams.get('code');
      
      console.log('URLSearchParams로 추출된 code:', urlParamsCode ? urlParamsCode.substring(0, 20) + '...' : 'null');
      console.log('URL 파라미터 전체:', Object.fromEntries(urlParams.entries()));
      
      if (error) {
        console.error('카카오 로그인 에러:', error);
        if (onFailure) onFailure(new Error(`Kakao login error: ${error}`));
        return;
      }
      
      const finalCode = code || urlParamsCode;
      if (finalCode) {
        console.log('✅ 카카오 Authorization Code 발견! App.tsx가 처리합니다...');
        // App.tsx의 KakaoAuthHandler가 처리하므로 여기서는 로그만 출력
      } else {
        console.log('❌ Authorization Code가 URL에 없습니다.');
      }
    };

    // App.tsx의 KakaoAuthHandler가 토큰 교환을 처리하므로 이 함수는 제거

    // 즉시 실행하고 load 이벤트도 추가로 대기
    initKakao();
    window.addEventListener('load', initKakao);

    return () => {
      window.removeEventListener('load', initKakao);
    };
  }, [onSuccess, onFailure]);

  const handleLogin = () => {
    if (!window.Kakao) {
      console.error('Kakao SDK가 로드되지 않았습니다.');
      if (onFailure) onFailure(new Error('Kakao SDK not loaded'));
      return;
    }

    if (!window.Kakao.isInitialized()) {
      console.error('Kakao SDK가 초기화되지 않았습니다.');
      if (onFailure) onFailure(new Error('Kakao SDK not initialized'));
      return;
    }

    console.log('카카오 로그인 시작');

    // 먼저 기존 토큰이 있는지 확인
    const existingToken = window.Kakao.Auth.getAccessToken();
    if (existingToken) {
      console.log('기존 액세스 토큰 발견:', existingToken);
      console.log('App.tsx의 KakaoAuthHandler가 처리합니다.');
      // App.tsx의 KakaoAuthHandler가 사용자 정보를 처리하므로 여기서는 로그인만 진행
    }

    // 카카오 로그인 - 루트 경로로 리다이렉트 시도
    const redirectUri = 'http://localhost:3001';
    
    console.log('사용할 리다이렉트 URI:', redirectUri);
    console.log('현재 URL:', window.location.href);
    console.log('앱 키:', import.meta.env.VITE_KAKAO_APP_KEY);
    
    try {
      // authorize 메소드 호출 (scope 제거)
      window.Kakao.Auth.authorize({
        redirectUri: redirectUri
      });
    } catch (error: any) {
      console.error('카카오 authorize 실패:', error);
      if (onFailure) onFailure(error);
    }
  };

  // App.tsx의 KakaoAuthHandler가 처리하므로 이 함수는 제거

  return (
    <button 
      onClick={handleLogin}
      className="w-12 h-12 bg-yellow-400 hover:bg-yellow-500 rounded-full flex items-center justify-center transition-colors duration-200"
      type="button"
    >
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 0 1-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.866C1.5 6.665 6.201 3 12 3z"/>
      </svg>
    </button>
  );
};

export default KakaoLogin;