import { useState } from 'react';
import LoadingSpinner from '../shared/LoadingSpinner';
import ProductDetailsModal from './ProductDetailsModal';

export default function ProductGrid({ products, isLoading }) {
  const [selectedProduct, setSelectedProduct] = useState(null);

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
            className="border p-4 rounded-lg hover:shadow-md transition-shadow bg-white"
          >
            {/* Show less information initially */}
            <h3 className="font-bold text-lg mb-2">
              {product.product_name || product.name}
            </h3>

            {product.image_url && (
              <img 
                src={product.image_url} 
                alt={product.product_name || product.name}
                className="w-full h-40 object-contain mb-4"
                onError={(e) => e.target.style.display = 'none'}
              />
            )}

            <div className="space-y-2">
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

      {/* Modal */}
      {selectedProduct && (
        <ProductDetailsModal 
          product={selectedProduct} 
          onClose={() => setSelectedProduct(null)} 
        />
      )}
    </>
  );
}