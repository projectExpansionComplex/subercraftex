import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { RootState, AppDispatch, clear_cart, add_notification } from '@/store/main';

const UV_Checkout: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();
  const { auth_token, current_user } = useSelector((state: RootState) => state.auth);
  const { items, total } = useSelector((state: RootState) => state.cart);
  const { currency } = useSelector((state: RootState) => state.preferences);

  const [checkoutStep, setCheckoutStep] = useState<'shipping' | 'payment' | 'review'>('shipping');
  const [shippingAddress, setShippingAddress] = useState<any>(null);
  const [billingAddress, setBillingAddress] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<any>(null);
  const [orderSummary, setOrderSummary] = useState({
    items: items,
    subtotal: total,
    shipping: 0,
    tax: 0,
    total: total
  });

  useEffect(() => {
    if (!auth_token) {
      navigate('/login');
    }
  }, [auth_token, navigate]);

  useEffect(() => {
    if (shippingAddress) {
      calculateTaxAndShipping();
    }
  }, [shippingAddress]);

  const calculateTaxAndShipping = async () => {
    try {
      const response = await axios.post('/api/calculate-tax-shipping', {
        items: items,
        shippingAddress: shippingAddress
      }, {
        headers: { Authorization: `Bearer ${auth_token}` }
      });
      setOrderSummary(prevSummary => ({
        ...prevSummary,
        shipping: response.data.shipping,
        tax: response.data.tax,
        total: prevSummary.subtotal + response.data.shipping + response.data.tax
      }));
    } catch (error) {
      console.error('Error calculating tax and shipping:', error);
      dispatch(add_notification({
        id: Date.now().toString(),
        type: 'error',
        message: 'Failed to calculate tax and shipping. Please try again.'
      }));
    }
  };

  const handleShippingSubmit = (values: any) => {
    setShippingAddress(values);
    setCheckoutStep('payment');
  };

  const handlePaymentSubmit = (values: any) => {
    setPaymentMethod(values);
    setCheckoutStep('review');
  };

  const handlePlaceOrder = async () => {
    try {
      const response = await axios.post('/api/orders', {
        items: items,
        shippingAddress: shippingAddress,
        billingAddress: billingAddress || shippingAddress,
        paymentMethod: paymentMethod,
        orderTotal: orderSummary.total
      }, {
        headers: { Authorization: `Bearer ${auth_token}` }
      });
      dispatch(clear_cart());
      dispatch(add_notification({
        id: Date.now().toString(),
        type: 'success',
        message: 'Order placed successfully!'
      }));
      navigate(`/order-confirmation/${response.data.order_uid}`);
    } catch (error) {
      console.error('Error placing order:', error);
      dispatch(add_notification({
        id: Date.now().toString(),
        type: 'error',
        message: 'Failed to place order. Please try again.'
      }));
    }
  };

  const ShippingSchema = Yup.object().shape({
    addressLine1: Yup.string().required('Address is required'),
    city: Yup.string().required('City is required'),
    state: Yup.string().required('State is required'),
    postalCode: Yup.string().required('Postal code is required'),
    country: Yup.string().required('Country is required'),
  });

  const PaymentSchema = Yup.object().shape({
    cardNumber: Yup.string().required('Card number is required').matches(/^\d{16}$/, 'Invalid card number'),
    expiryDate: Yup.string().required('Expiry date is required').matches(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Invalid expiry date (MM/YY)'),
    cvv: Yup.string().required('CVV is required').matches(/^\d{3,4}$/, 'Invalid CVV'),
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      {/* Progress Indicator */}
      <div className="flex justify-between mb-8">
        {['shipping', 'payment', 'review'].map((step, index) => (
          <div key={step} className={`flex items-center ${index < ['shipping', 'payment', 'review'].indexOf(checkoutStep) ? 'text-green-500' : ''}`}>
            <div className={`w-8 h-8 rounded-full ${index <= ['shipping', 'payment', 'review'].indexOf(checkoutStep) ? 'bg-green-500' : 'bg-gray-300'} flex items-center justify-center text-white`}>
              {index + 1}
            </div>
            <span className="ml-2 capitalize">{step}</span>
            {index < 2 && <div className="w-full h-1 bg-gray-300 mx-2" />}
          </div>
        ))}
      </div>

      {checkoutStep === 'shipping' && (
        <Formik
          initialValues={shippingAddress || { addressLine1: '', addressLine2: '', city: '', state: '', postalCode: '', country: '' }}
          validationSchema={ShippingSchema}
          onSubmit={handleShippingSubmit}
        >
          {({ errors, touched }) => (
            <Form>
              <h2 className="text-2xl font-semibold mb-4">Shipping Address</h2>
              <div className="mb-4">
                <label htmlFor="addressLine1" className="block mb-2">Address Line 1</label>
                <Field name="addressLine1" type="text" className={`w-full p-2 border rounded ${errors.addressLine1 && touched.addressLine1 ? 'border-red-500' : ''}`} />
                <ErrorMessage name="addressLine1" component="div" className="text-red-500 mt-1" />
              </div>
              <div className="mb-4">
                <label htmlFor="addressLine2" className="block mb-2">Address Line 2 (Optional)</label>
                <Field name="addressLine2" type="text" className="w-full p-2 border rounded" />
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="city" className="block mb-2">City</label>
                  <Field name="city" type="text" className={`w-full p-2 border rounded ${errors.city && touched.city ? 'border-red-500' : ''}`} />
                  <ErrorMessage name="city" component="div" className="text-red-500 mt-1" />
                </div>
                <div>
                  <label htmlFor="state" className="block mb-2">State</label>
                  <Field name="state" type="text" className={`w-full p-2 border rounded ${errors.state && touched.state ? 'border-red-500' : ''}`} />
                  <ErrorMessage name="state" component="div" className="text-red-500 mt-1" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="postalCode" className="block mb-2">Postal Code</label>
                  <Field name="postalCode" type="text" className={`w-full p-2 border rounded ${errors.postalCode && touched.postalCode ? 'border-red-500' : ''}`} />
                  <ErrorMessage name="postalCode" component="div" className="text-red-500 mt-1" />
                </div>
                <div>
                  <label htmlFor="country" className="block mb-2">Country</label>
                  <Field name="country" type="text" className={`w-full p-2 border rounded ${errors.country && touched.country ? 'border-red-500' : ''}`} />
                  <ErrorMessage name="country" component="div" className="text-red-500 mt-1" />
                </div>
              </div>
              <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Continue to Payment</button>
            </Form>
          )}
        </Formik>
      )}

      {checkoutStep === 'payment' && (
        <Formik
          initialValues={paymentMethod || { cardNumber: '', expiryDate: '', cvv: '' }}
          validationSchema={PaymentSchema}
          onSubmit={handlePaymentSubmit}
        >
          {({ errors, touched }) => (
            <Form>
              <h2 className="text-2xl font-semibold mb-4">Payment Information</h2>
              <div className="mb-4">
                <label htmlFor="cardNumber" className="block mb-2">Card Number</label>
                <Field name="cardNumber" type="text" className={`w-full p-2 border rounded ${errors.cardNumber && touched.cardNumber ? 'border-red-500' : ''}`} />
                <ErrorMessage name="cardNumber" component="div" className="text-red-500 mt-1" />
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="expiryDate" className="block mb-2">Expiry Date (MM/YY)</label>
                  <Field name="expiryDate" type="text" className={`w-full p-2 border rounded ${errors.expiryDate && touched.expiryDate ? 'border-red-500' : ''}`} />
                  <ErrorMessage name="expiryDate" component="div" className="text-red-500 mt-1" />
                </div>
                <div>
                  <label htmlFor="cvv" className="block mb-2">CVV</label>
                  <Field name="cvv" type="text" className={`w-full p-2 border rounded ${errors.cvv && touched.cvv ? 'border-red-500' : ''}`} />
                  <ErrorMessage name="cvv" component="div" className="text-red-500 mt-1" />
                </div>
              </div>
              <div className="mb-4">
                <label className="flex items-center">
                  <Field type="checkbox" name="sameAsBilling" className="mr-2" />
                  Billing address same as shipping
                </label>
              </div>
              <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Review Order</button>
            </Form>
          )}
        </Formik>
      )}

      {checkoutStep === 'review' && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Order Review</h2>
          <div className="mb-4">
            <h3 className="text-xl font-semibold mb-2">Shipping Address</h3>
            <p>{shippingAddress.addressLine1}</p>
            {shippingAddress.addressLine2 && <p>{shippingAddress.addressLine2}</p>}
            <p>{`${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.postalCode}`}</p>
            <p>{shippingAddress.country}</p>
          </div>
          <div className="mb-4">
            <h3 className="text-xl font-semibold mb-2">Payment Method</h3>
            <p>Card ending in {paymentMethod.cardNumber.slice(-4)}</p>
          </div>
          <div className="mb-4">
            <h3 className="text-xl font-semibold mb-2">Order Summary</h3>
            {orderSummary.items.map((item: any) => (
              <div key={item.product_uid} className="flex justify-between mb-2">
                <span>{item.quantity}x {item.name}</span>
                <span>{currency} {(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{currency} {orderSummary.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{currency} {orderSummary.shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>{currency} {orderSummary.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold mt-2">
                <span>Total</span>
                <span>{currency} {orderSummary.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
          <button onClick={handlePlaceOrder} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">Place Order</button>
        </div>
      )}
    </div>
  );
};

export default UV_Checkout;