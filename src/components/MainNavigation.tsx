import { Link, useLocation } from 'react-router-dom';

const MainNavigation = () => {
  const location = useLocation();
  
  const navItems = [
    { name: 'All', href: '/products' },
    { name: 'Home', href: '/'},
    { name: 'Best', href: '/products/best'},
    { name: 'New', href: '/products/new' },
    { name: 'Sale', href: '/products/sale' },
    { name: 'Q&A', href: '/qna' }
  ];

  return (
    <nav className="max-w-screen-xl mx-auto bg-white/50 backdrop-blur-sm rounded-full mx-4 shadow-lg">
      <ul className="flex justify-center space-x-8 text-gray-600 text-base font-medium py-4">
        {navItems.map((item, index) => (
          <li key={index}>
            <Link 
              to={item.href!} 
              className={`px-4 py-2 rounded-full transition-all duration-300 hover:scale-105 ${
                location.pathname === item.href ? 'bg-gradient-to-r from-orange-400 to-pink-400 text-white shadow-lg' : 'hover:bg-orange-50 hover:text-orange-600'
              }`}
            >
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default MainNavigation;