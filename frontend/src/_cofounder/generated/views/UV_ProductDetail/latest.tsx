import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Zoom } from 'swiper/modules';
import { FaStar, FaShoppingCart, FaHeart, FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { RootState, AppDispatch, add_to_cart, add_notification } from '@/store/main';
import baseUrl from '../../../../utils/baseURL.js'
import axiosInstance from '@/utils/axiosInstance';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/zoom';

const UV_ProductDetail: React.FC = () => {
  const { product_uid } = useParams<{ product_uid: string }>();
  const dispatch: AppDispatch = useDispatch();
  const { auth_token,current_user } = useSelector((state: RootState) => state.auth);

  const [product, setProduct] = useState<any>(null);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewRating, setReviewRating] = useState<number>(0);
  const [reviewComment, setReviewComment] = useState<string>('');
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProductDetails = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/api/craftexproducts/${product_uid}`,);
     
      setProduct(response.data);
      setSelectedVariant(response.data.variants?.[0] || null);
      setLoading(false);
    } catch (err) {
      setError('Failed to load product details. Please try again later.');
      setLoading(false);
    }
  }, [product_uid]);

  // Fetch reviews for the product
  const fetchReviews = useCallback(async () => {
    try {
      const response = await axiosInstance.get(`/api/craftexreviews/product/${product_uid}`);
      setReviews(response.data.data);
    } catch (err) {
      console.error('Failed to load reviews:', err);
    }
  }, [product_uid]);

  const fetchRelatedProducts = useCallback(async () => {
    if (!product?.craftexCategory) return; // Prevent API call if category is missing
    try {
      const response = await axiosInstance.get(`/api/craftexproductsbycategory?category_uid=${product?.craftexCategory?._id}&limit=4`);
      setRelatedProducts(response.data.products.filter((p: any) => p.uid !== product_uid));
    } catch (err) {
      console.error('Failed to load related products:', err);
    }
  }, [product?.category_uid, product_uid]);

  useEffect(() => {
    fetchProductDetails();
  }, [fetchProductDetails]);

  useEffect(() => {
    if (product) {
      fetchReviews();
      fetchRelatedProducts();
    }
  }, [product, fetchReviews, fetchRelatedProducts]);

  const handleVariantSelect = (variant: any) => {
    setSelectedVariant(variant);
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (!selectedVariant) return; // Exit if no variant is selected
  
    // Ensure newQuantity is a valid number
    if (isNaN(newQuantity)) {
      setQuantity(1); // Reset to 1 if invalid
      return;
    }
  
    // Clamp the quantity between 1 and the selected variant's stock
    const clampedQuantity = Math.max(1, Math.min(newQuantity, selectedVariant.stock));
    setQuantity(clampedQuantity);
  };
  const addQuantity = () => {
    if (!selectedVariant) return; // Exit if no variant is selected
  
    // Increment the quantity, but ensure it doesn't exceed the stock
    const newQuantity = quantity + 1;
    const clampedQuantity = Math.min(newQuantity, selectedVariant.stock);
    setQuantity(clampedQuantity);
  };

  const subtractQuantity = () => {
    if (!selectedVariant) return; // Exit if no variant is selected
  
    // Decrement the quantity, but ensure it doesn't go below 1
    const newQuantity = quantity - 1;
    const clampedQuantity = Math.max(newQuantity, 1);
    setQuantity(clampedQuantity);
  };


  const handleAddToCart = () => {
    dispatch(add_to_cart({
      product_uid: product.uid,
      quantity: quantity,
      price: selectedVariant.price,
    }));
    dispatch(add_notification({
      id: Date.now().toString(),
      type: 'success',
      message: 'Product added to cart successfully!',
    }));
  };

  const handleAddToWishlist = async () => {
    if (!auth_token) {
      dispatch(add_notification({
        id: Date.now().toString(),
        type: 'error',
        message: 'Please log in to add items to your wishlist.',
      }));
      return;
    }
    try {
     
      await axiosInstance.post('/api/wishlist/add', { product_uid: product._id }, {
        headers: { Authorization: `Bearer ${auth_token}` },
      });
      dispatch(add_notification({
        id: Date.now().toString(),
        type: 'success',
        message: 'Product added to wishlist successfully!',
      }));
    } catch (err) {
      dispatch(add_notification({
        id: Date.now().toString(),
        type: 'error',
        message: 'Failed to add product to wishlist. Please try again.',
      }));
    }
  };



  const loadARView = () => {
    // Implement AR view logic here
    console.log('AR view not implemented yet');
  };

  const handleSubmitReview = async (rating: number, comment: string) => {
    if (!auth_token) {
      dispatch(add_notification({
        id: Date.now().toString(),
        type: 'error',
        message: 'Please log in to submit a review.',
      }));
      return;
    }
    try {
      await axiosInstance.post('/api/craftexreviews', {
        user: current_user.id,
        product_uid: product.uid,
        rating,
        comment,
      }, {
        headers: { Authorization: `Bearer ${auth_token}` },
      });
      fetchReviews();
      dispatch(add_notification({
        id: Date.now().toString(),
        type: 'success',
        message: 'Review submitted successfully!',
      }));
    } catch (err) {
      dispatch(add_notification({
        id: Date.now().toString(),
        type: 'error',
        message: 'Failed to submit review. Please try again.',
      }));
    }
  };

  const handleRatingChange = (rating: number) => {
    setReviewRating(rating);
  };

  const handleCommentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setReviewComment(e.target.value);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>;
  }

  if (!product) {
    return <div className="flex justify-center items-center h-screen">Product not found</div>;
  }

  return (
    <>
   
      <div className="container mx-auto px-4 py-8" style={{paddingTop:'7rem'}}>
     
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
          {/* Image Gallery */}
          <div className="relative">
          
            <Swiper
              modules={[Navigation, Pagination, Zoom]}
              navigation
              pagination={{ clickable: true }}
              zoom={{ maxRatio: 3 }}
              className="h-96 bg-gray-100 rounded-lg"
            >
              
              {product.images.map((image: any, index: number) => (
                <SwiperSlide key={index}>
                  <div className="swiper-zoom-container">
                    <img
                      src={baseUrl + image}
                      alt={`${product.name} - Image ${index + 1}`}
                      className="object-contain w-full h-full"
                    />
                    
             
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          {/* Product Info */}
          <div>
            <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
            {console.log("variant for price",selectedVariant )}
            <p className="text-2xl font-semibold mb-4">${selectedVariant?.price.toFixed(2)}</p>
            

            {/* Existing Reviews */}
            {reviews.length > 0 && (
              <div className="mt-8">
                <h2 className="text-2xl font-bold mb-4">Customer Reviews</h2>
                {reviews.map((review) => (
                  <div key={review.uid} className="bg-gray-100 p-4 rounded">
                    <div className="flex items-center mb-2">
                      {[...Array(5)].map((_, index) => (
                        <FaStar
                          key={index}
                          className={index < review.rating ? 'text-yellow-400' : 'text-gray-300'}
                        />
                      ))}
                    </div>
                    <p className="text-gray-700">{review.comment}</p>
                  </div>
                ))}
              </div>
            )}
            
            {/* Variants */}
            {product.variants && product.variants.length > 1 && (
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">Variants:</h3>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((variant: any) => (
                    <button
                      key={variant.uid}
                      onClick={() => handleVariantSelect(variant)}
                      className={`px-4 py-2 rounded ${
                        selectedVariant.uid === variant.uid
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-800'
                      }`}
                    >
                      {variant.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="flex items-center mb-4">
              <label htmlFor="quantity" className="mr-2">Quantity:</label>
              <button
                onClick={subtractQuantity}
                className="px-2 py-1 bg-gray-200 rounded-l"
              >
                -
              </button>
              <input
                  type="number"
                  id="quantity"
                  value={quantity}
                  onChange={(e) => handleQuantityChange(parseInt(e.target.value))}
                  onBlur={(e) => {
                    const value = parseInt(e.target.value);
                    if (isNaN(value)) {
                      setQuantity(1); // Reset to 1 if invalid
                    }
                  }}
                  className="w-16 text-center border-t border-b border-gray-200"
                />
               
              <button
                onClick={addQuantity}
                className="px-2 py-1 bg-gray-200 rounded-r"
              >
                +
              </button>
            </div>

            {/* Add to Cart and Wishlist */}
            <div className="flex gap-4 mb-6">
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-300"
              >
                <FaShoppingCart className="inline mr-2" /> Add to Cart
              </button>
              <button
                onClick={handleAddToWishlist}
                className="flex-1 bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition duration-300"
              >
                <FaHeart className="inline mr-2" /> Add to Wishlist
              </button>
            </div>

            {/* Sustainability Score */}
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Sustainability Score:</h3>
              <div className="flex items-center">
                {[...Array(5)].map((_, index) => (
                  <FaStar
                    key={index}
                    className={index < product.ratings ? 'text-yellow-400' : 'text-gray-300'}
                  />
                ))}
              </div>
            </div>

            {/* AR View Button */}
            <button
              onClick={loadARView}
              className="w-full bg-purple-500 text-white py-2 px-4 rounded hover:bg-purple-600 transition duration-300 mb-4"
            >
              View in AR
            </button>
          </div>
        </div>

        {/* Product Details */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-4">Product Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-2">Description:</h3>
              <p>{product.description}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Specifications:</h3>
              <ul className="list-disc list-inside">
                <li>Material: {product?.materials?.join(', ')}</li>
                <li>Dimensions: {`${product?.dimensions?.length}L x ${product?.dimensions?.width}W x ${product?.dimensions?.height}H`}</li>
                <li>Weight: {product?.weight} kg</li>
                <li>Country of Origin: {product?.country_of_origin}</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Sustainability Metrics */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-4">Sustainability Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-green-100 p-4 rounded">
              <h3 className="font-semibold mb-2">Eco-Friendly Materials:</h3>
              {console.log(product?.sustainability_metrics?.sustainability_metrics,"checking sus")}
              <p>{product?.sustainability_metrics?.sustainability_metrics?.eco_friendly_materials ? 'Yes' : 'No'}</p>
            </div>
            <div className="bg-blue-100 p-4 rounded">
              <h3 className="font-semibold mb-2">Carbon Footprint:</h3>
              <p>{product?.sustainability_metrics?.sustainability_metrics?.carbon_footprint} kg CO2e</p>
            </div>
            <div className="bg-yellow-100 p-4 rounded">
              <h3 className="font-semibold mb-2">Water Usage:</h3>
              <p>{product?.sustainability_metrics?.sustainability_metrics?.water_usage} liters</p>
            </div>
            <div className="bg-purple-100 p-4 rounded">
              <h3 className="font-semibold mb-2">Renewable Energy Used:</h3>
              <p>{product?.sustainability_metrics?.sustainability_metrics?.renewable_energy_used ? 'Yes' : 'No'}</p>
            </div>
            <div className="bg-red-100 p-4 rounded">
              <h3 className="font-semibold mb-2">Recyclable Packaging:</h3>
              <p>{product?.sustainability_metrics?.sustainability_metrics?.recyclable_packaging ? 'Yes' : 'No'}</p>
            </div>
          </div>
        </div>

                {/* Review Submission */}
            {reviews.length === 0 && (
              <div className="mt-8">
                <h2 className="text-2xl font-bold mb-4">Be the first to review this product!</h2>
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, index) => (
                    <FaStar
                      key={index}
                      className={index < reviewRating ? 'text-yellow-400 cursor-pointer' : 'text-gray-300 cursor-pointer'}
                      onClick={() => handleRatingChange(index + 1)}
                    />
                  ))}
                </div>
                <textarea
                  placeholder="Write your review here..."
                  value={reviewComment}
                  onChange={handleCommentChange}
                  className="w-full p-2 border rounded"
                />
                <button
                  onClick={() => handleSubmitReview(reviewRating, reviewComment)}
                  className="mt-4 bg-blue-500 text-white py-2 px-4 rounded"
                >
                  Submit Review
                </button>
              </div>
            )}
        {/* Customer Reviews */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-4">Customer Reviews</h2>
          {reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.uid} className="bg-gray-100 p-4 rounded">
                  <div className="flex items-center mb-2">
                    {[...Array(5)].map((_, index) => (
                      <FaStar
                        key={index}
                        className={index < review.rating ? 'text-yellow-400' : 'text-gray-300'}
                      />
                    ))}
                  </div>
                  <p className="text-gray-700">{review.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <p>No reviews yet. Be the first to review this product!</p>
          )}
        </div>

        {/* Related Products */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-4">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {relatedProducts && relatedProducts.map((relatedProduct) => (
              <Link
                key={relatedProduct.uid}
                to={`/product/${relatedProduct.uid}`}
                className="bg-white shadow rounded-lg overflow-hidden transition duration-300 hover:shadow-lg"
              >
                <img
                  src={relatedProduct.images[0].image_url}
                  alt={relatedProduct.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="font-semibold mb-2">{relatedProduct.name}</h3>
                  <p className="text-gray-600">${relatedProduct.price.toFixed(2)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default UV_ProductDetail;