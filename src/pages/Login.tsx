import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { api } from '../services/api';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const loginData = {
      username,
      password,
      remember_me: rememberMe,
    };

    const searchParams = new URLSearchParams(location.search);
    const nextUrl = searchParams.get('next') || '/';

    try {
      const response = await api.login(loginData, nextUrl !== '/' ? nextUrl : undefined);

      if (response.status === 'OK') {
        // 로그인 성공 시 처리
        if (response.type && response.next_url) {
          // 사용자 타입 정보를 스토어에 저장 (필요시)
          login(null, null, {
            type: response.type,
            username: username,
          });
          
          // next_url로 리다이렉트
          navigate(response.next_url);
        } else {
          // 기본 메인 페이지로 리다이렉트
          navigate('/');
        }
      } else {
        setError(response.message || '로그인에 실패했습니다.');
      }
    } catch (err: any) {
      console.error("Login failed:", err);
      
      if (err?.response?.data?.status === 'ERROR') {
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
            <h1 className="text-5xl font-bold mb-4 tracking-tight drop-shadow-lg">쇼프다</h1>
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
                <a href="#" className="text-orange-600 hover:text-pink-600 transition-colors">
                  비밀번호 찾기
                </a>
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
                <button className="w-12 h-12 bg-yellow-400 hover:bg-yellow-500 rounded-full flex items-center justify-center transition-colors duration-200">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 0 1-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.866C1.5 6.665 6.201 3 12 3z"/>
                  </svg>
                </button>
                
                {/* 구글 로그인 */}
                <button className="w-12 h-12 bg-white hover:bg-gray-50 border border-gray-200 rounded-full flex items-center justify-center transition-colors duration-200">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                </button>
                
                {/* 네이버 로그인 */}
                <button className="w-12 h-12 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center transition-colors duration-200">
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M16.273 12.845L7.376 0H0v24h7.727V11.155L16.624 24H24V0h-7.727v12.845z"/>
                  </svg>
                </button>
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