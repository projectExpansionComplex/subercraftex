import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { RootState, AppDispatch, set_auth, add_notification } from '@/store/main';

const UV_UserProfile: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const { current_user, auth_token } = useSelector((state: RootState) => state.auth);
  const { theme } = useSelector((state: RootState) => state.preferences);

  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [userDetails, setUserDetails] = useState<any>(null);
  const [orderHistory, setOrderHistory] = useState<any[]>([]);
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (current_user) {
      fetchUserProfile();
      fetchOrderHistory();
      fetchSavedAddresses();
      fetchPaymentMethods();
      fetchWishlist();
    }
  }, [current_user]);

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get(`http://localhost:1337/api/users/${current_user?.uid}`, {
        headers: { Authorization: `Bearer ${auth_token}` }
      });
      setUserDetails(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      dispatch(add_notification({ id: Date.now().toString(), type: 'error', message: 'Failed to load user profile' }));
    }
  };

  const fetchOrderHistory = async () => {
    try {
      const response = await axios.get(`http://localhost:1337/api/users/${current_user?.uid}/orders`, {
        headers: { Authorization: `Bearer ${auth_token}` }
      });
      setOrderHistory(response.data);
    } catch (error) {
      console.error('Error fetching order history:', error);
      dispatch(add_notification({ id: Date.now().toString(), type: 'error', message: 'Failed to load order history' }));
    }
  };

  const fetchSavedAddresses = async () => {
    try {
      const response = await axios.get(`http://localhost:1337/api/users/${current_user?.uid}/addresses`, {
        headers: { Authorization: `Bearer ${auth_token}` }
      });
      setSavedAddresses(response.data);
    } catch (error) {
      console.error('Error fetching saved addresses:', error);
      dispatch(add_notification({ id: Date.now().toString(), type: 'error', message: 'Failed to load saved addresses' }));
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      const response = await axios.get(`http://localhost:1337/api/users/${current_user?.uid}/payment-methods`, {
        headers: { Authorization: `Bearer ${auth_token}` }
      });
      setPaymentMethods(response.data);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      dispatch(add_notification({ id: Date.now().toString(), type: 'error', message: 'Failed to load payment methods' }));
    }
  };

  const fetchWishlist = async () => {
    try {
      const response = await axios.get(`http://localhost:1337/api/users/${current_user?.uid}/wishlist`, {
        headers: { Authorization: `Bearer ${auth_token}` }
      });
      setWishlist(response.data);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      dispatch(add_notification({ id: Date.now().toString(), type: 'error', message: 'Failed to load wishlist' }));
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await axios.put(`http://localhost:1337/api/users/${current_user?.uid}`, userDetails, {
        headers: { Authorization: `Bearer ${auth_token}` }
      });
      setUserDetails(response.data);
      setIsEditing(false);
      dispatch(add_notification({ id: Date.now().toString(), type: 'success', message: 'Profile updated successfully' }));
    } catch (error) {
      console.error('Error updating profile:', error);
      dispatch(add_notification({ id: Date.now().toString(), type: 'error', message: 'Failed to update profile' }));
    }
  };

  const handleChangePassword = async (oldPassword: string, newPassword: string) => {
    try {
      await axios.post(`http://localhost:1337/api/users/${current_user?.uid}/change-password`, 
        { old_password: oldPassword, new_password: newPassword },
        { headers: { Authorization: `Bearer ${auth_token}` } }
      );
      dispatch(add_notification({ id: Date.now().toString(), type: 'success', message: 'Password changed successfully' }));
    } catch (error) {
      console.error('Error changing password:', error);
      dispatch(add_notification({ id: Date.now().toString(), type: 'error', message: 'Failed to change password' }));
    }
  };

  const handleAddAddress = async (address: any) => {
    try {
      const response = await axios.post(`http://localhost:1337/api/users/${current_user?.uid}/addresses`, address, {
        headers: { Authorization: `Bearer ${auth_token}` }
      });
      setSavedAddresses([...savedAddresses, response.data]);
      dispatch(add_notification({ id: Date.now().toString(), type: 'success', message: 'Address added successfully' }));
    } catch (error) {
      console.error('Error adding address:', error);
      dispatch(add_notification({ id: Date.now().toString(), type: 'error', message: 'Failed to add address' }));
    }
  };

  const handleRemoveAddress = async (addressId: string) => {
    try {
      await axios.delete(`http://localhost:1337/api/users/${current_user?.uid}/addresses/${addressId}`, {
        headers: { Authorization: `Bearer ${auth_token}` }
      });
      setSavedAddresses(savedAddresses.filter(addr => addr.id !== addressId));
      dispatch(add_notification({ id: Date.now().toString(), type: 'success', message: 'Address removed successfully' }));
    } catch (error) {
      console.error('Error removing address:', error);
      dispatch(add_notification({ id: Date.now().toString(), type: 'error', message: 'Failed to remove address' }));
    }
  };

  const handleAddPaymentMethod = async (paymentMethod: any) => {
    try {
      const response = await axios.post(`http://localhost:1337/api/users/${current_user?.uid}/payment-methods`, paymentMethod, {
        headers: { Authorization: `Bearer ${auth_token}` }
      });
      setPaymentMethods([...paymentMethods, response.data]);
      dispatch(add_notification({ id: Date.now().toString(), type: 'success', message: 'Payment method added successfully' }));
    } catch (error) {
      console.error('Error adding payment method:', error);
      dispatch(add_notification({ id: Date.now().toString(), type: 'error', message: 'Failed to add payment method' }));
    }
  };

  const handleRemovePaymentMethod = async (methodId: string) => {
    try {
      await axios.delete(`http://localhost:1337/api/users/${current_user?.uid}/payment-methods/${methodId}`, {
        headers: { Authorization: `Bearer ${auth_token}` }
      });
      setPaymentMethods(paymentMethods.filter(method => method.id !== methodId));
      dispatch(add_notification({ id: Date.now().toString(), type: 'success', message: 'Payment method removed successfully' }));
    } catch (error) {
      console.error('Error removing payment method:', error);
      dispatch(add_notification({ id: Date.now().toString(), type: 'error', message: 'Failed to remove payment method' }));
    }
  };

  const handleRemoveFromWishlist = async (productId: string) => {
    try {
      await axios.delete(`http://localhost:1337/api/users/${current_user?.uid}/wishlist/${productId}`, {
        headers: { Authorization: `Bearer ${auth_token}` }
      });
      setWishlist(wishlist.filter(item => item.productId !== productId));
      dispatch(add_notification({ id: Date.now().toString(), type: 'success', message: 'Item removed from wishlist' }));
    } catch (error) {
      console.error('Error removing item from wishlist:', error);
      dispatch(add_notification({ id: Date.now().toString(), type: 'error', message: 'Failed to remove item from wishlist' }));
    }
  };

  const handleExportUserData = async () => {
    try {
      const response = await axios.get(`http://localhost:1337/api/users/${current_user?.uid}/export`, {
        headers: { Authorization: `Bearer ${auth_token}` },
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'user_data.json');
      document.body.appendChild(link);
      link.click();
      link.remove();
      dispatch(add_notification({ id: Date.now().toString(), type: 'success', message: 'User data exported successfully' }));
    } catch (error) {
      console.error('Error exporting user data:', error);
      dispatch(add_notification({ id: Date.now().toString(), type: 'error', message: 'Failed to export user data' }));
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className={`container mx-auto px-4 py-8 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      <h1 className="text-3xl font-bold mb-8">User Profile</h1>
      
      <div className="flex flex-wrap mb-6">
        <button
          className={`mr-4 mb-2 px-4 py-2 rounded ${activeTab === 'overview' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`mr-4 mb-2 px-4 py-2 rounded ${activeTab === 'orders' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
          onClick={() => setActiveTab('orders')}
        >
          Orders
        </button>
        <button
          className={`mr-4 mb-2 px-4 py-2 rounded ${activeTab === 'addresses' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
          onClick={() => setActiveTab('addresses')}
        >
          Addresses
        </button>
        <button
          className={`mr-4 mb-2 px-4 py-2 rounded ${activeTab === 'payment' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
          onClick={() => setActiveTab('payment')}
        >
          Payment Methods
        </button>
        <button
          className={`mr-4 mb-2 px-4 py-2 rounded ${activeTab === 'wishlist' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
          onClick={() => setActiveTab('wishlist')}
        >
          Wishlist
        </button>
      </div>

      {activeTab === 'overview' && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Profile Information</h2>
          {isEditing ? (
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label htmlFor="fullName" className="block mb-1">Full Name</label>
                <input
                  type="text"
                  id="fullName"
                  value={userDetails.fullName}
                  onChange={(e) => setUserDetails({...userDetails, fullName: e.target.value})}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label htmlFor="email" className="block mb-1">Email</label>
                <input
                  type="email"
                  id="email"
                  value={userDetails.email}
                  onChange={(e) => setUserDetails({...userDetails, email: e.target.value})}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label htmlFor="bio" className="block mb-1">Bio</label>
                <textarea
                  id="bio"
                  value={userDetails.bio}
                  onChange={(e) => setUserDetails({...userDetails, bio: e.target.value})}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 bg-gray-300 rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">Save Changes</button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <p><strong>Full Name:</strong> {userDetails.fullName}</p>
              <p><strong>Email:</strong> {userDetails.email}</p>
              <p><strong>Bio:</strong> {userDetails.bio}</p>
              <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-blue-500 text-white rounded">Edit Profile</button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'orders' && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Order History</h2>
          {orderHistory.length > 0 ? (
            <ul className="space-y-4">
              {orderHistory.map((order) => (
                <li key={order.orderId} className="border p-4 rounded">
                  <p><strong>Order ID:</strong> {order.orderId}</p>
                  <p><strong>Date:</strong> {new Date(order.date).toLocaleDateString()}</p>
                  <p><strong>Total:</strong> ${order.total.toFixed(2)}</p>
                  <p><strong>Status:</strong> {order.status}</p>
                  <Link to={`/order/${order.orderId}`} className="text-blue-500 hover:underline">View Details</Link>
                </li>
              ))}
            </ul>
          ) : (
            <p>No orders found.</p>
          )}
        </div>
      )}

      {activeTab === 'addresses' && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Saved Addresses</h2>
          {savedAddresses.length > 0 ? (
            <ul className="space-y-4">
              {savedAddresses.map((address) => (
                <li key={address.id} className="border p-4 rounded">
                  <p><strong>{address.type === 'billing' ? 'Billing' : 'Shipping'} Address</strong></p>
                  <p>{address.streetAddress}</p>
                  <p>{address.city}, {address.state} {address.zipCode}</p>
                  <p>{address.country}</p>
                  <button onClick={() => handleRemoveAddress(address.id)} className="mt-2 px-3 py-1 bg-red-500 text-white rounded">Remove</button>
                </li>
              ))}
            </ul>
          ) : (
            <p>No saved addresses.</p>
          )}
          <button onClick={() => {/* Open add address modal */}} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">Add New Address</button>
        </div>
      )}

      {activeTab === 'payment' && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Payment Methods</h2>
          {paymentMethods.length > 0 ? (
            <ul className="space-y-4">
              {paymentMethods.map((method) => (
                <li key={method.id} className="border p-4 rounded">
                  <p><strong>{method.type === 'credit_card' ? 'Credit Card' : 'PayPal'}</strong></p>
                  {method.type === 'credit_card' && (
                    <p>**** **** **** {method.lastFour}</p>
                  )}
                  {method.type === 'paypal' && (
                    <p>{method.email}</p>
                  )}
                  <button onClick={() => handleRemovePaymentMethod(method.id)} className="mt-2 px-3 py-1 bg-red-500 text-white rounded">Remove</button>
                </li>
              ))}
            </ul>
          ) : (
            <p>No saved payment methods.</p>
          )}
          <button onClick={() => {/* Open add payment method modal */}} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">Add New Payment Method</button>
        </div>
      )}

      {activeTab === 'wishlist' && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Wishlist</h2>
          {wishlist.length > 0 ? (
            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {wishlist.map((item) => (
                <li key={item.productId} className="border p-4 rounded">
                  <img src={item.imageUrl} alt={item.name} className="w-full h-48 object-cover mb-2" />
                  <h3 className="font-semibold">{item.name}</h3>
                  <p>${item.price.toFixed(2)}</p>
                  <div className="mt-2 space-x-2">
                    <Link to={`/product/${item.productId}`} className="px-3 py-1 bg-blue-500 text-white rounded">View Product</Link>
                    <button onClick={() => handleRemoveFromWishlist(item.productId)} className="px-3 py-1 bg-red-500 text-white rounded">Remove</button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>Your wishlist is empty.</p>
          )}
        </div>
      )}

      <div className="mt-8 space-y-4">
        <button onClick={() => {/* Open change password modal */}} className="w-full px-4 py-2 bg-green-500 text-white rounded">Change Password</button>
        <button onClick={handleExportUserData} className="w-full px-4 py-2 bg-purple-500 text-white rounded">Export User Data</button>
      </div>
    </div>
  );
};

export default UV_UserProfile;