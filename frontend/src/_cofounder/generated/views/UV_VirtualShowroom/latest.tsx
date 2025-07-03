import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import axios from 'axios';
import { RootState, AppDispatch, add_to_cart, add_notification } from '@/store/main';
import { Link } from 'react-router-dom';

// Helper component for product hotspots
const Hotspot: React.FC<{ position: [number, number, number], onClick: () => void }> = ({ position, onClick }) => (
  <Html position={position}>
    <div className="w-6 h-6 bg-blue-500 rounded-full cursor-pointer animate-pulse" onClick={onClick} />
  </Html>
);

// Helper component for 3D model loading
const Model: React.FC<{ url: string, position: [number, number, number] }> = ({ url, position }) => {
  const { scene } = useGLTF(url);
  return <primitive object={scene} position={position} />;
};

const UV_VirtualShowroom: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const { auth_token } = useSelector((state: RootState) => state.auth);
  const [showroomScene, setShowroomScene] = useState<any>(null);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [customizationOptions, setCustomizationOptions] = useState<{ colors: string[], materials: string[], sizes: string[] }>({
    colors: [],
    materials: [],
    sizes: []
  });
  const [isVRMode, setIsVRMode] = useState(false);

  useEffect(() => {
    const fetchShowroomData = async () => {
      try {
        const response = await axios.get('http://localhost:1337/api/virtual-showroom/scene', {
          headers: { Authorization: `Bearer ${auth_token}` }
        });
        setShowroomScene(response.data);
      } catch (error) {
        console.error('Error fetching showroom data:', error);
        dispatch(add_notification({
          id: Date.now().toString(),
          type: 'error',
          message: 'Failed to load virtual showroom. Please try again.'
        }));
      }
    };

    fetchShowroomData();
  }, [auth_token, dispatch]);

  const handleProductSelect = useCallback(async (productUid: string) => {
    try {
      const response = await axios.get(`http://localhost:1337/api/products/${productUid}`, {
        headers: { Authorization: `Bearer ${auth_token}` }
      });
      setSelectedProduct(response.data);
      setCustomizationOptions({
        colors: response.data.customization_options.colors || [],
        materials: response.data.customization_options.materials || [],
        sizes: response.data.customization_options.sizes || []
      });
    } catch (error) {
      console.error('Error fetching product details:', error);
      dispatch(add_notification({
        id: Date.now().toString(),
        type: 'error',
        message: 'Failed to load product details. Please try again.'
      }));
    }
  }, [auth_token, dispatch]);

  const handleAddToCart = useCallback(() => {
    if (selectedProduct) {
      dispatch(add_to_cart({
        product_uid: selectedProduct.uid,
        quantity: 1,
        price: selectedProduct.price
      }));
      dispatch(add_notification({
        id: Date.now().toString(),
        type: 'success',
        message: 'Product added to cart successfully.'
      }));
    }
  }, [selectedProduct, dispatch]);

  const handleCaptureShowroomState = useCallback(async () => {
    try {
      await axios.post('http://localhost:1337/api/virtual-showroom/captures', {
        scene_state: showroomScene,
        selected_product: selectedProduct?.uid
      }, {
        headers: { Authorization: `Bearer ${auth_token}` }
      });
      dispatch(add_notification({
        id: Date.now().toString(),
        type: 'success',
        message: 'Showroom state captured successfully.'
      }));
    } catch (error) {
      console.error('Error capturing showroom state:', error);
      dispatch(add_notification({
        id: Date.now().toString(),
        type: 'error',
        message: 'Failed to capture showroom state. Please try again.'
      }));
    }
  }, [showroomScene, selectedProduct, auth_token, dispatch]);

  const toggleVRMode = () => setIsVRMode(!isVRMode);

  return (
    <>
      <div className="relative w-full h-screen">
        <Canvas camera={{ position: [0, 5, 10] }}>
          <Suspense fallback={<Html center><div className="text-white">Loading...</div></Html>}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} />
            {showroomScene && showroomScene.objects.map((obj: any) => (
              <Model key={obj.uid} url={obj.model_url} position={[obj.position.x, obj.position.y, obj.position.z]} />
            ))}
            {showroomScene && showroomScene.objects.map((obj: any) => (
              <Hotspot
                key={`hotspot-${obj.uid}`}
                position={[obj.position.x, obj.position.y + 2, obj.position.z]}
                onClick={() => handleProductSelect(obj.uid)}
              />
            ))}
            <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
          </Suspense>
        </Canvas>

        {/* UI Overlay */}
        <div className="absolute top-4 left-4 bg-white bg-opacity-80 p-4 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-4">Virtual Showroom</h1>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            onClick={toggleVRMode}
          >
            {isVRMode ? 'Exit VR Mode' : 'Enter VR Mode'}
          </button>
          <button
            className="ml-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
            onClick={handleCaptureShowroomState}
          >
            Capture Showroom
          </button>
        </div>

        {/* Product Details Sidebar */}
        {selectedProduct && (
          <div className="absolute top-0 right-0 w-80 h-full bg-white bg-opacity-90 p-6 overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">{selectedProduct.name}</h2>
            <img src={selectedProduct.image_url} alt={selectedProduct.name} className="w-full mb-4 rounded" />
            <p className="mb-4">{selectedProduct.description}</p>
            <p className="text-lg font-semibold mb-4">Price: ${selectedProduct.price}</p>

            {/* Customization Options */}
            <div className="mb-4">
              <h3 className="font-bold mb-2">Customize:</h3>
              {customizationOptions.colors.length > 0 && (
                <div className="mb-2">
                  <label className="block mb-1">Color:</label>
                  <select className="w-full p-2 border rounded">
                    {customizationOptions.colors.map(color => (
                      <option key={color} value={color}>{color}</option>
                    ))}
                  </select>
                </div>
              )}
              {customizationOptions.materials.length > 0 && (
                <div className="mb-2">
                  <label className="block mb-1">Material:</label>
                  <select className="w-full p-2 border rounded">
                    {customizationOptions.materials.map(material => (
                      <option key={material} value={material}>{material}</option>
                    ))}
                  </select>
                </div>
              )}
              {customizationOptions.sizes.length > 0 && (
                <div className="mb-2">
                  <label className="block mb-1">Size:</label>
                  <select className="w-full p-2 border rounded">
                    {customizationOptions.sizes.map(size => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <button
              className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
              onClick={handleAddToCart}
            >
              Add to Cart
            </button>
            <Link to={`/product/${selectedProduct.uid}`} className="block text-center mt-4 text-blue-500 hover:underline">
              View Full Details
            </Link>
          </div>
        )}
      </div>
    </>
  );
};

export default UV_VirtualShowroom;