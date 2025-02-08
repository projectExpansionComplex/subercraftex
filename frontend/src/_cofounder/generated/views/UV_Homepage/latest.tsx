import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { RootState } from '@/store/main';

const UV_Homepage: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [categoryProducts, setCategoryProducts] = useState<Record<string, any[]>>({});
  const [featuredDesigners, setFeaturedDesigners] = useState<any[]>([]);
  const [latestBlogPosts, setLatestBlogPosts] = useState<any[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { current_user } = useSelector((state: RootState) => state.auth);
  const { theme, language } = useSelector((state: RootState) => state.preferences);

  useEffect(() => {
    const fetchHomePageContent = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [
          featuredProductsRes,
          categoryProductsRes,
          featuredDesignersRes,
          latestBlogPostsRes,
          trendingProductsRes
        ] = await Promise.all([
          axios.get('http://localhost:1337/api/featured-products'),
          axios.get('http://localhost:1337/api/category-products'),
          axios.get('http://localhost:1337/api/featured-designers'),
          axios.get('http://localhost:1337/api/latest-blog-posts'),
          axios.get('http://localhost:1337/api/trending-products')
        ]);

        setFeaturedProducts(featuredProductsRes.data);
        setCategoryProducts(categoryProductsRes.data);
        setFeaturedDesigners(featuredDesignersRes.data);
        setLatestBlogPosts(latestBlogPostsRes.data);
        setTrendingProducts(trendingProductsRes.data);
      } catch (err) {
        setError('Failed to load homepage content. Please try again later.');
        console.error('Error fetching homepage content:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHomePageContent();
  }, []);

  const handleCategoryClick = (categoryUid: string) => {
    // Navigation handled by Link component
  };

  const handleProductClick = (productUid: string) => {
    // Navigation handled by Link component
  };

  const handleDesignerClick = (designerUid: string) => {
    // Navigation handled by Link component
  };

  const handleBlogPostClick = (postUid: string) => {
    // Navigation handled by Link component
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    );
  }

  return (
    <>
      <div className={`homepage ${theme} ${language}`}>
        {/* Hero Carousel */}
        <section className="hero-carousel mb-12">
          <div className="relative">
            {featuredProducts.map((product, index) => (
              <div key={product.id} className={`carousel-item ${index === 0 ? 'block' : 'hidden'}`}>
                <img src={product.imageUrl} alt={product.name} className="w-full h-96 object-cover" loading="lazy" />
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-4">
                  <h2 className="text-2xl font-bold">{product.name}</h2>
                  <p className="text-lg">{product.description}</p>
                  <Link to={`/product/${product.id}`} className="mt-2 inline-block bg-white text-black px-4 py-2 rounded">
                    View Product
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Category Grid */}
        <section className="category-grid mb-12">
          <h2 className="text-2xl font-bold mb-4">Shop by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Object.entries(categoryProducts).map(([category, products]) => (
              <Link key={category} to={`/category/${category}`} className="category-tile">
                <div className="relative h-48 rounded overflow-hidden">
                  <img src={products[0]?.thumbnail} alt={category} className="w-full h-full object-cover" loading="lazy" />
                  <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                    <span className="text-white text-xl font-bold">{category}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Featured Designers */}
        <section className="featured-designers mb-12">
          <h2 className="text-2xl font-bold mb-4">Featured Designers</h2>
          <div className="flex overflow-x-auto space-x-4 pb-4">
            {featuredDesigners.map((designer) => (
              <Link key={designer.id} to={`/designer/${designer.id}`} className="flex-shrink-0">
                <div className="w-48 text-center">
                  <img src={designer.avatar} alt={designer.name} className="w-32 h-32 rounded-full mx-auto mb-2" loading="lazy" />
                  <h3 className="font-semibold">{designer.name}</h3>
                  <p className="text-sm text-gray-600">{designer.specialty}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Latest Blog Posts */}
        <section className="latest-blog-posts mb-12">
          <h2 className="text-2xl font-bold mb-4">Latest from the Blog</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {latestBlogPosts.map((post) => (
              <Link key={post.id} to={`/blog/${post.id}`} className="blog-post-card">
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <img src={post.imageUrl} alt={post.title} className="w-full h-48 object-cover" loading="lazy" />
                  <div className="p-4">
                    <h3 className="font-bold text-xl mb-2">{post.title}</h3>
                    <p className="text-gray-600 mb-2">{post.excerpt}</p>
                    <p className="text-sm text-gray-500">By {post.author} on {new Date(post.publishDate).toLocaleDateString()}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Trending Products */}
        <section className="trending-products mb-12">
          <h2 className="text-2xl font-bold mb-4">Trending Now</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {trendingProducts.map((product) => (
              <Link key={product.id} to={`/product/${product.id}`} className="product-card">
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <img src={product.thumbnail} alt={product.name} className="w-full h-48 object-cover" loading="lazy" />
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                    <p className="text-gray-800 font-bold">${product.price.toFixed(2)}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Sustainability Spotlight */}
        <section className="sustainability-spotlight mb-12">
          <div className="bg-green-100 p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Sustainability Spotlight</h2>
            <p className="mb-4">Learn about our commitment to sustainable and ethical design practices.</p>
            <Link to="/sustainability" className="bg-green-500 text-white px-4 py-2 rounded inline-block">
              Explore Our Initiatives
            </Link>
          </div>
        </section>

        {/* Personalized Section (for authenticated users) */}
        {current_user && (
          <section className="personalized-content mb-12">
            <h2 className="text-2xl font-bold mb-4">Recommended for You</h2>
            {/* Add personalized content here based on user preferences */}
            <p>Welcome back, {current_user.full_name}! Check out these items based on your interests.</p>
            {/* Add personalized product recommendations here */}
          </section>
        )}
      </div>
    </>
  );
};

export default UV_Homepage;