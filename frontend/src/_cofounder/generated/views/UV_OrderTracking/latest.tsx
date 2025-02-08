import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { format } from 'date-fns';
import { RootState, AppDispatch, add_notification, add_to_cart } from '@/store/main';

const UV_OrderTracking: React.FC = () => {
  const { order_uid } = useParams<{ order_uid: string }>();
  const dispatch: AppDispatch = useDispatch();
  const { auth_token } = useSelector((state: RootState) => state.auth);
  const [activeTab, setActiveTab] = useState<string>('summary');
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [trackingInfo, setTrackingInfo] = useState<any>(null);
  const [orderHistory, setOrderHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [orderResponse, trackingResponse, historyResponse] = await Promise.all([
          axios.get(`http://localhost:1337/api/orders/${order_uid}`, {
            headers: { Authorization: `Bearer ${auth_token}` }
          }),
          axios.get(`http://localhost:1337/api/orders/${order_uid}/tracking`, {
            headers: { Authorization: `Bearer ${auth_token}` }
          }),
          axios.get('http://localhost:1337/api/users/orders', {
            headers: { Authorization: `Bearer ${auth_token}` }
          })
        ]);
        setOrderDetails(orderResponse.data);
        setTrackingInfo(trackingResponse.data);
        setOrderHistory(historyResponse.data);
      } catch (err) {
        setError('Failed to load order information. Please try again later.');
        console.error('Error fetching order data:', err);
      }
      setLoading(false);
    };

    fetchData();
    const intervalId = setInterval(fetchData, 300000); // Refresh every 5 minutes

    return () => clearInterval(intervalId);
  }, [order_uid, auth_token]);

  const handleInitiateReturn = async () => {
    try {
      await axios.post(`http://localhost:1337/api/orders/${order_uid}/returns`, {}, {
        headers: { Authorization: `Bearer ${auth_token}` }
      });
      dispatch(add_notification({ id: Date.now().toString(), type: 'success', message: 'Return initiated successfully' }));
      // Refresh order details
      const response = await axios.get(`http://localhost:1337/api/orders/${order_uid}`, {
        headers: { Authorization: `Bearer ${auth_token}` }
      });
      setOrderDetails(response.data);
    } catch (err) {
      dispatch(add_notification({ id: Date.now().toString(), type: 'error', message: 'Failed to initiate return' }));
    }
  };

  const handleCancelOrder = async () => {
    try {
      await axios.post(`http://localhost:1337/api/orders/${order_uid}/cancel`, {}, {
        headers: { Authorization: `Bearer ${auth_token}` }
      });
      dispatch(add_notification({ id: Date.now().toString(), type: 'success', message: 'Order cancelled successfully' }));
      // Refresh order details
      const response = await axios.get(`http://localhost:1337/api/orders/${order_uid}`, {
        headers: { Authorization: `Bearer ${auth_token}` }
      });
      setOrderDetails(response.data);
    } catch (err) {
      dispatch(add_notification({ id: Date.now().toString(), type: 'error', message: 'Failed to cancel order' }));
    }
  };

  const handleReorder = () => {
    orderDetails.items.forEach((item: any) => {
      dispatch(add_to_cart({
        product_uid: item.product_uid,
        quantity: item.quantity,
        price: item.price_at_time
      }));
    });
    dispatch(add_notification({ id: Date.now().toString(), type: 'success', message: 'Items added to cart' }));
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading order details...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Order Tracking</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <div className="bg-white shadow-md rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-semibold mb-4">Order #{orderDetails.orderNumber}</h2>
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-600">Status: <span className="font-semibold">{orderDetails.status}</span></span>
              <span className="text-gray-600">Order Date: {format(new Date(orderDetails.orderDate), 'MMM dd, yyyy')}</span>
            </div>
            <div className="flex space-x-4 mb-6">
              <button
                onClick={handleReorder}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
              >
                Reorder
              </button>
              {orderDetails.status === 'pending' && (
                <button
                  onClick={handleCancelOrder}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
                >
                  Cancel Order
                </button>
              )}
              {['shipped', 'delivered'].includes(orderDetails.status) && (
                <button
                  onClick={handleInitiateReturn}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded"
                >
                  Initiate Return
                </button>
              )}
            </div>
            <div className="border-b border-gray-200 mb-4">
              <nav className="-mb-px flex space-x-8">
                {['summary', 'items', 'shipping', 'billing'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`${
                      activeTab === tab
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize`}
                  >
                    {tab}
                  </button>
                ))}
              </nav>
            </div>
            {activeTab === 'summary' && (
              <div>
                <p className="text-lg font-semibold mb-2">Total Amount: ${orderDetails.totalAmount.toFixed(2)}</p>
                <p className="text-gray-600 mb-4">{orderDetails.items.length} item(s)</p>
                {trackingInfo && (
                  <div className="bg-gray-100 p-4 rounded-md">
                    <h3 className="text-lg font-semibold mb-2">Tracking Information</h3>
                    <p>Carrier: {trackingInfo.carrier}</p>
                    <p>Tracking Number: {trackingInfo.trackingNumber}</p>
                    <p>Status: {trackingInfo.status}</p>
                    <p>Estimated Delivery: {format(new Date(trackingInfo.estimatedDelivery), 'MMM dd, yyyy')}</p>
                  </div>
                )}
              </div>
            )}
            {activeTab === 'items' && (
              <div>
                {orderDetails.items.map((item: any, index: number) => (
                  <div key={index} className="flex items-center justify-between border-b border-gray-200 py-4 last:border-b-0">
                    <div className="flex items-center">
                      <img src={`https://picsum.photos/seed/${item.product_uid}/100/100`} alt={item.name} className="w-16 h-16 object-cover rounded mr-4" />
                      <div>
                        <h4 className="font-semibold">{item.name}</h4>
                        <p className="text-gray-600">Quantity: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="font-semibold">${(item.price_at_time * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            )}
            {activeTab === 'shipping' && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Shipping Address</h3>
                <p>{orderDetails.shippingAddress.address_line1}</p>
                {orderDetails.shippingAddress.address_line2 && <p>{orderDetails.shippingAddress.address_line2}</p>}
                <p>{orderDetails.shippingAddress.city}, {orderDetails.shippingAddress.state} {orderDetails.shippingAddress.postal_code}</p>
                <p>{orderDetails.shippingAddress.country}</p>
              </div>
            )}
            {activeTab === 'billing' && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Billing Address</h3>
                <p>{orderDetails.billingAddress.address_line1}</p>
                {orderDetails.billingAddress.address_line2 && <p>{orderDetails.billingAddress.address_line2}</p>}
                <p>{orderDetails.billingAddress.city}, {orderDetails.billingAddress.state} {orderDetails.billingAddress.postal_code}</p>
                <p>{orderDetails.billingAddress.country}</p>
                <h3 className="text-lg font-semibold mt-4 mb-2">Payment Method</h3>
                <p>{orderDetails.paymentMethod.type}</p>
                <p>**** **** **** {orderDetails.paymentMethod.last4}</p>
              </div>
            )}
          </div>
        </div>
        <div className="md:col-span-1">
          <div className="bg-white shadow-md rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Order History</h3>
            {orderHistory.map((order: any) => (
              <Link
                key={order.uid}
                to={`/order-tracking/${order.uid}`}
                className={`block border-b border-gray-200 py-3 last:border-b-0 ${order.uid === order_uid ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
              >
                <p className="font-semibold">Order #{order.orderNumber}</p>
                <p className="text-sm text-gray-600">{format(new Date(order.orderDate), 'MMM dd, yyyy')}</p>
                <p className="text-sm font-medium">${order.totalAmount.toFixed(2)} - {order.status}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UV_OrderTracking;