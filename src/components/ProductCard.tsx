import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HeartIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { toast } from 'react-hot-toast';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';

interface ProductCardProps {
  product: {
    id: number;
    name: string;
    image?: string;
    price: string;
    discount_price?: string;
    slug?: string;
  };
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [isWished, setIsWished] = useState(false);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      checkWishlistStatus();
    }
  }, [product.id, isAuthenticated]);

  const checkWishlistStatus = async () => {
    try {
      const response = await api.checkWishlist(product.id);
      if (response.status) {
        setIsWished(response.is_wished);
      }
    } catch (error) {
      // Silently fail - don't log to console to avoid duplicate logs
      setIsWished(false);
    }
  };

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.info('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    if (loading) return;

    setLoading(true);
    try {
      const response = await api.toggleWishlist(product.id);
      if (response.status) {
        setIsWished(!isWished);
        toast.success(isWished ? '위시리스트에서 제거되었습니다.' : '위시리스트에 추가되었습니다.');
      }
    } catch (error) {
      toast.error('위시리스트 처리 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.info('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    try {
      const response = await api.addToCart({
        product_id: product.id,
        quantity: 1
      });

      if (response.status) {
        toast.success('장바구니에 추가되었습니다.');
      }
    } catch (error) {
      toast.error('장바구니 추가 중 오류가 발생했습니다.');
    }
  };

  const calculateDiscount = () => {
    if (product.discount_price) {
      const original = parseFloat(product.price);
      const discounted = parseFloat(product.discount_price);
      return Math.round(((original - discounted) / original) * 100);
    }
    return 0;
  };

  return (
    <Link
      to={`/product/${product.id}`}
      className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:z-10 relative"
    >
      {/* 상품 이미지 */}
      <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-t-2xl bg-gray-100 relative">
        <img
          src={product.image || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk0YTNiOCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuyggeygge2DnOydtOyngDwvdGV4dD48L3N2Zz4='}
          alt={product.name}
          className="h-64 w-full object-cover object-center group-hover:scale-110 transition-transform duration-300"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            if (target.src !== 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk0YTNiOCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuyggeygge2DnOydtOyngDwvdGV4dD48L3N2Zz4=') {
              target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk0YTNiOCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuyggeygge2DnOydtOyngDwvdGV4dD48L3N2Zz4=';
            }
          }}
        />
        
        {/* 할인 배지 */}
        {product.discount_price && (
          <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            {calculateDiscount()}% OFF
          </div>
        )}

        {/* 위시리스트 버튼 */}
        <button
          onClick={toggleWishlist}
          className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-all duration-200"
          title={isWished ? '위시리스트에서 제거' : '위시리스트에 추가'}
        >
          {isWished ? (
            <HeartSolidIcon className="h-5 w-5 text-red-500" />
          ) : (
            <HeartIcon className="h-5 w-5 text-gray-600 hover:text-red-500" />
          )}
        </button>

        {/* 장바구니 버튼 */}
        <button
          onClick={addToCart}
          className="absolute bottom-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-all duration-200 opacity-0 group-hover:opacity-100"
          title="장바구니에 추가"
        >
          <ShoppingBagIcon className="h-5 w-5 text-gray-600 hover:text-blue-600" />
        </button>
      </div>
      
      {/* 상품 정보 */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors duration-200">
          {product.name}
        </h3>
        <div className="flex items-center justify-between">
          <div>
            {product.discount_price ? (
              <div className="flex flex-col">
                <p className="text-lg font-bold text-orange-600">
                  ₩{parseFloat(product.discount_price).toLocaleString()}
                </p>
                <p className="text-sm text-gray-500 line-through">
                  ₩{parseFloat(product.price).toLocaleString()}
                </p>
              </div>
            ) : (
              <p className="text-lg font-bold text-gray-900">
                ₩{parseFloat(product.price).toLocaleString()}
              </p>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;