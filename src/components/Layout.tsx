import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import Header2 from './Header2';
import Footer from './Footer';

interface LayoutProps {
  children: ReactNode;
}

function Layout({ children }: LayoutProps) {
  const location = useLocation();

  // 홈페이지인지 확인
  const isHomePage = location.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col font-[Pretendard]">
      {/* 조건부 sticky */}
      <div className={isHomePage ? "sticky top-0 z-50 bg-white border-b" : "bg-white border-b"}>
        <Header2 />
      </div>
      
      <main className="flex-1">
        {children}
      </main>

      <Footer />
    </div>
  );
}

export default Layout;