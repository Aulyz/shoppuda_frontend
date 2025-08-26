import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { api } from '../services/api';

function Login() {
  // const [email, setEmail] = useState(''); // 이메일 상태 제거
  const [username, setUsername] = useState(''); // 아이디 상태 추가
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  // const { login } = useAuthStore(); // 필요시 사용

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 로그인 데이터 생성 - 아이디와 비밀번호 사용
    const loginData = {
      username, // 이메일에서 아이디로 변경
      password,
    };

    try {
      // 1. API를 통해 로그인 시도
      const response = await api.login(loginData);
      const { access: accessToken, refresh: refreshToken } = response;

      // 2. 성공 시 Zustand 스토어에 토큰과 사용자 정보 저장
      useAuthStore.getState().login(accessToken, refreshToken);

      // 3. 홈페이지 또는 이전 페이지로 리다이렉트
      navigate('/');
    } catch (err: any) {
      console.error("Login failed:", err);
      // 백엔드에서 보내는 에러 메시지 형식에 맞게 조정
      const errorMessage = err?.response?.data?.detail || err?.response?.data?.non_field_errors?.[0] || '로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.';
      setError(errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            계정에 로그인하세요
          </h2>
        </div>
        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <input type="hidden" name="remember" value="true" />
          <div className="rounded-md shadow-sm -space-y-px">
            {/* 이메일 입력 필드를 아이디 입력 필드로 변경 */}
            <div>
              <label htmlFor="username" className="sr-only">아이디</label>
              <input
                id="username"
                name="username"
                type="text" // 이메일 형식이 아니므로 type="text"
                // autoComplete="email" // 필요에 따라 조정
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="아이디"
                value={username} // value를 username으로 변경
                onChange={(e) => setUsername(e.target.value)} // onChange도 username으로 변경
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">비밀번호</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="비밀번호"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                로그인 상태 유지
              </label>
            </div>

            <div className="text-sm">
              <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                비밀번호를 잊으셨나요?
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              로그인
            </button>
          </div>
        </form>
        <div className="text-sm text-center">
          <span>계정이 없으신가요? </span>
          <Link to="/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
            회원가입
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;