import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const LoginSuccess = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login); // ✅ login 함수 가져오기

  useEffect(() => {
    console.log("=== KakaoAuthHandler 실행됨 ===");
    console.log("현재 URL:", window.location.href);

    const access = params.get("access");
    const refresh = params.get("refresh");

    if (access && refresh) {
      // ✅ login 함수 호출 (setUser 대신)
      login(access, refresh);

      // 로컬스토리지 직접 저장도 가능
      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);

      navigate("/"); // 메인 페이지로 이동
    }
  }, [params, login, navigate]);

  return <div>로그인 중입니다...</div>;
};

export default LoginSuccess;
