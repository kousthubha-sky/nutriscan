import { memo, useState } from 'react';
import LoadingSpinner from '../shared/LoadingSpinner';

const ProductGrid = memo(({ 
  products, 
  isLoading, 
  currentPage, 
  totalPages, 
  onPageChange,
  onProductSelect // We'll only use this prop now
}) => {
  const [imageErrors, setImageErrors] = useState({});

  const handleImageError = (productId) => {
    setImageErrors(prev => ({
      ...prev,
      [productId]: true
    }));
  };

  const getImageUrl = (product) => {
    if (imageErrors[product._id || product.code]) {
      return '/placeholder.png';
    }
    return product.image_url || product.imageUrl || '/placeholder.png';
  };

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!products?.length) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">No products found. Try a different search term.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map(product => (
          <div 
            key={product._id || product.code}
            className="product-card border rounded-lg hover:shadow-md transition-shadow 
              bg-white dark:bg-gray-800 dark:border-gray-700 cursor-pointer"
            onClick={() => onProductSelect(product)} // Simplified click handler
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
              <p className="text-gray-600 dark:text-gray-400">
                <span className="font-semibold">Brand:</span> {product.brands || product.brand || 'N/A'}
              </p>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="pagination-controls">
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1 || isLoading}
              className="page-btn"
            >
              Previous
            </button>
            
            <span className="page-info">
              Page {currentPage} of {totalPages}
            </span>
            
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages || isLoading}
              className="page-btn"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

export default ProductGrid;