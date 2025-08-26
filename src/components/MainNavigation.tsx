import { Link } from 'react-router-dom';

const MainNavigation = () => {
  const navItems = [
    { name: 'All', href: '/products' },
    { name: 'Best', href: '/products/best', active: true },
    { name: 'New', href: '/products/new' },
    { name: 'Sale', href: '/products/sale' },
    { name: 'Q&A', href: '/qna' }
  ];

  return (
    <nav className="max-w-screen-xl mx-auto">
      <ul className="flex justify-center space-x-8 text-gray-700 text-base font-medium py-2">
        {navItems.map((item, index) => (
          <li key={index}>
            <Link 
              to={item.href} 
              className={`hover:text-black transition-colors ${
                item.active ? 'border-b-2 border-orange-400 text-black pb-2' : ''
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