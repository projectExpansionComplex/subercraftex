import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { RootState, AppDispatch, add_notification } from '@/store/main';

const UV_SustainabilityHub: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const { current_user } = useSelector((state: RootState) => state.auth);
  const { language, currency } = useSelector((state: RootState) => state.preferences);

  const [sustainabilityMetrics, setSustainabilityMetrics] = useState({
    totalRecycledMaterials: 0,
    carbonFootprintReduction: 0,
    waterSaved: 0,
    communitiesSupported: 0
  });
  const [sustainabilityBadges, setSustainabilityBadges] = useState([]);
  const [supplyChainMap, setSupplyChainMap] = useState([]);
  const [artisanStories, setArtisanStories] = useState([]);
  const [ecoFriendlyProducts, setEcoFriendlyProducts] = useState([]);
  const [activeInitiative, setActiveInitiative] = useState(null);
  const [personalImpact, setPersonalImpact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSustainabilityData();
  }, []);

  useEffect(() => {
    if (current_user) {
      calculatePersonalImpact();
    }
  }, [current_user]);

  const fetchSustainabilityData = async () => {
    setLoading(true);
    try {
      const [metricsRes, badgesRes, supplyChainRes, storiesRes, productsRes, initiativeRes] = await Promise.all([
        axios.get('http://localhost:1337/api/sustainability/metrics'),
        axios.get('http://localhost:1337/api/sustainability/badges'),
        axios.get('http://localhost:1337/api/sustainability/supply-chain'),
        axios.get('http://localhost:1337/api/sustainability/artisan-stories'),
        axios.get('http://localhost:1337/api/products?sustainability_score_min=8'),
        axios.get('http://localhost:1337/api/sustainability/active-initiative')
      ]);

      setSustainabilityMetrics(metricsRes.data);
      setSustainabilityBadges(badgesRes.data);
      setSupplyChainMap(supplyChainRes.data);
      setArtisanStories(storiesRes.data);
      setEcoFriendlyProducts(productsRes.data);
      setActiveInitiative(initiativeRes.data);
    } catch (err) {
      setError('Failed to load sustainability data. Please try again later.');
      console.error('Error fetching sustainability data:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculatePersonalImpact = async () => {
    try {
      const res = await axios.get(`http://localhost:1337/api/users/${current_user.uid}/sustainability-impact`);
      setPersonalImpact(res.data);
    } catch (err) {
      console.error('Error calculating personal impact:', err);
    }
  };

  const submitSustainabilityPledge = async (pledgeData) => {
    try {
      await axios.post('http://localhost:1337/api/sustainability/pledges', pledgeData);
      dispatch(add_notification({
        id: Date.now().toString(),
        type: 'success',
        message: 'Thank you for your sustainability pledge!'
      }));
    } catch (err) {
      dispatch(add_notification({
        id: Date.now().toString(),
        type: 'error',
        message: 'Failed to submit pledge. Please try again.'
      }));
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading sustainability data...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>;
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-center">Sustainability Hub</h1>

        {/* Overall Sustainability Metrics */}
        <section className="mb-12 bg-green-100 p-6 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Our Sustainability Impact</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded shadow">
              <h3 className="font-bold">Recycled Materials</h3>
              <p className="text-2xl">{sustainabilityMetrics.totalRecycledMaterials.toLocaleString()} kg</p>
            </div>
            <div className="bg-white p-4 rounded shadow">
              <h3 className="font-bold">Carbon Footprint Reduction</h3>
              <p className="text-2xl">{sustainabilityMetrics.carbonFootprintReduction.toLocaleString()} kg CO2e</p>
            </div>
            <div className="bg-white p-4 rounded shadow">
              <h3 className="font-bold">Water Saved</h3>
              <p className="text-2xl">{sustainabilityMetrics.waterSaved.toLocaleString()} liters</p>
            </div>
            <div className="bg-white p-4 rounded shadow">
              <h3 className="font-bold">Communities Supported</h3>
              <p className="text-2xl">{sustainabilityMetrics.communitiesSupported.toLocaleString()}</p>
            </div>
          </div>
        </section>

        {/* Sustainability Badges */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Our Sustainability Certifications</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {sustainabilityBadges.map((badge) => (
              <div key={badge.id} className="bg-white p-4 rounded shadow text-center w-40">
                <img src={badge.icon} alt={badge.name} className="w-16 h-16 mx-auto mb-2" />
                <h3 className="font-bold">{badge.name}</h3>
                <p className="text-sm">{badge.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Interactive Supply Chain Map */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Our Ethical Supply Chain</h2>
          <div className="bg-gray-100 p-4 rounded">
            {/* Placeholder for interactive map */}
            <p className="text-center">Interactive supply chain map will be displayed here</p>
          </div>
        </section>

        {/* Artisan Stories */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Artisan Stories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {artisanStories.slice(0, 3).map((story) => (
              <div key={story.id} className="bg-white p-4 rounded shadow">
                <img src={story.image} alt={story.name} className="w-full h-48 object-cover mb-4 rounded" />
                <h3 className="font-bold text-lg">{story.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{story.location}</p>
                <p className="text-sm mb-4">{story.story.substring(0, 150)}...</p>
                <Link to={`/artisan/${story.id}`} className="text-blue-500 hover:underline">Read more</Link>
              </div>
            ))}
          </div>
          {artisanStories.length > 3 && (
            <div className="text-center mt-4">
              <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                Load More Stories
              </button>
            </div>
          )}
        </section>

        {/* Eco-Friendly Products Showcase */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Shop Eco-Friendly</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {ecoFriendlyProducts.slice(0, 8).map((product) => (
              <Link key={product.uid} to={`/product/${product.uid}`} className="bg-white p-4 rounded shadow hover:shadow-lg transition-shadow">
                <img src={product.image} alt={product.name} className="w-full h-48 object-cover mb-2 rounded" />
                <h3 className="font-bold">{product.name}</h3>
                <p className="text-sm text-gray-600 mb-2">Sustainability Score: {product.sustainabilityScore}/10</p>
                <div className="flex flex-wrap gap-1">
                  {product.badges.map((badge, index) => (
                    <span key={index} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">{badge}</span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-4">
            <Link to="/shop?filter=eco-friendly" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
              View All Eco-Friendly Products
            </Link>
          </div>
        </section>

        {/* Active Sustainability Initiative */}
        {activeInitiative && (
          <section className="mb-12 bg-blue-100 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Current Sustainability Initiative</h2>
            <h3 className="text-xl font-bold mb-2">{activeInitiative.title}</h3>
            <p className="mb-4">{activeInitiative.description}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-bold mb-2">Impact so far:</h4>
                <ul className="list-disc list-inside">
                  {Object.entries(activeInitiative.impact).map(([key, value]) => (
                    <li key={key}>{key}: {value}</li>
                  ))}
                </ul>
              </div>
              <div>
                {activeInitiative.media && activeInitiative.media.length > 0 && (
                  <img src={activeInitiative.media[0]} alt="Initiative visual" className="w-full h-48 object-cover rounded" />
                )}
              </div>
            </div>
          </section>
        )}

        {/* Personal Impact Calculator */}
        {current_user && personalImpact && (
          <section className="mb-12 bg-yellow-100 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Your Sustainability Impact</h2>
            <p className="mb-4">Based on your purchases, here's how you've contributed to sustainability:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded shadow">
                <h3 className="font-bold">Recycled Materials Used</h3>
                <p className="text-2xl">{personalImpact.recycledMaterials.toLocaleString()} kg</p>
              </div>
              <div className="bg-white p-4 rounded shadow">
                <h3 className="font-bold">Carbon Footprint Reduced</h3>
                <p className="text-2xl">{personalImpact.carbonFootprintReduced.toLocaleString()} kg CO2e</p>
              </div>
              <div className="bg-white p-4 rounded shadow">
                <h3 className="font-bold">Water Saved</h3>
                <p className="text-2xl">{personalImpact.waterSaved.toLocaleString()} liters</p>
              </div>
            </div>
            <button 
              onClick={calculatePersonalImpact}
              className="mt-4 bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
            >
              Recalculate Impact
            </button>
          </section>
        )}

        {/* Sustainability Pledge Form */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Make a Sustainability Pledge</h2>
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target as HTMLFormElement);
            submitSustainabilityPledge(Object.fromEntries(formData));
          }} className="bg-white p-6 rounded shadow">
            <div className="mb-4">
              <label htmlFor="pledge" className="block mb-2 font-bold">Your Pledge:</label>
              <textarea 
                id="pledge" 
                name="pledge" 
                required 
                className="w-full p-2 border rounded"
                placeholder="I pledge to..."
              ></textarea>
            </div>
            <div className="mb-4">
              <label className="block mb-2 font-bold">
                <input type="checkbox" name="newsletter" className="mr-2" />
                Subscribe to sustainability newsletter
              </label>
            </div>
            <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
              Submit Pledge
            </button>
          </form>
        </section>
      </div>
    </>
  );
};

export default UV_SustainabilityHub;