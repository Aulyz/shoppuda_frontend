import React from 'react';
import { Link } from 'react-router-dom';
import OptimizedImage from './OptimizedImage';
import { useRecentProductsStore } from '../store/recentProductsStore';

const RecentlyViewed: React.FC = () => {
  const { getRecentProducts, clearAllProducts } = useRecentProductsStore();
  const recentProducts = getRecentProducts();

  const handleClearAll = () => {
    if (window.confirm('모든 최근 본 상품을 삭제하시겠습니까?')) {
      clearAllProducts();
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
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

  const getImageUrl = (product: any) => {
    if (product.main_image) return product.main_image;
    if (product.images && product.images.length > 0) return product.images[0].url;
    if (product.image) return product.image;
    return '/placeholder-image.jpg';
  };

  const getDisplayPrice = (product: any) => {
    if (product.sale_price && product.sale_price > 0) return product.sale_price;
    if (product.regular_price) return product.regular_price;
    return product.price || 0;
  };

  if (recentProducts.length === 0) {
    return null; // 홈페이지에서는 아무것도 표시하지 않음
  }

  return (
    <section className="py-8 sm:py-10 md:py-12 lg:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-800">
            최근 본 상품
          </h2>
          <button
            onClick={handleClearAll}
            className="text-sm text-gray-500 hover:text-red-500 transition-colors"
          >
            전체 삭제
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
          {recentProducts.slice(0, 5).map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group"
            >
              <Link to={`/product/${product.id}`}>
                <div className="relative w-full aspect-square bg-gray-50">
                  <OptimizedImage
                    src={getImageUrl(product)}
                    alt={product.name}
                    className="w-full h-full group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="flex justify-center gap-2">
                      <button className="bg-white/90 backdrop-blur px-3 py-1 rounded text-xs font-semibold hover:bg-white transition-colors">
                        WISH
                      </button>
                      <button className="bg-white/90 backdrop-blur px-3 py-1 rounded text-xs font-semibold hover:bg-white transition-colors">
                        ADD
                      </button>
                    </div>
                  </div>
                </div>
                <div className="px-3 sm:px-4 py-3 sm:py-4">
                  <h3 className="text-sm sm:text-base font-semibold text-gray-900 line-clamp-2 min-h-[2.5rem]">
                    {product.name}
                  </h3>
                  <div className="mt-2 text-base sm:text-lg font-bold text-gray-900">
                    {formatPrice(getDisplayPrice(product))}원
                  </div>
                  <div className="mt-1 text-xs text-gray-400">
                    {formatDate(product.viewedAt)}
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>

        {recentProducts.length > 5 && (
          <div className="text-center mt-8">
            <Link
              to="/recently-viewed"
              className="inline-flex items-center px-6 py-3 bg-gray-800 text-white rounded-full font-semibold hover:bg-gray-900 transition-colors duration-200"
            >
              더 많은 상품 보기
              <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default RecentlyViewed;

// 전체 최근 본 상품 페이지용 컴포넌트
export const RecentlyViewedFull: React.FC = () => {
  const { getRecentProducts, clearAllProducts } = useRecentProductsStore();
  const recentProducts = getRecentProducts();

  const handleRemoveItem = (productId: string | number) => {
    const { recentProducts: current } = useRecentProductsStore.getState();
    const filtered = current.filter(p => p.id !== productId);
    useRecentProductsStore.setState({ recentProducts: filtered });
  };

  const handleClearAll = () => {
    if (window.confirm('모든 최근 본 상품을 삭제하시겠습니까?')) {
      clearAllProducts();
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
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

  const getImageUrl = (product: any) => {
    if (product.main_image) return product.main_image;
    if (product.images && product.images.length > 0) return product.images[0].url;
    if (product.image) return product.image;
    return '/placeholder-image.jpg';
  };

  const getDisplayPrice = (product: any) => {
    if (product.sale_price && product.sale_price > 0) return product.sale_price;
    if (product.regular_price) return product.regular_price;
    return product.price || 0;
  };

  if (recentProducts.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
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
        {recentProducts.map((product) => (
          <div
            key={product.id}
            className="relative group bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow"
          >
            {/* 삭제 버튼 */}
            <button
              onClick={() => handleRemoveItem(product.id)}
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

            <Link to={`/product/${product.id}`}>
              {/* 상품 이미지 */}
              <div className="aspect-square overflow-hidden rounded-t-lg">
                <OptimizedImage
                  src={getImageUrl(product)}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                />
              </div>

              {/* 상품 정보 */}
              <div className="p-3">
                <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-2">
                  {product.name}
                </h3>
                <div className="text-sm font-bold text-gray-900 mb-2">
                  {formatPrice(getDisplayPrice(product))}원
                </div>
                <div className="text-xs text-gray-400">
                  {formatDate(product.viewedAt)}
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

// 사이드바용 미니 컴포넌트
export const RecentlyViewedMini: React.FC = () => {
  const { getRecentProducts } = useRecentProductsStore();
  const recentProducts = getRecentProducts();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  const getImageUrl = (product: any) => {
    if (product.main_image) return product.main_image;
    if (product.images && product.images.length > 0) return product.images[0].url;
    if (product.image) return product.image;
    return '/placeholder-image.jpg';
  };

  const getDisplayPrice = (product: any) => {
    if (product.sale_price && product.sale_price > 0) return product.sale_price;
    if (product.regular_price) return product.regular_price;
    return product.price || 0;
  };

  if (recentProducts.length === 0) {
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
        {recentProducts.slice(0, 5).map((product) => (
          <Link
            key={product.id}
            to={`/product/${product.id}`}
            className="flex items-center space-x-2 hover:bg-gray-50 p-1 rounded transition-colors"
          >
            <div className="w-12 h-12 flex-shrink-0">
              <OptimizedImage
                src={getImageUrl(product)}
                alt={product.name}
                className="w-full h-full object-cover rounded"
                sizes="48px"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-900 truncate">
                {product.name}
              </p>
              <p className="text-xs font-semibold text-orange-500">
                {formatPrice(getDisplayPrice(product))}원
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};