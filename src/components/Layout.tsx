import { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import Header1 from './Header1';
import Header2 from './Header2';
import Footer from './Footer';

interface LayoutProps {
  children: ReactNode;
}

function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col font-[Pretendard]">
      {/* Header - 컴포넌트 사용 */}
      <Header1 />
      {/* Header2 - 컴포넌트 사용 */}
      <Header2 />

      <main className="flex-1">
        {children}
      </main>

      {/* Footer - 컴포넌트 사용 */}
      <Footer />
    </div>
  );
}

export default Layout;