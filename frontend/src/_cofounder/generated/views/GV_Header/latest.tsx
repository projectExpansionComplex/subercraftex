import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

// Importing necessary actions and types from Redux store
import { RootState, AppDispatch, logout, toggle_search_overlay, set_preferences } from '@/store/main';

// Importing icons from FontAwesome
import { FaSearch, FaShoppingCart, FaUser, FaBars, FaMicrophone } from 'react-icons/fa';

// Importing the component-specific styles
import './header.css';

// Importing the company logo
import logo from '../../../../images/logo/logo.svg';

// Functional component definition
const GV_Header: React.FC = () => {
  const dispatch: AppDispatch = useDispatch(); // Redux dispatcher to trigger actions
  const navigate = useNavigate(); // Hook for programmatic navigation in React Router

  // Extracting state from Redux store
  const { current_user, auth_token } = useSelector((state: RootState) => state.auth); // User authentication details
  const { items } = useSelector((state: RootState) => state.cart); // Items in the cart
  const { language } = useSelector((state: RootState) => state.preferences); // Selected language preference

  // Component state management
  const [isSearchFocused, setIsSearchFocused] = useState(false); // Tracks search bar focus state
  const [userMenuOpen, setUserMenuOpen] = useState(false); // Tracks whether the user menu is open
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false); // Tracks whether the mobile menu is open
  const [searchQuery, setSearchQuery] = useState(''); // Stores the current search query

  // Creating refs for DOM elements to detect outside clicks
  const searchInputRef = useRef<HTMLInputElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Effect to close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false); // Close user menu when clicking outside
      }
    };

    // Adding event listener for detecting outside clicks
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Function to handle search form submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Prevent page reload
    dispatch(toggle_search_overlay()); // Trigger Redux action to show search overlay
    navigate(`/search?q=${encodeURIComponent(searchQuery)}`); // Redirect to search results page
  };

  // Function to handle voice search (placeholder for future implementation)
  const handleVoiceSearch = () => {
    console.log('Voice search triggered'); // Log action (actual implementation can be added later)
  };

  // Function to handle user logout
  const handleLogout = () => {
    dispatch(logout()); // Trigger logout action in Redux
    setUserMenuOpen(false); // Close user menu
    navigate('/'); // Redirect to home page
  };

  // Function to change language preference
  const handleLanguageChange = (newLanguage: string) => {
    dispatch(set_preferences({ language: newLanguage })); // Dispatch language change to Redux store
  };

  // Calculate total cart item count
  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Function to trigger login popup (reloads page)
  const handleLoginPopup = () => {
    dispatch(logout()); // Clear user session (optional, depends on authentication flow)
    setUserMenuOpen(false); // Close menu
    navigate('/'); // Redirect to home
    window.location.reload(); // Refresh page to show login modal
  };

  return (
    <header className="bg-white shadow-md fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between bg-white text-gray-900">
        
        {/* Logo Section */}
        <Link to="/" className="flex items-center">
          <img src={logo} alt="SUBER-Craftex Logo" className="h-10 w-auto" />
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex space-x-4 outsideNavebarMobile">
          <Link to="/category/woodworking" className="text-gray-600 hover:text-gray-800">Woodworking</Link>
          <Link to="/category/apparel" className="text-gray-600 hover:text-gray-800">Apparel</Link>
          <Link to="/category/web-design" className="text-gray-600 hover:text-gray-800">Web Design</Link>
          <Link to="/category/automotive" className="text-gray-600 hover:text-gray-800">Automotive</Link>
          <Link to="/category/architecture" className="text-gray-600 hover:text-gray-800">Architecture</Link>
          <Link to="/category/interior" className="text-gray-600 hover:text-gray-800">Interior</Link>
        </nav>

        {/* Right-side Header Actions */}
        <div className="flex items-center space-x-4 loginContainer">
          
          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search designs..."
              className={`border rounded-full py-1 px-3 focus:outline-none focus:ring-2 focus:ring-blue-300 ${
                isSearchFocused ? 'w-64' : 'w-48'
              } transition-all duration-300`}
              style={{color:'white'}}
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

          {/* User Account Menu */}
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
                    <Link onClick={handleLoginPopup} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Login</Link>
                    <Link onClick={handleLoginPopup} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Register</Link>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Shopping Cart */}
          <Link to="/cart" className="text-gray-600 hover:text-gray-800 relative">
            <FaShoppingCart />
            {cartItemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                {cartItemCount}
              </span>
            )}
          </Link>

          {/* Language Selector */}
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="border rounded py-1 px-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
            style={{color:'white'}}
          >
            <option value="en">EN</option>
            <option value="es">ES</option>
            <option value="fr">FR</option>
          </select>
        </div>
      </div>
    </header>
  );
};

export default GV_Header;
