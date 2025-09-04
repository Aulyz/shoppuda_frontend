import { Link, useLocation } from 'react-router-dom';

const MainNavigation = () => {
  const location = useLocation();
  
  const navItems = [
    { name: 'All', koreanName: '전체보기', href: '/products' },
    { name: 'Home', koreanName: '메인', href: '/'},
    { name: 'Best', koreanName: '인기제품', href: '/products/best'},
    { name: 'New', koreanName: '신상품', href: '/products/new' },
    { name: 'Sale', koreanName: '이벤트', href: '/products/sale' },
    { name: 'Q&A', koreanName: '문의', href: '/qna' }
  ];

  return (
    <nav className="max-w-screen-xl mx-auto">
      <ul className="flex justify-center space-x-8 text-gray-700 text-base font-medium py-2">
        {navItems.map((item, index) => (
          <li key={index}>
            <Link 
              to={item.href!} 
              className={`pb-2 p-2 hover:text-black ${
                location.pathname === item.href ? 'border-b-2 border-[#EF9F9F]' : ''
              }`}
            >
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default MainNavigation;