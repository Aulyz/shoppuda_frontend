import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from 'react-query'
import { Toaster } from 'react-hot-toast'
import { useEffect, useState } from 'react'
import Layout from './components/Layout'
import Home from './pages/Home'
import ProductsAll from './pages/ProductsAll'
import ProductsBest from './pages/ProductsBest'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import MyPage from './pages/MyPage'
import Wishlist from './pages/Wishlist'
import QnA from './pages/QnA'
import ProductsNew from './pages/ProductsNew'
import ProductsSale from './pages/ProductsSale'
import CategoryProducts from './pages/CategoryProducts'
import Orders from './pages/Orders'
import Support from './pages/Support'
import { useAuthStore } from './store/authStore'
import LoginSuccess from './pages/LoginSuccess'
import KakaoNameInput from './pages/KakaoNameInput'
import UserDebug from './components/UserDebug'
import RecentlyViewed from './components/RecentlyViewed'

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
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 이미 처리 중이면 중복 실행 방지
    if (isProcessing) return;
    
    // 이미 처리된 코드인지 확인
    const processedCodes = sessionStorage.getItem('kakao_processed_codes');
    const fullUrl = window.location.href;
    const codeMatch = fullUrl.match(/[?&]code=([^&]+)/);
    const code = codeMatch ? decodeURIComponent(codeMatch[1]) : null;

    if (!code) {
      console.log('No code found in URL');
      navigate('/login');
      return;
    }

    // 이미 처리된 코드면 스킵
    if (processedCodes && processedCodes.includes(code)) {
      console.log('Code already processed, skipping...');
      return;
    }

    const handleKakaoAuth = async () => {
      setIsProcessing(true);
      
      // 처리된 코드로 마킹
      const existingCodes = sessionStorage.getItem('kakao_processed_codes') || '';
      sessionStorage.setItem('kakao_processed_codes', existingCodes + ',' + code);

      try {
        console.log('Sending code to backend...');
        const response = await fetch(`http://shoppuda.kro.kr:8000/api/kakao/login/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            code: code,
            redirect_uri: import.meta.env.VITE_KAKAO_REDIRECT_URI || 'http://shoppuda.kro.kr:3000/kakao/callback'
          }),
        });

        const data = await response.json();
        console.log('Response:', response.status, data);

        if (response.ok && data.success) {
          // 로그인 성공
          const { login } = useAuthStore.getState();
          login(data.access, data.refresh, data.user);
          
          // 카카오 액세스 토큰도 저장
          if (data.kakao_access_token) {
            localStorage.setItem('kakao_access_token', data.kakao_access_token);
          }
          
          // 처리된 코드 목록 클리어
          sessionStorage.removeItem('kakao_processed_codes');
          
          console.log('Login successful, redirecting...');
          navigate('/');
          window.history.replaceState({}, document.title, '/');
        } else {
          setError(data.error || '카카오 로그인에 실패했습니다.');
          setTimeout(() => {
            sessionStorage.removeItem('kakao_processed_codes');
            navigate('/login');
          }, 2000);
        }
      } catch (err) {
        console.error('Kakao login error:', err);
        setError('카카오 로그인 중 오류가 발생했습니다.');
        setTimeout(() => {
          sessionStorage.removeItem('kakao_processed_codes');
          navigate('/login');
        }, 2000);
      }
    };

    handleKakaoAuth();
  }, []); // 한 번만 실행

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 to-pink-50">
      <div className="text-center p-8 bg-white rounded-lg shadow-lg">
        {error ? (
          <>
            <div className="text-red-500 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-gray-800 font-semibold">{error}</p>
            <p className="text-gray-500 text-sm mt-2">로그인 페이지로 이동합니다...</p>
          </>
        ) : (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600">카카오 로그인 처리 중...</p>
          </>
        )}
      </div>
    </div>
  );
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
            <Route path="/category/*" element={<CategoryProducts />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/mypage" element={<MyPage />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/qna" element={<QnA />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/support" element={<Support />} />
            <Route path="/recently-viewed" element={<RecentlyViewed />} />
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