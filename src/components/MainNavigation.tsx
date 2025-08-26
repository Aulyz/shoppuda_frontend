const MainNavigation = () => {
  return (
    <nav className="max-w-screen-xl mx-auto">
      <ul className="flex justify-center space-x-8 text-gray-700 text-base font-medium py-2">
        <li><a href="#" className="hover:text-black">All</a></li>
        <li><a href="#" className="border-b-2 border-orange-400 text-black pb-2">Best</a></li>
        <li><a href="#" className="hover:text-black">New</a></li>
        <li><a href="#" className="hover:text-black">Sale</a></li>
        <li><a href="#" className="hover:text-black">Q&amp;A</a></li>
      </ul>
    </nav>
  );
};

export default MainNavigation;