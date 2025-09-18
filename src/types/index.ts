export interface User {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  avatar?: string;
  created_at: string;
  updated_at: string;
}

export interface LoginData {
  username: string;
  password: string;
}

export interface AuthResponse {
  user: User; // 로그인한 사용자의 전체 정보
  token: string; // 인증 토큰
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  final_price: number;
  discount_percentage: number;
  category: string;
  brand: string;
  image?: string;
  images?: string[];
  stock: number;
  is_wishlisted?: boolean;
  sizes?: string[];
  colors?: string[];
  rating?: number;
  review_count?: number;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: number;
  product: Product;
  quantity: number;
  size?: string;
  color?: string;
  added_at: string;
}

export interface Order {
  id: number;
  order_number: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total_amount: number;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
  shipping_address: string;
  billing_address?: string;
}

export interface OrderItem {
  id: number;
  product: Product;
  quantity: number;
  price: number;
  size?: string;
  color?: string;
}

export interface WishlistItem {
  id: number;
  product: Product;
  created_at: string;
}

// Navigation types
export type NavItemType = {
  name: string;
  href: string;
  active?: boolean;
};

// Dropdown states
export type DropdownType = 'customer' | 'profile';

// API Response types
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  status: number;
  success: boolean;
}

// Component Props types
export interface DropdownProps {
  isOpen: boolean;
  onToggle: (type: DropdownType, isOpen: boolean) => void;
  items: NavItemType[];
}