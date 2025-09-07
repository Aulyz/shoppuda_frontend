import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { api } from '../services/api';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

interface Category {
  id: number;
  name: string;
  code: string;
  parent: number | null;
  full_path: string;
  icon: string;
  children: Category[];
}

const MainNavigation = () => {
  const location = useLocation();
  const [hoveredCategory, setHoveredCategory] = useState<number | null>(null);
  
  // 카테고리 목록 조회
  const { data: categoriesData } = useQuery(
    'categories',
    () => api.getCategories()
  );

  const staticItems = [
    { name: '홈', href: '/', isStatic: true },
    { name: '전체보기', href: '/products', isStatic: true },
    { name: '베스트', href: '/products/best', isStatic: true },
    { name: '신상품', href: '/products/new', isStatic: true },
    { name: '이벤트', href: '/products/sale', isStatic: true }
  ];

  return (
    <nav className="max-w-screen-xl mx-auto relative">
      <ul className="flex justify-center items-center space-x-6 text-gray-700 text-base font-medium py-2">
        {/* 정적 메뉴 아이템들 */}
        {staticItems.map((item, index) => (
          <li key={`static-${index}`}>
            <Link 
              to={item.href} 
              className={`pb-2 p-2 hover:text-black transition-colors ${
                location.pathname === item.href ? 'border-b-2 border-[#EF9F9F]' : ''
              }`}
            >
              {item.name}
            </Link>
          </li>
        ))}
        
        {/* 카테고리 드롭다운 */}
        {categoriesData?.categories?.slice(0, 5).map((category: Category) => (
          <li 
            key={category.id}
            className="relative group"
            onMouseEnter={() => setHoveredCategory(category.id)}
            onMouseLeave={() => setHoveredCategory(null)}
          >
            <Link 
              to={`/products?category=${encodeURIComponent(category.name)}`}
              className="pb-2 p-2 hover:text-black transition-colors flex items-center space-x-1"
            >
              <span>{category.name}</span>
              {category.children && category.children.length > 0 && (
                <ChevronDownIcon className="h-3 w-3" />
              )}
            </Link>
            
            {/* 하위 카테고리 드롭다운 */}
            {category.children && category.children.length > 0 && hoveredCategory === category.id && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                {category.children.map((child) => (
                  <Link
                    key={child.id}
                    to={`/products?category=${encodeURIComponent(child.name)}`}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      <i className={`${child.icon} text-xs`}></i>
                      <span>{child.name}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </li>
        ))}
        
        {/* Q&A 메뉴 */}
        <li>
          <Link 
            to="/qna" 
            className={`pb-2 p-2 hover:text-black transition-colors ${
              location.pathname === '/qna' ? 'border-b-2 border-[#EF9F9F]' : ''
            }`}
          >
            문의
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default MainNavigation;