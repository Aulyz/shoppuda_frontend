import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';

const MainNavigation = () => {
  const location = useLocation();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  
  const navItems = [
    { name: 'All', koreanName: '전체보기', href: '/products' },
    { name: 'Home', koreanName: '메인', href: '/'},
    { name: 'Best', koreanName: '인기제품', href: '/products/best'},
    { name: 'New', koreanName: '신상품', href: '/products/new' },
    { name: 'Sale', koreanName: '이벤트', href: '/products/sale' },
    { name: 'Q&A', koreanName: '문의', href: '/qna' }
  ];

  return (
    <nav className="max-w-screen-xl mx-auto bg-white/50 backdrop-blur-sm rounded-full mx-4 shadow-lg">
      <ul className="flex justify-center space-x-4 text-gray-600 text-base font-medium py-4">
        {navItems.map((item, index) => (
          <li key={index}>
            <Link 
              to={item.href!} 
              className={`inline-block px-4 py-2 rounded-full transition-all duration-300 hover:scale-105 ${
                location.pathname === item.href ? 'bg-gradient-to-r from-orange-400 to-pink-400 text-white shadow-lg' : 'hover:bg-orange-50 hover:text-orange-600'
              }`}
              onMouseEnter={() => setHoveredItem(item.name)}
              onMouseLeave={() => setHoveredItem(null)}
              style={{ minWidth: '100px' }}
            >
              <span className="inline-block text-center w-full">
                {hoveredItem === item.name ? item.koreanName : item.name}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default MainNavigation;