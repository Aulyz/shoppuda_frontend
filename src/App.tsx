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
import Wishlist from './pages/Wishlist'
import QnA from './pages/QnA'
import ProductsNew from './pages/ProductsNew'
import ProductsSale from './pages/ProductsSale'
import { useAuthStore } from './store/authStore'
import LoginSuccess from './pages/LoginSuccess'
import KakaoNameInput from './pages/KakaoNameInput'
import UserDebug from './components/UserDebug'

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
          // 1. 먼저 카카오에서 직접 토큰 받기
          const tokenResponse = await fetch('https://kauth.kakao.com/oauth/token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              grant_type: 'authorization_code',
              client_id: import.meta.env.VITE_KAKAO_APP_KEY,
              redirect_uri: import.meta.env.VITE_KAKAO_REDIRECT_URI,
              code: code,
            }),
          });

          if (!tokenResponse.ok) {
            throw new Error('Failed to get Kakao token');
          }

          const tokenData = await tokenResponse.json();
          console.log('Kakao token response:', tokenData);

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
          console.log('Kakao user data:', userData);

          // 3. Django 백엔드로 카카오 정보 전송
          const response = await fetch(`http://shoppuda.kro.kr:8000/accounts/kakao/callback/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              kakao_id: userData.id,
              email: userData.kakao_account?.email,
              nickname: userData.kakao_account?.profile?.nickname,
              access_token: tokenData.access_token,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            console.log('Django response:', data);
            
            // 이름 입력이 필요한 경우
            if (data.require_name) {
              navigate(`/kakao/name-input?access=${data.access}&refresh=${data.refresh}&user_id=${data.user.id}&username=${data.user.username}&email=${data.user.email}`);
            } else if (data.success) {
              // 로그인 성공
              login(data.access, data.refresh, data.user);
              
              // 로컬 스토리지에 카카오 토큰도 저장
              localStorage.setItem('kakao_access_token', tokenData.access_token);
              if (tokenData.refresh_token) {
                localStorage.setItem('kakao_refresh_token', tokenData.refresh_token);
              }
              
              navigate('/');
              window.history.replaceState({}, document.title, '/');
            }
          } else if (response.redirected) {
            // Django에서 리다이렉트된 경우
            const redirectUrl = response.url;
            const urlParams = new URLSearchParams(redirectUrl.split('?')[1]);
            const access = urlParams.get('access');
            const refresh = urlParams.get('refresh');
            
            if (access && refresh) {
              // Django에서 사용자 정보 가져오기
              const userResponse = await fetch('http://shoppuda.kro.kr:8000/api/user/profile/', {
                headers: {
                  'Authorization': `Bearer ${access}`,
                },
              });
              
              if (userResponse.ok) {
                const data = await userResponse.json();
                if (data.status && data.profile) {
                  login(access, refresh, data.profile);
                  navigate('/');
                }
              }
            }
          } else {
            throw new Error('Failed to authenticate with Kakao');
          }

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
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/qna" element={<QnA />} />
            <Route path="/kakao/callback" element={<KakaoAuthHandler />} />
            <Route path="/login/success" element={<LoginSuccess />} />
            <Route path="/kakao/name-input" element={<KakaoNameInput />} />
          </Routes>
        </Layout>
        <UserDebug />
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