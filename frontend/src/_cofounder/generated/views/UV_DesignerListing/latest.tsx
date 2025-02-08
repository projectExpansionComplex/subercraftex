import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { RootState, AppDispatch, add_notification } from '@/store/main';
import axios from 'axios';
import { debounce } from 'lodash';
import { Moon, Sun, Search, ChevronLeft, ChevronRight, Star, MapPin, Briefcase } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Progress } from "@/components/ui/progress";

interface Designer {
  uid: string;
  name: string;
  profileImageUrl: string;
  specialties: string[];
  location: string;
  rating: number;
  designCount: number;
  featuredDesignUrl: string;
}

interface FeaturedDesigner extends Designer {
  bio: string;
}

const UV_DesignerListing: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const { auth_token } = useSelector((state: RootState) => state.auth);
  const { language, currency } = useSelector((state: RootState) => state.preferences);

  const [designers, setDesigners] = useState<Designer[]>([]);
  const [featuredDesigners, setFeaturedDesigners] = useState<FeaturedDesigner[]>([]);
  const [totalDesigners, setTotalDesigners] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    specialties: [] as string[],
    location: '',
    rating: 0,
  });
  const [sortOption, setSortOption] = useState('popularity');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [darkMode, setDarkMode] = useState(false);

  const itemsPerPage = 12;

  const fetchDesigners = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await axios.get('http://localhost:1337/api/designers', {
        params: {
          page: currentPage,
          limit: itemsPerPage,
          sort: sortOption,
          specialties: filters.specialties.join(','),
          location: filters.location,
          rating: filters.rating,
          search: searchTerm,
        },
        headers: auth_token ? { Authorization: `Bearer ${auth_token}` } : {},
      });
      setDesigners(response.data.designers);
      setTotalDesigners(response.data.total_count);
    } catch (err) {
      setError('Failed to fetch designers. Please try again later.');
      dispatch(add_notification({
        id: Date.now().toString(),
        type: 'error',
        message: 'Failed to fetch designers. Please try again later.',
      }));
    }
    setIsLoading(false);
  }, [currentPage, sortOption, filters, searchTerm, auth_token, dispatch]);

  const fetchFeaturedDesigners = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:1337/api/designers/featured', {
        headers: auth_token ? { Authorization: `Bearer ${auth_token}` } : {},
      });
      setFeaturedDesigners(response.data.featured_designers);
    } catch (err) {
      console.error('Failed to fetch featured designers:', err);
    }
  }, [auth_token]);

  useEffect(() => {
    fetchDesigners();
    fetchFeaturedDesigners();
  }, [fetchDesigners, fetchFeaturedDesigners]);

  const debouncedSearch = debounce((value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  }, 300);

  const handleFilterChange = (filterType: string, value: any) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
    setCurrentPage(1);
  };

  const handleSortChange = (option: string) => {
    setSortOption(option);
    setCurrentPage(1);
  };

  const handleQuickContact = (designerId: string) => {
    console.log('Quick contact with designer:', designerId);
  };

  const renderStarRating = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${index < rating ? 'text-yellow-400' : 'text-gray-300'}`}
        fill={index < rating ? 'currentColor' : 'none'}
      />
    ));
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    // You would typically update the global theme here
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold font-serif">Designers</h1>
          <Button variant="ghost" onClick={toggleDarkMode}>
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>

        <p className="text-xl mb-8">Discover talented designers from around the world</p>

        {featuredDesigners.length > 0 && (
          <section className="mb-12">
            <h2 className="text-3xl font-semibold mb-6 font-serif">Featured Designers</h2>
            <Carousel>
              <CarouselContent>
                {featuredDesigners.map((designer) => (
                  <CarouselItem key={designer.uid} className="md:basis-1/2 lg:basis-1/3">
                    <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                      <img src={designer.featuredDesignUrl} alt={`Featured design by ${designer.name}`} className="w-full h-48 object-cover rounded-lg mb-4" />
                      <div className="flex items-center mb-4">
                        <Avatar className="h-16 w-16 mr-4">
                          <AvatarImage src={designer.profileImageUrl} alt={designer.name} />
                          <AvatarFallback>{designer.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="text-xl font-semibold">{designer.name}</h3>
                          <p className="text-sm text-gray-500">{designer.specialties[0]}</p>
                        </div>
                      </div>
                      <p className="text-sm mb-4">{designer.bio}</p>
                      <Link to={`/designer/${designer.uid}`}>
                        <Button variant="outline" className="w-full">View Profile</Button>
                      </Link>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </section>
        )}

        <div className="mb-8 space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            <Input
              type="text"
              placeholder="Search designers..."
              className="flex-grow"
              onChange={(e) => debouncedSearch(e.target.value)}
            />
            <Select value={sortOption} onValueChange={handleSortChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popularity">Popularity</SelectItem>
                <SelectItem value="rating">Rating</SelectItem>
                <SelectItem value="experience">Experience</SelectItem>
                <SelectItem value="designs_count">Number of Designs</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-wrap gap-4">
            <Select value={filters.location} onValueChange={(value) => handleFilterChange('location', value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Locations</SelectItem>
                {/* Add location options */}
              </SelectContent>
            </Select>
            <Select value={filters.rating.toString()} onValueChange={(value) => handleFilterChange('rating', parseInt(value))}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">All Ratings</SelectItem>
                <SelectItem value="4">4+ Stars</SelectItem>
                <SelectItem value="3">3+ Stars</SelectItem>
                <SelectItem value="2">2+ Stars</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <Progress value={33} className="w-1/2 mx-auto" />
            <p className="mt-4 text-lg">Loading designers...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-600">{error}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {designers.map((designer) => (
              <div key={designer.uid} className={`rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white shadow'}`}>
                <img src={designer.featuredDesignUrl} alt={`Featured design by ${designer.name}`} className="w-full h-48 object-cover" />
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <Avatar className="h-12 w-12 mr-4">
                      <AvatarImage src={designer.profileImageUrl} alt={designer.name} />
                      <AvatarFallback>{designer.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-xl font-semibold">{designer.name}</h3>
                      <p className="text-sm flex items-center">
                        <MapPin className="w-4 h-4 mr-1" /> {designer.location}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center mb-2">
                    {renderStarRating(designer.rating)}
                    <span className="ml-2 text-sm">({designer.rating.toFixed(1)})</span>
                  </div>
                  <div className="mb-4">
                    {designer.specialties.map((specialty, index) => (
                      <Badge key={index} variant="secondary" className="mr-2 mb-2">{specialty}</Badge>
                    ))}
                  </div>
                  <p className="text-sm mb-4 flex items-center">
                    <Briefcase className="w-4 h-4 mr-1" /> {designer.designCount} designs
                  </p>
                  <div className="flex justify-between items-center">
                    <Link to={`/designer/${designer.uid}`}>
                      <Button variant="outline">View Profile</Button>
                    </Link>
                    <Button onClick={() => handleQuickContact(designer.uid)}>
                      Quick Contact
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && !error && (
          <div className="mt-12 flex justify-center items-center">
            <Button
              variant="outline"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="mr-2"
            >
              <ChevronLeft className="w-4 h-4 mr-2" /> Previous
            </Button>
            <span className="mx-4 text-lg">
              Page {currentPage} of {Math.ceil(totalDesigners / itemsPerPage)}
            </span>
            <Button
              variant="outline"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, Math.ceil(totalDesigners / itemsPerPage)))}
              disabled={currentPage === Math.ceil(totalDesigners / itemsPerPage)}
              className="ml-2"
            >
              Next <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UV_DesignerListing;