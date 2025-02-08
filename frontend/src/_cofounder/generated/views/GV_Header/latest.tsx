import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch, logout, toggle_search_overlay, set_preferences } from '@/store/main';
import { FaSearch, FaShoppingCart, FaUser, FaBars, FaMicrophone } from 'react-icons/fa';
import './header.css'

const GV_Header: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();
  const { current_user, auth_token } = useSelector((state: RootState) => state.auth);
  const { items } = useSelector((state: RootState) => state.cart);
  const { language } = useSelector((state: RootState) => state.preferences);

  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const searchInputRef = useRef<HTMLInputElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(toggle_search_overlay());
    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
  };

  const handleVoiceSearch = () => {
    // Implement voice search functionality here
    console.log('Voice search triggered');
  };

  const handleLogout = () => {
    dispatch(logout());
    setUserMenuOpen(false);
    navigate('/');
  };

  const handleLanguageChange = (newLanguage: string) => {
    dispatch(set_preferences({ language: newLanguage }));
  };

  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="bg-white shadow-md fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <img src="https://picsum.photos/200" alt="SUBER-Craftex Logo" className="h-10 w-auto" />
          <span className="ml-2 text-xl font-bold text-gray-800">SUBER-Craftex</span>
        </Link>

        <nav className="hidden md:flex space-x-4">
          <Link to="/category/woodworking" className="text-gray-600 hover:text-gray-800">Woodworking</Link>
          <Link to="/category/apparel" className="text-gray-600 hover:text-gray-800">Apparel</Link>
          <Link to="/category/web-design" className="text-gray-600 hover:text-gray-800">Web Design</Link>
          <Link to="/category/automotive" className="text-gray-600 hover:text-gray-800">Automotive</Link>
          <Link to="/category/architecture" className="text-gray-600 hover:text-gray-800">Architecture</Link>
          <Link to="/category/interior" className="text-gray-600 hover:text-gray-800">Interior</Link>
        </nav>

        <div className="flex items-center space-x-4">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search designs..."
              className={`border rounded-full py-1 px-3 focus:outline-none focus:ring-2 focus:ring-blue-300 ${
                isSearchFocused ? 'w-64' : 'w-48'
              } transition-all duration-300`}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <FaSearch />
            </button>
            <button type="button" onClick={handleVoiceSearch} className="absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <FaMicrophone />
            </button>
          </form>

          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="text-gray-600 hover:text-gray-800 focus:outline-none"
            >
              <FaUser />
            </button>
            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1">
                {auth_token ? (
                  <>
                    <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Profile</Link>
                    <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Logout</button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Login</Link>
                    <Link to="/register" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Register</Link>
                  </>
                )}
              </div>
            )}
          </div>

          <Link to="/cart" className="text-gray-600 hover:text-gray-800 relative">
            <FaShoppingCart />
            {cartItemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                {cartItemCount}
              </span>
            )}
          </Link>

          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="border rounded py-1 px-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            <option value="en">EN</option>
            <option value="es">ES</option>
            <option value="fr">FR</option>
          </select>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-gray-600 hover:text-gray-800 focus:outline-none"
          >
            <FaBars />
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <nav className="md:hidden bg-white border-t py-2">
          <Link to="/category/woodworking" className="block px-4 py-2 text-gray-600 hover:bg-gray-100">Woodworking</Link>
          <Link to="/category/apparel" className="block px-4 py-2 text-gray-600 hover:bg-gray-100">Apparel</Link>
          <Link to="/category/web-design" className="block px-4 py-2 text-gray-600 hover:bg-gray-100">Web Design</Link>
          <Link to="/category/automotive" className="block px-4 py-2 text-gray-600 hover:bg-gray-100">Automotive</Link>
          <Link to="/category/architecture" className="block px-4 py-2 text-gray-600 hover:bg-gray-100">Architecture</Link>
          <Link to="/category/interior" className="block px-4 py-2 text-gray-600 hover:bg-gray-100">Interior</Link>
        </nav>
      )}
    </header>
  );
};

export default GV_Header;