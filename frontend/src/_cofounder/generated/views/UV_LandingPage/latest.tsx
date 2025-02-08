import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { RootState, AppDispatch, add_notification } from '@/store/main';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star } from 'lucide-react';

const UV_LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch: AppDispatch = useDispatch();
  const { current_user } = useSelector((state: RootState) => state.auth);
  const { theme, language } = useSelector((state: RootState) => state.preferences);

  const [featuredDesigns, setFeaturedDesigns] = useState<any[]>([]);
  const [latestDesigns, setLatestDesigns] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [designerSpotlight, setDesignerSpotlight] = useState<any>(null);
  const [worldMapData, setWorldMapData] = useState<any>({ regions: [] });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLandingPageData = async () => {
      try {
        setIsLoading(true);
        const [featuredRes, latestRes, testimonialsRes, spotlightRes, mapDataRes] = await Promise.all([
          axios.get('http://localhost:1337/api/featured-designs'),
          axios.get('http://localhost:1337/api/latest-designs'),
          axios.get('http://localhost:1337/api/testimonials'),
          axios.get('http://localhost:1337/api/designer-spotlight'),
          axios.get('http://localhost:1337/api/world-map-data')
        ]);

        setFeaturedDesigns(featuredRes.data);
        setLatestDesigns(latestRes.data);
        setTestimonials(testimonialsRes.data);
        setDesignerSpotlight(spotlightRes.data);
        setWorldMapData(mapDataRes.data);
      } catch (error) {
        console.error('Error fetching landing page data:', error);
        dispatch(add_notification({
          id: Date.now().toString(),
          type: 'error',
          message: 'Failed to load some content. Please try refreshing the page.'
        }));
      } finally {
        setIsLoading(false);
      }
    };

    fetchLandingPageData();
  }, [dispatch]);

  const handleDesignClick = (designUid: string) => {
    navigate(`/design/${designUid}`);
  };

  const handleDesignerSpotlightClick = (designerUid: string) => {
    navigate(`/designer/${designerUid}`);
  };

  const handleRegionClick = (regionName: string) => {
    navigate(`/explore?region=${regionName}`);
  };

  const handleSignUpClick = () => {
    if (current_user) {
      navigate('/explore');
    } else {
      navigate('/register');
    }
  };

  return (
    <div className={`uv-landing-page ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center bg-gradient-to-r from-purple-600 to-blue-500">
        <div className="text-center z-10 px-4 md:px-0">
          <h1 className="text-4xl md:text-7xl font-bold mb-4 text-white">
            Discover Global Design Excellence
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white">
            Bringing the world's most innovative designs to your fingertips
          </p>
          <Button
            onClick={handleSignUpClick}
            className="bg-white text-purple-600 hover:bg-purple-100 transition duration-300"
          >
            {current_user ? 'Explore Designs' : 'Sign Up Now'}
          </Button>
        </div>
        <div className="absolute inset-0 bg-black opacity-50"></div>
      </section>

      {/* Interactive World Map */}
      <section className="py-16 px-4 md:px-8">
        <h2 className="text-3xl font-bold mb-8 text-center">Explore Designs by Region</h2>
        <div className="relative w-full h-96 md:h-[600px] bg-gray-200 rounded-lg overflow-hidden">
          {worldMapData.regions.map((region: any) => (
            <Button
              key={region.name}
              onClick={() => handleRegionClick(region.name)}
              className="absolute bg-blue-500 hover:bg-blue-600 text-white rounded-full transform -translate-x-1/2 -translate-y-1/2 transition duration-300"
              style={{ left: `${region.coordinates.x}%`, top: `${region.coordinates.y}%` }}
            >
              {region.name} ({region.designCount})
            </Button>
          ))}
        </div>
      </section>

      {/* Featured Designers Carousel */}
      <section className="py-16 px-4 md:px-8 bg-gray-100">
        <h2 className="text-3xl font-bold mb-8 text-center">Featured Designers</h2>
        <Carousel className="w-full max-w-5xl mx-auto">
          <CarouselContent>
            {featuredDesigns.map((design) => (
              <CarouselItem key={design.uid} className="md:basis-1/2 lg:basis-1/3">
                <div
                  className="cursor-pointer p-4"
                  onClick={() => handleDesignClick(design.uid)}
                >
                  <img
                    src={design.imageUrl}
                    alt={design.title}
                    className="w-full h-48 object-cover rounded-lg mb-2"
                  />
                  <h3 className="font-semibold">{design.title}</h3>
                  <p className="text-sm text-gray-600">{design.designerName}</p>
                  <Badge variant="secondary">{design.country}</Badge>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </section>

      {/* Latest Designs */}
      <section className="py-16 px-4 md:px-8">
        <h2 className="text-3xl font-bold mb-8 text-center">Latest Designs</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {latestDesigns.map((design) => (
            <div
              key={design.uid}
              className="cursor-pointer bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:scale-105"
              onClick={() => handleDesignClick(design.uid)}
            >
              <img
                src={design.thumbnailUrl}
                alt={design.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="font-semibold mb-1">{design.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{design.designerName}</p>
                <Badge>{design.category}</Badge>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Designer Spotlight */}
      {designerSpotlight && (
        <section className="py-16 px-4 md:px-8 bg-gradient-to-r from-purple-600 to-blue-500 text-white">
          <h2 className="text-3xl font-bold mb-8 text-center">Designer Spotlight</h2>
          <div className="flex flex-col md:flex-row items-center justify-center space-y-8 md:space-y-0 md:space-x-8">
            <Avatar className="w-48 h-48">
              <AvatarImage src={designerSpotlight.profileImage} alt={designerSpotlight.name} />
              <AvatarFallback>{designerSpotlight.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="text-center md:text-left">
              <h3 className="text-2xl font-bold mb-2">{designerSpotlight.name}</h3>
              <p className="text-xl mb-4">{designerSpotlight.specialty}</p>
              <Button
                onClick={() => handleDesignerSpotlightClick(designerSpotlight.uid)}
                variant="secondary"
              >
                View Profile
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      <section className="py-16 px-4 md:px-8">
        <h2 className="text-3xl font-bold mb-8 text-center">What Our Users Say</h2>
        <Carousel className="w-full max-w-4xl mx-auto">
          <CarouselContent>
            {testimonials.map((testimonial) => (
              <CarouselItem key={testimonial.uid} className="md:basis-1/2">
                <div className="bg-white p-6 rounded-lg shadow-md m-2">
                  <p className="text-gray-600 mb-4">{testimonial.content}</p>
                  <div className="flex items-center">
                    <Avatar className="w-12 h-12 mr-4">
                      <AvatarImage src={testimonial.userAvatar} alt={testimonial.userName} />
                      <AvatarFallback>{testimonial.userName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold">{testimonial.userName}</h4>
                      <div className="flex text-yellow-400">
                        {[...Array(testimonial.rating)].map((_, index) => (
                          <Star key={index} className="w-5 h-5 fill-current" />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </section>

      {/* Call-to-Action */}
      <section className="py-16 px-4 md:px-8 bg-purple-600 text-white text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Join Our Global Design Community?</h2>
        <p className="text-xl mb-8">Sign up now and start exploring amazing designs from around the world!</p>
        <Button
          onClick={handleSignUpClick}
          variant="secondary"
          className="bg-white text-purple-600 hover:bg-purple-100 transition duration-300"
        >
          {current_user ? 'Explore Designs' : 'Sign Up Now'}
        </Button>
      </section>
    </div>
  );
};

export default UV_LandingPage;