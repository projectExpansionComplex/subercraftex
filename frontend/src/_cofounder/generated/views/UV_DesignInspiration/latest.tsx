import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { RootState } from '@/store/main';

const UV_DesignInspiration: React.FC = () => {
  const [blogPosts, setBlogPosts] = useState<Array<{
    uid: string;
    title: string;
    excerpt: string;
    author: string;
    category: string;
    image_url: string;
    created_at: number;
  }>>([]);

  const [designerSpotlights, setDesignerSpotlights] = useState<Array<{
    uid: string;
    name: string;
    bio: string;
    image_url: string;
    specialty: string;
  }>>([]);

  const [trendReports, setTrendReports] = useState<Array<{
    uid: string;
    title: string;
    description: string;
    image_url: string;
    created_at: number;
  }>>([]);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  const { current_user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    fetchBlogPosts();
    fetchDesignerSpotlights();
    fetchTrendReports();
  }, [selectedCategory, currentPage]);

  const fetchBlogPosts = async () => {
    try {
      const response = await axios.get(`http://localhost:1337/api/blog-posts`, {
        params: {
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          page: currentPage,
          limit: 6
        }
      });
      setBlogPosts(response.data.data);
      setTotalPages(Math.ceil(response.data.total_count / 6));
    } catch (error) {
      console.error('Error fetching blog posts:', error);
    }
  };

  const fetchDesignerSpotlights = async () => {
    try {
      const response = await axios.get(`http://localhost:1337/api/designer-spotlights`);
      setDesignerSpotlights(response.data);
    } catch (error) {
      console.error('Error fetching designer spotlights:', error);
    }
  };

  const fetchTrendReports = async () => {
    try {
      const response = await axios.get(`http://localhost:1337/api/trend-reports`);
      setTrendReports(response.data);
    } catch (error) {
      console.error('Error fetching trend reports:', error);
    }
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const shareContent = (contentType: string, contentId: string) => {
    // Implement sharing functionality here
    console.log(`Sharing ${contentType} with ID: ${contentId}`);
    // This could open a modal with sharing options or use a third-party sharing library
  };

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Design Inspiration</h1>

        {/* Category Filter */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Explore by Category</h2>
          <div className="flex flex-wrap gap-2">
            {['all', 'interior', 'furniture', 'lighting', 'textiles'].map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`px-4 py-2 rounded-full ${
                  selectedCategory === category
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-800'
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Blog Posts */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Latest Blog Posts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post) => (
              <div key={post.uid} className="bg-white rounded-lg shadow-md overflow-hidden">
                <img
                  src={post.image_url}
                  alt={post.title}
                  className="w-full h-48 object-cover"
                  loading="lazy"
                />
                <div className="p-4">
                  <h3 className="text-xl font-semibold mb-2">{post.title}</h3>
                  <p className="text-gray-600 mb-4">{post.excerpt}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">By {post.author}</span>
                    <button
                      onClick={() => shareContent('blog', post.uid)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      Share
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Pagination */}
          <div className="mt-8 flex justify-center">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`mx-1 px-3 py-1 rounded ${
                  currentPage === page
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-800'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        </section>

        {/* Designer Spotlights */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Designer Spotlights</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {designerSpotlights.map((designer) => (
              <div key={designer.uid} className="bg-white rounded-lg shadow-md overflow-hidden">
                <img
                  src={designer.image_url}
                  alt={designer.name}
                  className="w-full h-48 object-cover"
                  loading="lazy"
                />
                <div className="p-4">
                  <h3 className="text-xl font-semibold mb-2">{designer.name}</h3>
                  <p className="text-gray-600 mb-2">{designer.specialty}</p>
                  <p className="text-sm text-gray-500 mb-4">{designer.bio}</p>
                  <Link
                    to={`/designer/${designer.uid}`}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    View Profile
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Trend Reports */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Design Trend Reports</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {trendReports.map((report) => (
              <div key={report.uid} className="bg-white rounded-lg shadow-md overflow-hidden">
                <img
                  src={report.image_url}
                  alt={report.title}
                  className="w-full h-48 object-cover"
                  loading="lazy"
                />
                <div className="p-4">
                  <h3 className="text-xl font-semibold mb-2">{report.title}</h3>
                  <p className="text-gray-600 mb-4">{report.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      {new Date(report.created_at).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => shareContent('trend', report.uid)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      Share
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Personalized Recommendations */}
        {current_user && (
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">Recommended for You</h2>
            <p className="text-gray-600">
              Based on your interests, we think you'll love these designs:
            </p>
            {/* Add personalized content recommendations here */}
          </section>
        )}
      </div>
    </>
  );
};

export default UV_DesignInspiration;