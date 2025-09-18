import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export default function KakaoNameInput() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthStore();
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // URL 파라미터에서 토큰과 사용자 정보 가져오기
  const params = new URLSearchParams(location.search);
  const accessToken = params.get('access');
  const refreshToken = params.get('refresh');
  const userId = params.get('user_id');
  const username = params.get('username');
  const email = params.get('email');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('이름을 입력해주세요');
      return;
    }

    setIsLoading(true);

    try {
      // Django API로 이름 업데이트 요청
      const response = await fetch('http://192.168.0.5:8000/accounts/kakao/callback/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          first_name: name.trim()
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // 로그인 처리
        if (accessToken && refreshToken) {
          login(accessToken, refreshToken, {
            id: data.user.id,
            username: data.user.username,
            email: data.user.email,
            first_name: data.user.first_name,
            loginType: 'kakao'
          });
        }

        toast.success(`${name}님, 환영합니다!`);
        navigate('/');
      } else {
        throw new Error('이름 업데이트 실패');
      }
    } catch (error) {
      console.error('Name update error:', error);
      toast.error('이름 저장 중 오류가 발생했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-pink-50">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            환영합니다! 👋
          </h1>
          <p className="text-gray-600">
            쇼핑을 시작하기 전에 이름을 알려주세요
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              이름
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="홍길동"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              autoFocus
              required
            />
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">
              <span className="font-semibold">이메일:</span> {email}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              <span className="font-semibold">아이디:</span> {username}
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '저장 중...' : '시작하기'}
          </button>
        </form>
      </div>
    </div>
  );
}