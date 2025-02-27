import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch, add_to_cart, add_notification } from '@/store/main';
import axios from 'axios';
import { debounce } from 'lodash';
import axiosInstance from '@/utils/axiosInstance';
import baseUrl from '../../../../utils/baseURL.js'
// Custom hook for fetching products
const useProducts = (categoryUid: string, filters: any, sort: string, page: number) => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalProducts: 0,
    productsPerPage: 20
  });

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axiosInstance.get('/api/products-all', {
          params: {
            category_uid: categoryUid,
            page,
            limit: pagination.productsPerPage,
            sort,
            ...filters
          }
        });
        setProducts(response.data.products);
        setPagination({
          currentPage: response.data.page,
          totalPages: Math.ceil(response.data.total_count / pagination.productsPerPage),
          totalProducts: response.data.total_count,
          productsPerPage: pagination.productsPerPage
        });
      } catch (err) {
        setError('Failed to fetch products. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryUid, filters, sort, page, pagination.productsPerPage]);

  return { products, loading, error, pagination };
};

const UV_CategoryListing: React.FC = () => {
  const { category_uid } = useParams<{ category_uid: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch: AppDispatch = useDispatch();
  const { auth_token } = useSelector((state: RootState) => state.auth);

  const [filters, setFilters] = useState({
    price_min: searchParams.get('filter_price_min') || '',
    price_max: searchParams.get('filter_price_max') || '',
    designer: searchParams.get('filter_designer') || '',
    country: searchParams.get('filter_country') || '',
    material: searchParams.get('filter_material') || ''
  });
  const [sort, setSort] = useState(searchParams.get('sort') || 'popularity');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
  const [viewMode, setViewMode] = useState<2 | 3 | 4>(3);
  const [quickViewProduct, setQuickViewProduct] = useState<any | null>(null);

  const { products, loading, error, pagination } = useProducts(category_uid || '', filters, sort, page);

  const [categoryInfo, setCategoryInfo] = useState({
    uid: '',
    name: '',
    description: '',
    productCount: 0
  });

  useEffect(() => {
    const fetchCategoryInfo = async () => {
      try {
        const response = await axiosInstance.get(`api/craftexcategories/filter/${category_uid}`);
        console.log(response.data,"this is the responsen data");
        setCategoryInfo(response.data);
      } catch (err) {
        console.error('Failed to fetch category info:', err);
      }
    };

    if (category_uid) {
      fetchCategoryInfo();
    }
  }, [category_uid]);

  const updateSearchParams = useCallback(() => {
    const params: any = { page, sort };
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params[`filter_${key}`] = value;
    });
    setSearchParams(params);
  }, [filters, page, sort, setSearchParams]);

  useEffect(() => {
    updateSearchParams();
  }, [updateSearchParams]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const debouncedFilterChange = useMemo(
    () => debounce(handleFilterChange, 300),
    []
  );

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSort(e.target.value);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleQuickView = (product: any) => {
    setQuickViewProduct(product);
  };

  const handleAddToWishlist = async (productId: string) => {
    if (!auth_token) {
      dispatch(add_notification({
        id: Date.now().toString(),
        type: 'error',
        message: 'Please log in to add items to your wishlist.'
      }));
      return;
    }

    try {
      await axios.post('wishlist', { product_uid: productId }, {
        headers: { Authorization: `Bearer ${auth_token}` }
      });
      dispatch(add_notification({
        id: Date.now().toString(),
        type: 'success',
        message: 'Product added to wishlist!'
      }));
    } catch (err) {
      dispatch(add_notification({
        id: Date.now().toString(),
        type: 'error',
        message: 'Failed to add product to wishlist. Please try again.'
      }));
    }
  };

  const handleAddToCart = (product: any) => {
    dispatch(add_to_cart({
      product_uid: product.uid,
      quantity: 1,
      price: product.price
    }));
    dispatch(add_notification({
      id: Date.now().toString(),
      type: 'success',
      message: 'Product added to cart!'
    }));
  };

  return (
    <>
      <div className="container mx-auto px-4 py-8" style={{ paddingTop: '7rem' }}>
        <nav className="text-sm breadcrumbs mb-4" >
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/shop">Shop</Link></li>
            <li>{categoryInfo.name}</li>
           
          </ul>
        </nav>
          {/* Category Header */}
        <div className="mb-8">
          
          <h1 className="text-3xl font-bold mb-2">{categoryInfo[0]?.name}</h1>
          <p className="text-gray-600">{categoryInfo[0]?.description}</p>
        </div>


        <div className="flex flex-col md:flex-row gap-8">
          {/* Filter Sidebar */}
          <div className="w-full md:w-1/4 bg-[#F9FAFB] p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">Filters</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Price Range</label>
                <div className="mt-1 flex space-x-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.price_min}
                    onChange={(e) => debouncedFilterChange('price_min', e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.price_max}
                    onChange={(e) => debouncedFilterChange('price_max', e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Designer</label>
                <input
                  type="text"
                  value={filters.designer}
                  onChange={(e) => debouncedFilterChange('designer', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Country</label>
                <input
                  type="text"
                  value={filters.country}
                  onChange={(e) => debouncedFilterChange('country', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Material</label>
                <input
                  type="text"
                  value={filters.material}
                  onChange={(e) => debouncedFilterChange('material', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
              </div>
            </div>
          </div>

          {/* Product Listing */}
          <div className="w-full md:w-3/4">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-2">
                <label htmlFor="sort" className="text-sm font-medium text-gray-700">Sort by:</label>
                <select
                  id="sort"
                  value={sort}
                  onChange={handleSortChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                >
                  <option value="popularity">Popularity</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="newest">Newest Arrivals</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode(2)}
                  className={`p-2 ${viewMode === 2 ? 'bg-gray-200' : 'bg-white'} rounded`}
                  aria-label="Two column view"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2zM3 16a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode(3)}
                  className={`p-2 ${viewMode === 3 ? 'bg-gray-200' : 'bg-white'} rounded`}
                  aria-label="Three column view"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2zM3 16a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode(4)}
                  className={`p-2 ${viewMode === 4 ? 'bg-gray-200' : 'bg-white'} rounded`}
                  aria-label="Four column view"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2zM3 16a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" />
                  </svg>
                </button>
              </div>
            </div>

            {loading && <div className="text-center py-8">Loading...</div>}
            {error && <div className="text-center py-8 text-red-600">{error}</div>}

            {!loading && !error && (
              <>
                <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-${viewMode} gap-6`}>
                  {products.map((product) => (
                    <div key={product._id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
                      <img src={baseUrl + product.thumbnail} alt={product.name} className="w-full h-48 object-cover" />
                      <div className="p-4">
                        <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
                        <p className="text-gray-600 mb-2">{product.designerName}</p>
                        <p className="text-lg font-bold mb-2">${product.price.toFixed(2)}</p>
                        <div className="flex justify-between items-center">
                          <button
                            onClick={() => handleQuickView(product)}
                            className="text-indigo-600 hover:text-indigo-800"
                          >
                            Quick View
                          </button>
                          <button
                            onClick={() => handleAddToWishlist(product.uid)}
                            className="text-gray-600 hover:text-red-600"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex justify-center">
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      Previous
                    </button>
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pageNumber) => (
                      <button
                        key={pageNumber}
                        onClick={() => handlePageChange(pageNumber)}
                        className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${
                          pageNumber === page ? 'text-indigo-600 bg-indigo-50' : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    ))}
                    <button
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page === pagination.totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      {quickViewProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold">{quickViewProduct.name}</h2>
              <button
                onClick={() => setQuickViewProduct(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <img src={baseUrl + quickViewProduct.thumbnail} alt={quickViewProduct.name} className="w-full h-64 object-cover mb-4 rounded" />
            <p className="text-gray-600 mb-2">{quickViewProduct.designer.first_name} {quickViewProduct.designer.last_name}</p>
            <p className="text-xl font-bold mb-4" style={{color:"#374151"}}>${quickViewProduct.price.toFixed(2)}</p>
            <p className="text-gray-700 mb-4">{quickViewProduct.description}</p>
            <div className="flex space-x-4">
              <button
                onClick={() => handleAddToCart(quickViewProduct)}
                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
              >
                Add to Cart
              </button>
              <button
                onClick={() => handleAddToWishlist(quickViewProduct.uid)}
                className="border border-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-100"
              >
                Add to Wishlist
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UV_CategoryListing;