import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { RootState, AppDispatch, remove_from_cart, update_cart_item_quantity, add_notification } from '@/store/main';
import axios from 'axios';
import { debounce } from 'lodash';

const UV_ShoppingCart: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const cartTotal = useSelector((state: RootState) => state.cart.total);
  const { currency } = useSelector((state: RootState) => state.preferences);
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [estimatedShipping, setEstimatedShipping] = useState(0);
  const [recentlyViewedItems, setRecentlyViewedItems] = useState<any[]>([]);

  useEffect(() => {
    fetchRecentlyViewedItems();
    estimateShipping();
  }, []);

  const fetchRecentlyViewedItems = async () => {
    try {
      const response = await axios.get('http://localhost:1337/api/products/recently-viewed');
      setRecentlyViewedItems(response.data);
    } catch (error) {
      console.error('Failed to fetch recently viewed items:', error);
    }
  };

  const estimateShipping = async () => {
    try {
      const response = await axios.post('http://localhost:1337/api/shipping/estimate', { items: cartItems });
      setEstimatedShipping(response.data.estimated_cost);
    } catch (error) {
      console.error('Failed to estimate shipping:', error);
    }
  };

  const handleQuantityChange = useCallback(debounce(async (productUid: string, newQuantity: number) => {
    try {
      await axios.put(`http://localhost:1337/api/cart/update`, { product_uid: productUid, quantity: newQuantity });
      dispatch(update_cart_item_quantity({ product_uid: productUid, quantity: newQuantity }));
    } catch (error) {
      console.error('Failed to update quantity:', error);
      dispatch(add_notification({ id: Date.now().toString(), type: 'error', message: 'Failed to update quantity. Please try again.' }));
    }
  }, 300), [dispatch]);

  const handleRemoveItem = async (productUid: string) => {
    try {
      await axios.delete(`http://localhost:1337/api/cart/item/${productUid}`);
      dispatch(remove_from_cart(productUid));
    } catch (error) {
      console.error('Failed to remove item:', error);
      dispatch(add_notification({ id: Date.now().toString(), type: 'error', message: 'Failed to remove item. Please try again.' }));
    }
  };

  const handleApplyPromoCode = async () => {
    try {
      const response = await axios.post('http://localhost:1337/api/promo/apply', { code: promoCode });
      setPromoDiscount(response.data.discount);
      dispatch(add_notification({ id: Date.now().toString(), type: 'success', message: 'Promo code applied successfully!' }));
    } catch (error) {
      console.error('Failed to apply promo code:', error);
      dispatch(add_notification({ id: Date.now().toString(), type: 'error', message: 'Invalid promo code. Please try again.' }));
    }
  };

  const handleSaveForLater = async (productUid: string) => {
    try {
      await axios.post('http://localhost:1337/api/wishlist/add', { product_uid: productUid });
      await handleRemoveItem(productUid);
      dispatch(add_notification({ id: Date.now().toString(), type: 'success', message: 'Item saved for later.' }));
    } catch (error) {
      console.error('Failed to save item for later:', error);
      dispatch(add_notification({ id: Date.now().toString(), type: 'error', message: 'Failed to save item for later. Please try again.' }));
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(price);
  };

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Your Shopping Cart</h1>
        {cartItems.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-xl mb-4">Your cart is empty</p>
            <Link to="/shop" className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition-colors">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-2/3">
              {cartItems.map((item) => (
                <div key={item.product_uid} className="flex items-center border-b py-4">
                  <img src={item.image} alt={item.name} className="w-24 h-24 object-cover mr-4" />
                  <div className="flex-grow">
                    <h3 className="text-lg font-semibold">{item.name}</h3>
                    <p className="text-gray-600">{formatPrice(item.price)}</p>
                    <div className="flex items-center mt-2">
                      <button
                        onClick={() => handleQuantityChange(item.product_uid, Math.max(1, item.quantity - 1))}
                        className="bg-gray-200 px-2 py-1 rounded-l"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(item.product_uid, parseInt(e.target.value) || 1)}
                        className="w-16 text-center border-t border-b"
                      />
                      <button
                        onClick={() => handleQuantityChange(item.product_uid, item.quantity + 1)}
                        className="bg-gray-200 px-2 py-1 rounded-r"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <button
                      onClick={() => handleRemoveItem(item.product_uid)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                    <button
                      onClick={() => handleSaveForLater(item.product_uid)}
                      className="text-blue-500 hover:text-blue-700 mt-2"
                    >
                      Save for Later
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="lg:w-1/3">
              <div className="bg-gray-100 p-6 rounded">
                <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                <div className="flex justify-between mb-2">
                  <span>Subtotal</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Estimated Shipping</span>
                  <span>{formatPrice(estimatedShipping)}</span>
                </div>
                {promoDiscount > 0 && (
                  <div className="flex justify-between mb-2 text-green-600">
                    <span>Promo Discount</span>
                    <span>-{formatPrice(promoDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold text-lg mt-4">
                  <span>Total</span>
                  <span>{formatPrice(cartTotal + estimatedShipping - promoDiscount)}</span>
                </div>
                <div className="mt-6">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Enter promo code"
                    className="w-full p-2 border rounded mb-2"
                  />
                  <button
                    onClick={handleApplyPromoCode}
                    className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors"
                  >
                    Apply Promo Code
                  </button>
                </div>
                <Link
                  to="/checkout"
                  className="block w-full bg-green-500 text-white text-center py-3 rounded mt-6 hover:bg-green-600 transition-colors"
                >
                  Proceed to Checkout
                </Link>
              </div>
            </div>
          </div>
        )}
        {recentlyViewedItems.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-semibold mb-4">Recently Viewed Items</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {recentlyViewedItems.map((item) => (
                <Link key={item.uid} to={`/product/${item.uid}`} className="block">
                  <img src={item.image} alt={item.name} className="w-full h-48 object-cover rounded" />
                  <h3 className="mt-2 font-semibold">{item.name}</h3>
                  <p className="text-gray-600">{formatPrice(item.price)}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default UV_ShoppingCart;