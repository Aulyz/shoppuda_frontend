import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';

interface WishlistItem {
  id: number;
  product: {
    id: number;
    name: string;
    brand: string;
    price: number;
    sale_price: number | null;
    is_on_sale: boolean;
    main_image: string | null;
    slug: string;
  };
  created_at: string;
}

const Wishlist: React.FC = () => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('로그인이 필요합니다.');
      navigate('/login');
      return;
    }
    fetchWishlist();
  }, [isAuthenticated, navigate]);

  const fetchWishlist = async () => {
    try {
      const response = await api.getWishlist();
      if (response.status) {
        setWishlistItems(response.items);
      }
    } catch (error) {
      // Silently fail - don't log to console
      toast.error('위시리스트를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId: number) => {
    try {
      const response = await api.toggleWishlist(productId);
      
      if (response.status) {
        toast.success(response.message || '위시리스트에서 제거되었습니다.');
        fetchWishlist();
      }
    } catch (error) {
      // Silently fail - don't log to console
      toast.error('위시리스트에서 제거하는데 실패했습니다.');
    }
  };

  const addToCart = async (productId: number) => {
    try {
      const response = await api.addToCart({
        product_id: productId,
        quantity: 1
      });
      
      if (response.status) {
        toast.success('장바구니에 추가되었습니다.');
      }
    } catch (error) {
      // Silently fail - don't log to console
      toast.error('장바구니에 추가하는데 실패했습니다.');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  const calculateDiscountRate = (originalPrice: number, salePrice: number) => {
    return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center mb-8">
          <Heart className="w-8 h-8 text-red-500 mr-3" fill="currentColor" />
          <h1 className="text-3xl font-bold text-gray-900">위시리스트</h1>
          <span className="ml-4 px-3 py-1 bg-red-100 text-red-600 rounded-full text-sm font-medium">
            {wishlistItems.length}개 상품
          </span>
        </div>

        {wishlistItems.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-4">위시리스트가 비어있습니다.</p>
            <button
              onClick={() => navigate('/shop')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              쇼핑 계속하기
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistItems.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative aspect-square">
                  {item.product.main_image ? (
                    <img
                      src={item.product.main_image}
                      alt={item.product.name}
                      className="w-full h-full object-cover cursor-pointer"
                      onClick={() => navigate(`/product/${item.product.slug}`)}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400">이미지 없음</span>
                    </div>
                  )}
                  {item.product.is_on_sale && item.product.sale_price && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-sm font-bold">
                      {calculateDiscountRate(item.product.price, item.product.sale_price)}% OFF
                    </div>
                  )}
                  <button
                    onClick={() => removeFromWishlist(item.product.id)}
                    className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
                    title="위시리스트에서 제거"
                  >
                    <Trash2 className="w-5 h-5 text-red-500" />
                  </button>
                </div>
                
                <div className="p-4">
                  <p className="text-sm text-gray-500 mb-1">{item.product.brand}</p>
                  <h3 
                    className="font-medium text-gray-900 mb-2 cursor-pointer hover:text-blue-600 line-clamp-2"
                    onClick={() => navigate(`/product/${item.product.slug}`)}
                  >
                    {item.product.name}
                  </h3>
                  
                  <div className="mb-3">
                    {item.product.is_on_sale && item.product.sale_price ? (
                      <div>
                        <span className="text-gray-400 line-through text-sm">
                          ₩{formatPrice(item.product.price)}
                        </span>
                        <span className="text-lg font-bold text-red-500 ml-2">
                          ₩{formatPrice(item.product.sale_price)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-lg font-bold text-gray-900">
                        ₩{formatPrice(item.product.price)}
                      </span>
                    )}
                  </div>
                  
                  <button
                    onClick={() => addToCart(item.product.id)}
                    className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    장바구니 담기
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;