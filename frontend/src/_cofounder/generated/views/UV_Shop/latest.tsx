import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { RootState, AppDispatch, add_to_cart, add_notification } from '@/store/main';
import axios from 'axios';
import { debounce } from 'lodash';
import { Search, ShoppingCart, Grid, List, Star, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const UV_Shop: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  const [products, set_products] = useState<any[]>([]);
  const [categories, set_categories] = useState<any[]>([]);
  const [is_loading, set_is_loading] = useState(true);
  const [filters, set_filters] = useState({
    category_uid: null,
    price_min: null,
    price_max: null,
    rating: null,
  });
  const [sort_option, set_sort_option] = useState('created_at_desc');
  const [current_page, set_current_page] = useState(1);
  const [total_pages, set_total_pages] = useState(1);
  const [view_mode, set_view_mode] = useState('grid');
  const [quick_view_product, set_quick_view_product] = useState(null);
  const [search_query, set_search_query] = useState('');

  const { auth_token } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    fetch_categories();
    const search_params = new URLSearchParams(location.search);
    const initial_filters = {
      category_uid: search_params.get('category') || null,
      price_min: search_params.get('price_min') ? Number(search_params.get('price_min')) : null,
      price_max: search_params.get('price_max') ? Number(search_params.get('price_max')) : null,
      rating: search_params.get('rating') ? Number(search_params.get('rating')) : null,
    };
    set_filters(initial_filters);
    set_sort_option(search_params.get('sort') || 'created_at_desc');
    set_current_page(Number(search_params.get('page')) || 1);
    set_search_query(search_params.get('search') || '');
  }, [location.search]);

  useEffect(() => {
    fetch_products();
  }, [filters, sort_option, current_page, search_query]);

  const fetch_categories = async () => {
    try {
      const response = await axios.get('http://localhost:1337/api/product-categories');
      set_categories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      dispatch(add_notification({
        id: Date.now().toString(),
        type: 'error',
        message: 'Failed to load product categories. Please try again.',
      }));
    }
  };

  const fetch_products = async () => {
    set_is_loading(true);
    try {
      const response = await axios.get('http://localhost:1337/api/products', {
        params: {
          ...filters,
          sort: sort_option,
          page: current_page,
          limit: 20,
          search: search_query,
        },
      });
      set_products(response.data.products);
      set_total_pages(Math.ceil(response.data.total_count / 20));
    } catch (error) {
      console.error('Error fetching products:', error);
      dispatch(add_notification({
        id: Date.now().toString(),
        type: 'error',
        message: 'Failed to load products. Please try again.',
      }));
    } finally {
      set_is_loading(false);
    }
  };

  const update_url = useCallback(
    debounce((new_filters, new_sort, new_page, new_search) => {
      const search_params = new URLSearchParams();
      Object.entries(new_filters).forEach(([key, value]) => {
        if (value !== null) {
          search_params.set(key, value.toString());
        }
      });
      search_params.set('sort', new_sort);
      search_params.set('page', new_page.toString());
      if (new_search) {
        search_params.set('search', new_search);
      }
      navigate(`${location.pathname}?${search_params.toString()}`, { replace: true });
    }, 300),
    [navigate, location.pathname]
  );

  const handle_filter_change = (key: string, value: any) => {
    const new_filters = { ...filters, [key]: value };
    set_filters(new_filters);
    set_current_page(1);
    update_url(new_filters, sort_option, 1, search_query);
  };

  const handle_sort_change = (new_sort: string) => {
    set_sort_option(new_sort);
    set_current_page(1);
    update_url(filters, new_sort, 1, search_query);
  };

  const handle_page_change = (new_page: number) => {
    set_current_page(new_page);
    update_url(filters, sort_option, new_page, search_query);
  };

  const handle_search = (query: string) => {
    set_search_query(query);
    set_current_page(1);
    update_url(filters, sort_option, 1, query);
  };

  const handle_add_to_cart = (product: any) => {
    dispatch(add_to_cart({
      product_uid: product.uid,
      quantity: 1,
      price: product.price,
    }));
    dispatch(add_notification({
      id: Date.now().toString(),
      type: 'success',
      message: `${product.name} added to cart!`,
    }));
  };

  const filtered_products = useMemo(() => {
    return products.filter((product) => {
      if (filters.category_uid && product.category_uid !== filters.category_uid) return false;
      if (filters.price_min && product.price < filters.price_min) return false;
      if (filters.price_max && product.price > filters.price_max) return false;
      if (filters.rating && product.rating < filters.rating) return false;
      return true;
    });
  }, [products, filters]);

  const sorted_products = useMemo(() => {
    return [...filtered_products].sort((a, b) => {
      switch (sort_option) {
        case 'price_asc':
          return a.price - b.price;
        case 'price_desc':
          return b.price - a.price;
        case 'rating_desc':
          return b.rating - a.rating;
        default:
          return b.created_at - a.created_at;
      }
    });
  }, [filtered_products, sort_option]);

  const featured_products = useMemo(() => {
    return products.filter(product => product.is_featured).slice(0, 3);
  }, [products]);

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-purple-900">Shop Designs</h1>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search designs..."
                value={search_query}
                onChange={(e) => handle_search(e.target.value)}
                className="pl-10 pr-4 py-2 w-64"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            </div>
            <Button variant="outline" size="icon">
              <ShoppingCart className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters */}
          <div className="w-full lg:w-1/4">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4 text-purple-900">Filters</h2>
              <div className="space-y-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">Category</label>
                  <Select
                    value={filters.category_uid || ''}
                    onValueChange={(value) => handle_filter_change('category_uid', value || null)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.uid} value={category.uid}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">Price Range</label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={filters.price_min || ''}
                      onChange={(e) => handle_filter_change('price_min', e.target.value ? Number(e.target.value) : null)}
                      className="w-1/2"
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={filters.price_max || ''}
                      onChange={(e) => handle_filter_change('price_max', e.target.value ? Number(e.target.value) : null)}
                      className="w-1/2"
                    />
                  </div>
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">Minimum Rating</label>
                  <Input
                    type="number"
                    min="0"
                    max="5"
                    step="0.5"
                    value={filters.rating || ''}
                    onChange={(e) => handle_filter_change('rating', e.target.value ? Number(e.target.value) : null)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Product Grid */}
          <div className="w-full lg:w-3/4">
            <div className="flex justify-between items-center mb-4">
              <div>
                <label className="mr-2 text-sm font-medium text-gray-700">Sort by:</label>
                <Select value={sort_option} onValueChange={handle_sort_change}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="created_at_desc">Newest</SelectItem>
                    <SelectItem value="price_asc">Price: Low to High</SelectItem>
                    <SelectItem value="price_desc">Price: High to Low</SelectItem>
                    <SelectItem value="rating_desc">Highest Rated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant={view_mode === 'grid' ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => set_view_mode('grid')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={view_mode === 'list' ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => set_view_mode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {is_loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-900 mx-auto"></div>
              </div>
            ) : sorted_products.length === 0 ? (
              <div className="text-center py-8 text-gray-600">No products found.</div>
            ) : (
              <div className={`${view_mode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-6'}`}>
                {sorted_products.map((product) => (
                  <div key={product.uid} className={`bg-white rounded-lg shadow-md overflow-hidden ${view_mode === 'list' ? 'flex' : ''}`}>
                    <img
                      src={product.image_url || `https://picsum.photos/seed/${product.uid}/300/300`}
                      alt={product.name}
                      className={`w-full h-48 object-cover ${view_mode === 'list' ? 'w-1/3' : ''}`}
                    />
                    <div className={`p-4 ${view_mode === 'list' ? 'w-2/3' : ''}`}>
                      <h3 className="text-lg font-semibold mb-2 text-purple-900">{product.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{product.designer_name}</p>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xl font-bold text-purple-900">${product.price.toFixed(2)}</span>
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-400 mr-1" />
                          <span className="text-sm font-medium text-gray-600">{product.rating.toFixed(1)}</span>
                        </div>
                      </div>
                      <div className="flex justify-between mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => set_quick_view_product(product)}
                        >
                          Quick View
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handle_add_to_cart(product)}
                        >
                          Add to Cart
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            <Pagination className="mt-8">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => handle_page_change(current_page - 1)}
                    disabled={current_page === 1}
                  />
                </PaginationItem>
                {Array.from({ length: total_pages }, (_, i) => i + 1).map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => handle_page_change(page)}
                      isActive={current_page === page}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => handle_page_change(current_page + 1)}
                    disabled={current_page === total_pages}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>

        {/* Featured Products */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-4 text-purple-900">Featured Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featured_products.map((product) => (
              <div key={product.uid} className="bg-white rounded-lg shadow-md overflow-hidden">
                <img
                  src={product.image_url || `https://picsum.photos/seed/${product.uid}/300/300`}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-2 text-purple-900">{product.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{product.designer_name}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-purple-900">${product.price.toFixed(2)}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => set_quick_view_product(product)}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      {quick_view_product && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-purple-900">{quick_view_product.name}</h2>
              <Button variant="ghost" size="icon" onClick={() => set_quick_view_product(null)}>
                <X className="h-6 w-6" />
              </Button>
            </div>
            <div className="flex flex-col md:flex-row gap-8">
              <img
                src={quick_view_product.image_url || `https://picsum.photos/seed/${quick_view_product.uid}/400/400`}
                alt={quick_view_product.name}
                className="w-full md:w-1/2 h-64 object-cover rounded-lg"
              />
              <div className="flex flex-col justify-between">
                <div>
                  <p className="text-gray-600 mb-2">{quick_view_product.designer_name}</p>
                  <p className="mb-4">{quick_view_product.description}</p>
                  <p className="text-2xl font-bold mb-4 text-purple-900">${quick_view_product.price.toFixed(2)}</p>
                  <div className="flex items-center mb-4">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star
                        key={index}
                        className={`h-5 w-5 ${
                          index < Math.floor(quick_view_product.rating)
                            ? 'text-yellow-400'
                            : 'text-gray-300'
                        }`}
                        fill="currentColor"
                      />
                    ))}
                    <span className="ml-2 text-sm text-gray-600">({quick_view_product.rating.toFixed(1)})</span>
                  </div>
                </div>
                <Button
                  onClick={() => {
                    handle_add_to_cart(quick_view_product);
                    set_quick_view_product(null);
                  }}
                  className="w-full"
                >
                  Add to Cart
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UV_Shop;