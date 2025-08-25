import { ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCartIcon, UserIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { useAuthStore } from '../store/authStore'

interface LayoutProps {
  children: ReactNode
}

function Layout({ children }: LayoutProps) {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="text-2xl font-bold text-primary-600">
                Shopuda
              </Link>
              <nav className="ml-10 flex space-x-4">
                <Link to="/products" className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium">
                  상품
                </Link>
                <Link to="/products?category=new" className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium">
                  신상품
                </Link>
                <Link to="/products?category=best" className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium">
                  베스트
                </Link>
              </nav>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-600 hover:text-primary-600">
                <MagnifyingGlassIcon className="h-6 w-6" />
              </button>
              
              <Link to="/cart" className="p-2 text-gray-600 hover:text-primary-600 relative">
                <ShoppingCartIcon className="h-6 w-6" />
                {/* 장바구니 카운트 표시 */}
              </Link>
              
              {user ? (
                <div className="relative group">
                  <button className="p-2 text-gray-600 hover:text-primary-600">
                    <UserIcon className="h-6 w-6" />
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <Link to="/mypage" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      마이페이지
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      로그아웃
                    </button>
                  </div>
                </div>
              ) : (
                <Link to="/login" className="text-sm font-medium text-gray-700 hover:text-primary-600">
                  로그인
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 bg-gray-50">
        {children}
      </main>

      <footer className="bg-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Shopuda</h3>
              <p className="text-gray-400 text-sm">온라인 쇼핑의 새로운 경험</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-3">고객센터</h4>
              <p className="text-gray-400 text-sm">평일 09:00 - 18:00</p>
              <p className="text-gray-400 text-sm">주말 및 공휴일 휴무</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-3">회사</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">회사소개</a></li>
                <li><a href="#" className="hover:text-white">이용약관</a></li>
                <li><a href="#" className="hover:text-white">개인정보처리방침</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-3">팔로우</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">인스타그램</a></li>
                <li><a href="#" className="hover:text-white">페이스북</a></li>
                <li><a href="#" className="hover:text-white">유튜브</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-700 text-center text-sm text-gray-400">
            © 2024 Shopuda. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Layout