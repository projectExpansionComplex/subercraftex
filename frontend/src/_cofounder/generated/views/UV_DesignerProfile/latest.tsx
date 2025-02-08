import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch, add_notification } from '@/store/main';
import axios from 'axios';
import { format } from 'date-fns';
import { StarIcon, PlayIcon, XIcon } from '@heroicons/react/solid';

const UV_DesignerProfile: React.FC = () => {
  const { designerUid } = useParams<{ designerUid: string }>();
  const dispatch: AppDispatch = useDispatch();
  const { auth_token, current_user } = useSelector((state: RootState) => state.auth);
  const { currency } = useSelector((state: RootState) => state.preferences);

  const [designerData, setDesignerData] = useState<any>(null);
  const [designerPortfolio, setDesignerPortfolio] = useState<any[]>([]);
  const [designerProducts, setDesignerProducts] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [notableProjects, setNotableProjects] = useState<any[]>([]);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [currentVideo, setCurrentVideo] = useState("");
  const [availableConsultationSlots, setAvailableConsultationSlots] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDesignerData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await axios.get(`http://localhost:1337/api/designers/${designerUid}`, {
          headers: { Authorization: `Bearer ${auth_token}` }
        });
        setDesignerData(response.data.designer);
        setDesignerPortfolio(response.data.portfolio);
        setDesignerProducts(response.data.products);
        setReviews(response.data.reviews);
        setNotableProjects(response.data.notableProjects);
      } catch (err) {
        setError('Failed to load designer data. Please try again later.');
        dispatch(add_notification({
          id: Date.now().toString(),
          type: 'error',
          message: 'Failed to load designer data.'
        }));
      } finally {
        setIsLoading(false);
      }
    };

    fetchDesignerData();
  }, [designerUid, auth_token, dispatch]);

  const toggleVideoModal = (videoUrl: string = "") => {
    setIsVideoModalOpen(!isVideoModalOpen);
    setCurrentVideo(videoUrl);
  };

  const handlePortfolioItemClick = (itemUid: string) => {
    // Navigate to the full design detail page
    // This would typically use react-router's navigate function
    console.log(`Navigating to portfolio item: ${itemUid}`);
  };

  const handleProductClick = (productUid: string) => {
    // Navigate to the product detail page
    // This would typically use react-router's navigate function
    console.log(`Navigating to product: ${productUid}`);
  };

  const submitReview = async (rating: number, comment: string) => {
    try {
      await axios.post(`http://localhost:1337/api/designers/${designerUid}/reviews`, {
        rating,
        comment
      }, {
        headers: { Authorization: `Bearer ${auth_token}` }
      });
      dispatch(add_notification({
        id: Date.now().toString(),
        type: 'success',
        message: 'Review submitted successfully.'
      }));
      // Refresh reviews
      const reviewsResponse = await axios.get(`http://localhost:1337/api/designers/${designerUid}/reviews`);
      setReviews(reviewsResponse.data);
    } catch (err) {
      dispatch(add_notification({
        id: Date.now().toString(),
        type: 'error',
        message: 'Failed to submit review. Please try again.'
      }));
    }
  };

  const fetchConsultationSlots = async () => {
    try {
      const response = await axios.get(`http://localhost:1337/api/designers/${designerUid}/consultation-slots`, {
        headers: { Authorization: `Bearer ${auth_token}` }
      });
      setAvailableConsultationSlots(response.data);
    } catch (err) {
      dispatch(add_notification({
        id: Date.now().toString(),
        type: 'error',
        message: 'Failed to fetch consultation slots. Please try again.'
      }));
    }
  };

  const bookConsultation = async (slotId: string) => {
    try {
      await axios.post(`http://localhost:1337/api/consultations`, {
        designerUid,
        slotId
      }, {
        headers: { Authorization: `Bearer ${auth_token}` }
      });
      dispatch(add_notification({
        id: Date.now().toString(),
        type: 'success',
        message: 'Consultation booked successfully.'
      }));
      // Refresh available slots
      fetchConsultationSlots();
    } catch (err) {
      dispatch(add_notification({
        id: Date.now().toString(),
        type: 'error',
        message: 'Failed to book consultation. Please try again.'
      }));
    }
  };

  const followDesigner = async () => {
    try {
      await axios.post(`http://localhost:1337/api/designers/${designerUid}/follow`, {}, {
        headers: { Authorization: `Bearer ${auth_token}` }
      });
      dispatch(add_notification({
        id: Date.now().toString(),
        type: 'success',
        message: 'You are now following this designer.'
      }));
      // Update local state to reflect the follow action
      setDesignerData(prev => ({ ...prev, isFollowed: true }));
    } catch (err) {
      dispatch(add_notification({
        id: Date.now().toString(),
        type: 'error',
        message: 'Failed to follow designer. Please try again.'
      }));
    }
  };

  const initiateChat = async () => {
    try {
      const response = await axios.post(`http://localhost:1337/api/chats`, {
        recipientUid: designerUid
      }, {
        headers: { Authorization: `Bearer ${auth_token}` }
      });
      // Navigate to chat page with the new chat session
      console.log(`Navigating to chat session: ${response.data.chatUid}`);
    } catch (err) {
      dispatch(add_notification({
        id: Date.now().toString(),
        type: 'error',
        message: 'Failed to start chat. Please try again.'
      }));
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Designer Header */}
        <div className="relative">
          <img src={designerData.coverImageUrl} alt="Cover" className="w-full h-64 object-cover rounded-lg" />
          <img src={designerData.profileImageUrl} alt={designerData.name} className="absolute bottom-0 left-8 -mb-16 w-32 h-32 rounded-full border-4 border-white" />
        </div>
        
        <div className="mt-20 sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{designerData.name}</h1>
            <p className="mt-1 text-sm text-gray-500">{designerData.location}</p>
          </div>
          <div className="mt-4 sm:mt-0">
            {auth_token && (
              <>
                <button onClick={followDesigner} className="mr-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
                  {designerData.isFollowed ? 'Following' : 'Follow'}
                </button>
                <button onClick={initiateChat} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">
                  Message
                </button>
              </>
            )}
          </div>
        </div>

        {/* Designer Bio */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900">About</h2>
          <p className="mt-4 text-gray-600">{designerData.bio}</p>
          <div className="mt-4 flex flex-wrap">
            {designerData.specialties.map((specialty: string, index: number) => (
              <span key={index} className="mr-2 mb-2 px-3 py-1 bg-gray-200 rounded-full text-sm text-gray-700">
                {specialty}
              </span>
            ))}
          </div>
        </div>

        {/* Designer Portfolio */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900">Portfolio</h2>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {designerPortfolio.map((item) => (
              <div key={item.uid} className="relative group" onClick={() => handlePortfolioItemClick(item.uid)}>
                <img src={item.imageUrl} alt={item.title} className="w-full h-64 object-cover rounded-lg" />
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center rounded-lg">
                  <p className="text-white text-center font-bold">{item.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Designer Products */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900">Shop</h2>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {designerProducts.map((product) => (
              <div key={product.uid} className="border rounded-lg p-4" onClick={() => handleProductClick(product.uid)}>
                <img src={product.thumbnailUrl} alt={product.title} className="w-full h-48 object-cover rounded-lg" />
                <h3 className="mt-2 text-lg font-semibold">{product.title}</h3>
                <p className="text-gray-600">{new Intl.NumberFormat(currency, { style: 'currency', currency }).format(product.price)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Reviews */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900">Reviews</h2>
          <div className="mt-4">
            {reviews.map((review) => (
              <div key={review.uid} className="border-b pb-4 mb-4">
                <div className="flex items-center">
                  <img src={review.userAvatar} alt={review.userName} className="w-10 h-10 rounded-full mr-4" />
                  <div>
                    <p className="font-semibold">{review.userName}</p>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <StarIcon key={i} className={`h-5 w-5 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`} />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="mt-2 text-gray-600">{review.comment}</p>
                <p className="mt-1 text-sm text-gray-500">{format(new Date(review.createdAt), 'MMMM d, yyyy')}</p>
              </div>
            ))}
          </div>
          {auth_token && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold">Leave a Review</h3>
              {/* Add review form here */}
            </div>
          )}
        </div>

        {/* Notable Projects */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900">Notable Projects</h2>
          <div className="mt-4 space-y-8">
            {notableProjects.map((project, index) => (
              <div key={index} className="flex flex-col md:flex-row">
                <img src={project.imageUrl} alt={project.title} className="w-full md:w-1/3 h-48 object-cover rounded-lg" />
                <div className="mt-4 md:mt-0 md:ml-6 flex-1">
                  <h3 className="text-xl font-semibold">{project.title}</h3>
                  <p className="mt-2 text-gray-600">{project.description}</p>
                  <p className="mt-2 text-sm text-gray-500">Year: {project.year}</p>
                  <div className="mt-2">
                    <span className="text-sm font-semibold">Collaborators: </span>
                    {project.collaborators.join(', ')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Book a Consultation */}
        {auth_token && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900">Book a Consultation</h2>
            <button onClick={fetchConsultationSlots} className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
              View Available Slots
            </button>
            {availableConsultationSlots.length > 0 && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {availableConsultationSlots.map((slot) => (
                  <button
                    key={slot.id}
                    onClick={() => bookConsultation(slot.id)}
                    className="bg-white border border-gray-300 rounded-lg py-2 px-4 hover:bg-gray-50"
                  >
                    {format(new Date(slot.date), 'MMM d, yyyy')} at {slot.time}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Video Modal */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 w-full max-w-3xl">
            <div className="flex justify-end">
              <button onClick={() => toggleVideoModal()} className="text-gray-500 hover:text-gray-700">
                <XIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="mt-4">
              <video src={currentVideo} controls className="w-full" />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UV_DesignerProfile;