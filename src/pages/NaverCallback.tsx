import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { api } from '../services/api';

const NaverCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuthStore();

  useEffect(() => {
    const handleNaverCallback = async () => {
      try {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        if (error) {
          console.error('네이버 로그인 오류:', error, errorDescription);
          navigate('/login?error=naver_auth_failed');
          return;
        }

        if (!code || !state) {
          console.error('네이버 인가 코드 또는 state가 없습니다.');
          navigate('/login?error=missing_params');
          return;
        }

        // 백엔드에 네이버 로그인 요청
        const response = await api.naverLogin({ code, state });

        if (response.success) {
          // JWT 토큰과 사용자 정보 저장
          login(response.access, response.refresh, response.user);
          
          // 네이버 액세스 토큰도 저장
          if (response.naver_access_token) {
            localStorage.setItem('naver_access_token', response.naver_access_token);
          }

          // redirect 파라미터 처리
          const redirectUrl = searchParams.get('redirect') || '/';
          navigate(redirectUrl);
        } else {
          console.error('네이버 로그인 실패:', response.error);
          navigate('/login?error=naver_login_failed');
        }
      } catch (error) {
        console.error('네이버 로그인 처리 중 오류:', error);
        navigate('/login?error=naver_processing_failed');
      }
    };

    handleNaverCallback();
  }, [searchParams, navigate, login]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <h2 className="mt-6 text-2xl font-bold text-gray-900">네이버 로그인 처리 중...</h2>
          <p className="mt-2 text-sm text-gray-600">
            잠시만 기다려주세요.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NaverCallback;