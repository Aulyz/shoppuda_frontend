export interface User {
  id: number
  username: string
  email: string
  first_name?: string
  last_name?: string
}

export interface Product {
  id: number
  name: string
  description: string
  price: number
  final_price: number
  discount_percentage: number
  category: string
  brand: string
  image?: string
  stock: number
  is_wishlisted?: boolean
  sizes?: string[]
  colors?: string[]
}

export interface CartItem {
  id: number
  product: Product
  quantity: number
  size?: string
  color?: string
}

export interface Order {
  id: number
  order_number: string
  status: string
  total_amount: number
  created_at: string
  items: OrderItem[]
  shipping_address: string
  billing_address?: string
}

export interface OrderItem {
  id: number
  product: Product
  quantity: number
  price: number
  size?: string
  color?: string
}

export interface WishlistItem {
  id: number
  product: Product
  created_at: string
}