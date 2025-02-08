import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { RootState, AppDispatch, add_to_cart, add_notification } from '@/store/main';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Star, ShoppingCart, Heart, Share, ChevronLeft, ChevronRight, Camera } from 'lucide-react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const UV_DesignDetail: React.FC = () => {
  const { designUid } = useParams<{ designUid: string }>();
  const dispatch: AppDispatch = useDispatch();
  const { auth_token, current_user } = useSelector((state: RootState) => state.auth);
  const { currency } = useSelector((state: RootState) => state.preferences);

  const [designData, setDesignData] = useState<any>(null);
  const [relatedDesigns, setRelatedDesigns] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [is3DViewerOpen, setIs3DViewerOpen] = useState<boolean>(false);
  const [quantity, setQuantity] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDesignData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [designResponse, relatedResponse, reviewsResponse] = await Promise.all([
        axios.get(`http://localhost:1337/api/designs/${designUid}`, {
          headers: { Authorization: `Bearer ${auth_token}` }
        }),
        axios.get(`http://localhost:1337/api/designs/${designUid}/related`),
        axios.get(`http://localhost:1337/api/designs/${designUid}/reviews`)
      ]);

      setDesignData(designResponse.data);
      setRelatedDesigns(relatedResponse.data);
      setReviews(reviewsResponse.data);

      const avgRating = reviewsResponse.data.reduce((acc: number, review: any) => acc + review.rating, 0) / reviewsResponse.data.length;
      setAverageRating(avgRating);
    } catch (err) {
      setError('Failed to load design data. Please try again later.');
      console.error('Error fetching design data:', err);
    }
    setIsLoading(false);
  }, [designUid, auth_token]);

  useEffect(() => {
    fetchDesignData();
  }, [fetchDesignData]);

  const handleImageGalleryNav = (index: number) => {
    setSelectedImageIndex(index);
  };

  const toggle3DViewer = () => {
    setIs3DViewerOpen(!is3DViewerOpen);
  };

  const updateQuantity = (newQuantity: number) => {
    setQuantity(Math.max(1, newQuantity));
  };

  const addToCart = async () => {
    try {
      await axios.post('http://localhost:1337/api/cart', {
        design_uid: designUid,
        quantity
      }, {
        headers: { Authorization: `Bearer ${auth_token}` }
      });
      dispatch(add_to_cart({ product_uid: designUid, quantity, price: designData.price }));
      dispatch(add_notification({
        id: Date.now().toString(),
        type: 'success',
        message: 'Item added to cart successfully!'
      }));
    } catch (err) {
      console.error('Error adding to cart:', err);
      dispatch(add_notification({
        id: Date.now().toString(),
        type: 'error',
        message: 'Failed to add item to cart. Please try again.'
      }));
    }
  };

  const requestCustomOrder = async () => {
    try {
      await axios.post('http://localhost:1337/api/custom-orders', {
        design_uid: designUid
      }, {
        headers: { Authorization: `Bearer ${auth_token}` }
      });
      dispatch(add_notification({
        id: Date.now().toString(),
        type: 'success',
        message: 'Custom order request submitted successfully!'
      }));
    } catch (err) {
      console.error('Error requesting custom order:', err);
      dispatch(add_notification({
        id: Date.now().toString(),
        type: 'error',
        message: 'Failed to submit custom order request. Please try again.'
      }));
    }
  };

  const submitReview = async (rating: number, comment: string) => {
    try {
      const response = await axios.post(`http://localhost:1337/api/designs/${designUid}/reviews`, {
        rating,
        comment
      }, {
        headers: { Authorization: `Bearer ${auth_token}` }
      });
      setReviews([...reviews, response.data]);
      dispatch(add_notification({
        id: Date.now().toString(),
        type: 'success',
        message: 'Review submitted successfully!'
      }));
    } catch (err) {
      console.error('Error submitting review:', err);
      dispatch(add_notification({
        id: Date.now().toString(),
        type: 'error',
        message: 'Failed to submit review. Please try again.'
      }));
    }
  };

  const reportInappropriateContent = async (contentType: 'design' | 'review', contentId: string) => {
    try {
      await axios.post('http://localhost:1337/api/report', {
        content_type: contentType,
        content_id: contentId
      }, {
        headers: { Authorization: `Bearer ${auth_token}` }
      });
      dispatch(add_notification({
        id: Date.now().toString(),
        type: 'success',
        message: 'Content reported successfully. We will review it shortly.'
      }));
    } catch (err) {
      console.error('Error reporting content:', err);
      dispatch(add_notification({
        id: Date.now().toString(),
        type: 'error',
        message: 'Failed to report content. Please try again.'
      }));
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>;
  }

  if (!designData) {
    return <div className="flex justify-center items-center h-screen">Design not found</div>;
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <Breadcrumb className="mb-8">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/designs">Designs</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{designData.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <Swiper
              modules={[Navigation, Pagination]}
              spaceBetween={10}
              slidesPerView={1}
              navigation={{
                prevEl: '.swiper-button-prev',
                nextEl: '.swiper-button-next',
              }}
              pagination={{ clickable: true }}
              onSlideChange={(swiper) => handleImageGalleryNav(swiper.activeIndex)}
              className="rounded-lg overflow-hidden"
            >
              {designData.images.map((image: any, index: number) => (
                <SwiperSlide key={index}>
                  <LazyLoadImage
                    effect="blur"
                    src={image.url}
                    alt={`${designData.title} - Image ${index + 1}`}
                    className="w-full h-auto object-cover"
                  />
                </SwiperSlide>
              ))}
              <div className="swiper-button-prev absolute left-4 top-1/2 z-10 transform -translate-y-1/2">
                <Button variant="outline" size="icon">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </div>
              <div className="swiper-button-next absolute right-4 top-1/2 z-10 transform -translate-y-1/2">
                <Button variant="outline" size="icon">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </Swiper>

            <div className="flex justify-center space-x-4">
              {designData.threeDModelUrl && (
                <Button onClick={toggle3DViewer} variant="outline">
                  {/* <Cube className="mr-2 h-4 w-4" /> */}
                  {is3DViewerOpen ? 'Close 3D View' : 'Open 3D View'}
                </Button>
              )}
              <Button variant="outline">
                <Camera className="mr-2 h-4 w-4" />
                360° View
              </Button>
            </div>

            {is3DViewerOpen && (
              <div className="aspect-w-16 aspect-h-9">
                <iframe
                  src={designData.threeDModelUrl}
                  title="3D Model Viewer"
                  className="w-full h-full rounded-lg"
                  allowFullScreen
                ></iframe>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <h1 className="text-4xl font-bold text-gray-900">{designData.title}</h1>
            <Link to={`/designer/${designData.designerUid}`} className="inline-flex items-center space-x-2 text-blue-600 hover:underline">
              <Avatar>
                <AvatarImage src={designData.designerProfileUrl} alt={designData.designerName} />
                <AvatarFallback>{designData.designerName.charAt(0)}</AvatarFallback>
              </Avatar>
              <span>Designed by {designData.designerName}</span>
            </Link>

            <div className="flex items-center space-x-2">
              <div className="flex text-yellow-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${star <= averageRating ? 'fill-current' : 'stroke-current'}`}
                  />
                ))}
              </div>
              <span className="text-gray-600">({reviews.length} reviews)</span>
            </div>

            <p className="text-3xl font-semibold text-gray-900">
              {new Intl.NumberFormat(currency, {
                style: 'currency',
                currency: currency
              }).format(designData.price)}
            </p>

            <p className="text-gray-700">{designData.description}</p>

            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Materials</h2>
                <ul className="list-disc list-inside text-gray-700">
                  {designData.materials.map((material: string, index: number) => (
                    <li key={index}>{material}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Dimensions</h2>
                <p className="text-gray-700">
                  {designData.dimensions.width} x {designData.dimensions.height} x {designData.dimensions.depth} cm
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="w-1/3">
                <Select value={quantity.toString()} onValueChange={(value) => updateQuantity(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Quantity" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={addToCart} className="flex-1">
                <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
              </Button>
            </div>

            <Button onClick={requestCustomOrder} variant="outline" className="w-full">
              Request Custom Order
            </Button>

            <div className="flex justify-between items-center">
              <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
                <Heart className="mr-2 h-4 w-4" /> Add to Wishlist
              </Button>
              <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
                <Share className="mr-2 h-4 w-4" /> Share
              </Button>
            </div>
          </div>
        </div>

        <Tabs defaultValue="details" className="mt-12">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="designer">Designer</TabsTrigger>
          </TabsList>
          <TabsContent value="details">
            <div className="prose max-w-none">
              <h2>Product Details</h2>
              <p>{designData.longDescription}</p>
              {/* Add more detailed information here */}
            </div>
          </TabsContent>
          <TabsContent value="reviews">
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.uid} className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center mb-4">
                    <Avatar>
                      <AvatarImage src={review.userAvatar} alt={review.userName} />
                      <AvatarFallback>{review.userName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="ml-4">
                      <p className="font-semibold">{review.userName}</p>
                      <div className="flex text-yellow-400">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${star <= review.rating ? 'fill-current' : 'stroke-current'}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700">{review.comment}</p>
                  <button
                    onClick={() => reportInappropriateContent('review', review.uid)}
                    className="mt-2 text-sm text-red-500 hover:underline"
                  >
                    Report
                  </button>
                </div>
              ))}
              {current_user && (
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.target as HTMLFormElement;
                  const rating = parseInt(form.rating.value);
                  const comment = form.comment.value;
                  submitReview(rating, comment);
                  form.reset();
                }} className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-xl font-semibold mb-4">Write a Review</h3>
                  <div className="mb-4">
                    <label htmlFor="rating" className="block text-sm font-medium text-gray-700">
                      Rating
                    </label>
                    <Select name="rating">
                      <SelectTrigger>
                        <SelectValue placeholder="Select a rating" />
                      </SelectTrigger>
                      <SelectContent>
                        {[5, 4, 3, 2, 1].map((num) => (
                          <SelectItem key={num} value={num.toString()}>
                            {num} {num === 1 ? 'Star' : 'Stars'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="mb-4">
                    <label htmlFor="comment" className="block text-sm font-medium text-gray-700">
                      Comment
                    </label>
                    <textarea
                      id="comment"
                      name="comment"
                      rows={4}
                      required
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    ></textarea>
                  </div>
                  <Button type="submit">
                    Submit Review
                  </Button>
                </form>
              )}
            </div>
          </TabsContent>
          <TabsContent value="designer">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center mb-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={designData.designerProfileUrl} alt={designData.designerName} />
                  <AvatarFallback>{designData.designerName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="ml-4">
                  <h3 className="text-xl font-semibold">{designData.designerName}</h3>
                  <Link to={`/designer/${designData.designerUid}`} className="text-blue-600 hover:underline">
                    View Profile
                  </Link>
                </div>
              </div>
              <p className="text-gray-700">{designData.designerBio}</p>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Related Designs</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {relatedDesigns.map((design) => (
              <Link key={design.uid} to={`/design/${design.uid}`} className="group">
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <LazyLoadImage
                    effect="blur"
                    src={design.thumbnailUrl}
                    alt={design.title}
                    className="w-full h-48 object-cover group-hover:opacity-75 transition"
                  />
                  <div className="p-4">
                    <h3 className="text-lg font-semibold mb-2">{design.title}</h3>
                    <p className="text-gray-600 mb-2">By {design.designerName}</p>
                    <p className="text-blue-600 font-semibold">
                      {new Intl.NumberFormat(currency, {
                        style: 'currency',
                        currency: currency
                      }).format(design.price)}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-12 text-center">
          <Button variant="link" onClick={() => reportInappropriateContent('design', designUid)} className="text-red-500 hover:underline">
            Report Inappropriate Content
          </Button>
        </div>
      </div>
    </>
  );
};

export default UV_DesignDetail;