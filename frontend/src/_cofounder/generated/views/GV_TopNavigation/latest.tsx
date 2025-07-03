import React, { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch, logout, toggle_search_overlay, set_preferences } from '@/store/main';
import { Search, ChevronDown, ShoppingCart, Menu, X } from 'lucide-react';
import {logo} from '@/images';


import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui';
import { relative } from 'path';

const GV_TopNavigation: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();
  const { current_user } = useSelector((state: RootState) => state.auth);
  const { count: notificationCount } = useSelector((state: RootState) => state.messages);
  const { items: cartItems } = useSelector((state: RootState) => state.cart);
  const { language } = useSelector((state: RootState) => state.preferences);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = useCallback(async () => {
    await dispatch(logout());
    navigate('/');
    
  }, [dispatch, navigate]);

  const handleLanguageChange = useCallback((newLanguage: string) => {
    dispatch(set_preferences({ language: newLanguage }));
  }, [dispatch]);

  const handleSearchClick = useCallback(() => {
    dispatch(toggle_search_overlay());
  }, [dispatch]);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
  }, []);

  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleLoginPopup = () => {
    dispatch(logout());
    setUserMenuOpen(false);
    navigate('/');
    window.location.reload();
  };

  const [isExploreOpen, setIsExploreOpen] = React.useState(false);


  return (
    <nav className=" bg-white shadow-md fixed top-0 left-0 right-0 z-50">
      <div className="navbersubContainer navbar max-w-7xl mx-auto px-4 sm:px-6 ">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center" style={{justifyContent: "center"}}>
            <Link to="/" className="flex-shrink-0">
              <img className="h-10 w-auto logoMain" src={logo} alt="SUBER-Craftex" />
            </Link>
            <div className="hidden md:block ml-10" style={{ color: "black" }}>
      <nav className="relative z-10 flex max-w-max flex-1 items-center justify-center">
        <ul className="group flex flex-1 list-none items-center justify-center space-x-1 parentNavLink">
          {/* Explore Designs Dropdown */}
          <li className="navbarLinks relative">
            <button
              onClick={() => setIsExploreOpen(!isExploreOpen)}
              className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-medium transition-colors hover:bg-neutral-100 hover:text-neutral-900 focus:bg-neutral-100 focus:text-neutral-900 focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-neutral-100/50 data-[state=open]:bg-neutral-100/50 dark:bg-neutral-950 dark:hover:bg-neutral-800 dark:hover:text-neutral-50 dark:focus:bg-neutral-800 dark:focus:text-neutral-50 dark:data-[active]:bg-neutral-800/50 dark:data-[state=open]:bg-neutral-800/50"
            >
              Explore Designs
              <ChevronDown
                className={`relative top-[1px] ml-1 h-3 w-3 transition duration-200 ${
                  isExploreOpen ? "rotate-180" : ""
                }`}
                aria-hidden="true"
              />
            </button>
            {isExploreOpen && (
              <div
                className="absolute left-0 top-full mt-1.5 w-full origin-top-center rounded-md border border-neutral-200 bg-white text-neutral-950 shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-90 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-50 md:w-auto"
                style={{  position: "absolute" }}
              >
                <div className="p-2">
                  <a
                    href="/explore"
                    className="block px-4 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    style={{ top: 0, position: "relative" }}
                  >
                    All Designs
                  </a>
                  <a
                    href="/explore/featured"
                    className="block px-4 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  >
                    Featured
                  </a>
                  <a
                    href="/explore/trending"
                    className="block px-4 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  >
                    Trending
                  </a>
                </div>
              </div>
            )}
          </li>

          {/* Other Navigation Links */}
          <li className="navbarLinks">
            <a
              href="/designers"
              className="inline-flex h-10 w-max items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-medium transition-colors hover:bg-neutral-100 hover:text-neutral-900 focus:bg-neutral-100 focus:text-neutral-900 focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-neutral-100/50 data-[state=open]:bg-neutral-100/50 dark:bg-neutral-950 dark:hover:bg-neutral-800 dark:hover:text-neutral-50 dark:focus:bg-neutral-800 dark:focus:text-neutral-50 dark:data-[active]:bg-neutral-800/50 dark:data-[state=open]:bg-neutral-800/50"
            >
              Designers
            </a>
          </li>
          <li className="navbarLinks">
            <a
              href="/projects"
              className="inline-flex h-10 w-max items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-medium transition-colors hover:bg-neutral-100 hover:text-neutral-900 focus:bg-neutral-100 focus:text-neutral-900 focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-neutral-100/50 data-[state=open]:bg-neutral-100/50 dark:bg-neutral-950 dark:hover:bg-neutral-800 dark:hover:text-neutral-50 dark:focus:bg-neutral-800 dark:focus:text-neutral-50 dark:data-[active]:bg-neutral-800/50 dark:data-[state=open]:bg-neutral-800/50"
            >
              Projects
            </a>
          </li>
          <li className="navbarLinks">
            <a
              href="/shop"
              className="inline-flex h-10 w-max items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-medium transition-colors hover:bg-neutral-100 hover:text-neutral-900 focus:bg-neutral-100 focus:text-neutral-900 focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-neutral-100/50 data-[state=open]:bg-neutral-100/50 dark:bg-neutral-950 dark:hover:bg-neutral-800 dark:hover:text-neutral-50 dark:focus:bg-neutral-800 dark:focus:text-neutral-50 dark:data-[active]:bg-neutral-800/50 dark:data-[state=open]:bg-neutral-800/50"
            >
              Shop
            </a>
          </li>
          <li className="navbarLinks">
            <a
              href="/learn"
              className="inline-flex h-10 w-max items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-medium transition-colors hover:bg-neutral-100 hover:text-neutral-900 focus:bg-neutral-100 focus:text-neutral-900 focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-neutral-100/50 data-[state=open]:bg-neutral-100/50 dark:bg-neutral-950 dark:hover:bg-neutral-800 dark:hover:text-neutral-50 dark:focus:bg-neutral-800 dark:focus:text-neutral-50 dark:data-[active]:bg-neutral-800/50 dark:data-[state=open]:bg-neutral-800/50"
            >
              Learn
            </a>
          </li>
          <li className="navbarLinks">
            <a
              href="/forums"
              className="inline-flex h-10 w-max items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-medium transition-colors hover:bg-neutral-100 hover:text-neutral-900 focus:bg-neutral-100 focus:text-neutral-900 focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-neutral-100/50 data-[state=open]:bg-neutral-100/50 dark:bg-neutral-950 dark:hover:bg-neutral-800 dark:hover:text-neutral-50 dark:focus:bg-neutral-800 dark:focus:text-neutral-50 dark:data-[active]:bg-neutral-800/50 dark:data-[state=open]:bg-neutral-800/50"
            >
              Community
            </a>
          </li>
        </ul>
      </nav>
    </div>
          </div>
          <div className="hidden md:flex items-center space-x-2">
          <div className="relative">
              <Input
                type="text"
                placeholder="Search"
                className="pl-10 pr-4 py-2 rounded-full border border-gray-300 bg-gray-100 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500"
              />
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 cursor-pointer"
                onClick={handleSearchClick}
              />
            </div>
            <Select value={language} onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-[100px] bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-md">
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 shadow-lg">
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="fr">Français</SelectItem>
              </SelectContent>
            </Select>
            {current_user ? (
              <div className="relative">

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <div className="cursor-pointer rounded-full overflow-hidden hover:ring-2 hover:ring-gray-300 transition">
      <Avatar className="w-10 h-10">
        <AvatarImage
          src={current_user?.profile_picture_url || "https://picsum.photos/seed/user/200"}
          alt={current_user?.full_name || "User"}
        />
        <AvatarFallback className="bg-gray-200 text-gray-600 font-bold uppercase">
          {current_user?.full_name?.charAt(0) || "U"}
        </AvatarFallback>
      </Avatar>
    </div>
  </DropdownMenuTrigger>

  <DropdownMenuContent
    align="end"
    className="w-48 bg-white text-black shadow-lg rounded-lg p-2 border border-gray-200"
    data-theme="light"
  >
    <DropdownMenuItem
      onClick={() => navigate("/profile")}
      className="px-3 py-2 rounded-md hover:bg-gray-100 transition"
    >
      Profile Settings
    </DropdownMenuItem>

    <DropdownMenuSeparator className="bg-gray-200" />

    <DropdownMenuItem
      onClick={handleLogout}
      className="px-3 py-2 rounded-md text-red-500 hover:bg-red-100 transition"
    >
      Logout
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
                {notificationCount > 0 && (
                  <Badge variant="destructive" className="absolute -top-1 -right-1">
                    {notificationCount}
                  </Badge>
                )}
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none hidden group-hover:block">
                  <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Profile</Link>
                  <Link to="/messages" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Messages
                    {notificationCount > 0 && <Badge variant="destructive" className="ml-2">{notificationCount}</Badge>}
                  </Link>
                  <Link to="/notifications" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Notifications</Link>
                  {current_user.role === 'designer' && (
                    <Link to="/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Dashboard</Link>
                  )}
                  <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Logout</button>
                </div>
              </div>
            ) : (
              <div className="space-x-2 naveLoginButtonContainer" style={{width:"12vw"}}>
                <Button onClick={handleLoginPopup} asChild variant="default">
                  <Link to='/' >Login</Link>
                </Button>
                <Button onClick={handleLoginPopup} asChild variant="outline" style={{color:'black'}}>
                  <Link to='/'>Sign Up</Link>
                </Button>
              </div>
            )}
            <Link to="/cart" className="relative">
              <ShoppingCart className="h-6 w-6 text-gray-600" />
              {cartItemCount > 0 && (
                <Badge variant="destructive" className="absolute -top-4 -right-1">
                  {cartItemCount}
                </Badge>
              )}
            </Link>
          </div>
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={toggleMobileMenu}>
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link to="/explore" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">Explore Designs</Link>
            <Link to="/designers" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">Designers</Link>
            <Link to="/projects" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">Projects</Link>
            <Link to="/shop" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">Shop</Link>
            <Link to="/learn" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">Learn</Link>
            <Link to="/forums" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">Community</Link>
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="flex items-center px-5">
              <div className="flex-shrink-0">
                <Avatar>
                  <AvatarImage src={current_user?.profile_picture_url || "https://picsum.photos/seed/user/200"} alt={current_user?.full_name} />
                  <AvatarFallback>{current_user?.full_name.charAt(0)}</AvatarFallback>
                </Avatar>
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-gray-800">{current_user?.full_name}</div>
                <div className="text-sm font-medium text-gray-500">{current_user?.email}</div>
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <Link to="/profile" className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100">Profile</Link>
              <Link to="/messages" className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100">
                Messages
                {notificationCount > 0 && <Badge variant="destructive" className="ml-2">{notificationCount}</Badge>}
              </Link>
              <Link to="/notifications" className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100">Notifications</Link>
              {current_user?.role === 'designer' && (
                <Link to="/dashboard" className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100">Dashboard</Link>
              )}
              {current_user ? (
                <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100">Logout</button>
              ) : (
                <>
                  <Link to="/login" className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100">Login</Link>
                  <Link to="/register" className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100">Sign Up</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default React.memo(GV_TopNavigation);