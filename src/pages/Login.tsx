import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { api } from '../services/api';
import KakaoLogin from '../components/KakaoLogin';
import NaverLogin from '../components/NaverLogin';
import GoogleLogin from '../components/GoogleLogin';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthStore();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleKakaoSuccess = async (kakaoData: any) => {
    try {
      console.log('카카오 로그인 데이터:', kakaoData);
      
      // 카카오 토큰을 localStorage에 저장
      localStorage.setItem('kakao_access_token', kakaoData.accessToken);
      if (kakaoData.refreshToken) {
        localStorage.setItem('kakao_refresh_token', kakaoData.refreshToken);
      }
      
      // 카카오 프로필 정보 추출
      const profile = kakaoData.profile;
      const kakaoAccount = profile.kakao_account;
      const profileInfo = kakaoAccount?.profile;
      
      // 백엔드에 카카오 로그인 정보 전송하여 JWT 토큰 받기
      const response = await api.kakaoLogin({
        kakao_id: profile.id,
        email: kakaoAccount?.email || '',
        nickname: profileInfo?.nickname || ''
      });
      
      if (response.success) {
        // JWT 토큰과 사용자 정보 저장
        login(response.access, response.refresh, response.user);
        
        const searchParams = new URLSearchParams(location.search);
        const nextUrl = searchParams.get('next') || searchParams.get('redirect') || '/';
        navigate(nextUrl);
      } else {
        setError(response.error || '카카오 로그인에 실패했습니다.');
      }
    } catch (err: any) {
      console.error('카카오 로그인 처리 실패:', err);
      setError('카카오 로그인에 실패했습니다.');
    }
  };

  const handleKakaoFailure = (error: any) => {
    console.error('카카오 로그인 오류:', error);
    setError('카카오 로그인에 실패했습니다.');
  };

  const handleNaverSuccess = async (naverData: any) => {
    try {
      console.log('네이버 로그인 데이터:', naverData);
      
      // 네이버 토큰을 localStorage에 저장
      localStorage.setItem('naver_access_token', naverData.accessToken);
      if (naverData.refreshToken) {
        localStorage.setItem('naver_refresh_token', naverData.refreshToken);
      }
      
      // 백엔드에 네이버 로그인 정보 전송하여 JWT 토큰 받기
      const response = await api.naverLogin(naverData);
      
      if (response.success) {
        // JWT 토큰과 사용자 정보 저장
        login(response.access, response.refresh, response.user);
        
        const searchParams = new URLSearchParams(location.search);
        const nextUrl = searchParams.get('next') || searchParams.get('redirect') || '/';
        navigate(nextUrl);
      } else {
        setError(response.error || '네이버 로그인에 실패했습니다.');
      }
    } catch (err: any) {
      console.error('네이버 로그인 처리 실패:', err);
      setError('네이버 로그인에 실패했습니다.');
    }
  };

  const handleNaverFailure = (error: any) => {
    console.error('네이버 로그인 오류:', error);
    setError('네이버 로그인에 실패했습니다.');
  };

  const handleGoogleSuccess = async (googleData: any) => {
    try {
      console.log('구글 로그인 데이터:', googleData);
      
      // 구글 토큰을 localStorage에 저장
      localStorage.setItem('google_access_token', googleData.accessToken);
      if (googleData.refreshToken) {
        localStorage.setItem('google_refresh_token', googleData.refreshToken);
      }
      
      // 백엔드에 구글 로그인 정보 전송하여 JWT 토큰 받기
      const response = await api.googleLogin(googleData);
      
      if (response.success) {
        // JWT 토큰과 사용자 정보 저장
        login(response.access, response.refresh, response.user);
        
        const searchParams = new URLSearchParams(location.search);
        const nextUrl = searchParams.get('next') || searchParams.get('redirect') || '/';
        navigate(nextUrl);
      } else {
        setError(response.error || '구글 로그인에 실패했습니다.');
      }
    } catch (err: any) {
      console.error('구글 로그인 처리 실패:', err);
      setError('구글 로그인에 실패했습니다.');
    }
  };

  const handleGoogleFailure = (error: any) => {
    console.error('구글 로그인 오류:', error);
    setError('구글 로그인에 실패했습니다.');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const loginData = {
      username,
      password,
      remember_me: rememberMe,
    };

    const searchParams = new URLSearchParams(location.search);
    const nextUrl = searchParams.get('next') || searchParams.get('redirect') || '/';

    try {
      const response = await api.login(loginData, nextUrl !== '/' ? nextUrl : undefined);

      if (response.status === 'OK') {
        // JWT 토큰과 사용자 정보 저장
        login(response.access, response.refresh, response.user);
        
        // 리다이렉트 (프론트엔드에서 계산한 nextUrl 우선 사용)
        navigate(nextUrl);
      } else {
        setError(response.message || '로그인에 실패했습니다.');
      }
    } catch (err: any) {
      console.error("Login failed:", err);
      
      if (err?.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err?.response?.status === 405) {
        setError('잘못된 요청 방식입니다.');
      } else {
        setError('로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.');
      }
    }
  };

  return (
    <div className="bg-gradient-to-br from-orange-50 via-white to-pink-50 overflow-hidden" style={{height: 'calc(100vh - 70px)'}}>
      <div className="h-full flex">
        {/* 왼쪽 영역 - 브랜딩 */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-orange-400 via-orange-500 to-pink-500 items-center justify-center relative overflow-hidden">
          {/* 배경 패턴 */}
          <div className="absolute inset-0">
            {/* 그라데이션 오버레이 */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/90 via-orange-600/85 to-pink-600/90"></div>
            
            {/* 기하학적 패턴 */}
            <div className="absolute inset-0 opacity-20">
              {/* 큰 원들 */}
              <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-full"></div>
              <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-white/8 rounded-full"></div>
              <div className="absolute top-1/3 left-1/4 w-32 h-32 bg-white/15 rounded-full"></div>
              
              {/* 작은 장식 요소들 */}
              <div className="absolute top-20 right-32 w-4 h-4 bg-white/30 rotate-45"></div>
              <div className="absolute bottom-40 left-16 w-6 h-6 bg-white/25 rotate-45"></div>
              <div className="absolute top-1/2 right-16 w-3 h-3 bg-white/35 rounded-full"></div>
              <div className="absolute top-3/4 left-1/3 w-2 h-2 bg-white/40 rounded-full"></div>
            </div>
            
            {/* 그리드 패턴 */}
            <div className="absolute inset-0 opacity-5">
              <div className="h-full w-full" style={{
                backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
                backgroundSize: '40px 40px'
              }}></div>
            </div>
          </div>
          
          <div className="relative z-10 text-center text-white px-8">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-white/15 backdrop-blur-sm rounded-full mb-6 shadow-2xl">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-5xl font-bold mb-4 tracking-tight drop-shadow-lg">샵푸다</h1>
            <p className="text-xl opacity-95 font-light mb-2">해외가 가까워지는 순간</p>
            <div className="w-16 h-0.5 bg-white/60 mx-auto mt-6"></div>
          </div>
        </div>
        
        {/* 오른쪽 영역 - 로그인 폼 */}
        <div className="w-full lg:w-1/2 flex items-start justify-center pt-20 px-6 lg:px-12">
          <div className="max-w-sm w-full">
            <div className="text-center mb-6">
              <div className="lg:hidden inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-orange-400 to-pink-400 rounded-full mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent mb-1">
                로그인
              </h2>
              <p className="text-gray-500 text-sm">계정에 로그인하세요</p>
            </div>
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 mb-4">
                <div className="text-sm text-red-700 text-center">{error}</div>
              </div>
            )}
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">아이디</label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all duration-200"
                  placeholder="아이디를 입력하세요"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">비밀번호</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all duration-200"
                  placeholder="비밀번호를 입력하세요"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-orange-500 focus:ring-orange-400 border-gray-300 rounded"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <label htmlFor="remember-me" className="ml-2 text-gray-600">
                    로그인 상태 유지 (2주)
                  </label>
                </div>
                <Link to="/forgot-password" className="text-orange-600 hover:text-pink-600 transition-colors">
                  비밀번호 찾기
                </Link>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-orange-400 to-pink-400 text-white font-semibold py-2.5 rounded-lg hover:from-orange-500 hover:to-pink-500 focus:outline-none focus:ring-2 focus:ring-orange-400/50 transition-all duration-200"
              >
                로그인
              </button>
            </form>
            
            {/* 소셜 로그인 영역 */}
            <div className="pt-6">
              <div className="relative mb-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">간편로그인</span>
                </div>
              </div>
              
              <div className="flex justify-center space-x-4">
                {/* 카카오 로그인 */}
                <KakaoLogin 
                  onSuccess={handleKakaoSuccess}
                  onFailure={handleKakaoFailure}
                />
                
                {/* 구글 로그인 */}
                <GoogleLogin 
                  onSuccess={handleGoogleSuccess}
                  onFailure={handleGoogleFailure}
                />
                
                {/* 네이버 로그인 */}
                <NaverLogin 
                  onSuccess={handleNaverSuccess}
                  onFailure={handleNaverFailure}
                />
              </div>
            </div>
            
            <div className="text-center pt-4 mt-4 border-t border-gray-200">
              <span className="text-gray-600 text-sm">계정이 없으신가요? </span>
              <Link to="/signup" className="text-sm font-semibold text-orange-600 hover:text-pink-600 transition-colors">
                회원가입
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;