import { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
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
      <Header2 /> {/* Header1 제거 */}
      
      <main className="flex-1">
        {children}
      </main>

      <Footer />
    </div>
  );
}

export default Layout;