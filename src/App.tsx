import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from 'react-query'
import { Toaster } from 'react-hot-toast'
import { useEffect } from 'react'
import Layout from './components/Layout'
import Home from './pages/Home'
import ProductsAll from './pages/ProductsAll'
import ProductsBest from './pages/ProductsBest'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import MyPage from './pages/MyPage'
import QnA from './pages/QnA'
import ProductsNew from './pages/ProductsNew'
import ProductsSale from './pages/ProductsSale'
import { useAuthStore } from './store/authStore'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
})

// 카카오 로그인 처리 컴포넌트
function KakaoAuthHandler() {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  useEffect(() => {
    const handleKakaoAuth = async () => {
      console.log('=== KakaoAuthHandler 실행됨 ===');
      console.log('현재 URL:', window.location.href);

      // URL에서 코드 확인
      const fullUrl = window.location.href;
      const codeMatch = fullUrl.match(/[?&]code=([^&]+)/);
      const code = codeMatch ? decodeURIComponent(codeMatch[1]) : null;

      if (code) {
        console.log('✅ 홈페이지에서 카카오 코드 발견:', code.substring(0, 20) + '...');
        
        try {
          // 카카오에서 토큰 요청
          console.log('토큰 교환 시도...');
          const tokenResponse = await fetch('https://kauth.kakao.com/oauth/token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              grant_type: 'authorization_code',
              client_id: import.meta.env.VITE_KAKAO_APP_KEY,
              redirect_uri: 'http://localhost:3001',
              code: code,
            }),
          });

          if (tokenResponse.ok) {
            const tokenData = await tokenResponse.json();
            console.log('토큰 교환 성공:', tokenData);

            // 카카오 SDK 초기화 및 사용자 정보 요청
            if (window.Kakao && !window.Kakao.isInitialized()) {
              window.Kakao.init(import.meta.env.VITE_KAKAO_APP_KEY);
            }

            if (window.Kakao && tokenData.access_token) {
              window.Kakao.Auth.setAccessToken(tokenData.access_token);
              
              try {
                // SDK 2.x에서는 Promise 방식으로 API 호출
                const profileResponse = await window.Kakao.API.request({
                  url: '/v2/user/me'
                });
                
                console.log('사용자 정보 요청 성공:', profileResponse);
                
                // localStorage에 토큰 저장
                localStorage.setItem('kakao_access_token', tokenData.access_token);
                if (tokenData.refresh_token) {
                  localStorage.setItem('kakao_refresh_token', tokenData.refresh_token);
                }
                
                // 사용자 정보로 로그인 처리
                const profile = profileResponse;
                const kakaoAccount = profile.kakao_account;
                const profileInfo = kakaoAccount?.profile;
                
                const kakaoUser = {
                  id: profile.id,
                  username: profileInfo?.nickname || `kakao_${profile.id}`,
                  email: kakaoAccount?.email || '',
                  first_name: profileInfo?.nickname || '',
                  type: 'CUSTOMER' as const,
                  loginType: 'kakao' as const
                };
                
                console.log('로그인 처리:', kakaoUser);
                login(null, null, kakaoUser);
                
                // URL 정리하고 홈으로 이동
                window.history.replaceState({}, document.title, '/');
                console.log('✅ 카카오 로그인 완료!');
                
              } catch (apiError) {
                console.error('카카오 사용자 정보 요청 실패:', apiError);
              }
            }
          } else {
            const errorData = await tokenResponse.json();
            console.error('토큰 요청 실패:', errorData);
          }
        } catch (error) {
          console.error('카카오 로그인 처리 중 오류:', error);
        }
      }
    };

    handleKakaoAuth();
  }, [navigate, login]);

  return null;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <KakaoAuthHandler />
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/products" element={<ProductsAll />} />
            <Route path="/products/best" element={<ProductsBest />} />
            <Route path="/products/new" element={<ProductsNew />} />
            <Route path="/products/sale" element={<ProductsSale />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/mypage" element={<MyPage />} />
            <Route path="/qna" element={<QnA />} />
          </Routes>
        </Layout>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App