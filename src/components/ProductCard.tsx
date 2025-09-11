import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HeartIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { toast } from 'react-hot-toast';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import OptimizedImage from './OptimizedImage';

interface ProductCardProps {
  product: {
    id: string | number;
    name: string;
    image?: string;
    thumbnail?: string;
    price: string | number;
    discount_price?: string | number;
    discount_percentage?: number;
    slug?: string;
    stock?: number;
    stock_quantity?: number;
    is_new?: boolean;
    is_best?: boolean;
    is_featured?: boolean;
    brand?: string | null;
    brand_name?: string;
    short_description?: string;
    category?: {
      id: number;
      name: string;
      code: string;
    } | string;
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
    if (product.discount_percentage) {
      return product.discount_percentage;
    }
    if (product.discount_price) {
      const original = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
      const discounted = typeof product.discount_price === 'string' ? parseFloat(product.discount_price) : product.discount_price;
      return Math.round(((original - discounted) / original) * 100);
    }
    return 0;
  };

  return (
    <Link
      to={product.slug ? `/product/${product.slug}` : `/product/${product.id}`}
      className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:z-10 relative"
    >
      {/* 상품 이미지 */}
      <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-t-2xl bg-gray-100 relative">
        <OptimizedImage
          src={product.image || product.thumbnail || ''}
          alt={product.name}
          className="h-64 w-full group-hover:scale-110 transition-transform duration-300"
          width={256}
          height={256}
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
          priority={false}
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
        {/* 브랜드 명 */}
        {(product.brand || product.brand_name) && (
          <p className="text-xs text-gray-500 mb-1">
            {product.brand_name || product.brand}
          </p>
        )}
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors duration-200">
          {product.name}
        </h3>
        <div className="flex items-center justify-between">
          <div>
            {product.discount_price ? (
              <div className="flex flex-col">
                <p className="text-lg font-bold text-orange-600">
                  ₩{(typeof product.discount_price === 'string' ? parseFloat(product.discount_price) : product.discount_price).toLocaleString()}
                </p>
                <p className="text-sm text-gray-500 line-through">
                  ₩{(typeof product.price === 'string' ? parseFloat(product.price) : product.price).toLocaleString()}
                </p>
              </div>
            ) : (
              <p className="text-lg font-bold text-gray-900">
                ₩{(typeof product.price === 'string' ? parseFloat(product.price) : product.price).toLocaleString()}
              </p>
            )}
          </div>
        </div>
        
        {/* 재고 상태 */}
        {(product.stock === 0 || product.stock_quantity === 0) && (
          <p className="text-xs text-red-500 mt-2">품절</p>
        )}
        {((product.stock && product.stock > 0 && product.stock <= 5) || 
          (product.stock_quantity && product.stock_quantity > 0 && product.stock_quantity <= 5)) && (
          <p className="text-xs text-orange-500 mt-2">
            재고 {product.stock || product.stock_quantity}개 남음
          </p>
        )}
        
        {/* 배지 */}
        <div className="flex gap-2 mt-2">
          {product.is_new && (
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">NEW</span>
          )}
          {product.is_best && (
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">BEST</span>
          )}
          {product.is_featured && (
            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">추천</span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;