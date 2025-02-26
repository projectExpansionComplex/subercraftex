import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch, set_connection_status } from '@/store/main';

// Global Shared Views
import GV_TopNavigation from '@/components/views/GV_TopNavigation';
import GV_Footer from '@/components/views/GV_Footer';
import GV_AuthModal from '@/components/views/GV_AuthModal';
import GV_Notifications from '@/components/views/GV_Notifications';
import GV_SearchOverlay from '@/components/views/GV_SearchOverlay';
import GV_Header from '@/components/views/GV_Header';

// Unique Views
import UV_Homepage from '@/components/views/UV_Homepage';
import UV_ExploreDesigns from '@/components/views/UV_ExploreDesigns';
import UV_DesignDetail from '@/components/views/UV_DesignDetail';
import UV_DesignerListing from '@/components/views/UV_DesignerListing';
import UV_DesignerProfile from '@/components/views/UV_DesignerProfile';
import UV_UserProfile from '@/components/views/UV_UserProfile';
import UV_ProjectPosting from '@/components/views/UV_ProjectPosting';
import UV_ProjectListing from '@/components/views/UV_ProjectListing';
import UV_ProjectDetail from '@/components/views/UV_ProjectDetail';
import UV_Shop from '@/components/views/UV_Shop';
import UV_ShoppingCart from '@/components/views/UV_ShoppingCart';
import UV_Checkout from '@/components/views/UV_Checkout';
import UV_OrderConfirmation from '@/components/views/UV_OrderConfirmation';
import UV_DesignChallenges from '@/components/views/UV_DesignChallenges';
import UV_CommunityForums from '@/components/views/UV_CommunityForums';
import UV_LearningCenter from '@/components/views/UV_LearningCenter';
import UV_LiveEvents from '@/components/views/UV_LiveEvents';
import UV_AdminDashboard from '@/components/views/UV_AdminDashboard';
import UV_CategoryListing from '@/components/views/UV_CategoryListing';
import UV_ProductDetail from '@/components/views/UV_ProductDetail';
import UV_DesignInspiration from '@/components/views/UV_DesignInspiration';
import UV_CustomDesignRequest from '@/components/views/UV_CustomDesignRequest';
import UV_CommunityForum from '@/components/views/UV_CommunityForum';
import UV_VirtualShowroom from '@/components/views/UV_VirtualShowroom';
import UV_OrderTracking from '@/components/views/UV_OrderTracking';
import UV_SustainabilityHub from '@/components/views/UV_SustainabilityHub';
import UV_Login from '@/components/views/UV_Login';

const App: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const { current_user, auth_token } = useSelector((state: RootState) => state.auth);
  const { is_search_overlay_open } = useSelector((state: RootState) => state.ui);
  const { theme, language } = useSelector((state: RootState) => state.preferences);
  
  useEffect(() => {
    // Initialize WebSocket connection
    dispatch({ type: 'web_socket_connection/connect' });

    // Clean up WebSocket connection on unmount
    return () => {
      dispatch(set_connection_status('disconnected'));
    };
  }, [dispatch]);

  useEffect(() => {
    // Apply theme
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    // Apply language
    document.documentElement.lang = language;
  }, [language]);

  const isAuthenticated = !!auth_token;
  const isAdmin = current_user?.role === 'admin';

  return (
   
      <div className={`App ${theme}`}>
      
        <GV_Header />
        <GV_TopNavigation />
        
        {is_search_overlay_open && <GV_SearchOverlay />}
        
        <main className="min-h-screen">
          <Routes>
            <Route path="/" element={<UV_Homepage />} />
            <Route path="/explore" element={<UV_ExploreDesigns />} />
            <Route path="/design/:design_uid" element={<UV_DesignDetail />} />
            <Route path="/designers" element={<UV_DesignerListing />} />
            <Route path="/designer/:designer_uid" element={<UV_DesignerProfile />} />
            <Route path="/profile" element={isAuthenticated ? <UV_UserProfile /> : <Navigate to="/login" />} />
            <Route path="/post-project" element={isAuthenticated ? <UV_ProjectPosting /> : <Navigate to="/login" />} />
            <Route path="/projects" element={<UV_ProjectListing />} />
            <Route path="/project/:project_uid" element={<UV_ProjectDetail />} />
            <Route path="/shop" element={<UV_Shop />} />
            <Route path="/cart" element={<UV_ShoppingCart />} />
            <Route path="/checkout" element={isAuthenticated ? <UV_Checkout /> : <Navigate to="/login" />} />
            <Route path="/order-confirmation/:order_uid" element={<UV_OrderConfirmation />} />
            <Route path="/challenges" element={<UV_DesignChallenges />} />
            <Route path="/forums" element={<UV_CommunityForums />} />
            <Route path="/learn" element={<UV_LearningCenter />} />
            <Route path="/events" element={<UV_LiveEvents />} />
            <Route path="/admin" element={isAuthenticated && isAdmin ? <UV_AdminDashboard /> : <Navigate to="/" />} />
            <Route path="/category/:category_uid" element={<UV_CategoryListing />} />
            <Route path="/product/:product_uid" element={<UV_ProductDetail />} />
            <Route path="/inspiration" element={<UV_DesignInspiration />} />
            <Route path="/custom-request" element={<UV_CustomDesignRequest />} />
            <Route path="/forum/:topic_uid" element={<UV_CommunityForum />} />
            <Route path="/virtual-showroom" element={<UV_VirtualShowroom />} />
            <Route path="/order-tracking/:order_uid" element={isAuthenticated ? <UV_OrderTracking /> : <Navigate to="/login" />} />
            <Route path="/sustainability" element={<UV_SustainabilityHub />} />
          </Routes>
        </main>

        <GV_Footer />
        <GV_Notifications />
        {!isAuthenticated && <GV_AuthModal />}
      </div>
  
  );
};

export default App;