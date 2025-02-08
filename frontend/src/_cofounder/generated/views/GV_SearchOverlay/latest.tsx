import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { RootState, AppDispatch, add_recent_search, toggle_search_overlay } from '@/store/main';
import axios from 'axios';
import { debounce } from 'lodash';
import { X, Search, ChevronDown } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

const GV_SearchOverlay: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const language = useSelector((state: RootState) => state.ui.language);
  const recentSearches = useSelector((state: RootState) => state.search.recent_searches);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    categories: [] as string[],
    location: '',
    priceRange: { min: 0, max: 1000 }
  });
  const [sortOption, setSortOption] = useState('relevance');
  const [searchResults, setSearchResults] = useState({
    designs: [],
    designers: [],
    products: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [autocompleteResults, setAutocompleteResults] = useState([]);
  const [activeTab, setActiveTab] = useState('designs');

  const searchInputRef = useRef<HTMLInputElement>(null);

  const performSearch = useCallback(debounce(async (query: string, filters: any, sort: string) => {
    if (query.length < 2) {
      setSearchResults({ designs: [], designers: [], products: [] });
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.get('http://localhost:1337/api/search', {
        params: { query, ...filters, sort }
      });
      setSearchResults(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error('Search error:', error);
      setIsLoading(false);
    }
  }, 300), []);

  const fetchAutocomplete = useCallback(debounce(async (query: string) => {
    if (query.length < 2) {
      setAutocompleteResults([]);
      return;
    }

    try {
      const response = await axios.get('http://localhost:1337/api/search/autocomplete', {
        params: { query }
      });
      setAutocompleteResults(response.data);
    } catch (error) {
      console.error('Autocomplete error:', error);
    }
  }, 150), []);

  useEffect(() => {
    performSearch(searchQuery, selectedFilters, sortOption);
  }, [searchQuery, selectedFilters, sortOption, performSearch]);

  useEffect(() => {
    fetchAutocomplete(searchQuery);
  }, [searchQuery, fetchAutocomplete]);

  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleFilterChange = (filterType: string, value: any) => {
    setSelectedFilters(prev => ({ ...prev, [filterType]: value }));
  };

  const handleSortChange = (value: string) => {
    setSortOption(value);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSelectedFilters({
      categories: [],
      location: '',
      priceRange: { min: 0, max: 1000 }
    });
    setSortOption('relevance');
    setSearchResults({ designs: [], designers: [], products: [] });
  };

  const handleCloseOverlay = () => {
    dispatch(toggle_search_overlay());
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery) {
      dispatch(add_recent_search(searchQuery));
      performSearch(searchQuery, selectedFilters, sortOption);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-start overflow-y-auto">
      <div className="bg-white w-full max-w-4xl mt-20 rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-purple-900">Search</h2>
          <Button variant="ghost" size="icon" onClick={handleCloseOverlay}>
            <X className="h-6 w-6" />
          </Button>
        </div>

        {recentSearches.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-semibold mb-2 text-gray-600">Recent Searches</h3>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((search, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => setSearchQuery(search)}
                >
                  {search}
                </Button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSearchSubmit}>
          <div className="relative mb-4">
            <Input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={handleSearchInput}
              placeholder="Search designs, designers, or products..."
              className="pr-10"
            />
            <Button type="submit" size="icon" className="absolute right-0 top-0">
              <Search className="h-4 w-4" />
            </Button>
          </div>

          {autocompleteResults.length > 0 && (
            <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-60 overflow-auto">
              {autocompleteResults.map((result: string, index: number) => (
                <li
                  key={index}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => setSearchQuery(result)}
                >
                  {result}
                </li>
              ))}
            </ul>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categories</label>
              <div className="space-y-2">
                {['woodworking', 'apparel', 'web-design', 'automotive'].map((category) => (
                  <div key={category} className="flex items-center">
                    <Checkbox
                      id={category}
                      checked={selectedFilters.categories.includes(category)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          handleFilterChange('categories', [...selectedFilters.categories, category]);
                        } else {
                          handleFilterChange('categories', selectedFilters.categories.filter(c => c !== category));
                        }
                      }}
                    />
                    <label htmlFor={category} className="ml-2 text-sm text-gray-700">{category}</label>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <Input
                type="text"
                value={selectedFilters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                placeholder="Enter location"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price Range</label>
              <Slider
                defaultValue={[selectedFilters.priceRange.min, selectedFilters.priceRange.max]}
                max={1000}
                step={10}
                onValueChange={(value) => handleFilterChange('priceRange', { min: value[0], max: value[1] })}
              />
              <div className="flex justify-between mt-2 text-sm text-gray-600">
                <span>${selectedFilters.priceRange.min}</span>
                <span>${selectedFilters.priceRange.max}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center mb-4">
            <Select value={sortOption} onValueChange={handleSortChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Relevance</SelectItem>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="popularity">Popularity</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit" className="bg-blue-500 text-white">
              Search
            </Button>
          </div>
        </form>

        {isLoading ? (
          <Progress value={33} className="w-full mt-4" />
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="designs">Designs</TabsTrigger>
              <TabsTrigger value="designers">Designers</TabsTrigger>
              <TabsTrigger value="products">Products</TabsTrigger>
            </TabsList>
            {Object.entries(searchResults).map(([category, results]) => (
              <TabsContent key={category} value={category}>
                {results.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {results.map((result: any) => (
                      <div key={result.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <Link
                          to={`/${category.slice(0, -1)}/${result.id}`}
                          className="text-blue-600 hover:text-blue-800 font-semibold"
                        >
                          {result.title || result.name}
                        </Link>
                        <p className="text-sm text-gray-600 mt-2">{result.description}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No results found for {category}</p>
                )}
              </TabsContent>
            ))}
          </Tabs>
        )}

        <div className="mt-8 flex justify-end">
          <Button variant="outline" onClick={handleClearSearch}>
            Clear Search
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GV_SearchOverlay;