import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

const LoginSuccess = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  useEffect(() => {
    const processLogin = async () => {

      const access = params.get("access");
      const refresh = params.get("refresh");

      if (access && refresh) {
        try {
          // Django에서 사용자 정보 가져오기
          const userResponse = await fetch('http://shoppuda.kro.kr:8000/api/user/profile/', {
            headers: {
              'Authorization': `Bearer ${access}`,
            },
          });
          
          if (userResponse.ok) {
            const data = await userResponse.json();
            if (data.status && data.profile) {
              // 로그인 처리
              login(access, refresh, data.profile);
              
              toast.success(`${data.profile.first_name || data.profile.username}님, 환영합니다!`);
              navigate("/");
            }
          } else {
            // 사용자 정보를 가져올 수 없어도 토큰만으로 로그인
            login(access, refresh);
            navigate("/");
          }
        } catch (error) {
          // 에러가 발생해도 토큰만으로 로그인 시도
          login(access, refresh);
          navigate("/");
        }
      } else {
        // 토큰이 없으면 로그인 페이지로
        navigate("/login");
      }
    };

    processLogin();
  }, [params, login, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-pink-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">로그인 처리 중입니다...</p>
      </div>
    </div>
  );
};

export default LoginSuccess;
