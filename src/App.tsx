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
      const fullUrl = window.location.href;
      const codeMatch = fullUrl.match(/[?&]code=([^&]+)/);
      const code = codeMatch ? decodeURIComponent(codeMatch[1]) : null;

      if (code) {
        try {
          // 1. 카카오 토큰 요청
          const tokenResponse = await fetch('https://kauth.kakao.com/oauth/token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              grant_type: 'authorization_code',
              client_id: import.meta.env.VITE_KAKAO_APP_KEY,
              redirect_uri: 'http://localhost:3001/kakao/callback',
              code: code,
            }),
          });

          if (!tokenResponse.ok) {
            throw new Error('Failed to get Kakao token');
          }

          const tokenData = await tokenResponse.json();

          // 2. 카카오 사용자 정보 요청
          const userResponse = await fetch('https://kapi.kakao.com/v2/user/me', {
            headers: {
              Authorization: `Bearer ${tokenData.access_token}`,
              'Content-Type': 'application/json',
            },
          });

          if (!userResponse.ok) {
            throw new Error('Failed to get Kakao user info');
          }

          const userData = await userResponse.json();

          // 3. 백엔드로 전송할 사용자 데이터 구성
          const kakaoUser = {
            id: userData.id,
            username: userData.kakao_account?.profile?.nickname || `user${userData.id}`,
            email: userData.kakao_account?.email || '',
            profileImage: userData.kakao_account?.profile?.profile_image_url,
            type: "CUSTOMER" as "CUSTOMER",
            loginType: "kakao" as "kakao"
          };

          // 4. 로그인 처리
          login(null, null, kakaoUser);
          
          // 5. 토큰 저장
          localStorage.setItem('kakao_access_token', tokenData.access_token);
          if (tokenData.refresh_token) {
            localStorage.setItem('kakao_refresh_token', tokenData.refresh_token);
          }

          // 6. 홈으로 리다이렉트
          navigate('/');
          window.history.replaceState({}, document.title, '/');

        } catch (error) {
          console.error('Kakao login error:', error);
          navigate('/login');
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
            <Route path="/kakao/callback" element={<KakaoAuthHandler />} />
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