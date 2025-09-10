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

  // 최상위 카테고리만 필터링
  const topLevelCategories = categoriesData?.categories?.filter((category: Category) => 
    category.parent === null
  ) || [];

  // 카테고리의 URL-safe 코드 생성 함수
  const getCategoryUrlCode = (category: Category): string => {
    // API에서 code가 있으면 사용하고, 없으면 name을 기반으로 생성
    if (category.code && category.code !== '') {
      return category.code.replace(/^_/, 'cat'); // "_1" -> "cat1"
    }
    
    // code가 없거나 빈 문자열이면 name을 URL-safe하게 변환
    return category.name.toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-가-힣]/g, '')
      .replace(/^-+|-+$/g, ''); // 앞뒤 하이픈 제거
  };

  const staticItems = [
    { name: '홈', href: '/', isStatic: true },
    { name: '전체보기', href: '/products', isStatic: true, hasDropdown: true },
    { name: '베스트', href: '/products/best', isStatic: true },
    { name: '신상품', href: '/products/new', isStatic: true },
    { name: '이벤트', href: '/products/sale', isStatic: true }
  ];

  return (
    <nav className="max-w-screen-xl mx-auto relative">
      <ul className="flex justify-center items-center space-x-6 text-gray-700 text-base font-medium py-2">
        {/* 정적 메뉴 아이템들 */}
        {staticItems.map((item, index) => (
          <li 
            key={`static-${index}`}
            className={item.hasDropdown ? "relative" : ""}
          >
            <div
              className={item.hasDropdown ? "relative" : ""}
              onMouseEnter={item.hasDropdown ? () => setHoveredCategory(-1) : undefined}
              onMouseLeave={item.hasDropdown ? () => setHoveredCategory(null) : undefined}
            >
              <Link 
                to={item.href} 
                className={`pb-2 p-2 hover:text-black transition-colors flex items-center space-x-1 ${
                  location.pathname === item.href ? 'border-b-2 border-[#EF9F9F]' : ''
                }`}
              >
                <span>{item.name}</span>
                {item.hasDropdown && (
                  <ChevronDownIcon className="h-3 w-3" />
                )}
              </Link>
              
              {/* 전체보기 카테고리 드롭다운 */}
              {item.hasDropdown && topLevelCategories.length > 0 && hoveredCategory === -1 && (
                <div className="absolute top-full left-0 pt-2 z-50">
                  <div className="w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                    {topLevelCategories.map((category: Category) => (
                      <Link
                        key={category.id}
                        to={`/products/${getCategoryUrlCode(category)}`}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                        onClick={() => setHoveredCategory(null)}
                      >
                        <div className="flex items-center space-x-2">
                          <i className={`${category.icon} text-xs`}></i>
                          <span>{category.name}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
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