import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { MagnifyingGlassIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { api } from '../services/api';

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
  discount_price?: number;
  discount_percentage?: number;
  stock: number;
}

interface SearchFilters {
  minPrice?: number;
  maxPrice?: number;
  category?: string;
  sortBy?: 'price_asc' | 'price_desc' | 'name' | 'newest';
}

const SearchResults: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [products, setProducts] = useState<Product[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // 검색 실행
  useEffect(() => {
    if (query) {
      searchProducts();
    }
  }, [query, filters, currentPage]);

  // 카테고리 목록 가져오기
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.getCategories();
      setCategories(response.map((cat: any) => cat.name));
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const searchProducts = async () => {
    setIsLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        ...filters
      };
      
      const response = await api.searchProducts(query, params);
      setProducts(response.products || []);
      setTotalCount(response.total || 0);
    } catch (error) {
      console.error('Search failed:', error);
      setProducts([]);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (newFilters: SearchFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleSortChange = (sortBy: SearchFilters['sortBy']) => {
    handleFilterChange({ ...filters, sortBy });
  };

  const clearFilters = () => {
    setFilters({});
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 검색 헤더 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          '{query}' 검색 결과
        </h1>
        <p className="text-gray-600">
          {totalCount}개의 상품을 찾았습니다
        </p>
      </div>

      {/* 정렬 및 필터 버튼 */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <select
            value={filters.sortBy || 'newest'}
            onChange={(e) => handleSortChange(e.target.value as SearchFilters['sortBy'])}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="newest">최신순</option>
            <option value="price_asc">가격 낮은순</option>
            <option value="price_desc">가격 높은순</option>
            <option value="name">이름순</option>
          </select>
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <FunnelIcon className="w-5 h-5 mr-2" />
          필터
        </button>
      </div>

      {/* 필터 패널 */}
      {showFilters && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">필터</h3>
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              필터 초기화
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 카테고리 필터 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                카테고리
              </label>
              <select
                value={filters.category || ''}
                onChange={(e) => handleFilterChange({ ...filters, category: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">전체</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* 가격 범위 필터 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                최소 가격
              </label>
              <input
                type="number"
                value={filters.minPrice || ''}
                onChange={(e) => handleFilterChange({ ...filters, minPrice: e.target.value ? Number(e.target.value) : undefined })}
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                최대 가격
              </label>
              <input
                type="number"
                value={filters.maxPrice || ''}
                onChange={(e) => handleFilterChange({ ...filters, maxPrice: e.target.value ? Number(e.target.value) : undefined })}
                placeholder="999999999"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* 로딩 상태 */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* 검색 결과 */}
      {!isLoading && products.length > 0 && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <Link
                key={product.id}
                to={`/product/${product.id}`}
                className="group"
              >
                <div className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow overflow-hidden">
                  <div className="aspect-square bg-gray-100 overflow-hidden">
                    <img
                      src={product.image || '/placeholder.png'}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder.png';
                      }}
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-2">
                      {product.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <div>
                        {product.discount_price ? (
                          <>
                            <p className="text-xs text-gray-500 line-through">
                              {product.price.toLocaleString()}원
                            </p>
                            <p className="text-lg font-bold text-red-600">
                              {product.discount_price.toLocaleString()}원
                            </p>
                            {product.discount_percentage && (
                              <span className="text-xs text-red-600">
                                {product.discount_percentage}% 할인
                              </span>
                            )}
                          </>
                        ) : (
                          <p className="text-lg font-bold text-gray-900">
                            {product.price.toLocaleString()}원
                          </p>
                        )}
                      </div>
                    </div>
                    {product.stock === 0 && (
                      <p className="text-xs text-red-500 mt-2">품절</p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <nav className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 bg-white border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  이전
                </button>
                
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-2 rounded-md ${
                        currentPage === pageNum
                          ? 'bg-blue-600 text-white'
                          : 'bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 bg-white border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  다음
                </button>
              </nav>
            </div>
          )}
        </>
      )}

      {/* 검색 결과 없음 */}
      {!isLoading && products.length === 0 && (
        <div className="text-center py-12">
          <MagnifyingGlassIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            검색 결과가 없습니다
          </h2>
          <p className="text-gray-600 mb-6">
            다른 검색어를 시도해보거나 필터를 조정해보세요.
          </p>
          <Link
            to="/"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            홈으로 돌아가기
          </Link>
        </div>
      )}
    </div>
  );
};

export default SearchResults;