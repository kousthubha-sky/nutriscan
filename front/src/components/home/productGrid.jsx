import { memo, useState } from 'react';
import LoadingSpinner from '../shared/LoadingSpinner';
import { Star } from "lucide-react";
import { motion as Motion } from "framer-motion";

const ProductGrid = memo(({ 
  products, 
  isLoading, 
  currentPage, 
  totalPages, 
  onPageChange,
  onProductSelect
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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
        {products.map((product, index) => (
          <Motion.div
            key={product._id || product.code}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="w-full transparent dark:transparent rounded-lg shadow-sm hover:shadow-md transition-all border border-gray-200 dark:border-gray-700 group"
            onClick={() => onProductSelect(product)}
          >
            <div className="relative pt-[100%]">
              <div className="absolute inset-0 p-4">
                <img
                  src={getImageUrl(product)}
                  alt={product.product_name || product.name}
                  className="w-full h-full object-contain transition-transform group-hover:scale-105"
                  onError={() => handleImageError(product._id || product.code)}
                  loading="lazy"
                />
                <div className="absolute top-2 right-2 bg-white/90 dark:bg-gray-800/90 px-2 py-1 rounded-full flex items-center gap-1 text-sm font-medium">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span>{(product.healthRating || 3.0).toFixed(1)}</span>
                </div>
              </div>
            </div>
            <div className="p-4 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm transition-colors group-hover:bg-white/80 dark:group-hover:bg-gray-800/80">
              <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 min-h-[2.5rem]">
                {product.product_name || product.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {product.brands || product.brand || 'Unknown Brand'}
              </p>
            </div>
          </Motion.div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="pagination-controls ">
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