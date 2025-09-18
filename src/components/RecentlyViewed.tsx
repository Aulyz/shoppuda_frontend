import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import OptimizedImage from './OptimizedImage';

interface Product {
  id: string;  // UUID로 변경
  name: string;
  slug?: string;
  selling_price: number;  // price -> selling_price로 변경
  discount_price?: number;
  thumbnail_url?: string;
  category_name: string;
}

interface RecentlyViewedItem {
  id: number;
  product: Product;
  viewed_at: string;
  view_count: number;
}

const RecentlyViewed: React.FC = () => {
  const [items, setItems] = useState<RecentlyViewedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRecentlyViewed();
  }, []);

  const fetchRecentlyViewed = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        'http://192.168.0.5:8000/products/api/recently-viewed/',
        {
          withCredentials: true, // 세션 쿠키 포함
        }
      );
      // response.data가 배열인지 확인
      const data = Array.isArray(response.data) ? response.data : [];
      setItems(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch recently viewed:', err);
      setError('최근 본 상품을 불러오는데 실패했습니다.');
      setItems([]); // 에러 시 빈 배열로 설정
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = async (productId: string) => {
    try {
      await axios.delete(
        `http://192.168.0.5:8000/products/api/recently-viewed/${productId}/delete/`,
        {
          withCredentials: true,
        }
      );
      // 목록에서 제거
      setItems(items.filter(item => item.product.id !== productId));
    } catch (err) {
      console.error('Failed to remove item:', err);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('모든 최근 본 상품을 삭제하시겠습니까?')) {
      return;
    }

    try {
      await axios.delete(
        'http://192.168.0.5:8000/products/api/recently-viewed/clear/',
        {
          withCredentials: true,
        }
      );
      setItems([]);
    } catch (err) {
      console.error('Failed to clear all:', err);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return '방금 전';
    if (diffMins < 60) return `${diffMins}분 전`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}시간 전`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}일 전`;
    
    return date.toLocaleDateString('ko-KR');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        {error}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 mb-4">
          최근 본 상품이 없습니다.
        </div>
        <Link 
          to="/shop" 
          className="inline-block px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
        >
          쇼핑 계속하기
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">최근 본 상품</h2>
        <button
          onClick={handleClearAll}
          className="text-sm text-gray-500 hover:text-red-500 transition-colors"
        >
          전체 삭제
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="relative group bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow"
          >
            {/* 삭제 버튼 */}
            <button
              onClick={() => handleRemoveItem(item.product.id)}
              className="absolute top-2 right-2 z-10 p-1 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
              title="삭제"
            >
              <svg
                className="w-4 h-4 text-gray-600 hover:text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <Link to={`/product/${item.product.id}`}>
              {/* 상품 이미지 */}
              <div className="aspect-square overflow-hidden rounded-t-lg">
                {item.product.thumbnail_url ? (
                  <img
                    src={item.product.thumbnail_url}
                    alt={item.product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <svg
                      className="w-12 h-12 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                )}
              </div>

              {/* 상품 정보 */}
              <div className="p-3">
                <div className="text-xs text-gray-500 mb-1">
                  {item.product.category_name}
                </div>
                <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-2">
                  {item.product.name}
                </h3>
                <div className="flex items-center justify-between">
                  <div>
                    {item.product.discount_price ? (
                      <>
                        <div className="text-xs text-gray-400 line-through">
                          {formatPrice(item.product.selling_price)}
                        </div>
                        <div className="text-sm font-bold text-orange-500">
                          {formatPrice(item.product.discount_price)}
                        </div>
                      </>
                    ) : (
                      <div className="text-sm font-bold text-gray-900">
                        {formatPrice(item.product.selling_price)}
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-400">
                  {formatDate(item.viewed_at)}
                  {item.view_count > 1 && ` · ${item.view_count}회 조회`}
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentlyViewed;

// 사이드바용 미니 컴포넌트
export const RecentlyViewedMini: React.FC = () => {
  const [items, setItems] = useState<RecentlyViewedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentlyViewed();
  }, []);

  const fetchRecentlyViewed = async () => {
    try {
      const response = await axios.get(
        'http://192.168.0.5:8000/products/api/recently-viewed/',
        {
          withCredentials: true,
        }
      );
      // response.data가 배열인지 확인
      const data = Array.isArray(response.data) ? response.data : [];
      setItems(data.slice(0, 10)); // 최대 10개만 표시
    } catch (err) {
      console.error('Failed to fetch recently viewed:', err);
      setItems([]); // 에러 시 빈 배열로 설정
    } finally {
      setLoading(false);
    }
  };

  if (loading || items.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-sm">최근 본 상품</h3>
        <Link
          to="/recently-viewed"
          className="text-xs text-orange-500 hover:text-orange-600"
        >
          전체보기
        </Link>
      </div>
      <div className="space-y-2">
        {items.map((item) => (
          <Link
            key={item.id}
            to={`/product/${item.product.id}`}
            className="flex items-center space-x-2 hover:bg-gray-50 p-1 rounded transition-colors"
          >
            <div className="w-12 h-12 flex-shrink-0">
              {item.product.thumbnail_url ? (
                <img
                  src={item.product.thumbnail_url}
                  alt={item.product.name}
                  className="w-full h-full object-cover rounded"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 rounded"></div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-900 truncate">
                {item.product.name}
              </p>
              <p className="text-xs font-semibold text-orange-500">
                {new Intl.NumberFormat('ko-KR').format(
                  item.product.discount_price || item.product.selling_price
                )}원
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};