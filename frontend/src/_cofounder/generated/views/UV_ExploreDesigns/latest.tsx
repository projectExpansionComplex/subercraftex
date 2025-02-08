import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { RootState, AppDispatch, add_notification } from '@/store/main';
import axios from 'axios';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { FixedSizeList as List } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';
import { debounce } from 'lodash';
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Toggle } from "@/components/ui/toggle";
import { Button } from "@/components/ui/button";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Grid, List as ListIcon, X } from 'lucide-react';

// Types
interface Design {
  uid: string;
  title: string;
  thumbnailUrl: string;
  designerName: string;
  designerUid: string;
  category: string;
  country: string;
  description: string;
  createdAt: string;
  price: number;
}

interface Filters {
  category: string | null;
  region: string | null;
  priceRange: { min: number | null; max: number | null } | null;
  materials: string[];
  designerUid: string | null;
}

// Custom hook for fetching designs
const useFetchDesigns = (filters: Filters, sortOption: string, page: number) => {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [totalDesigns, setTotalDesigns] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { auth_token } = useSelector((state: RootState) => state.auth);

  const fetchDesigns = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('http://localhost:1337/api/designs', {
        params: { ...filters, sort: sortOption, page },
        headers: { Authorization: `Bearer ${auth_token}` },
      });
      setDesigns(prevDesigns => [...prevDesigns, ...response.data.designs]);
      setTotalDesigns(response.data.total_count);
    } catch (err) {
      setError('Failed to fetch designs. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [filters, sortOption, page, auth_token]);

  useEffect(() => {
    fetchDesigns();
  }, [fetchDesigns]);

  return { designs, totalDesigns, loading, error };
};

const UV_ExploreDesigns: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const { theme, language } = useSelector((state: RootState) => state.preferences);
  const { current_user } = useSelector((state: RootState) => state.auth);

  const [filters, setFilters] = useState<Filters>({
    category: null,
    region: null,
    priceRange: null,
    materials: [],
    designerUid: null,
  });
  const [sortOption, setSortOption] = useState<string>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [quickViewDesign, setQuickViewDesign] = useState<Design | null>(null);

  const { designs, totalDesigns, loading, error } = useFetchDesigns(filters, sortOption, currentPage);

  const handleFilterChange = (newFilters: Partial<Filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
  };

  const handleSortChange = (newSortOption: string) => {
    setSortOption(newSortOption);
    setCurrentPage(1);
  };

  const handleRegionClick = (region: string) => {
    handleFilterChange({ region: region === filters.region ? null : region });
  };

  const handleQuickView = (design: Design) => {
    setQuickViewDesign(design);
    setIsQuickViewOpen(true);
  };

  const closeQuickView = () => {
    setIsQuickViewOpen(false);
    setQuickViewDesign(null);
  };

  const loadMoreItems = () => {
    if (!loading) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const debouncedLoadMoreItems = debounce(loadMoreItems, 300);

  const isItemLoaded = (index: number) => index < designs.length;

  const DesignItem: React.FC<{ index: number; style: React.CSSProperties }> = ({ index, style }) => {
    const design = designs[index];
    if (!design) return null;

    return (
      <div style={style} className={`p-4 ${viewMode === 'grid' ? 'w-full sm:w-1/2 md:w-1/3 lg:w-1/4' : 'w-full'}`}>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:scale-105">
          <img src={design.thumbnailUrl} alt={design.title} className="w-full h-48 object-cover" />
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-2 text-purple-700 dark:text-purple-300">{design.title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{design.designerName}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{design.country}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{design.category}</p>
            <p className="text-sm line-clamp-2 text-gray-700 dark:text-gray-200">{design.description}</p>
            <div className="mt-4 flex justify-between items-center">
              <Button
                onClick={() => handleQuickView(design)}
                variant="outline"
                className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Quick View
              </Button>
              <Link
                to={`/design/${design.uid}`}
                className="text-green-500 hover:text-green-600 dark:text-green-400 dark:hover:text-green-300"
              >
                View Details
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (error) {
    dispatch(add_notification({ id: Date.now().toString(), type: 'error', message: error }));
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-center text-purple-800 dark:text-purple-200">Explore Designs</h1>

        {/* World Map */}
        <div className="mb-8 bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
          <ComposableMap projection="geoMercator">
            <Geographies geography="/world-110m.json">
              {({ geographies }) =>
                geographies.map(geo => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onClick={() => handleRegionClick(geo.properties.CONTINENT)}
                    style={{
                      default: {
                        fill: filters.region === geo.properties.CONTINENT ? '#4B0082' : '#D6D6DA',
                        outline: 'none',
                      },
                      hover: {
                        fill: '#55E2F9',
                        outline: 'none',
                      },
                      pressed: {
                        fill: '#FFD700',
                        outline: 'none',
                      },
                    }}
                  />
                ))
              }
            </Geographies>
          </ComposableMap>
        </div>

        {/* Filters */}
        <div className="mb-8 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4 text-purple-700 dark:text-purple-300">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Select
              value={filters.category || ''}
              onValueChange={(value) => handleFilterChange({ category: value || null })}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                <SelectItem value="woodworking">Woodworking</SelectItem>
                <SelectItem value="apparel">Apparel</SelectItem>
                <SelectItem value="web_design">Web Design</SelectItem>
                <SelectItem value="automotive">Automotive</SelectItem>
                <SelectItem value="architectural">Architectural</SelectItem>
                <SelectItem value="interior">Interior</SelectItem>
              </SelectContent>
            </Select>

            <div>
              <p className="mb-2 text-sm text-gray-600 dark:text-gray-300">Price Range</p>
              <Slider
                defaultValue={[0, 1000]}
                max={1000}
                step={10}
                onValueChange={(value) => handleFilterChange({ priceRange: { min: value[0], max: value[1] } })}
                className="w-full"
              />
            </div>

            <Select
              value={sortOption}
              onValueChange={(value) => handleSortChange(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
                <SelectItem value="price_low_high">Price: Low to High</SelectItem>
                <SelectItem value="price_high_low">Price: High to Low</SelectItem>
                <SelectItem value="most_popular">Most Popular</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center space-x-2">
              <Toggle
                pressed={viewMode === 'grid'}
                onPressedChange={() => setViewMode('grid')}
                aria-label="Grid view"
              >
                <Grid className="h-4 w-4" />
              </Toggle>
              <Toggle
                pressed={viewMode === 'list'}
                onPressedChange={() => setViewMode('list')}
                aria-label="List view"
              >
                <ListIcon className="h-4 w-4" />
              </Toggle>
              <Button
                variant="outline"
                onClick={() => handleFilterChange({ category: null, region: null, priceRange: null, materials: [], designerUid: null })}
                className="ml-auto"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Design List */}
        <InfiniteLoader
          isItemLoaded={isItemLoaded}
          itemCount={totalDesigns}
          loadMoreItems={debouncedLoadMoreItems}
        >
          {({ onItemsRendered, ref }) => (
            <List
              className="list"
              height={800}
              itemCount={totalDesigns}
              itemSize={viewMode === 'grid' ? 350 : 200}
              onItemsRendered={onItemsRendered}
              ref={ref}
              width={viewMode === 'grid' ? window.innerWidth - 32 : window.innerWidth - 64}
            >
              {DesignItem}
            </List>
          )}
        </InfiniteLoader>

        {loading && (
          <div className="text-center my-4">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        )}

        <Pagination className="mt-8">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#" isActive>{currentPage}</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext href="#" onClick={() => setCurrentPage(prev => prev + 1)} />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>

      {/* Quick View Modal */}
      {isQuickViewOpen && quickViewDesign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg max-w-2xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-purple-700 dark:text-purple-300">{quickViewDesign.title}</h2>
              <Button variant="ghost" onClick={closeQuickView}>
                <X className="h-6 w-6" />
              </Button>
            </div>
            <img src={quickViewDesign.thumbnailUrl} alt={quickViewDesign.title} className="w-full h-64 object-cover mb-4 rounded-lg" />
            <p className="mb-2"><strong className="text-blue-600 dark:text-blue-400">Designer:</strong> {quickViewDesign.designerName}</p>
            <p className="mb-2"><strong className="text-blue-600 dark:text-blue-400">Category:</strong> {quickViewDesign.category}</p>
            <p className="mb-2"><strong className="text-blue-600 dark:text-blue-400">Country:</strong> {quickViewDesign.country}</p>
            <p className="mb-4 text-gray-700 dark:text-gray-300">{quickViewDesign.description}</p>
            <div className="flex justify-between">
              <Link
                to={`/design/${quickViewDesign.uid}`}
                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors"
              >
                View Full Details
              </Link>
              <Button
                onClick={closeQuickView}
                variant="outline"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UV_ExploreDesigns;