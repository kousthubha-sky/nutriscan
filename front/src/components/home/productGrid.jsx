import { useState } from 'react';
import LoadingSpinner from '../shared/LoadingSpinner';
import ProductDetailsModal from './ProductDetailsModal';

export default function ProductGrid({ products, isLoading }) {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [imageErrors, setImageErrors] = useState({});

  const handleImageError = (productId) => {
    setImageErrors(prev => ({
      ...prev,
      [productId]: true
    }));
  };

  const getImageUrl = (product) => {
    if (imageErrors[product._id || product.code]) {
      return '/placeholder.png'; // Your local placeholder image
    }
    return product.image_url || product.imageUrl || '/placeholder.png';
  };

  if (isLoading) return <LoadingSpinner />;
  if (!products?.length) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No products found. Try a different search term.</p>
      </div>
    );
  }

  return (
    <>
      <div id='prodgrid' className="">
        {products.map((product) => (
          <div 
            key={product._id || product.code}
            className="product-card border rounded-lg hover:shadow-md transition-shadow bg-white"
          >
            <h3 className="font-bold text-lg mb-2 px-4 pt-4">
              {product.product_name || product.name}
            </h3>

            <div className="image-wrapper">
              <div className="image-container">
                <img 
                  src={getImageUrl(product)}
                  alt={product.product_name || product.name}
                  className="product-image"
                  onError={() => handleImageError(product._id || product.code)}
                  loading="lazy"
                />
              </div>
            </div>

            <div className="product-info px-4 pb-4">
              <p className="text-gray-600">
                <span className="font-semibold">Brand:</span> {product.brands || product.brand || 'N/A'}
              </p>
              
              <button 
                onClick={() => setSelectedProduct(product)}
                className="w-full mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedProduct && (
        <ProductDetailsModal 
          product={selectedProduct} 
          onClose={() => setSelectedProduct(null)} 
        />
      )}
    </>
  );
}