import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
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
  const { data: categoriesData, error: categoriesError } = useQuery(
    'categories',
    () => api.getCategories(),
    {
      retry: 1,
      onError: () => {
        // 카테고리 조회 실패는 조용히 처리
      }
    }
  );

  // 카테고리 데이터
  const categories = categoriesData || [];

  // 상품 목록 조회
  const { data: productsData } = useQuery(
    'products-nav',
    () => api.getProducts({ page_size: 1000 })
  );

  // 최상위 카테고리만 필터링
  const topLevelCategories = useMemo(() => {
    if (!categories || categories.length === 0) return [];
    const categoryArray = Array.isArray(categories) ? categories : [];
    return categoryArray.filter((category: any) => 
      category.parent === null || category.parent === undefined
    );
  }, [categories]);

  // 카테고리별 상품 개수 계산
  const getCategoryProductCount = (category: Category): number => {
    if (!productsData?.products) return 0;
    
    // 현재 카테고리와 하위 카테고리의 ID들 수집
    const getCategoryAndDescendantIds = (cat: Category): number[] => {
      const ids = [cat.id];
      if (cat.children) {
        cat.children.forEach(child => {
          ids.push(...getCategoryAndDescendantIds(child));
        });
      }
      return ids;
    };
    
    const categoryIds = getCategoryAndDescendantIds(category);
    
    // 해당 카테고리에 속한 상품 개수 카운트
    return productsData.products.filter((product: any) => 
      categoryIds.includes(product.category.id)
    ).length;
  };

  // 카테고리의 URL 경로 생성 함수
  const getCategoryUrlPath = (category: Category): string => {
    // 카테고리 이름을 그대로 사용 (한글 포함)
    return `/category/${encodeURIComponent(category.name)}`;
  };

  const staticItems = [
    { name: '홈', href: '/', isStatic: true },
    { name: '카테고리', href: '/products', isStatic: true, hasDropdown: true },
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
              
              {/* 전체보기 카테고리 드롭다운 - 최상위 카테고리만 표시 */}
              {item.hasDropdown && topLevelCategories.length > 0 && hoveredCategory === -1 && (
                <div className="absolute top-full left-0 pt-2 z-50">
                  <div className="w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-3">
                    <div className="px-4 pb-2 mb-2 border-b border-gray-100">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">카테고리</p>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {topLevelCategories.map((category: Category) => (
                        <Link
                          key={category.id}
                          to={getCategoryUrlPath(category)}
                          className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-orange-50 hover:to-pink-50 hover:text-orange-600 transition-all duration-200 group"
                          onClick={() => setHoveredCategory(null)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <i className={`${category.icon || 'fas fa-folder'} text-xs group-hover:text-orange-500`}></i>
                              <span className="font-medium">{category.name}</span>
                            </div>
                            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                              {getCategoryProductCount(category)}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                    <div className="border-t border-gray-100 mt-2 pt-2">
                      <Link
                        to="/products"
                        className="block px-4 py-2 text-sm font-medium text-orange-600 hover:bg-orange-50 transition-colors"
                        onClick={() => setHoveredCategory(null)}
                      >
                        <div className="flex items-center justify-center space-x-2">
                          <span>모든 상품 보기</span>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </div>
                      </Link>
                    </div>
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