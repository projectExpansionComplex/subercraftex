import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { RootState } from '@/store/main';
import { 
  Badge,
  Button,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui';
import { Printer, Truck, ArrowRight } from 'lucide-react';

const UV_OrderConfirmation: React.FC = () => {
  const { orderUid } = useParams<{ orderUid: string }>();
  const { auth_token } = useSelector((state: RootState) => state.auth);
  const { language, currency } = useSelector((state: RootState) => state.preferences);

  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [estimatedDeliveryDate, setEstimatedDeliveryDate] = useState<string | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:1337/api/orders/${orderUid}`, {
          headers: { Authorization: `Bearer ${auth_token}` }
        });
        setOrderDetails(response.data);
        calculateEstimatedDelivery(response.data);
        fetchRelatedProducts(response.data.items);
        sendOrderConfirmationEmail(response.data);
      } catch (err) {
        setError('Failed to fetch order details. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    if (orderUid) {
      fetchOrderDetails();
    }
  }, [orderUid, auth_token]);

  const calculateEstimatedDelivery = async (order: any) => {
    try {
      const response = await axios.post('http://localhost:1337/api/calculate-delivery', {
        items: order.items,
        shippingMethod: order.shippingMethod
      }, {
        headers: { Authorization: `Bearer ${auth_token}` }
      });
      setEstimatedDeliveryDate(response.data.estimatedDeliveryDate);
    } catch (err) {
      console.error('Failed to calculate estimated delivery date:', err);
    }
  };

  const fetchRelatedProducts = async (items: any[]) => {
    try {
      const response = await axios.post('http://localhost:1337/api/related-products', {
        items: items.map(item => item.productUid)
      });
      setRelatedProducts(response.data.relatedProducts);
    } catch (err) {
      console.error('Failed to fetch related products:', err);
    }
  };

  const sendOrderConfirmationEmail = async (order: any) => {
    try {
      await axios.post('http://localhost:1337/api/send-order-confirmation', {
        orderUid: order.orderUid,
        email: order.userEmail
      }, {
        headers: { Authorization: `Bearer ${auth_token}` }
      });
    } catch (err) {
      console.error('Failed to send order confirmation email:', err);
    }
  };

  const handlePrintOrderDetails = () => {
    window.print();
  };

  const handleTrackOrder = async () => {
    try {
      const response = await axios.get(`http://localhost:1337/api/order-tracking/${orderUid}`, {
        headers: { Authorization: `Bearer ${auth_token}` }
      });
      window.location.href = response.data.trackingUrl;
    } catch (err) {
      console.error('Failed to get tracking information:', err);
      setError('Unable to retrieve tracking information. Please try again later.');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(language, { style: 'currency', currency: currency }).format(amount);
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading order details...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>;
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-4 text-center">Order Confirmation</h1>
        
        {orderDetails && (
          <>
            <div className="text-center mb-6">
              <Badge variant="success" className="text-lg px-4 py-2">Order Successful</Badge>
            </div>
            
            <p className="text-center text-gray-600 mb-8">Order Number: {orderDetails.orderUid}</p>
            
            <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
              <div className="flex justify-between items-center mb-4">
                <p className="text-gray-600">Order Date: {new Date(orderDetails.orderDate).toLocaleDateString()}</p>
                {estimatedDeliveryDate && (
                  <p className="text-gray-600">
                    Estimated Delivery: {new Date(estimatedDeliveryDate).toLocaleDateString()}
                  </p>
                )}
              </div>
              
              <Table>
                <TableCaption>Order Items</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orderDetails.items.map((item: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{formatCurrency(item.price)}</TableCell>
                      <TableCell>{formatCurrency(item.price * item.quantity)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              <div className="mt-6 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(orderDetails.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span>{formatCurrency(orderDetails.shipping)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span>{formatCurrency(orderDetails.tax)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>{formatCurrency(orderDetails.total)}</span>
                </div>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <h2 className="text-2xl font-semibold mb-4">Shipping Information</h2>
                <p className="text-gray-600">
                  {orderDetails.shippingAddress.fullName}<br />
                  {orderDetails.shippingAddress.street}<br />
                  {orderDetails.shippingAddress.city}, {orderDetails.shippingAddress.state} {orderDetails.shippingAddress.zipCode}<br />
                  {orderDetails.shippingAddress.country}
                </p>
              </div>
              <div>
                <h2 className="text-2xl font-semibold mb-4">Billing Information</h2>
                <p className="text-gray-600">
                  {orderDetails.billingAddress.fullName}<br />
                  {orderDetails.billingAddress.street}<br />
                  {orderDetails.billingAddress.city}, {orderDetails.billingAddress.state} {orderDetails.billingAddress.zipCode}<br />
                  {orderDetails.billingAddress.country}
                </p>
                <p className="mt-4 text-gray-600">
                  Payment Method: {orderDetails.paymentMethod}
                </p>
              </div>
            </div>
            
            {orderDetails.digitalProducts && orderDetails.digitalProducts.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Digital Products</h2>
                <p className="text-gray-600 mb-4">
                  Your digital products are ready for download. Click the buttons below to access your purchases.
                </p>
                <div className="flex flex-wrap gap-4">
                  {orderDetails.digitalProducts.map((product: any, index: number) => (
                    <Button key={index} variant="outline" asChild>
                      <a href={product.downloadUrl} target="_blank" rel="noopener noreferrer">
                        Download {product.name}
                      </a>
                    </Button>
                  ))}
                </div>
              </div>
            )}
            
            {relatedProducts.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">You Might Also Like</h2>
                <Carousel>
                  <CarouselContent>
                    {relatedProducts.map((product) => (
                      <CarouselItem key={product.productUid} className="md:basis-1/3">
                        <div className="p-4">
                          <img src={product.image} alt={product.name} className="w-full h-48 object-cover mb-4 rounded-lg" />
                          <h4 className="font-semibold">{product.name}</h4>
                          <p className="text-gray-600">{formatCurrency(product.price)}</p>
                          <Button variant="outline" asChild className="mt-2">
                            <Link to={`/product/${product.productUid}`}>View Product</Link>
                          </Button>
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious />
                  <CarouselNext />
                </Carousel>
              </div>
            )}
            
            <div className="flex flex-wrap justify-start gap-4 mb-8">
              <Button onClick={handlePrintOrderDetails} variant="outline">
                <Printer className="mr-2 h-4 w-4" /> Print Order
              </Button>
              <Button onClick={handleTrackOrder}>
                <Truck className="mr-2 h-4 w-4" /> Track Order
              </Button>
              <Button variant="secondary" asChild>
                <Link to="/shop">Continue Shopping</Link>
              </Button>
            </div>
            
            <div className="text-center text-gray-600">
              <p className="mb-4">Thank you for your purchase! If you have any questions, please contact our customer support.</p>
              <Link to="/support" className="text-blue-500 hover:underline">Contact Support <ArrowRight className="inline h-4 w-4" /></Link>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default UV_OrderConfirmation;