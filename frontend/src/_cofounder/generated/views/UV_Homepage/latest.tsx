import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { RootState } from '@/store/main';
import baseUrl from '../../../../utils/baseURL.js'
import axiosInstance from '@/utils/axiosInstance';

const UV_Homepage: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [categoryProducts, setCategoryProducts] = useState<Record<string, any[]>>({});
  const [featuredDesigners, setFeaturedDesigners] = useState<any[]>([]);
  const [latestBlogPosts, setLatestBlogPosts] = useState<any[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<any[]>([]);
  const [personalizedProducts, setPersonalizedProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { current_user, auth_token } = useSelector((state: RootState) => state.auth);
  const { theme, language } = useSelector((state: RootState) => state.preferences);

  useEffect(() => {
    const fetchHomePageContent = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const headers = auth_token ? { Authorization: auth_token } : {}; // Only send if exists

        const [
          featuredProductsRes,
          categoryProductsRes,
          featuredDesignersRes,
          latestBlogPostsRes,
          trendingProductsRes,
          personalizedProductsRes,
        ] = await Promise.all([
          axiosInstance.get('/api/featured-products'),
          axiosInstance.get('/api/category-products'),
          axiosInstance.get('/api/craftexdesigners'),
          axiosInstance.get('/api/latest-blog-posts'),
          axiosInstance.get('/api/trending-products'),
          auth_token
          ? axiosInstance.get('/api/personalized-products', { headers }) // Only fetch if logged in
          : { data: [] }, // Return empty array to prevent crashes
        ]);

        setFeaturedProducts(featuredProductsRes.data);
        setCategoryProducts(categoryProductsRes.data);
        setFeaturedDesigners(featuredDesignersRes.data);
        setLatestBlogPosts(latestBlogPostsRes.data);
        setTrendingProducts(trendingProductsRes.data);
        setPersonalizedProducts(personalizedProductsRes.data);
      } catch (err) {
        setError('Failed to load homepage content. Please try again later.');
        console.error('Error fetching homepage content:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHomePageContent();
  }, []);


console.log (categoryProducts, "this is what i have")
  const [activeIndex, setActiveIndex] = useState(0);

  // Function to go to the next slide
  const nextSlide = () => {
    setActiveIndex((prevIndex) => (prevIndex + 1) % featuredProducts.length);
  };

  // Function to go to the previous slide
  const prevSlide = () => {
    setActiveIndex((prevIndex) =>
      prevIndex === 0 ? featuredProducts.length - 1 : prevIndex - 1
    );
  };

  // Automatic slide transition
  // useEffect(() => {
  //   const interval = setInterval(nextSlide, 5000); // Change slide every 5 seconds
  //   return () => clearInterval(interval); // Cleanup interval on unmount
  // }, [activeIndex]);


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
    <div style={{backgroundColor: '#cbced1'}}>
      <div className={`homepage ${theme} ${language}`}>
        {/* Hero Carousel */}
        <section className="hero-carousel mb-12">
  <div className="relative">
    {featuredProducts.map((product, index) => (
      <div key={product._id} className={`carousel-item ${index === activeIndex ? 'block' : 'hidden'}`}>
       
        <img src={baseUrl + product?.images[0]} alt={product.name} className="w-full h-96 object-cover" loading="lazy" />
        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-4">
          <h2 className="text-2xl font-bold">{product.name}</h2>
          <p className="text-lg">{product.description}</p>
          <Link
            to={`/product/${product._id}`}
            className="mt-2 inline-block bg-[#4F46E5] text-white px-4 py-2 rounded hover:bg-[#3B82F6] transition-colors duration-300"
          >
            View Product
          </Link>
        </div>
      </div>
    ))}
    {/* Navigation Buttons */}
    <button
      className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-[#4F46E5] transition-colors duration-300"
      onClick={prevSlide}
    >
      &lt;
    </button>
    <button
      className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-[#4F46E5] transition-colors duration-300"
      onClick={nextSlide}
    >
      &gt;
    </button>
  </div>
</section>

        {/* Category Grid */}
        <section className="category-grid mb-12 bg-[#F9FAFB] p-6 rounded-lg">
  <h2 className="text-2xl font-bold mb-4 text-[#1F2937]">Shop by Category</h2>
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
    {Object.entries(categoryProducts).map(([category, products]) => (
      <Link key={category} to={`/category/${category}`} className="category-tile">
        {console.log(category,"this is cat")}
        <div className="relative h-48 rounded overflow-hidden">
          <img src={baseUrl + products[0]?.thumbnail} alt={category} className="w-full h-full object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
            <span className="text-white text-xl font-bold">{category}</span>
          </div>
        </div>
      </Link>
    ))}
  </div>
</section>

        {/* Featured Designers */}
        <section className="featured-designers mb-12 bg-[#F9FAFB] p-6 rounded-lg">
  <h2 className="text-2xl font-bold mb-4 text-[#1F2937]">Featured Designers</h2>
  <div className="flex overflow-x-auto space-x-4 pb-4">
    {featuredDesigners.map((designer) => (
      <Link key={designer._id} to={`/designer/${designer._id}`} className="flex-shrink-0">
        <div className="w-48 text-center bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-300">
          <img src={baseUrl + designer.avatar} alt={designer.name} className="w-32 h-32 rounded-full mx-auto mb-2" loading="lazy" />
          <h3 className="font-semibold text-[#1F2937]">{designer.name}</h3>
          <p className="text-sm text-[#6B7280]">{designer.specialty}</p>
        </div>
      </Link>
    ))}
  </div>
</section>

      {/* Latest Blog Posts */}
<section className="latest-blog-posts mb-12 bg-[#F9FAFB] p-6 rounded-lg">
  <h2 className="text-2xl font-bold mb-4 text-[#1F2937]">Latest from the Blog</h2>
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {latestBlogPosts.map((post) => (
      <Link key={post._id} to={`/blog/${post._id}`} className="blog-post-card">
        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
          {/* Featured Image or Video Thumbnail */}
          {post.featuredImage && (
            <img
              src={baseUrl + post.featuredImage}
              alt={post.title}
              className="w-full h-48 object-cover"
              loading="lazy"
            />
          )}

          {/* Video Embed (if videoUrl or youtubeUrl is present) */}
          {!post.featuredImage && (post.videoUrl || post.youtubeUrl) && (
            <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
              {post.videoUrl ? (
                <video controls className="w-full h-full object-cover">
                  <source src={baseUrl + post.videoUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <iframe
                  src={`https://www.youtube.com/embed/${post.youtubeUrl.split('v=')[1]}`}
                  title={post.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              )}
            </div>
          )}

          {/* Fallback for No Image or Video */}
          {!post.featuredImage && !post.videoUrl && !post.youtubeUrl && (
            <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-500">
              No Media
            </div>
          )}

          {/* Blog Post Content */}
          <div className="p-4">
            <h3 className="font-bold text-xl mb-2 text-[#1F2937]">{post.title}</h3>
            <p className="text-[#6B7280] mb-2">{post.excerpt}</p>

            {/* Render HTML Content Safely */}
            <div
              className="text-[#6B7280] mb-2"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Author and Publish Date */}
            <p className="text-sm text-[#6B7280]">
              By {post.author ? `${post.author.first_name} ${post.author.last_name}` : 'Unknown Author'} on{' '}
              {new Date(post.publishDate).toLocaleDateString()}
            </p>
          </div>
        </div>
      </Link>
    ))}
  </div>
</section>

        {/* Trending Products */}
        <section className="trending-products mb-12 bg-[#F9FAFB] p-6 rounded-lg">
  <h2 className="text-2xl font-bold mb-4 text-[#1F2937]">Trending Now</h2>
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
    {trendingProducts.map((product) => (
      <Link key={product._id} to={`/product/${product._id}`} className="product-card">
        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
          <img src={baseUrl + product.thumbnail} alt={product.name} className="w-full h-48 object-cover" loading="lazy" />
          <div className="p-4">
            <h3 className="font-semibold text-lg mb-2 text-[#1F2937]">{product.name}</h3>
            <p className="text-[#1F2937] font-bold">${product.price.toFixed(2)}</p>
          </div>
        </div>
      </Link>
    ))}
  </div>
</section>

        {/* Sustainability Spotlight */}
        <section className="sustainability-spotlight mb-12 bg-[#10B981] p-6 rounded-lg">
  <h2 className="text-2xl font-bold mb-4 text-white">Sustainability Spotlight</h2>
  <p className="mb-4 text-white">Learn about our commitment to sustainable and ethical design practices.</p>
  <Link
    to="/sustainability"
    className="bg-white text-[#10B981] px-4 py-2 rounded inline-block hover:bg-[#F9FAFB] transition-colors duration-300"
  >
    Explore Our Initiatives
  </Link>
</section>

        {/* Personalized Section (for authenticated users) */}
        {current_user && personalizedProducts.length > 0 &&  (
  <section className="personalized-content mb-12 bg-[#F9FAFB] p-6 rounded-lg">
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-2xl font-bold flex items-center text-[#1F2937]">
        <span className="mr-2">🌟</span> {/* Add an icon */}
        Recommended for You
      </h2>
      <Link
        to="/personalized-recommendations"
        className="text-sm text-[#4F46E5] hover:text-[#3B82F6] font-semibold"
      >
        See More &rarr;
      </Link>
    </div>
    <p className="text-[#6B7280] mb-6">
      Welcome back, {current_user.full_name}! Check out these items based on your interests.
    </p>
    <div className="flex overflow-x-auto space-x-4 pb-4">
      {personalizedProducts && personalizedProducts.map((product) => (
        <Link
          key={product._id}
          to={`/product/${product._id}`}
          className="flex-shrink-0 w-64 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
        >
          <div className="relative">
            <img
              src={baseUrl + product.thumbnail}
              alt={product.name}
              className="w-full h-48 object-cover rounded-t-lg"
              loading="lazy"
            />
            <div className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-sm">
              <span className="text-sm text-[#1F2937]">⭐ {product.averageRating || 'New'}</span>
            </div>
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-lg mb-2 text-[#1F2937]">{product.name}</h3>
            <p className="text-[#1F2937] font-bold">${product.price.toFixed(2)}</p>
            <p className="text-sm text-[#6B7280] mt-1">{product.tags.join(', ')}</p>
          </div>
        </Link>
      ))}
    </div>
  </section>
)}
      </div>
      </div>
    </>
  );
};

export default UV_Homepage;